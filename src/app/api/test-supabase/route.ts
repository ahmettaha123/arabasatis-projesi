import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/supabase';

export async function GET() {
  try {
    const result = await testSupabaseConnection();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API yolunda hata:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
} 