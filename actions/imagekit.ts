"use server"

import { imagekit } from "@/lib/imagekit"
import { handleError } from "@/lib/common/errors"
import { AppResponse } from "@/lib/common/response"

export const getImageKitAuthParams = async () => {
  try {
    const params = imagekit.getAuthenticationParameters()
    return AppResponse.ok(params)
  } catch (error) {
    return handleError("getImageKitAuthParams", error)
  }
}
