import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // IMPORTANT
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { action, data } = body

    console.log("ADMIN SAVE:", action)

    // SAVE TAX / GENERAL SETTINGS
    if (action === "save_settings") {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          key: "general",
          value: data
        })

      if (error) throw error
    }

    // SAVE APPAREL PRICING
    if (action === "save_apparel") {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          key: "apparel_pricing",
          value: data
        })

      if (error) throw error
    }

    // SAVE PRINT SIZES
    if (action === "save_print_sizes") {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          key: "print_sizes",
          value: data
        })

      if (error) throw error
    }

    // SAVE FAQS
    if (action === "save_faqs") {
      // clear old
      await supabase.from("faqs").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      const formatted = data.map(f => ({
        question: f.q,
        answer: f.a
      }))

      const { error } = await supabase.from("faqs").insert(formatted)

      if (error) throw error
    }

    // SAVE COLORS
    if (action === "save_colors") {
      await supabase.from("shirt_colors").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      const { error } = await supabase.from("shirt_colors").insert(data)

      if (error) throw error
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("SAVE ERROR:", err)
    return NextResponse.json({ success: false, error: err.message })
  }
}
