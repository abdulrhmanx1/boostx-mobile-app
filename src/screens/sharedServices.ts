/**
 * BoostX Mobile App - Shared Backend Services Reference & Placeholders
 * 
 * This file serves as the centralized import configuration and documentation
 * for the transition to the shared Supabase/API monorepo layer in the next phase.
 * 
 * Do NOT fully refactor live components yet. Use these definitions as import placeholders.
 */

// Import path placeholder referencing the 'boostx-shared' workspace package
// both in local development and production bundles.
import { 
  homeService, 
  productService, 
  orderService, 
  trackingService, 
  notificationService,
  authService,
  settingsService
} from 'boostx-shared';

export {
  homeService,
  productService,
  orderService,
  trackingService,
  notificationService,
  authService,
  settingsService
};

// =====================================================================
// 📱 MOBILE SCREENS & CORRESPONDING SHARED SERVICES MAPPING
// =====================================================================
//
// 1. HomeScreen.tsx
//    - Service: 'homeService'
//    - Usage: Fetches sponsored ads, nearby partner profiles, and active story campaigns.
//
// 2. SearchScreen.tsx
//    - Service: 'homeService'
//    - Usage: Queries partners dynamically based on semantic voice & text search intents.
//
// 3. StoresScreen.tsx / ProductsScreen.tsx
//    - Service: 'productService'
//    - Usage: Pulls full catalog menu items and handles dynamic items availability.
//
// 4. CartScreen.tsx
//    - Service: 'orderService'
//    - Usage: Processes direct checkouts, registers transactions, and triggers secure payment.
//
// 5. OrdersScreen.tsx
//    - Service: 'orderService'
//    - Usage: Lists historical and current active client orders.
//
// 6. OffersScreen.tsx
//    - Service: 'homeService'
//    - Usage: Collects season festivals coupons, bundle combos, and loyalty points rewards.
//
// 7. TrackingScreen.tsx
//    - Service: 'trackingService'
//    - Usage: Subscribes to realtime driver GPS coordinates and displays linear Bezier paths.
//
// 8. NotificationsScreen.tsx
//    - Service: 'notificationService'
//    - Usage: Pulls system and transactional order notifications, marks them as read.
//
// 9. ProfileScreen.tsx
//    - Service: 'authService' & 'settingsService'
//    - Usage: Handles user session logout and general localization configurations.
//
// =====================================================================
