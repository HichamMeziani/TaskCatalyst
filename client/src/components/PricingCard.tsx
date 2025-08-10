import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  onSelect: () => void;
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  isPopular = false,
  buttonText,
  onSelect,
}: PricingCardProps) {
  return (
    <Card className={`p-8 relative ${isPopular ? "border-2 border-primary" : ""}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary px-4 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <div className="text-3xl font-bold mb-6">
        {price}
        {price !== "Free" && (
          <span className="text-lg text-muted-foreground">/month</span>
        )}
      </div>
      
      <p className="text-muted-foreground mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-success" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        className={`w-full ${isPopular ? "bg-primary hover:bg-primary/90" : ""}`}
        variant={isPopular ? "default" : "outline"}
        onClick={onSelect}
      >
        {buttonText}
      </Button>
    </Card>
  );
}
