import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === 'save_product') {
      // Save/update product
      const { data: result, error } = await supabase
        .from('products')
        .upsert({ id: data.id, name: data.name, price: data.price, category: data.category, description: data.description, image_url: data.image_url })
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'delete_product') {
      const { error } = await supabase.from('products').delete().eq('id', data.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'save_faq') {
      const { data: result, error } = await supabase
        .from('faqs')
        .upsert({ id: data.id, question: data.question, answer: data.answer })
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'delete_faq') {
      const { error } = await supabase.from('faqs').delete().eq('id', data.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'save_color') {
      const { data: result, error } = await supabase
        .from('shirt_colors')
        .upsert({ id: data.id, name: data.name, hex_color: data.hex_color, photo_url: data.photo_url })
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'delete_color') {
      const { error } = await supabase.from('shirt_colors').delete().eq('id', data.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'save_tax_rate') {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key: 'tax_rate', value: { rate: data.rate } }, { onConflict: 'key' })
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'save_disclaimer') {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key: 'disclaimer_text', value: { text: data.text } }, { onConflict: 'key' })
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'save_client') {
      const { error } = await supabase
        .from('clients')
        .upsert({ phone: data.phone, name: data.name, email: data.email }, { onConflict: 'phone' })
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'save_apparel') {
      // Save apparel prices to admin_settings
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key: 'apparel_types', value: { apparel: data.apparel } }, { onConflict: 'key' })
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'save_print_sizes') {
      // Save print sizes to admin_settings
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key: 'print_sizes', value: { printSizes: data.printSizes } }, { onConflict: 'key' })
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'save_colors') {
      // Save colors - upsert to shirt_colors table
      for (const color of data.colors) {
        const { error } = await supabase
          .from('shirt_colors')
          .upsert({ name: color.name, hex_color: color.hex_color, photo_url: color.photo_url }, { onConflict: 'name' })
          .select();
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'save_faqs') {
      // Save FAQs - bulk upsert
      for (const faq of data.faqs) {
        const { error } = await supabase
          .from('faqs')
          .upsert({ question: faq.q, answer: faq.a }, { onConflict: 'question' })
          .select();
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
