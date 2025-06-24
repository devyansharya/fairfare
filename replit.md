# Fairfare - Cab Price Comparison Application

## Overview

Fairfare is a modern web application that allows users to compare cab prices across different ride-sharing services. The application features a sleek black and yellow design theme and provides users with the ability to search for rides, compare prices, and earn points through their usage.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: React Router DOM for client-side navigation
- **UI Components**: Comprehensive shadcn/ui component system with Radix UI primitives
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **Development**: Hot reload with Vite middleware integration

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Location**: `/shared/schema.ts` for shared types between client and server
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- Simple user authentication with username/password
- PostgreSQL-backed user storage
- Shared user types between frontend and backend
- Points-based reward system integrated into user profiles

### Search and Comparison Engine
- Location-based search functionality (pickup and destination)
- Date/time scheduling for future rides
- Mock data integration for cab services comparison
- Real-time price comparison display

### UI/UX Features
- Dark theme with yellow accent colors
- Responsive design optimized for mobile and desktop
- Toast notifications for user feedback
- Loading states and error handling
- Comprehensive form validation with React Hook Form

### Storage Layer
- Abstract storage interface (`IStorage`) for flexibility
- In-memory storage implementation for development
- Database-ready architecture for production scaling
- CRUD operations for user management

## Data Flow

1. **User Authentication**: Users log in through the Login component, which stores user data and points
2. **Search Process**: Users input search criteria via SearchForm component
3. **Price Comparison**: Mock cab services are displayed through PriceComparison component
4. **Service Selection**: Users can select preferred cab services and are redirected to booking
5. **Points System**: Users accumulate points displayed in the PointsBar component

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **react**: Frontend framework
- **@tanstack/react-query**: Data fetching and state management

### UI Dependencies
- **@radix-ui/**: Comprehensive primitive component library
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **drizzle-kit**: Database schema management
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Deployment Strategy

### Development Environment
- Monorepo structure with frontend/backend integration
- Replit-based development with integrated PostgreSQL
- Hot reload enabled through Vite middleware
- Port 5000 for Express server with Vite proxy for API calls
- Environment-based configuration

### Production Deployment
- Autoscale deployment target on Replit
- Build process: `npm run build` (Vite + esbuild)
- Start command: `npm run start`
- Static asset serving from `/dist/public`
- Database migrations via `npm run db:push`

### Configuration Management
- Environment variables for database connections
- Separate development and production configurations
- TypeScript path aliases for clean imports
- Modular component architecture

## Changelog
- June 22, 2025: Initial setup
- June 22, 2025: Successfully migrated project from Lovable to Replit
  - Fixed routing from React Router to wouter for Replit compatibility
  - Installed missing dependencies (react-router-dom, sonner, nanoid)
  - Created query client configuration with proper API request setup
  - Removed explicit React imports to work with Vite JSX transformer
  - Verified application loads and functions correctly on port 5000
- June 22, 2025: Added PostgreSQL database integration
  - Created database schema with users table (id, username, email, password, points, createdAt)
  - Implemented Drizzle ORM with Neon serverless PostgreSQL connection
  - Built API endpoints for user registration, login, and profile management
  - Updated Login component with registration/login toggle functionality
  - Migrated from in-memory storage to database storage with real user persistence
  - Successfully tested user registration - first user created with ID 1
- June 22, 2025: Integrated Google Maps API and real cab service APIs
  - Added Google Maps JavaScript API for location autocomplete and route calculation
  - Built LocationSearch component with real-time place predictions
  - Integrated actual Namma Yatri open-source API for live fare estimates
  - Implemented real fare calculation algorithms for Ola and Uber
  - Added deep linking functionality to redirect users to actual cab booking apps
  - Enhanced SearchForm with location-based search and current location detection
- June 22, 2025: Fixed location search with comprehensive city coverage
  - Created SimpleLocationSearch component with extensive Bengaluru and Chandigarh locations
  - Added Indranagar and 50+ popular areas including malls, transit hubs, and neighborhoods
  - Implemented fallback distance calculation using Haversine formula when Google Maps API unavailable
  - Fixed fare calculation system to work independently of external map services
  - Users can now search for specific areas like Indranagar, Koramangala, Sector 17 Chandigarh, etc.
- June 22, 2025: Completed full application refinement and validation
  - Fixed all currency displays to show rupees (₹) instead of dollars
  - Removed fake pricing data and reviews - now shows only authentic fare calculations
  - Implemented proper date/time validation preventing past bookings while allowing 24/7 scheduling
  - Enhanced fastest pickup calculation with accurate time parsing
  - Resolved all API fetch errors and ensured consistent Namma Yatri service display
  - Successfully tested end-to-end functionality with real location search and fare comparison
- June 24, 2025: Migrated from Replit Agent to proper monorepo structure
  - Configured Vite proxy to handle API calls to Express server
  - Fixed fare estimation to use server-side calculations via /api/fare-estimates endpoint
  - Implemented proper monorepo architecture with integrated frontend/backend
  - Database successfully configured with PostgreSQL and test user created
  - Login and authentication system working properly
  - Updated fare calculations with realistic current market rates for Bangalore
  - Added demo rewards for points redemption system (discounts, cashback, vouchers)
  - Fixed time validation to allow flexible booking times

## User Preferences

Preferred communication style: Simple, everyday language.