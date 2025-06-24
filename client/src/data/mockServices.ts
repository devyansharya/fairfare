
import { CabService } from '../components/CabServiceCard';

export const mockCabServices: CabService[] = [
  {
    id: '1',
    name: 'Uber X',
    logo: '🚗',
    price: 18,
    originalPrice: 22,
    rating: 4.8,
    reviews: 1250,
    estimatedTime: '3-5 min',
    capacity: 4,
    features: ['GPS Tracking', 'In-app Payment', 'Rating System'],
    isRecommended: true,
    carType: 'Standard'
  },
  {
    id: '2',
    name: 'Lyft',
    logo: '🚙',
    price: 19,
    rating: 4.7,
    reviews: 980,
    estimatedTime: '4-6 min',
    capacity: 4,
    features: ['GPS Tracking', 'In-app Payment', 'Friendly Drivers'],
    carType: 'Standard'
  },
  {
    id: '3',
    name: 'Uber Black',
    logo: '🚘',
    price: 35,
    rating: 4.9,
    reviews: 750,
    estimatedTime: '5-8 min',
    capacity: 4,
    features: ['Premium Vehicle', 'Professional Driver', 'WiFi'],
    carType: 'Premium'
  },
  {
    id: '4',
    name: 'Local Taxi',
    logo: '🚕',
    price: 25,
    originalPrice: 28,
    rating: 4.5,
    reviews: 420,
    estimatedTime: '8-12 min',
    capacity: 4,
    features: ['Cash Payment', 'Local Knowledge', '24/7 Service'],
    carType: 'Standard'
  },
  {
    id: '5',
    name: 'Uber XL',
    logo: '🚐',
    price: 28,
    rating: 4.6,
    reviews: 650,
    estimatedTime: '6-9 min',
    capacity: 6,
    features: ['Extra Space', 'GPS Tracking', 'Group Travel'],
    carType: 'Large'
  },
  {
    id: '6',
    name: 'Green Cab',
    logo: '🌱',
    price: 20,
    rating: 4.4,
    reviews: 320,
    estimatedTime: '7-10 min',
    capacity: 4,
    features: ['Eco-Friendly', 'Electric Vehicle', 'Carbon Neutral'],
    carType: 'Eco'
  }
];
