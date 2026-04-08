import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: faqs } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
    const { data: colors } = await supabase.from('shirt_colors').select('*').order('created_at', { ascending: false });
    const { data: settings } = await supabase.from('admin_settings').select('*');

    const get = (key, fallback) => {
      const row = settings?.find(s => s.key === key);
      return row ? row.value : fallback;
    };

    return NextResponse.json({
      products: products || [],
      faqs: faqs || [],
      colors: colors || [],
      taxRate: get('tax_rate', { rate: 0.07 })?.rate ?? 0.07,
      disclaimerText: get('disclaimer_text', { text: null })?.text || null,
      apparel: get('apparel_pricing', null),
      printSizes: get('print_sizes', null),
    });
  } catch (error) {
    console.error('Load settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
