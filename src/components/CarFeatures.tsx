import { Check } from "lucide-react";

interface CarFeaturesProps {
  features: string[];
}

export function CarFeatures({ features = [] }: CarFeaturesProps) {
  // Özelliklerin boş olması durumunda varsayılan bir liste göster
  const displayFeatures = features.length > 0 
    ? features 
    : [
      "ABS",
      "Elektronik Stabilite Kontrolü (ESP)",
      "Yolcu Hava Yastığı",
      "Sürücü Hava Yastığı",
      "Merkezi Kilit",
      "Klima",
      "Elektrikli Camlar"
    ];

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Donanım ve Özellikler</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {displayFeatures.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 