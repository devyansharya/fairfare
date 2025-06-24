
import { useState } from 'react';
import { Car, Zap, Shield, Clock } from 'lucide-react';
import SearchForm, { SearchData } from '../components/SearchForm';
import PriceComparison from '../components/PriceComparison';
import Login from '../components/Login';
import PointsBar from '../components/PointsBar';
import Rewards from './Rewards';
import { CabService } from '../components/CabServiceCard';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UserData {
  id: number;
  email: string;
  username: string;
  points: number;
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchResults, setSearchResults] = useState<CabService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [lastSearchData, setLastSearchData] = useState<SearchData | null>(null);

  const handleLogin = (user: UserData) => {
    setUserData(user);
    setIsLoggedIn(true);
    toast({
      title: `Welcome to Fairfare, ${user.username}!`,
      description: `Logged in successfully. You have ${user.points} points!`,
    });
  };

  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    setSearchResults([]);
    setHasSearched(false);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSearch = async (searchData: SearchData) => {
    setIsLoading(true);
    setLastSearchData(searchData);
    
    try {
      // Store locations for booking redirects
      localStorage.setItem('lastPickup', searchData.pickup.address);
      localStorage.setItem('lastDestination', searchData.destination.address);
      
      // Calculate route using distance formula
      const { calculateRoute } = await import('../lib/distanceCalculation');
      const { FareCalculator } = await import('../lib/fareCalculation');
      
      const route = calculateRoute(searchData.pickup, searchData.destination);
      
      // Get fares from all services with error handling
      let olafares, uberFares;
      
      try {
        olafares = FareCalculator.calculateOlaFare({
          distance: route.distance * 1000, // Convert to meters
          duration: route.duration * 60, // Convert to seconds
          distanceText: route.distanceText,
          durationText: route.durationText
        });
      } catch (error) {
        console.error('Ola fare calculation error:', error);
        throw new Error('Unable to calculate Ola fares');
      }
      
      try {
        uberFares = FareCalculator.calculateUberFare({
          distance: route.distance * 1000,
          duration: route.duration * 60,
          distanceText: route.distanceText,
          durationText: route.durationText
        });
      } catch (error) {
        console.error('Uber fare calculation error:', error);
        throw new Error('Unable to calculate Uber fares');
      }
      
      // Always include Namma Yatri with calculated fares (API often unavailable)
      const nammaYatriFare = {
        serviceId: 'namma-yatri',
        serviceName: 'Namma Yatri',
        vehicleType: 'Auto',
        fare: {
          baseFare: 25,
          distanceFare: route.distance * 12,
          timeFare: 0,
          surgeMultiplier: 1.0,
          platformFee: Math.min(10, route.distance * 0.8),
          taxes: 0,
          total: 25 + (route.distance * 12) + Math.min(10, route.distance * 0.8)
        },
        estimatedTime: route.durationText,
        features: ['Open Source', 'No Surge Pricing', 'Driver Friendly', 'Transparent Pricing'],
        estimateId: undefined,
        searchId: undefined
      };
      
      const nammaYatriFares = [nammaYatriFare];
      
      const allFares = [olafares, uberFares, ...nammaYatriFares];
      
      // Convert to CabService format with real data only
      const cabServices = allFares.map((fare, index) => ({
        id: `${fare.serviceId}-${index}`,
        name: fare.serviceName,
        logo: `/logos/${fare.serviceId}.png`,
        price: Math.round(fare.fare.total),
        originalPrice: undefined, // Remove fake original prices
        rating: undefined, // Remove fake ratings
        reviews: undefined, // Remove fake reviews
        estimatedTime: fare.estimatedTime,
        capacity: fare.vehicleType.includes('AUTO') || fare.vehicleType.includes('Auto') ? 3 : 4,
        features: fare.features,
        isRecommended: fare.serviceId === 'namma-yatri',
        carType: fare.vehicleType,
        estimateId: fare.estimateId,
        searchId: fare.searchId,
        serviceData: fare
      })).sort((a, b) => a.price - b.price);
      
      setSearchResults(cabServices);
      setHasSearched(true);
      
      toast({
        title: "Fare Comparison Ready!",
        description: `${route.distanceText} trip from ${searchData.pickup.address.split(',')[0]} to ${searchData.destination.address.split(',')[0]}`,
      });
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Unable to calculate fares. Please check your locations and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectService = async (service: CabService) => {
    try {
      const { redirectToApp } = await import('../lib/fareCalculation');
      
      // Calculate distance and award points
      if (userData && lastSearchData) {
        const { calculateRoute } = await import('../lib/distanceCalculation');
        const route = calculateRoute(lastSearchData.pickup, lastSearchData.destination);
        const pointsEarned = Math.floor(route.distance / 3);
        
        // Create booking record
        try {
          await apiRequest('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.id,
              serviceId: service.serviceData?.serviceId || service.name.toLowerCase().replace(' ', '-'),
              serviceName: service.name,
              pickupAddress: lastSearchData.pickup.address,
              destinationAddress: lastSearchData.destination.address,
              distance: route.distance,
              fare: service.price
            })
          });
          
          // Update user points locally
          const newPoints = userData.points + pointsEarned;
          setUserData({ ...userData, points: newPoints });
          
          toast({
            title: "Booking Confirmed!",
            description: `${service.name} booked! You earned ${pointsEarned} points for ${route.distanceText}`,
          });
          
        } catch (bookingError) {
          console.error('Booking record error:', bookingError);
        }
      }
      
      // Redirect to app
      const pickup = localStorage.getItem('lastPickup') || '';
      const destination = localStorage.getItem('lastDestination') || '';
      
      if (service.serviceData) {
        redirectToApp(service.serviceData, pickup, destination);
      } else {
        // Generic redirect based on service name
        const serviceName = service.name.toLowerCase();
        let redirectUrl = '';
        
        if (serviceName.includes('ola')) {
          redirectUrl = `https://book.olacabs.com/?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(destination)}`;
        } else if (serviceName.includes('uber')) {
          redirectUrl = `https://m.uber.com/looking?pickup_nickname=${encodeURIComponent(pickup)}&dropoff_nickname=${encodeURIComponent(destination)}`;
        } else {
          redirectUrl = 'https://nammayatri.in/open?source=fairfare';
        }
        
        window.open(redirectUrl, '_blank');
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Unable to process booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRewardsClick = () => {
    setShowRewards(true);
  };

  const handleBackFromRewards = () => {
    setShowRewards(false);
  };

  const handlePointsUpdate = (newPoints: number) => {
    if (userData) {
      setUserData({ ...userData, points: newPoints });
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Show rewards page if requested
  if (showRewards && userData) {
    return (
      <Rewards
        userId={userData.id}
        userPoints={userData.points}
        onBack={handleBackFromRewards}
        onPointsUpdate={handlePointsUpdate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Points Bar */}
      {userData && (
        <PointsBar 
          points={userData.points} 
          username={userData.username} 
          onLogout={handleLogout}
          onRewardsClick={handleRewardsClick}
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-2xl">
                <Car className="h-12 w-12 text-black" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Compare <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">Cab Prices</span>
              <br />
              in Seconds
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Find the best deals on rides from all major cab services. Save time and money with our instant price comparison.
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-16">
            <SearchForm onSearch={handleSearch} />
          </div>

          {/* Features */}
          {!hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-yellow-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Instant Results</h3>
                <p className="text-gray-300">Get real-time prices from all major cab services in one search.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Best Prices</h3>
                <p className="text-gray-300">Compare prices and find the most affordable option for your trip.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Save Time</h3>
                <p className="text-gray-300">No need to check multiple apps. We do the comparison for you.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">Searching for the best rides...</h2>
            <p className="text-gray-300">Comparing prices from all available services</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !isLoading && searchResults.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <PriceComparison 
            services={searchResults} 
            onSelectService={handleSelectService}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
