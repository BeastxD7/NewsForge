import { spawn } from "child_process"
import { readFile, readdir, rm, mkdtemp } from "fs/promises"
import { tmpdir } from "os"
import { join } from "path"

// ─── Video ID extraction ─────────────────────────────────────────────────────

const VIDEO_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export function extractVideoId(url: string): string | null {
  const match = url.match(VIDEO_ID_REGEX)
  return match?.[1] ?? null
}

// ─── oEmbed metadata (no API key needed) ─────────────────────────────────────

interface VideoMeta {
  title: string
  channelName: string
  duration: number
}

export async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  const res = await fetch(oembedUrl)

  if (!res.ok) {
    throw new Error(`Failed to fetch video metadata for ${videoId}: ${res.status}`)
  }

  const data = (await res.json()) as { title: string; author_name: string }

  return {
    title: data.title,
    channelName: data.author_name,
    duration: 0, // estimated from transcript segments
  }
}

// ─── Transcript fetching via yt-dlp ──────────────────────────────────────────

interface TranscriptResult {
  text: string
  estimatedDurationSecs: number
  language: string // e.g. "en", "hi", "en-orig"
}

/**
 * Run a shell command and return { stdout, stderr, code }.
 */
function run(cmd: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString() })
    proc.on("close", (code) => resolve({ stdout, stderr, code: code ?? 1 }))
    proc.on("error", () => resolve({ stdout, stderr, code: 1 }))
  })
}

/**
 * Find the first .json3 subtitle file written by yt-dlp in a directory.
 * yt-dlp names files as: <stem>.<lang>.json3 (e.g. sub.en.json3, sub.hi.json3)
 */
async function findJson3File(dir: string): Promise<string | null> {
  try {
    const files = await readdir(dir)
    const match = files.find((f) => f.endsWith(".json3"))
    return match ? join(dir, match) : null
  } catch {
    return null
  }
}

/**
 * Extract language code from a yt-dlp subtitle filename.
 * e.g. "sub.en.json3" → "en", "sub.hi-orig.json3" → "hi-orig"
 */
function langFromFilename(filePath: string): string {
  const name = filePath.split(/[/\\]/).pop() ?? ""
  // pattern: <stem>.<lang>.json3
  const parts = name.replace(/\.json3$/, "").split(".")
  return parts.length >= 2 ? (parts[parts.length - 1] ?? "unknown") : "unknown"
}

/**
 * Parse a yt-dlp json3 subtitle file into plain text + duration.
 */
async function parseJson3(filePath: string): Promise<{ text: string; estimatedDurationSecs: number }> {
  const raw = await readFile(filePath, "utf8")
  const data = JSON.parse(raw) as {
    events?: Array<{
      segs?: Array<{ utf8: string }>
      tStartMs?: number
      dDurationMs?: number
    }>
  }

  const events = data.events?.filter((e) => e.segs) ?? []
  if (events.length === 0) {
    throw new Error("Subtitle file contains no text events")
  }

  const text = events
    .map((e) => e.segs!.map((s) => s.utf8).join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  const lastEvent = events[events.length - 1]
  const estimatedDurationSecs = lastEvent?.tStartMs
    ? (lastEvent.tStartMs + (lastEvent.dDurationMs ?? 0)) / 1000
    : 0

  return { text, estimatedDurationSecs }
}

/**
 * Fetch transcript for a YouTube video using yt-dlp.
 *
 * Strategy:
 * 1. Try English captions first (manual + auto-generated), prefer en-orig
 * 2. If no English available, fall back to any language (video's original language)
 *
 * Uses non-JS player clients (tv_embedded, web_embedded, ios) to avoid the
 * "No supported JavaScript runtime" warning from recent yt-dlp versions.
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  const tempDir = await mkdtemp(join(tmpdir(), "nf-yt-"))
  const outStem = join(tempDir, "sub")
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Player clients that don't require a JS runtime (avoids deno/node requirement)
  const playerArgs = ["--extractor-args", "youtube:player_client=tv_embedded,web_embedded,ios"]

  function buildArgs(subLangOrFlag: string[]): string[] {
    return [
      "--write-auto-subs",
      "--write-subs",      // also fetch manually uploaded captions
      "--sub-format", "json3",
      "--skip-download",
      ...playerArgs,
      ...subLangOrFlag,
      "-o", outStem,
      videoUrl,
    ]
  }

  async function ytdlp(subLangOrFlag: string[]): Promise<void> {
    const args = buildArgs(subLangOrFlag)
    let r = await run("python", ["-m", "yt_dlp", ...args])
    if (r.code !== 0) {
      r = await run("yt-dlp", args)
    }
    // Non-zero exit is OK here — we check for the file instead of the exit code
    // to handle cases where yt-dlp exits 1 but still writes a subtitle file.
    void r
  }

  try {
    // ── Attempt 1: English captions (manual or auto-generated) ──────────────
    await ytdlp(["--sub-lang", "en,en.*"])
    let subFile = await findJson3File(tempDir)

    // ── Attempt 2: Fall back to original language (any) ─────────────────────
    if (!subFile) {
      // --all-subs downloads every available subtitle track
      await ytdlp(["--all-subs"])
      subFile = await findJson3File(tempDir)
    }

    if (!subFile) {
      throw new Error(
        `No transcript available for video ${videoId}. ` +
        "The video may not have captions enabled."
      )
    }

    const language = langFromFilename(subFile)
    const { text, estimatedDurationSecs } = await parseJson3(subFile)

    if (language !== "en" && !language.startsWith("en")) {
      console.log(
        `[youtube] No English captions found for ${videoId}. ` +
        `Using "${language}" captions — AI will translate to English.`
      )
    }

    return { text, estimatedDurationSecs, language }
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}
