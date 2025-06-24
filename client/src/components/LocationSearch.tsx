import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getPlacePredictions, getPlaceDetails, LocationData } from '@/lib/googleMaps';

interface LocationSearchProps {
  placeholder: string;
  value: string;
  onChange: (location: LocationData | null) => void;
  icon?: React.ReactNode;
}

const serviceableCities = ['bangalore', 'hyderabad', 'chennai']; // Define serviceable cities

const LocationSearch = ({ placeholder, value, onChange, icon }: LocationSearchProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
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
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (newValue.trim().length < 3) {
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await getPlacePredictions(newValue);
        setPredictions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelectPrediction = async (prediction: google.maps.places.AutocompletePrediction) => {
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      const locationData = await getPlaceDetails(prediction.place_id);
      setInputValue(locationData.address);
      
      // Check if the selected location is serviceable
      const isServiceable = serviceableCities.some(city => locationData.address.toLowerCase().includes(city));
      if (!isServiceable) {
        alert('Namma Yatri is not available in your selected location.');
        onChange(null);
        return;
      }

      onChange(locationData);
    } catch (error) {
      console.error('Error getting place details:', error);
      onChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setInputValue('');
    setPredictions([]);
    setShowSuggestions(false);
    onChange(null);
  };

  return (
    <div ref={containerRef} className="relative">
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
            if (predictions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-yellow-500 dark:focus:border-yellow-500"
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
            className="absolute right-2 top-1 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {prediction.structured_formatting.secondary_text}
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

export default LocationSearch;
