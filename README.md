# BoostX Mobile Application Workspace

This directory contains the customer-facing mobile web application and Progressive Web App (PWA) for the **BoostX** platform.

## Architecture & Safe Separation Plan (Phase 1 Completed)

The customer-facing application views have been extracted from the monolithic `App.tsx` file and organized into clean, modular React components within the `/src/screens` folder.

### Customer-Facing Modular Screens (Separated)

The following components are now separated into individual files under `src/screens/`:

1.  **Home** (`src/screens/HomeScreen.tsx`): The Saudi-themed premium luxury home interface displaying story highlights, active ads, categories grid, and list of nearby stores.
2.  **Search** (`src/screens/SearchScreen.tsx`): Advanced search center with smart tag filters, voice search simulator, and trending items.
3.  **Stores & Products** (`src/screens/StoresScreen.tsx`): Store detail views showing menu options, product highlights, and a customizable shopping cart/extra specifications bottom sheet.
4.  **Cart** (`src/screens/CartScreen.tsx`): Complete checkout sheet supporting quick payment via Apple Pay and promo code activation.
5.  **Orders** (`src/screens/OrdersScreen.tsx`): Customer order history divided into active, previous, and cancelled categories.
6.  **Offers** (`src/screens/OffersScreen.tsx`): Mega discount hub showcasing seasons events tickets, VIP subscription packages, and combo bundles.
7.  **Profile** (`src/screens/ProfileScreen.tsx`): Customer profile, digital wallet with charge simulation, general settings, and FCM notification simulator.
8.  **Tracking** (`src/screens/TrackingScreen.tsx`): Real-time live GPS order tracking simulation on an SVG map with Bezier path matching.
9.  **Notifications** (`src/screens/NotificationsScreen.tsx`): Alerts and notification logs for orders, payments, and system notices.

---

## Workspace Separation Summary

### 📱 Parts Belonging to Mobile Web / PWA Workspace
*   **Customer Screens:** Splash screen, onboarding views, standard login/OTP verification flow.
*   **Client Core UI:** Home, Search, Stores, Products, Checkout (Cart), Order list, Offers center, and Profile manager.
*   **Mini-Dashboards:** Lightweight status boards for partners/drivers/technicians to track quick stats directly from a mobile device without launching full management portals.

### 💻 Parts Belonging to Web Dashboard Workspace (`boostx-web-control-center`)
*   **SuperAdmin Portal:** Global role approvals, financial monitoring, and geographic operations logs.
*   **Admin Console:** Partner/driver document verification and fraud control panel.
*   **Full Business Dashboards:** Heavy operational consoles for store product cataloging, order fullfillment, fleet tracking, and deep ads analytics.
*   **Administrative Utilities:** WhatsApp automated message setup, raw Supabase database sandbox query execution.

---

## Next Steps for Separation
1.  **Refactor Main Entry Point:** Rewrite `boostx-mobile-app/src/App.tsx` to directly mount these newly separated modular screens instead of rendering inline cases, enabling massive code reduction.
2.  **Web Dashboard Cleanup:** Perform a similar component extraction for `boostx-web-control-center`, removing all duplicated customer-facing screens to reduce bundle sizes of the administrative portal.
3.  **Move Shared Styles and Core APIs:** Unify core CSS tokens (`App.css`) and shared Supabase hooks into the `shared` monorepo package so they can be securely imported without cross-folder references.
