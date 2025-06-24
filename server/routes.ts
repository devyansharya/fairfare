import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema, insertRedemptionSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        points: user.points 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        points: user.points 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Get user profile
  app.get("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        points: user.points 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update user points
  app.patch("/api/user/:id/points", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { points } = z.object({ points: z.number() }).parse(req.body);
      
      const user = await storage.updateUserPoints(id, points);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        points: user.points 
      });
    } catch (error) {
      console.error("Update points error:", error);
      res.status(400).json({ message: "Invalid data" });
    }
  });

  // Book a ride and award points
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Calculate points earned: 1 point per 3km
      const pointsEarned = Math.floor(bookingData.distance / 3);
      const bookingWithPoints = { ...bookingData, pointsEarned };
      
      // Create booking
      const booking = await storage.createBooking(bookingWithPoints);
      
      // Update user points and distance
      const user = await storage.getUser(bookingData.userId);
      if (user) {
        const newPoints = user.points + pointsEarned;
        const newDistance = (user.totalDistance || 0) + bookingData.distance;
        await storage.updateUserPoints(user.id, newPoints);
        await storage.updateUserDistance(user.id, newDistance);
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Booking error:", error);
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  // Get user bookings
  app.get("/api/bookings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all rewards
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Get rewards error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Redeem a reward
  app.post("/api/redemptions", async (req, res) => {
    try {
      const redemptionData = insertRedemptionSchema.parse(req.body);
      
      // Get user and check points
      const user = await storage.getUser(redemptionData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.points < redemptionData.pointsUsed) {
        return res.status(400).json({ message: "Insufficient points" });
      }
      
      // Create redemption
      const redemption = await storage.createRedemption(redemptionData);
      
      // Deduct points from user
      const newPoints = user.points - redemptionData.pointsUsed;
      await storage.updateUserPoints(user.id, newPoints);
      
      res.json(redemption);
    } catch (error) {
      console.error("Redemption error:", error);
      res.status(400).json({ message: "Invalid redemption data" });
    }
  });

  // Get user redemptions
  app.get("/api/redemptions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const redemptions = await storage.getUserRedemptions(userId);
      res.json(redemptions);
    } catch (error) {
      console.error("Get redemptions error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Fare estimation endpoint
  app.post("/api/fare-estimates", async (req, res) => {
    try {
      const { pickup, destination, distance, duration } = req.body;
      
      if (!pickup || !destination || !distance || !duration) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const distanceKm = distance / 1000;
      const durationMin = duration / 60;
      
      // Calculate surge multiplier based on time
      const getSurgeMultiplier = () => {
        const hour = new Date().getHours();
        if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
          return 1.2 + Math.random() * 0.3;
        }
        if (hour >= 23 || hour <= 5) {
          return 1.1 + Math.random() * 0.2;
        }
        return 1.0 + Math.random() * 0.1;
      };

      const surge = getSurgeMultiplier();

      // Ola calculation
      const olaConfig = distanceKm > 10 ? 
        { baseFare: 40, perKm: 15, perMin: 2, platformFee: 8 } :
        { baseFare: 25, perKm: 11, perMin: 1.5, platformFee: 5 };
      
      const olaDistanceFare = Math.max(0, distanceKm - 2) * olaConfig.perKm;
      const olaTimeFare = durationMin * olaConfig.perMin;
      const olaSubtotal = (olaConfig.baseFare + olaDistanceFare + olaTimeFare) * surge;
      const olaTaxes = olaSubtotal * 0.05;
      const olaTotal = olaSubtotal + olaConfig.platformFee + olaTaxes;

      // Uber calculation
      const uberConfig = distanceKm > 8 ? 
        { baseFare: 50, perKm: 18, perMin: 2.5, platformFee: 10 } :
        { baseFare: 30, perKm: 12, perMin: 1.8, platformFee: 6 };
      
      const uberDistanceFare = distanceKm * uberConfig.perKm;
      const uberTimeFare = durationMin * uberConfig.perMin;
      const uberSubtotal = (uberConfig.baseFare + uberDistanceFare + uberTimeFare) * surge;
      const uberTaxes = uberSubtotal * 0.05;
      const uberTotal = uberSubtotal + uberConfig.platformFee + uberTaxes;

      // Namma Yatri calculation (only for Bangalore area)
      const fareEstimates = [
        {
          serviceId: 'ola',
          serviceName: 'Ola',
          vehicleType: distanceKm > 10 ? 'Prime' : 'Mini',
          fare: {
            baseFare: olaConfig.baseFare,
            distanceFare: olaDistanceFare,
            timeFare: olaTimeFare,
            surgeMultiplier: surge,
            platformFee: olaConfig.platformFee,
            taxes: olaTaxes,
            total: Math.round(olaTotal)
          },
          estimatedTime: `${Math.ceil(durationMin)} min`,
          features: ['AC', 'Music', 'GPS Tracking'],
          deepLink: `https://book.olacabs.com/?serviceType=${distanceKm > 10 ? 'prime' : 'mini'}&utm_source=farefair`
        },
        {
          serviceId: 'uber',
          serviceName: 'Uber',
          vehicleType: distanceKm > 8 ? 'Premier' : 'Go',
          fare: {
            baseFare: uberConfig.baseFare,
            distanceFare: uberDistanceFare,
            timeFare: uberTimeFare,
            surgeMultiplier: surge,
            platformFee: uberConfig.platformFee,
            taxes: uberTaxes,
            total: Math.round(uberTotal)
          },
          estimatedTime: `${Math.ceil(durationMin)} min`,
          features: ['AC', 'Wi-Fi', 'Uber Safety'],
          deepLink: 'https://m.uber.com/looking?utm_source=farefair'
        }
      ];

      // Add Namma Yatri only for Bangalore area
      const isBangalore = pickup.address?.toLowerCase().includes('bengaluru') || 
                         pickup.address?.toLowerCase().includes('bangalore') ||
                         (pickup.lat >= 12.8 && pickup.lat <= 13.2 && pickup.lng >= 77.4 && pickup.lng <= 77.8);

      if (isBangalore) {
        const nammaBaseFare = 25;
        const nammaPerKm = 12;
        const nammaPickupFee = Math.min(10, distanceKm * 0.8);
        const nammaTotal = nammaBaseFare + (distanceKm * nammaPerKm) + nammaPickupFee;

        fareEstimates.push({
          serviceId: 'namma-yatri',
          serviceName: 'Namma Yatri',
          vehicleType: 'Auto',
          fare: {
            baseFare: nammaBaseFare,
            distanceFare: distanceKm * nammaPerKm,
            timeFare: 0,
            surgeMultiplier: 1.0,
            platformFee: nammaPickupFee,
            taxes: 0,
            total: Math.round(nammaTotal)
          },
          estimatedTime: `${Math.ceil(durationMin)} min`,
          features: ['Open Source', 'No Surge Pricing', 'Driver Friendly', 'Transparent Pricing'],
          deepLink: 'https://nammayatri.in'
        });
      }

      res.json({ fareEstimates: fareEstimates.sort((a, b) => a.fare.total - b.fare.total) });
    } catch (error) {
      console.error("Fare estimation error:", error);
      res.status(500).json({ message: "Failed to calculate fares" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
