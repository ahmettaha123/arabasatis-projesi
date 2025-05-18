import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Temel bir araba sayma işlemi yapalım
    console.log('API: Supabase bağlantı testi başlıyor...');
    
    const { data, error } = await supabase
      .from('arabalar')
      .select('count()', { count: 'exact', head: true });
    
    if (error) {
      console.error('API: Supabase bağlantı hatası:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      });
    }
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('API rotasında hata:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        details: error
      },
      { status: 500 }
    );
  }
} 