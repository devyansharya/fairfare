
import React from 'react';
import { TrendingDown, Award, Clock } from 'lucide-react';
import CabServiceCard, { CabService } from './CabServiceCard';

interface PriceComparisonProps {
  services: CabService[];
  onSelectService: (service: CabService) => void;
}

const PriceComparison = ({ services, onSelectService }: PriceComparisonProps) => {
  const cheapestPrice = Math.min(...services.map(s => s.price));
  const fastestService = services.reduce((prev, current) => {
    // Extract numeric value from time strings like "25 min"
    const prevTime = parseInt(prev.estimatedTime.replace(/\D/g, ''));
    const currentTime = parseInt(current.estimatedTime.replace(/\D/g, ''));
    return prevTime < currentTime ? prev : current;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-2xl border border-yellow-500">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-500">Best Price</p>
              <p className="text-2xl font-bold text-white">₹{cheapestPrice}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-2xl border border-yellow-500">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-3 rounded-full">
              <Clock className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-500">Fastest Pickup</p>
              <p className="text-2xl font-bold text-white">{fastestService.estimatedTime}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-2xl border border-yellow-500">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-3 rounded-full">
              <Award className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-500">Options Found</p>
              <p className="text-2xl font-bold text-white">{services.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Available Rides</h2>
        <p className="text-yellow-500">Compare prices and choose the best option for your trip</p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <CabServiceCard
            key={service.id}
            service={service}
            onSelect={onSelectService}
          />
        ))}
      </div>
    </div>
  );
};

export default PriceComparison;
