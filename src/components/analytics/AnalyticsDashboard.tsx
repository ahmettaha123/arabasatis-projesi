"use client";

import { useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

// ChartJS bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsDashboardProps {
  brandCounts: Array<{ marka: string; count: number }>;
  fuelTypes: Array<{ yakit_tipi: string; count: number }>;
  yearCounts: Array<{ model_yili: number; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
  recentListingsCount: number;
}

export function AnalyticsDashboard({
  brandCounts = [],
  fuelTypes = [],
  yearCounts = [],
  priceRanges = [],
  recentListingsCount = 0,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("genel");

  // En popüler 10 marka
  const topBrands = [...brandCounts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Son 10 yıl için araç sayıları
  const sortedYearCounts = [...yearCounts]
    .sort((a, b) => a.model_yili - b.model_yili)
    .slice(-10);

  // Marka-bazlı grafik verisi
  const brandData = {
    labels: topBrands.map((brand) => brand.marka),
    datasets: [
      {
        label: "Araç Sayısı",
        data: topBrands.map((brand) => brand.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Yakıt tipi pasta grafik verisi
  const fuelData = {
    labels: fuelTypes.map((type) => type.yakit_tipi),
    datasets: [
      {
        label: "Araç Sayısı",
        data: fuelTypes.map((type) => type.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Yıl bazlı çizgi grafik verisi
  const yearData = {
    labels: sortedYearCounts.map((year) => year.model_yili.toString()),
    datasets: [
      {
        label: "Araç Sayısı",
        data: sortedYearCounts.map((year) => year.count),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.4,
      },
    ],
  };

  // Fiyat aralığı grafik verisi
  const priceData = {
    labels: priceRanges.map((range) => range.range),
    datasets: [
      {
        label: "Araç Sayısı",
        data: priceRanges.map((range) => range.count),
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-8">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:w-1/2">
          <TabsTrigger value="genel">Genel Bakış</TabsTrigger>
          <TabsTrigger value="markalar">Markalar</TabsTrigger>
          <TabsTrigger value="fiyatlar">Fiyatlar</TabsTrigger>
          <TabsTrigger value="yakit">Yakıt Tipleri</TabsTrigger>
          <TabsTrigger value="yillar">Model Yılları</TabsTrigger>
        </TabsList>

        {/* Genel Bakış */}
        <TabsContent value="genel" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Son 7 Günde Yeni İlanlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentListingsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Marka Sayısı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{brandCounts.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Ortalama Fiyat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(325000)} {/* Örnek veri */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  En Popüler Yakıt Tipi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fuelTypes.length > 0
                    ? fuelTypes.sort((a, b) => b.count - a.count)[0].yakit_tipi
                    : "Dizel"}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>En Popüler Markalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={brandData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yakıt Tipi Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex justify-center items-center">
                  <div className="w-3/4">
                    <Pie data={fuelData} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Markalar Sekmesi */}
        <TabsContent value="markalar">
          <Card>
            <CardHeader>
              <CardTitle>Markalara Göre Araç Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={brandData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fiyatlar Sekmesi */}
        <TabsContent value="fiyatlar">
          <Card>
            <CardHeader>
              <CardTitle>Fiyat Aralıklarına Göre Araç Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={priceData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yakıt Tipleri Sekmesi */}
        <TabsContent value="yakit">
          <Card>
            <CardHeader>
              <CardTitle>Yakıt Tiplerine Göre Araç Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex justify-center items-center">
                <div className="w-1/2">
                  <Pie data={fuelData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Yılları Sekmesi */}
        <TabsContent value="yillar">
          <Card>
            <CardHeader>
              <CardTitle>Yıllara Göre Araç Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Line data={yearData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 