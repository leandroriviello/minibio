export const SOCIAL_PLATFORMS = ["instagram", "tiktok", "twitter", "youtube", "linkedin", "email"] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

export interface SocialLinkFormValue {
  platform: SocialPlatform
  url: string
}

export const createEmptySocialLinks = (): SocialLinkFormValue[] => {
  return SOCIAL_PLATFORMS.map((platform) => ({ platform, url: "" }))
}
