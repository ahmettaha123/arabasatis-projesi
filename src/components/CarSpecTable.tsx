interface CarSpecTableProps {
  car: {
    marka: string;
    model: string;
    model_yili: number;
    kilometre: number;
    yakit_tipi: string;
    vites_tipi: string;
    motor_hacmi?: string;
    motor_gucu?: string;
    kasa_tipi?: string;
    renk?: string;
    cekis?: string;
    silindir_sayisi?: number;
    kapi_sayisi?: number;
    garanti_durumu?: string;
    plaka_uyrugu?: string;
    [key: string]: any;
  };
}

export function CarSpecTable({ car }: CarSpecTableProps) {
  const specs = [
    { label: "Marka", value: car.marka },
    { label: "Model", value: car.model },
    { label: "Yıl", value: car.model_yili },
    { label: "Kilometre", value: `${car.kilometre.toLocaleString()} km` },
    { label: "Yakıt Tipi", value: car.yakit_tipi },
    { label: "Vites Tipi", value: car.vites_tipi },
    { label: "Motor Hacmi", value: car.motor_hacmi || "-" },
    { label: "Motor Gücü", value: car.motor_gucu || "-" },
    { label: "Kasa Tipi", value: car.kasa_tipi || "-" },
    { label: "Renk", value: car.renk || "-" },
    { label: "Çekiş", value: car.cekis || "-" },
    { label: "Silindir Sayısı", value: car.silindir_sayisi || "-" },
    { label: "Kapı Sayısı", value: car.kapi_sayisi || "-" },
    { label: "Garanti Durumu", value: car.garanti_durumu || "Yok" },
    { label: "Plaka Uyruğu", value: car.plaka_uyrugu || "TR" },
  ];

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Teknik Özellikler</h3>
      <div className="overflow-hidden rounded-md border border-muted">
        {specs.map((spec, index) => (
          <div 
            key={index} 
            className="grid grid-cols-2 gap-4 px-4 py-3 border-b last:border-b-0 border-muted even:bg-muted/30"
          >
            <div className="text-sm font-medium text-muted-foreground">{spec.label}</div>
            <div className="text-sm font-medium">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 