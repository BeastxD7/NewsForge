"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Generate or reuse a session ID stored in localStorage
function getSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    const KEY = "fv_sid"
    const EXPIRY_KEY = "fv_sid_exp"
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 min

    const existing = localStorage.getItem(KEY)
    const expiry = Number(localStorage.getItem(EXPIRY_KEY) ?? 0)

    if (existing && Date.now() < expiry) {
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + SESSION_TIMEOUT_MS))
      return existing
    }

    // New session
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(KEY, id)
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + SESSION_TIMEOUT_MS))
    return id
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

function sendBeacon(event: string, data: Record<string, unknown>): void {
  try {
    const payload = JSON.stringify(data)
    const url = `/api/analytics?event=${event}`
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }))
    } else {
      fetch(url, { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {})
    }
  } catch {
    // Never throw from tracking code
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  const enteredAt = useRef<number>(Date.now())
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    const sessionId = getSessionId()
    const url = window.location.href
    const referrer = prevPathname.current
      ? window.location.origin + prevPathname.current
      : document.referrer

    // Send duration of previous page before sending new pageview
    if (prevPathname.current !== null) {
      const duration = Math.round((Date.now() - enteredAt.current) / 1000)
      sendBeacon("pageview", {
        sessionId,
        url: window.location.origin + prevPathname.current,
        duration,
      })
    }

    enteredAt.current = Date.now()
    prevPathname.current = pathname

    // Track current pageview
    sendBeacon("pageview", {
      sessionId,
      url,
      referrer: referrer || undefined,
    })

    // Click tracker
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const el = target.closest("a, button, [data-track]") as HTMLElement | null
      if (!el) return
      sendBeacon("click", {
        sessionId,
        url: window.location.href,
        element: el.tagName.toLowerCase(),
        text: el.textContent?.trim().slice(0, 100),
        href: el instanceof HTMLAnchorElement ? el.href : undefined,
      })
    }

    document.addEventListener("click", handleClick, { passive: true })

    // Send final duration when user leaves
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - enteredAt.current) / 1000)
      sendBeacon("pageview", { sessionId, url: window.location.href, duration })
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("click", handleClick)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [pathname])

  return null
}
