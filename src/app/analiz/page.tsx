import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { BarChart, PieChart, LineChart, Car, User, ArrowRight, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Araç Analizi ve İstatistikleri | ArabaSatış",
  description:
    "Araç pazarındaki son istatistikler ve analizler. Fiyat trendleri, en popüler modeller ve daha fazlası.",
};

export default async function AnalysisPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Oturum kontrolü
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Oturum yoksa giriş sayfasına yönlendir
    redirect("/giris?redirect=/analiz");
  }
  
  // Araba markalarını al
  const { data: brands } = await supabase
    .from('araclar')
    .select('marka')
    .limit(1000);
    
  const uniqueBrands = Array.from(new Set(brands?.map(car => car.marka) || []));
  
  // Marka bazlı araç sayıları
  const { data: brandCounts } = await supabase
    .rpc('get_car_counts_by_brand');
    
  // Yakıt tipi dağılımı
  const { data: fuelTypes } = await supabase
    .rpc('get_fuel_type_distribution');
    
  // Yıl bazlı araç sayıları
  const { data: yearCounts } = await supabase
    .rpc('get_car_counts_by_year');
    
  // Son hafta ilana konulan araçlar
  const { data: recentListings } = await supabase
    .from('araclar')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });
    
  // Fiyat aralıkları
  const priceRanges = [
    { range: '0-100.000', count: 0 },
    { range: '100.000-250.000', count: 0 },
    { range: '250.000-500.000', count: 0 },
    { range: '500.000-1.000.000', count: 0 },
    { range: '1.000.000+', count: 0 },
  ];
  
  // Her bir araç için fiyat aralığını kontrol et
  recentListings?.forEach(car => {
    if (car.fiyat < 100000) {
      priceRanges[0].count++;
    } else if (car.fiyat < 250000) {
      priceRanges[1].count++;
    } else if (car.fiyat < 500000) {
      priceRanges[2].count++;
    } else if (car.fiyat < 1000000) {
      priceRanges[3].count++;
    } else {
      priceRanges[4].count++;
    }
  });
  
  return (
    <div className="container py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold">Araç Pazarı Analizi</h1>
        <p className="text-muted-foreground">
          Piyasadaki araç istatistikleri, fiyat trendleri ve diğer analiz raporları
        </p>
      </div>
      
      <AnalyticsDashboard 
        brandCounts={brandCounts || []}
        fuelTypes={fuelTypes || []}
        yearCounts={yearCounts || []}
        priceRanges={priceRanges}
        recentListingsCount={recentListings?.length || 0}
      />
      
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">Özel Analiz Raporları</h2>
            <p className="text-sm text-muted-foreground">
              Aradığınız spesifik bilgiler için özel raporlar oluşturun
            </p>
          </div>
          <Button>
            <Filter className="h-4 w-4 mr-2" />
            <span>Özel Rapor Oluştur</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Marka Karşılaştırma</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                İki markayı seçerek fiyat, popülerlik ve özellikleri karşılaştırın
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/analiz/karsilastirma">
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fiyat Trendi Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Seçtiğiniz araç modelinin fiyat trendini görün
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/analiz/fiyat-trendi">
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bölgesel Analiz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Araçların bölgesel dağılımı ve fiyat farklılıkları
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/analiz/bolgesel">
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 