"use client";

import { useState } from "react";
import { User, Phone, Mail, MessageSquare, Clock, Shield, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";

interface SellerContactCardProps {
  seller: {
    id: string;
    isim?: string;
    telefon?: string;
    email?: string;
    profil_resmi?: string;
    uyelik_tarihi?: string;
    onay_durumu?: "onaylı" | "onaysız";
    cevap_suresi?: string;
  };
}

export function SellerContactCard({ seller }: SellerContactCardProps) {
  const [isCopyingNumber, setIsCopyingNumber] = useState(false);
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  
  const sellerInfo = {
    id: seller?.id || "unknown",
    isim: seller?.isim || "İsimsiz Satıcı",
    telefon: seller?.telefon || "+90 (555) 555-5555",
    email: seller?.email || "satici@mail.com",
    profil_resmi: seller?.profil_resmi,
    uyelik_tarihi: seller?.uyelik_tarihi || "2023",
    onay_durumu: seller?.onay_durumu || "onaysız",
    cevap_suresi: seller?.cevap_suresi || "Genellikle 1 saat içinde"
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(sellerInfo.telefon);
    setIsCopyingNumber(true);
    toast.success("Telefon numarası kopyalandı!");
    
    setTimeout(() => {
      setIsCopyingNumber(false);
    }, 2000);
  };

  const toggleEmailVisibility = () => {
    setIsEmailVisible(!isEmailVisible);
  };

  const sendEmail = () => {
    window.location.href = `mailto:${sellerInfo.email}?subject=Araç İlanı Hakkında`;
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Satıcı Bilgileri</h2>
      
      {/* Satıcı profili */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          {sellerInfo.profil_resmi ? (
            <img 
              src={sellerInfo.profil_resmi} 
              alt={sellerInfo.isim} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <div>
          <div className="font-medium flex items-center gap-1">
            {sellerInfo.isim}
            {sellerInfo.onay_durumu === "onaylı" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Shield className="h-4 w-4 text-green-500 fill-green-500/20" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Onaylı Satıcı</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{sellerInfo.uyelik_tarihi}'den beri üye</span>
          </div>
        </div>
      </div>
      
      {/* İletişim butonları */}
      <div className="space-y-3">
        <Button 
          variant={isCopyingNumber ? "outline" : "default"}
          className="w-full gap-2 h-11 font-medium transition-all" 
          onClick={copyPhoneNumber}
        >
          {isCopyingNumber ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Kopyalandı!</span>
            </>
          ) : (
            <>
              <Phone className="h-4 w-4" />
              {sellerInfo.telefon}
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full gap-2 h-11 font-medium" 
          onClick={sendEmail}
        >
          <Mail className="h-4 w-4" />
          E-posta Gönder
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full gap-2 h-11 font-medium" 
        >
          <MessageSquare className="h-4 w-4" />
          Mesaj Gönder
        </Button>
      </div>
      
      {/* Cevap hızı */}
      <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 text-primary/60" />
        <span>{sellerInfo.cevap_suresi} cevap veriyor</span>
      </div>
    </div>
  );
} 