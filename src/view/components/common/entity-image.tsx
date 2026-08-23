import { useEffect, useState } from "react"
import { ImageOff } from "lucide-react"

import { apiRequestBlob } from "@/api/client"
import { toApiEndpoint } from "@/lib/media-url"
import { cn } from "@/lib/utils"

type EntityImageProps = {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
  fallbackIconClassName?: string
}

export function EntityImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackIconClassName,
}: EntityImageProps) {
  const [nativeFailed, setNativeFailed] = useState(false)
  const [blobSrc, setBlobSrc] = useState<string | null>(null)
  const [blobFailed, setBlobFailed] = useState(false)

  useEffect(() => {
    setNativeFailed(false)
    setBlobSrc(null)
    setBlobFailed(false)
  }, [src])

  useEffect(() => {
    if (!src || !nativeFailed) return

    const endpoint = toApiEndpoint(src)
    if (!endpoint) {
      setBlobFailed(true)
      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    void apiRequestBlob(endpoint)
      .then((blob) => {
        const next = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(next)
          return
        }
        objectUrl = next
        setBlobSrc(next)
      })
      .catch(() => {
        if (!cancelled) setBlobFailed(true)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src, nativeFailed])

  if (!src || (nativeFailed && blobFailed)) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[1.5rem] w-full items-center justify-center text-[var(--erp-muted)]",
          fallbackClassName
        )}
      >
        <ImageOff className={cn("size-4", fallbackIconClassName)} />
      </div>
    )
  }

  return (
    <img
      src={blobSrc ?? src}
      alt={alt}
      className={className}
      onError={() => {
        if (blobSrc) {
          setBlobFailed(true)
          return
        }
        setNativeFailed(true)
      }}
    />
  )
}
