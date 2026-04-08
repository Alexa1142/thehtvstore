import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req) {
  try {
    // Load products
    const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    
    // Load FAQs
    const { data: faqs } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
    
    // Load shirt colors
    const { data: colors } = await supabase.from('shirt_colors').select('*').order('created_at', { ascending: false });
    
    // Load tax rate from admin_settings
    const { data: settings } = await supabase.from('admin_settings').select('value').eq('key', 'tax_rate');
    let taxRate = 0.07; // default
    if (settings && settings.length > 0) {
      taxRate = settings[0].value?.rate || 0.07;
    }
    
    // Load disclaimer text
    const { data: disclaimer } = await supabase.from('admin_settings').select('value').eq('key', 'disclaimer_text');
    let disclaimerText = 'TERMS - THE HTV STORE\n\n1. COPYRIGHT: Designs must be your own or licensed.';
    if (disclaimer && disclaimer.length > 0) {
      disclaimerText = disclaimer[0].value?.text || disclaimerText;
    }

    return NextResponse.json({
      products: products || [],
      faqs: faqs || [],
      colors: colors || [],
      taxRate,
      disclaimerText,
    });
  } catch (error) {
    console.error('Load settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
