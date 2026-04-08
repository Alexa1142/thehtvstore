import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    // Fetch admin settings (tax_rate, disclaimer_text, apparel_pricing, print_sizes, clover_info)
    const { data: adminSettings } = await supabase
      .from("admin_settings")
      .select("key, value");

    // Fetch products
    const { data: products } = await supabase
      .from("products")
      .select("*");

    // Fetch FAQs
    const { data: faqs } = await supabase
      .from("faqs")
      .select("*");

    // Fetch shirt colors
    const { data: colors } = await supabase
      .from("shirt_colors")
      .select("*");

    // Parse admin settings
    let taxRate = 0.07;
    let disclaimerText = "";
    let apparelPricing = null;
    let printSizes = null;
    let cloverInfo = { merchantId: "", apiKey: "" };

    if (adminSettings) {
      adminSettings.forEach(setting => {
        if (setting.key === "tax_rate" && setting.value) {
          taxRate = setting.value.rate || 0.07;
        }
        if (setting.key === "disclaimer_text" && setting.value) {
          disclaimerText = setting.value.text || "";
        }
        if (setting.key === "apparel_pricing" && setting.value) {
          apparelPricing = setting.value;
        }
        if (setting.key === "print_sizes" && setting.value) {
          printSizes = setting.value;
        }
        if (setting.key === "clover_info" && setting.value) {
          cloverInfo = setting.value;
        }
      });
    }

    // Format FAQs
    const formattedFaqs = faqs ? faqs.map(f => ({ q: f.question, a: f.answer })) : [];

    // Format colors
    const formattedColors = colors ? colors.map(c => ({ n: c.name, h: c.hex_color })) : [];

    // Format products
    const formattedProducts = products ? products.map(p => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      cat: p.category,
      desc: p.description,
      img: p.image_url
    })) : [];

    return Response.json({
      taxRate,
      disclaimerText,
      faqs: formattedFaqs,
      colors: formattedColors,
      products: formattedProducts,
      apparelPricing,
      printSizes,
      cloverInfo
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return Response.json({ 
      taxRate: 0.07, 
      disclaimerText: "", 
      faqs: [],
      colors: [],
      products: [],
      cloverInfo: { merchantId: "", apiKey: "" }
    });
  }
}
