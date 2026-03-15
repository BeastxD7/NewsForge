"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ImagePlus, Search, Loader2, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { updateCoverImage } from "@/app/draft/[slug]/actions"

interface CoverImagePickerProps {
  articleId: string
  currentImage: string | null
  onUpdated: (url: string) => void
}

interface PexelsPhoto {
  id: number
  thumb: string
  url: string
  alt: string
  photographer: string
}

async function uploadImageFile(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append("image", file)
  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
    const json = await res.json() as { success: boolean; data?: { url: string }; message?: string }
    if (!json.success) {
      toast.error(json.message ?? "Image upload failed")
      return null
    }
    return json.data?.url ?? null
  } catch {
    toast.error("Upload failed — is the server running?")
    return null
  }
}

export function CoverImagePicker({ articleId, currentImage: _currentImage, onUpdated }: CoverImagePickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [photos, setPhotos] = useState<PexelsPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [selecting, setSelecting] = useState(false)
  const [pexelsError, setPexelsError] = useState<string | null>(null)

  const handleSelect = async (url: string): Promise<void> => {
    setSelecting(true)
    try {
      const result = await updateCoverImage(articleId, url)
      if (result.success) {
        onUpdated(url)
        toast.success("Cover image updated")
        setOpen(false)
      } else {
        toast.error(result.error ?? "Failed to update cover image")
      }
    } finally {
      setSelecting(false)
    }
  }

  const handleSearch = async (): Promise<void> => {
    if (!query.trim()) return
    setLoading(true)
    setPexelsError(null)
    setPhotos([])
    try {
      const res = await fetch(`/api/admin/pexels?q=${encodeURIComponent(query.trim())}`)
      const json = await res.json() as { success: boolean; photos?: PexelsPhoto[]; message?: string }
      if (!json.success) {
        setPexelsError(json.message ?? "Search failed")
      } else {
        setPhotos(json.photos ?? [])
      }
    } catch {
      setPexelsError("Network error while searching Pexels")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = (): void => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const url = await uploadImageFile(file)
      if (url) await handleSelect(url)
    }
    input.click()
  }

  const handleUrlSubmit = async (): Promise<void> => {
    if (!urlInput.startsWith("http")) return
    await handleSelect(urlInput)
    setUrlInput("")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button size="sm" variant="secondary" className="gap-1.5">
            <ImagePlus className="size-4" />
            Change cover
          </Button>
        }
      />
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Cover Image</SheetTitle>
        </SheetHeader>

        {selecting && (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground gap-2">
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </div>
        )}

        {/* Section A: Search Pexels */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Search Pexels</p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. technology, nature..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleSearch() }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleSearch()}
              disabled={loading || !query.trim()}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            </Button>
          </div>

          {pexelsError && (
            <p className="text-sm text-destructive mt-2">{pexelsError}</p>
          )}

          {!loading && !pexelsError && photos.length === 0 && query.trim() && (
            <p className="text-sm text-muted-foreground mt-2">No results found.</p>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => void handleSelect(photo.url)}
                  disabled={selecting}
                  className="relative rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring"
                  title={`${photo.alt} — by ${photo.photographer}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumb}
                    alt={photo.alt}
                    className="w-full h-[100px] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t my-6" />

        {/* Section B: Upload from device */}
        <div>
          <p className="text-sm font-medium mb-2">Upload from device</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpload}
            disabled={selecting}
          >
            <ImagePlus className="size-4 mr-1.5" />
            Upload image
          </Button>
        </div>

        <div className="border-t my-6" />

        {/* Section C: Enter URL directly */}
        <div>
          <p className="text-sm font-medium mb-2">Use image URL</p>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleUrlSubmit() }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleUrlSubmit()}
              disabled={selecting || !urlInput.startsWith("http")}
            >
              <Link className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
