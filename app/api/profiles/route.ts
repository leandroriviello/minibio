import { NextResponse } from "next/server"
import { getProfileByUsername, createProfile, updateProfile } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { username, display_name, bio, profile_image_url, social_links, custom_links } = body

    const profile = await createProfile({
      userId: user.id,
      username,
      display_name,
      bio,
      profile_image_url,
      social_links,
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
    const { username, display_name, bio, profile_image_url, social_links, custom_links } = body

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const profile = await updateProfile(username, {
      userId: user.id,
      display_name,
      bio,
      profile_image_url,
      social_links,
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
