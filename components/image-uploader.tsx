"use client"

import * as React from "react"
import Image from "next/image"
import { CloudUpload, Loader2, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadFileToImageKit } from "@/lib/imagekit-client"

interface BaseProps {
  folder?: string
  maxSizeMb?: number
  disabled?: boolean
  className?: string
}

interface SingleProps extends BaseProps {
  multiple?: false
  maxFiles?: never
  value: string | null
  onChange: (url: string | null) => void
}

interface MultiProps extends BaseProps {
  multiple: true
  maxFiles?: number
  value: string[]
  onChange: (urls: string[]) => void
}

type ImageUploaderProps = SingleProps | MultiProps

export function ImageUploader(props: ImageUploaderProps) {
  const { folder = "/uploads", maxSizeMb = 5, disabled = false, className } = props
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const inputRef = React.useRef<HTMLInputElement>(null)
  const urls = props.multiple ? props.value : props.value ? [props.value] : []

  const handleFiles = React.useCallback(async (fileList: FileList | null | File[]) => {
    if (!fileList || (fileList instanceof FileList && fileList.length === 0)) return
    if (disabled || isUploading) return

    setError(null)
    const files = Array.isArray(fileList) ? fileList : Array.from(fileList)
    const maxBytes = maxSizeMb * 1024 * 1024

    const oversized = files.find((f) => f.size > maxBytes)
    if (oversized) {
      setError(`File "${oversized.name}" exceeds the ${maxSizeMb}MB limit.`)
      return
    }

    if (props.multiple && props.maxFiles) {
      const remaining = props.maxFiles - props.value.length
      if (remaining <= 0) {
        setError(`Maximum of ${props.maxFiles} images allowed.`)
        return
      }
      if (files.length > remaining) {
        setError(`You can only upload ${remaining} more image(s).`)
        files.length = remaining
      }
    }

    setIsUploading(true)
    try {
      const uploaded = await Promise.all(
        files.map((file) => uploadFileToImageKit(file, folder))
      )
      const newUrls = uploaded.map((u) => u.url)

      if (props.multiple) {
        props.onChange([...props.value, ...newUrls])
      } else {
        props.onChange(newUrls[0] ?? null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }, [disabled, isUploading, maxSizeMb, props, folder])

  function removeAt(index: number) {
    if (disabled || isUploading) return
    if (props.multiple) {
      props.onChange(props.value.filter((_, i) => i !== index))
    } else {
      props.onChange(null)
    }
  }

  const onDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const canAddMore = props.multiple
    ? !props.maxFiles || props.value.length < props.maxFiles
    : urls.length === 0

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {/* 
        Grid layout for multiple images, 
        Block full-width layout for single images 
      */}
      <div className={cn(
        "w-full",
        props.multiple ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4" : "flex flex-col"
      )}>
        
        {/* Render existing images */}
        {urls.map((url, i) => (
          <div
            key={url + i}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border shadow-sm bg-muted/30 transition-all hover:shadow-md",
              props.multiple ? "aspect-square w-full" : "w-full min-h-[200px] md:min-h-[240px]"
            )}
          >
            <Image 
              src={url} 
              alt="Uploaded image preview" 
              fill 
              // 'object-contain' for single (to prevent cropping logos), 'object-cover' for grid galleries
              className={props.multiple ? "object-cover" : "object-contain p-2"} 
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-start justify-end p-2 md:p-3">
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="rounded-full bg-destructive/90 p-2 text-white shadow-sm backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
                  aria-label="Remove image"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Dropzone / Upload Button */}
        {canAddMore && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
            }}
            aria-disabled={disabled || isUploading}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/10 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 hover:text-foreground",
              isDragging && "border-primary bg-primary/5 text-primary scale-[1.01] shadow-inner",
              (disabled || isUploading) && "pointer-events-none opacity-50",
              
              // If Single Upload: Make it massive and full width
              // If Multiple Upload: Make it fit nicely into the aspect-square grid
              !props.multiple 
                ? "w-full min-h-[200px] md:min-h-[240px] p-8" 
                : "aspect-square w-full p-4"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-primary">
                <Loader2 className="size-8 animate-spin" />
                <span className="text-sm font-medium">Uploading...</span>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-background p-3 shadow-sm ring-1 ring-border/50">
                  {!props.multiple ? (
                    <CloudUpload className="size-6 md:size-8" />
                  ) : (
                    <ImageIcon className="size-5 md:size-6" />
                  )}
                </div>
                <div className="text-center px-4">
                  <span className="text-sm font-medium block">
                    {!props.multiple ? "Click or drag your image here" : "Add Image"}
                  </span>
                  {!props.multiple && (
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Supports JPG, PNG, WEBP up to {maxSizeMb}MB
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={props.multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled || isUploading}
      />

      {error && (
        <div className="flex items-center text-xs">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}