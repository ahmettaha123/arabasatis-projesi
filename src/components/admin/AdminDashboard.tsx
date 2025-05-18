"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "@supabase/auth-helpers-nextjs";
import {
  Users,
  Car,
  Eye,
  BarChart3,
  DollarSign,
  Clock,
  Plus,
  Settings,
  LogOut,
  FileText,
  List,
  Grid,
  Search,
  Database,
  Trash2,
  Edit,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AdminDashboardProps {
  user: User;
  stats: {
    totalCars: number;
    totalUsers: number;
    totalViews: number;
    totalSales: number;
  };
  latestListings: any[];
  pendingActions: any[];
  popularBrands: any[];
}

export function AdminDashboard({
  user,
  stats,
  latestListings = [],
  pendingActions = [],
  popularBrands = [],
}: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("overview");

  // Araç listeleri için görünüm durumu (grid/list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // İlanları filtrele
  const filteredListings = latestListings.filter(
    (listing) =>
      listing.marka.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Paneli</h1>
          <p className="text-muted-foreground">
            Hoş geldiniz, {user.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            <span>Ayarlar</span>
          </Button>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            <span>Çıkış</span>
          </Button>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 md:grid-cols-5 lg:w-1/2">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="cars">Araçlar</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
          <TabsTrigger value="settings" className="hidden md:block">
            Ayarlar
          </TabsTrigger>
        </TabsList>

        {/* Genel Bakış Sekmesi */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Araç
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCars}</div>
                <p className="text-xs text-muted-foreground">
                  Sistemdeki toplam araç sayısı
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Kullanıcı
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Kayıtlı kullanıcı sayısı
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Görüntülenme
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">
                  Tüm ilanların toplam görüntülenme sayısı
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Satılan Araçlar
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  Toplam satılan araç adedi
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>Son Eklenen İlanlar</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Araç</TableHead>
                      <TableHead>Fiyat</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestListings.slice(0, 5).map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">
                          {listing.marka} {listing.model} ({listing.model_yili})
                        </TableCell>
                        <TableCell>
                          {formatCurrency(listing.fiyat)}
                        </TableCell>
                        <TableCell>
                          {formatDate(listing.created_at)}
                        </TableCell>
                        <TableCell>{listing.kullanici?.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/araclar">Tüm İlanları Görüntüle</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Bekleyen İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingActions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>Bekleyen işlem bulunmuyor</p>
                    </div>
                  ) : (
                    pendingActions.map((action) => (
                      <div
                        key={action.id}
                        className="flex justify-between items-start border rounded-md p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {action.marka} {action.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(action.created_at)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Araçlar Sekmesi */}
        <TabsContent value="cars" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Tüm Araçlar</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Araç ara..."
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Yeni İlan</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "list" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Araç</TableHead>
                      <TableHead>Yıl</TableHead>
                      <TableHead>Fiyat</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-mono text-xs">
                          {listing.id.substring(0, 6)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {listing.marka} {listing.model}
                        </TableCell>
                        <TableCell>{listing.model_yili}</TableCell>
                        <TableCell>
                          {formatCurrency(listing.fiyat)}
                        </TableCell>
                        <TableCell>
                          {formatDate(listing.created_at)}
                        </TableCell>
                        <TableCell>{listing.kullanici?.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {filteredListings.map((listing) => (
                    <Card key={listing.id}>
                      <CardContent className="p-0">
                        <div className="h-40 bg-muted flex items-center justify-center">
                          <Car className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">
                            {listing.marka} {listing.model}
                          </h3>
                          <div className="flex justify-between mt-1">
                            <div className="text-sm text-muted-foreground">
                              {listing.model_yili}
                            </div>
                            <div className="font-medium text-sm">
                              {formatCurrency(listing.fiyat)}
                            </div>
                          </div>
                          <div className="flex justify-between mt-3">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Düzenle
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kullanıcılar Sekmesi */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Kullanıcı yönetimi modülü geliştirme aşamasındadır.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raporlar Sekmesi */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İstatistikler ve Raporlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-40 text-muted-foreground flex-col gap-2">
                <BarChart3 className="h-10 w-10" />
                <p>Raporlama modülü geliştirme aşamasındadır.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ayarlar Sekmesi */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Ayarları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-40 text-muted-foreground flex-col gap-2">
                <Settings className="h-10 w-10" />
                <p>Ayarlar modülü geliştirme aşamasındadır.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 