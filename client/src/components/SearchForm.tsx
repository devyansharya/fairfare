import { useState } from 'react';
import { MapPin, Calendar, Clock, Search, ArrowUpDown, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import SimpleLocationSearch from './SimpleLocationSearch';

interface LocationData {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

export interface SearchData {
  pickup: LocationData;
  destination: LocationData;
  date: string;
  time: string;
}

interface SearchFormProps {
  onSearch: (data: SearchData) => void;
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [pickup, setPickup] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toTimeString().slice(0, 5);
  });

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const getMaxDate = () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    return future.toISOString().split('T')[0];
  };

  const getMinTime = () => {
    const now = new Date();
    const selected = new Date(date);
    if (selected.toDateString() === now.toDateString()) {
      now.setMinutes(now.getMinutes() + 2);
      return now.toTimeString().slice(0, 5);
    }
    return "00:00";
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    // Don't auto-adjust time anymore - let user set any time they want
  };

  const swapLocations = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();
        if (data.results[0]) {
          setPickup({
            address: data.results[0].formatted_address,
            lat,
            lng,
            placeId: data.results[0].place_id
          });
        }
      } catch (e) {
        console.error("Location error", e);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ Compare button clicked");
    
    if (!pickup || !destination) {
      console.log("❌ Missing pickup or destination");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 2); // Allow booking just 2 minutes ahead
    
    if (selectedDateTime < now) {
      console.log("❌ Invalid date/time - must be at least 2 minutes from now");
      return;
    }

    console.log("📍 Calling onSearch with:", { pickup, destination, date, time });
    
    onSearch({
      pickup,
      destination,
      date,
      time
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-black/90 backdrop-blur-sm">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Pickup Location
              </label>
              <div className="flex gap-2">
                <SimpleLocationSearch
                  placeholder="Enter pickup"
                  value={pickup?.address || ''}
                  onChange={setPickup}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Button type="button" onClick={getCurrentLocation} className="px-3 bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Drop */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Destination
              </label>
              <div className="flex gap-2">
                <SimpleLocationSearch
                  placeholder="Enter destination"
                  value={destination?.address || ''}
                  onChange={setDestination}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Button type="button" onClick={swapLocations} className="px-3 bg-yellow-500 hover:bg-yellow-600 text-black">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="h-12 text-lg border-2 border-yellow-500 bg-black text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                min={getMinTime()}
                className="h-12 text-lg border-2 border-yellow-500 bg-black text-white"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-black shadow-md">
            <Search className="mr-2 h-5 w-5" />
            Compare Prices
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
