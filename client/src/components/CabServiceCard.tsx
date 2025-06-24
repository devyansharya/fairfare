import React from "react";
import { Star, Clock, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CabService {
  id: string;
  name: string;
  logo: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  estimatedTime: string;
  capacity: number;
  features: string[];
  isRecommended?: boolean;
  carType: string;
  estimateId?: string;
  searchId?: string;
  serviceData?: any;
}

interface CabServiceCardProps {
  service: CabService;
  onSelect: (service: CabService) => void;
  isServiceAvailable: boolean; // New prop to check service availability
}

const CabServiceCard = ({
  service,
  onSelect,
  isServiceAvailable,
}: CabServiceCardProps) => {
  const discount = service.originalPrice
    ? Math.round(
        ((service.originalPrice - service.price) / service.originalPrice) * 100,
      )
    : 0;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-black border-yellow-500 ${
        service.isRecommended ? "ring-2 ring-yellow-500 ring-opacity-50" : ""
      }`}
    >
      {service.isRecommended && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-yellow-600 text-black px-4 py-1 text-sm font-medium rounded-bl-lg">
          <Zap className="inline h-3 w-3 mr-1" />
          Recommended
        </div>
      )}

      <CardContent className="p-6">
      

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-2xl font-bold text-black">
              {service.logo}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {service.name}
              </h3>
              <p className="text-sm text-yellow-500">{service.carType}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1">
              {service.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{service.originalPrice}
                </span>
              )}
              <span className="text-2xl font-bold text-yellow-500">
                ₹{service.price}
              </span>
            </div>
            {discount > 0 && (
              <Badge
                variant="destructive"
                className="text-xs bg-yellow-500 text-black"
              >
                {discount}% OFF
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-300">
          {service.rating && service.reviews ? (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{service.rating}</span>
              <span>({service.reviews} reviews)</span>
            </div>
          ) : (
            <div className="text-yellow-500 text-sm">Real-time pricing</div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>{service.estimatedTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-yellow-500" />
              <span>{service.capacity} seats</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {service.features.map((feature, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-yellow-500/20 text-yellow-500 border-yellow-500"
            >
              {feature}
            </Badge>
          ))}
        </div>

        <Button
          onClick={() => onSelect(service)}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black transition-all duration-300 font-semibold"
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default CabServiceCard;
