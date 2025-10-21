import type React from "react"
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Instagram, Youtube, Linkedin, Mail, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProfileByUsername } from "@/lib/db"
import { verifySessionToken } from "@/lib/session"

interface SocialLink {
  platform: string
  url: string
  icon: React.ReactNode
}

const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const XIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 3.75h3.27l4.02 5.35 4.53-5.35h3.18l-6.21 7.28 6.61 9.22h-3.27l-4.35-6.04-5.13 6.04H4.88l6.48-7.62-6.86-8.88Z" />
  </svg>
)

const socialIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  tiktok: <TikTokIcon />,
  twitter: <XIcon />,
  youtube: <Youtube className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
}

const RESERVED_ROUTES = ["crear", "editar", "api", "admin", "_next", "favicon.ico"]

export default async function ProfilePage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params

  if (RESERVED_ROUTES.includes(username)) {
    redirect("/crear")
  }

  let profile
  try {
    profile = await getProfileByUsername(username)
  } catch (error) {
    console.error("[minibio] Error fetching profile:", error)
    notFound()
  }

  if (!profile) {
    notFound()
  }

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("minibio_session")?.value
  let canEdit = false
  if (sessionCookie && profile.user_id) {
    const session = await verifySessionToken(sessionCookie)
    if (session?.userId === profile.user_id) {
      canEdit = true
    }
  }

  const socialLinks: SocialLink[] = Object.entries(profile.social_links || {})
    .filter(([, url]) => url)
    .map(([platform, url]) => ({
      platform,
      url,
      icon: socialIcons[platform] || <ExternalLink className="h-5 w-5" />,
    }))

  const glassCardClass =
    "rounded-3xl border border-white/10 bg-[#101013]/70 backdrop-blur-2xl shadow-[0_45px_120px_-70px_rgba(0,0,0,0.85)]"

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-20%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-white/6 blur-[160px]" />
        <div className="absolute right-[-18%] top-[-12%] h-[32rem] w-[32rem] rounded-full bg-white/5 blur-[170px]" />
        <div className="absolute bottom-[-28%] left-[38%] h-[36rem] w-[36rem] rounded-full bg-white/4 blur-[200px]" />
      </div>

      <div className="relative z-10 px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
          {canEdit ? (
            <div className="flex justify-end">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href={`/editar/${username}`}>Editar perfil</Link>
              </Button>
            </div>
          ) : null}

          <Card className={cn(glassCardClass, "p-10 text-center space-y-8")}> 
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/30 to-white/10 p-[3px] shadow-[0_30px_80px_-70px_rgba(0,0,0,0.85)]">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.display_name}
                  width={144}
                  height={144}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-white/40 to-white/5 text-4xl font-semibold text-white/80">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-semibold md:text-5xl">{profile.display_name}</h1>
              <p className="text-sm uppercase tracking-[0.4em] text-white/40">@{profile.username}</p>
            </div>

            {profile.bio ? (
              <p className="mx-auto max-w-xl text-base leading-relaxed text-white/70">{profile.bio}</p>
            ) : (
              <p className="text-sm text-white/40">Este creador aún no escribió una biografía.</p>
            )}
          </Card>

          {socialLinks.length > 0 ? (
            <Card className={cn(glassCardClass, "p-8 space-y-5")}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Conectá en redes</h2>
                <span className="text-xs uppercase tracking-[0.4em] text-white/40">Social</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-white/15 bg-white/8 px-5 py-4 text-left transition hover:bg-white/16"
                  >
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white group-hover:bg-white/20">
                        {link.icon}
                      </span>
                      {socialLabels[link.platform] ?? link.platform}
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/50 group-hover:text-white/80" />
                  </a>
                ))}
              </div>
            </Card>
          ) : null}

          {profile.custom_links && profile.custom_links.length > 0 ? (
            <Card className={cn(glassCardClass, "p-8 space-y-5")}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Enlaces destacados</h2>
                <span className="text-xs uppercase tracking-[0.4em] text-white/40">Links</span>
              </div>
              <div className="space-y-3">
                {profile.custom_links.map((link, index) => (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl border border-white/12 bg-white/7 p-[1px] transition hover:border-white/20"
                  >
                    <div className="flex items-center justify-between rounded-[18px] bg-black/55 px-6 py-4 transition group-hover:bg-black/65">
                      <span className="text-base font-medium">{link.title}</span>
                      <ExternalLink className="h-4 w-4 text-white/50 group-hover:text-white/80" />
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          ) : null}

          <footer className="text-center space-y-4">
            <p className="text-sm text-white/50">¿Querés un perfil así de elegante?</p>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/20 bg-white/10 px-6 py-2 text-white hover:bg-white/15"
            >
              <Link href="/auth">Crear mi minibio</Link>
            </Button>
          </footer>
        </div>
      </div>
    </div>
  )
}
