import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Location data for Bengaluru and Chandigarh
const indianLocations = [
  // Bengaluru Main City
  { address: "Bengaluru, Karnataka, India", lat: 12.9716, lng: 77.5946, placeId: "bangalore" },
  { address: "Kempegowda International Airport, Bengaluru", lat: 13.1979, lng: 77.7063, placeId: "bangalore-airport" },
  
  // Bengaluru Areas
  { address: "Indranagar, Bengaluru", lat: 12.9719, lng: 77.6412, placeId: "indranagar" },
  { address: "Koramangala, Bengaluru", lat: 12.9279, lng: 77.6271, placeId: "koramangala" },
  { address: "Electronic City, Bengaluru", lat: 12.8456, lng: 77.6603, placeId: "electronic-city" },
  { address: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7500, placeId: "whitefield" },
  { address: "HSR Layout, Bengaluru", lat: 12.9082, lng: 77.6476, placeId: "hsr-layout" },
  { address: "BTM Layout, Bengaluru", lat: 12.9165, lng: 77.6101, placeId: "btm-layout" },
  { address: "Jayanagar, Bengaluru", lat: 12.9237, lng: 77.5937, placeId: "jayanagar" },
  { address: "JP Nagar, Bengaluru", lat: 12.9099, lng: 77.5833, placeId: "jp-nagar" },
  { address: "Banashankari, Bengaluru", lat: 12.9184, lng: 77.5606, placeId: "banashankari" },
  { address: "Malleshwaram, Bengaluru", lat: 13.0067, lng: 77.5667, placeId: "malleshwaram" },
  { address: "Rajajinagar, Bengaluru", lat: 12.9915, lng: 77.5520, placeId: "rajajinagar" },
  { address: "MG Road, Bengaluru", lat: 12.9716, lng: 77.6197, placeId: "mg-road" },
  { address: "Brigade Road, Bengaluru", lat: 12.9716, lng: 77.6088, placeId: "brigade-road" },
  { address: "Commercial Street, Bengaluru", lat: 12.9831, lng: 77.6089, placeId: "commercial-street" },
  { address: "UB City Mall, Bengaluru", lat: 12.9721, lng: 77.6202, placeId: "ub-city" },
  { address: "Forum Mall, Koramangala", lat: 12.9352, lng: 77.6245, placeId: "forum-mall" },
  { address: "Orion Mall, Bengaluru", lat: 13.0358, lng: 77.5540, placeId: "orion-mall" },
  { address: "Phoenix MarketCity, Bengaluru", lat: 12.9698, lng: 77.7500, placeId: "phoenix-mall" },
  { address: "Indiranagar 100 Feet Road, Bengaluru", lat: 12.9716, lng: 77.6412, placeId: "indiranagar-100ft" },
  { address: "Domlur, Bengaluru", lat: 12.9591, lng: 77.6390, placeId: "domlur" },
  { address: "CV Raman Nagar, Bengaluru", lat: 12.9798, lng: 77.6533, placeId: "cv-raman-nagar" },
  { address: "Marathahalli, Bengaluru", lat: 12.9591, lng: 77.6974, placeId: "marathahalli" },
  { address: "Silk Board, Bengaluru", lat: 12.9177, lng: 77.6228, placeId: "silk-board" },
  { address: "Hebbal, Bengaluru", lat: 13.0358, lng: 77.5971, placeId: "hebbal" },
  { address: "Yeshwantpur, Bengaluru", lat: 13.0280, lng: 77.5540, placeId: "yeshwantpur" },
  { address: "Majestic, Bengaluru", lat: 12.9762, lng: 77.5714, placeId: "majestic" },
  { address: "Chickpete, Bengaluru", lat: 12.9698, lng: 77.5804, placeId: "chickpete" },
  { address: "Vijayanagar, Bengaluru", lat: 12.9716, lng: 77.5322, placeId: "vijayanagar" },
  { address: "Basavanagudi, Bengaluru", lat: 12.9395, lng: 77.5803, placeId: "basavanagudi" },
  { address: "Wilson Garden, Bengaluru", lat: 12.9395, lng: 77.6090, placeId: "wilson-garden" },
  { address: "Richmond Town, Bengaluru", lat: 12.9593, lng: 77.6063, placeId: "richmond-town" },
  { address: "Cunningham Road, Bengaluru", lat: 12.9855, lng: 77.5947, placeId: "cunningham-road" },
  { address: "Sadashivanagar, Bengaluru", lat: 13.0077, lng: 77.5830, placeId: "sadashivanagar" },
  { address: "RT Nagar, Bengaluru", lat: 13.0211, lng: 77.5954, placeId: "rt-nagar" },
  { address: "Banaswadi, Bengaluru", lat: 13.0115, lng: 77.6520, placeId: "banaswadi" },
  { address: "KR Puram, Bengaluru", lat: 12.9893, lng: 77.6946, placeId: "kr-puram" },
  { address: "Hoodi, Bengaluru", lat: 12.9893, lng: 77.7172, placeId: "hoodi" },
  { address: "Varthur, Bengaluru", lat: 12.9393, lng: 77.7503, placeId: "varthur" },
  { address: "Sarjapur, Bengaluru", lat: 12.8893, lng: 77.6946, placeId: "sarjapur" },
  { address: "Bellandur, Bengaluru", lat: 12.9248, lng: 77.6735, placeId: "bellandur" },
  
  // Chandigarh Main City
  { address: "Chandigarh, India", lat: 30.7333, lng: 76.7794, placeId: "chandigarh" },
  { address: "Chandigarh Airport", lat: 30.6735, lng: 76.7884, placeId: "chandigarh-airport" },
  
  // Chandigarh Sectors
  { address: "Sector 17, Chandigarh", lat: 30.7410, lng: 76.7841, placeId: "sector-17-chd" },
  { address: "Sector 22, Chandigarh", lat: 30.7298, lng: 76.7665, placeId: "sector-22-chd" },
  { address: "Sector 35, Chandigarh", lat: 30.7218, lng: 76.7665, placeId: "sector-35-chd" },
  { address: "Sector 43, Chandigarh", lat: 30.7218, lng: 76.8008, placeId: "sector-43-chd" },
  { address: "Sector 15, Chandigarh", lat: 30.7493, lng: 76.7665, placeId: "sector-15-chd" },
  { address: "Sector 34, Chandigarh", lat: 30.7298, lng: 76.7494, placeId: "sector-34-chd" },
  { address: "Sector 8, Chandigarh", lat: 30.7575, lng: 76.7837, placeId: "sector-8-chd" },
  { address: "Sector 9, Chandigarh", lat: 30.7575, lng: 76.7994, placeId: "sector-9-chd" },
  { address: "Sector 26, Chandigarh", lat: 30.7218, lng: 76.7837, placeId: "sector-26-chd" },
  { address: "Sector 32, Chandigarh", lat: 30.7298, lng: 76.8008, placeId: "sector-32-chd" },
  { address: "Sector 47, Chandigarh", lat: 30.7058, lng: 76.8008, placeId: "sector-47-chd" },
  
  // Chandigarh Nearby Areas
  { address: "Panchkula, Haryana", lat: 30.6942, lng: 76.8606, placeId: "panchkula" },
  { address: "Mohali, Punjab", lat: 30.7046, lng: 76.7179, placeId: "mohali" },
  { address: "Zirakpur, Punjab", lat: 30.6422, lng: 76.8178, placeId: "zirakpur" },
  { address: "Kharar, Punjab", lat: 30.7441, lng: 76.6469, placeId: "kharar" },
  { address: "Elante Mall, Chandigarh", lat: 30.7081, lng: 76.8066, placeId: "elante-mall" },
  { address: "ISBT Chandigarh", lat: 30.7410, lng: 76.7668, placeId: "isbt-chandigarh" },
  { address: "Railway Station Chandigarh", lat: 30.7081, lng: 76.8066, placeId: "railway-chandigarh" }
];

interface LocationData {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface SimpleLocationSearchProps {
  placeholder: string;
  value: string;
  onChange: (location: LocationData | null) => void;
  icon?: React.ReactNode;
}

const SimpleLocationSearch = ({ placeholder, value, onChange, icon }: SimpleLocationSearchProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    
    if (newValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    // Filter locations based on input
    const filtered = indianLocations.filter(location =>
      location.address.toLowerCase().includes(newValue.toLowerCase())
    ).slice(0, 5);
    
    setSuggestions(filtered);
    setShowSuggestions(true);
    setIsLoading(false);
  };

  const handleSelectSuggestion = (location: LocationData) => {
    setInputValue(location.address);
    setShowSuggestions(false);
    onChange(location);
  };

  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(null);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <div className="absolute left-3 top-3 text-gray-400">
          {icon || <MapPin className="h-4 w-4" />}
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-10 h-12 text-lg border-2 border-yellow-500 focus:border-yellow-400 transition-colors bg-black text-white placeholder:text-gray-400"
        />
        {isLoading && (
          <div className="absolute right-10 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="absolute right-2 top-1 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-black border border-yellow-500 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-800 border-b border-gray-700 last:border-b-0 focus:outline-none focus:bg-gray-800"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {suggestion.address.split(',')[0]}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {suggestion.address}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleLocationSearch;