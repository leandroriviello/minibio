import { NextResponse } from "next/server"
import { getProfileByUsername, createProfile, updateProfile, getProfileByUserId } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { username, display_name, bio, profile_image_url, social_links, custom_social_links, custom_links } = body

    const existing = await getProfileByUsername(username)

    if (existing) {
      if (existing.user_id && existing.user_id !== user.id) {
        return NextResponse.json({ error: "Este nombre de usuario ya está en uso" }, { status: 409 })
      }

      const profile = await updateProfile(username, {
        userId: user.id,
        display_name,
        bio,
        profile_image_url,
        social_links,
        custom_social_links,
        custom_links,
      })

      if (!profile) {
        throw new Error("No se pudo actualizar el perfil existente")
      }

      return NextResponse.json(profile)
    }

    const profile = await createProfile({
      userId: user.id,
      username,
      display_name,
      bio,
      profile_image_url,
      social_links,
      custom_social_links,
      custom_links,
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[v0] Error creating profile:", error)
    const message = error instanceof Error ? error.message : "Error al crear el perfil"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const mine = searchParams.get("mine")

    if (mine === "true") {
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
      }

      const profile = await getProfileByUserId(user.id)
      if (!profile) {
        return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
      }

      return NextResponse.json(profile)
    }

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const profile = await getProfileByUsername(username)

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return NextResponse.json({ error: "Error al obtener el perfil" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { username, display_name, bio, profile_image_url, social_links, custom_social_links, custom_links } = body

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const profile = await updateProfile(username, {
      userId: user.id,
      display_name,
      bio,
      profile_image_url,
      social_links,
      custom_social_links,
      custom_links,
    })

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado o sin permisos" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    const message = error instanceof Error ? error.message : "Error al actualizar el perfil"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
