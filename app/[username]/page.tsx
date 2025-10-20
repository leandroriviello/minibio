import type React from "react"
import Image, { type ImageLoader } from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Instagram, Twitter, Youtube, Linkedin, Mail, ExternalLink } from "lucide-react"
import { getProfileByUsername } from "@/lib/db"

interface SocialLink {
  platform: string
  url: string
  icon: React.ReactNode
}

const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const socialIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  tiktok: <TikTokIcon />,
  twitter: <Twitter className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
}

const RESERVED_ROUTES = ["crear", "editar", "api", "admin", "_next", "favicon.ico"]

const externalImageLoader: ImageLoader = ({ src }) => src

export default async function ProfilePage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params

  if (RESERVED_ROUTES.includes(username)) {
    redirect("/crear")
  }

  let profile
  try {
    profile = await getProfileByUsername(username)
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    notFound()
  }

  if (!profile) {
    notFound()
  }

  const socialLinks: SocialLink[] = Object.entries(profile.social_links || {})
    .filter(([, url]) => url)
    .map(([platform, url]) => ({
      platform,
      url,
      icon: socialIcons[platform] || <ExternalLink className="w-5 h-5" />,
    }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href={`/editar/${username}`}>Editar perfil</Link>
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="p-8 text-center space-y-4">
          {profile.profile_image_url ? (
            <Image
              src={profile.profile_image_url}
              alt={profile.display_name}
              width={128}
              height={128}
              loader={externalImageLoader}
              unoptimized
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 mx-auto border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">{profile.display_name.charAt(0).toUpperCase()}</span>
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{profile.display_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && <p className="text-foreground/80 max-w-md mx-auto leading-relaxed">{profile.bio}</p>}
        </Card>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Redes sociales</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  {link.icon}
                  <span className="capitalize text-sm font-medium">{link.platform}</span>
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Custom Links */}
        {profile.custom_links && profile.custom_links.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Enlaces</h2>
            <div className="space-y-3">
              {profile.custom_links.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-4 px-6 text-left hover:bg-secondary/50 bg-transparent"
                  >
                    <span className="font-medium">{link.title}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">¿Quieres tu propia minibio?</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Crear la mía</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
