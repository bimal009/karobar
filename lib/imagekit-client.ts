"use client"

import { upload } from "@imagekit/javascript"
import { getImageKitAuthParams } from "@/actions/imagekit"

export interface UploadedImage {
  url: string
  fileId: string
  name: string
  sizeBytes: number
}

export async function uploadFileToImageKit(
  file: File,
  folder = "/uploads",
  options?: { isPrivateFile?: boolean }
): Promise<UploadedImage> {
  const auth = await getImageKitAuthParams()

  if (auth.error || !auth.data) {
    throw new Error(auth.message ?? "Failed to get upload credentials")
  }

  const { signature, expire, token } = auth.data

  const result = await upload({
    file,
    fileName: file.name,
    folder,
    signature,
    expire,
    token,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    isPrivateFile: options?.isPrivateFile ?? false,
  })

  return {
    url: result.url!,
    fileId: result.fileId!,
    name: result.name!,
    sizeBytes: file.size,
  }
}
