import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khdmurgshrmjbxufuovu.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZG11cmdzaHJtamJ4dWZ1b3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODM3NjQsImV4cCI6MjA2MzA1OTc2NH0.JqEWucaQXDm-WvFPPSSfcj1xODGlskxiCkCVLN7DbKE';
  
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  // Auth işleminde hata oluştu, login sayfasına geri gönder
  return NextResponse.redirect(new URL('/giris?error=callback', requestUrl.origin));
} 