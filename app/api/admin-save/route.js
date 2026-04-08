import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const { action, data } = await request.json();

    if (action === "save_apparel") {
      // Save apparel pricing to admin_settings as JSON
      const { error } = await supabase
        .from("admin_settings")
        .upsert({ key: "apparel_pricing", value: data.apparel });
      
      if (error) throw error;
      return Response.json({ success: true, message: "Apparel saved" });
    }

    if (action === "save_print_sizes") {
      // Save print sizes to admin_settings as JSON
      const { error } = await supabase
        .from("admin_settings")
        .upsert({ key: "print_sizes", value: data.printSizes });
      
      if (error) throw error;
      return Response.json({ success: true, message: "Print sizes saved" });
    }

    if (action === "save_tax_rate") {
      // Save tax rate to admin_settings
      const { error } = await supabase
        .from("admin_settings")
        .upsert({ key: "tax_rate", value: { rate: data.rate } });
      
      if (error) throw error;
      return Response.json({ success: true, message: "Tax rate saved" });
    }

    if (action === "save_disclaimer") {
      // Save disclaimer to admin_settings
      const { error } = await supabase
        .from("admin_settings")
        .upsert({ key: "disclaimer_text", value: { text: data.text } });
      
      if (error) throw error;
      return Response.json({ success: true, message: "Disclaimer saved" });
    }

    if (action === "save_colors") {
      // Delete existing colors and insert new ones
      const { error: deleteError } = await supabase
        .from("shirt_colors")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
      
      if (deleteError) throw deleteError;

      // Insert new colors
      const colorRows = data.colors.map(c => ({
        name: c.n,
        hex_color: c.h
      }));

      const { error: insertError } = await supabase
        .from("shirt_colors")
        .insert(colorRows);
      
      if (insertError) throw insertError;
      return Response.json({ success: true, message: "Colors saved" });
    }

    if (action === "save_faqs") {
      // Delete existing FAQs and insert new ones
      const { error: deleteError } = await supabase
        .from("faqs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
      
      if (deleteError) throw deleteError;

      // Insert new FAQs
      const faqRows = data.faqs.map(f => ({
        question: f.q,
        answer: f.a
      }));

      const { error: insertError } = await supabase
        .from("faqs")
        .insert(faqRows);
      
      if (insertError) throw insertError;
      return Response.json({ success: true, message: "FAQs saved" });
    }

    if (action === "save_product") {
      // Save or update a product
      const { error } = await supabase
        .from("products")
        .upsert({
          id: data.id,
          name: data.name,
          price: data.price,
          category: data.category,
          description: data.description,
          image_url: data.image_url
        });
      
      if (error) throw error;
      return Response.json({ success: true, message: "Product saved" });
    }

    if (action === "delete_product") {
      // Delete a product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", data.id);
      
      if (error) throw error;
      return Response.json({ success: true, message: "Product deleted" });
    }

    if (action === "save_faq") {
      // Save a single FAQ
      const { error } = await supabase
        .from("faqs")
        .insert({
          question: data.q,
          answer: data.a
        });
      
      if (error) throw error;
      return Response.json({ success: true, message: "FAQ saved" });
    }

    if (action === "delete_faq") {
      // Delete a FAQ
      const { error } = await supabase
        .from("faqs")
        .delete()
        .eq("id", data.id);
      
      if (error) throw error;
      return Response.json({ success: true, message: "FAQ deleted" });
    }

    if (action === "save_color") {
      // Save a single color
      const { error } = await supabase
        .from("shirt_colors")
        .insert({
          name: data.n,
          hex_color: data.h
        });
      
      if (error) throw error;
      return Response.json({ success: true, message: "Color saved" });
    }

    if (action === "delete_color") {
      // Delete a color
      const { error } = await supabase
        .from("shirt_colors")
        .delete()
        .eq("id", data.id);
      
      if (error) throw error;
      return Response.json({ success: true, message: "Color deleted" });
    }

    if (action === "save_client") {
      // Save client info
      const { error } = await supabase
        .from("clients")
        .upsert({
          name: data.nm,
          phone: data.ph,
          email: data.em
        }, { onConflict: "phone" });
      
      if (error) throw error;
      return Response.json({ success: true, message: "Client saved" });
    }

    if (action === "save_blast") {
      // Save blast message
      const { error } = await supabase
        .from("blast_messages")
        .insert({
          message: data.message,
          sent_to_count: data.count || 0
        });
      
      if (error) throw error;
      return Response.json({ success: true, message: "Blast sent" });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Admin save error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
