import { NextResponse } from 'next/server';
import { supabase, testSupabaseConnection } from '@/lib/supabase';

// Supabase bağlantı testi için endpoint
export async function GET() {
  try {
    const result = await testSupabaseConnection();
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500
    });
  } catch (error) {
    console.error('API test endpoint hatası:', error);
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