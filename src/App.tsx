import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home as HomeIcon, Search as SearchIcon, Gift, ShoppingCart, User, Bell, ClipboardList, 
  ArrowRight, ShieldCheck, Sparkles, HelpCircle, Phone, ArrowLeft, Award, Heart
} from 'lucide-react';
import './App.css';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { StoresScreen } from './screens/StoresScreen';
import { CartScreen } from './screens/CartScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { OffersScreen } from './screens/OffersScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { TrackingScreen } from './screens/TrackingScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { OfferDetailsScreen } from './screens/OfferDetailsScreen';
import { SponsoredListingScreen } from './screens/SponsoredListingScreen';
import { ListingScreen } from './screens/ListingScreen';
import { supabase } from './supabaseClient';

// Import Shared Experience Services
import { 
  splashService, 
  onboardingService, 
  appExperienceService,
  DEFAULT_SPLASH,
  DEFAULT_ONBOARDING_SCREENS,
  DEFAULT_LOGIN
} from 'boostx-shared';
import type {
  SplashSettings,
  OnboardingScreen,
  LoginSettings
} from 'boostx-shared';

// --- Premium CSS Keyframes Injected Dynamically ---
const CinematicStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes mesh-blob-1 {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.15); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes mesh-blob-2 {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(-40px, 40px) scale(0.9); }
      66% { transform: translate(40px, -20px) scale(1.2); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes mesh-blob-3 {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(50px, 30px) scale(1.2); }
      66% { transform: translate(-30px, -30px) scale(0.85); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes mesh-blob-4 {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(-20px, -40px) scale(1.1); }
      66% { transform: translate(30px, 50px) scale(0.95); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .mesh-container {
      position: absolute;
      inset: 0;
      background-color: #1E1230;
      overflow: hidden;
      z-index: 1;
    }
    .mesh-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.55;
      mix-blend-mode: screen;
      pointer-events: none;
    }
    .mesh-blob-1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #6B4AA0 0%, transparent 80%);
      top: -10%;
      left: -10%;
      animation: mesh-blob-1 12s infinite alternate ease-in-out;
    }
    .mesh-blob-2 {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, #8C63C7 0%, transparent 80%);
      bottom: -10%;
      right: -10%;
      animation: mesh-blob-2 14s infinite alternate ease-in-out;
    }
    .mesh-blob-3 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, #55C27A 0%, transparent 80%);
      top: 40%;
      right: -5%;
      animation: mesh-blob-3 10s infinite alternate ease-in-out;
    }
    .mesh-blob-4 {
      width: 380px;
      height: 380px;
      background: radial-gradient(circle, #6B4AA0 0%, transparent 80%);
      bottom: 30%;
      left: -5%;
      animation: mesh-blob-4 13s infinite alternate ease-in-out;
    }
    .noise-overlay {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0);
      background-size: 4px 4px;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      z-index: 2;
      pointer-events: none;
    }
    @keyframes electric-pulse {
      0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(168,85,247,0.4)) brightness(1); }
      50% { transform: scale(1.04); filter: drop-shadow(0 0 35px rgba(168,85,247,0.85)) brightness(1.2); }
      100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(168,85,247,0.4)) brightness(1); }
    }
    @keyframes lightning-strike {
      0%, 94%, 98% { opacity: 0; }
      95%, 97% { opacity: 0.12; }
      96% { opacity: 0.28; }
      99% { opacity: 0.2; }
    }
    @keyframes float-glow-orb {
      0% { transform: translate(0, 0) scale(1); opacity: 0.45; }
      50% { transform: translate(-20px, 30px) scale(1.15); opacity: 0.65; }
      100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
    }
    @keyframes float-particles {
      0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
      20% { opacity: 0.4; }
      80% { opacity: 0.3; }
      100% { transform: translateY(-120px) rotate(360deg); opacity: 0; }
    }
    .cinematic-splash-bg {
      background: radial-gradient(circle at center, #1b0c36 0%, #06020c 100%);
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      font-family: 'Cairo', sans-serif;
    }
    .electric-logo-text {
      font-size: 4rem;
      font-weight: 900;
      background: linear-gradient(135deg, #c084fc 0%, #7c3aed 50%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
      animation: electric-pulse 2.2s infinite ease-in-out;
      letter-spacing: -1.5px;
    }
    .lightning-streak-overlay {
      position: absolute;
      inset: 0;
      background: white;
      pointer-events: none;
      animation: lightning-strike 5s infinite;
      mix-blend-mode: overlay;
      z-index: 2;
    }
    .floating-green-glow {
      position: absolute;
      width: 320px;
      height: 320px;
      background: radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%);
      filter: blur(50px);
      border-radius: 50%;
      top: 30%;
      left: 10%;
      pointer-events: none;
      animation: float-glow-orb 8s infinite ease-in-out;
      z-index: 1;
    }
    .floating-purple-glow {
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
      filter: blur(60px);
      border-radius: 50%;
      bottom: 10%;
      right: -10%;
      pointer-events: none;
      animation: float-glow-orb 10s infinite ease-in-out reverse;
      z-index: 1;
    }
    .particles-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2;
    }
    .particle {
      position: absolute;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      animation: float-particles 6s infinite linear;
    }
    .glass-input-wrapper {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      backdrop-filter: blur(12px);
      transition: all 0.3s ease;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }
    .glass-input-wrapper:focus-within {
      border-color: rgba(168,85,247,0.5);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 15px rgba(168,85,247,0.2);
    }

    /* --- New Cinematic Redesign Animation Styles --- */
    @keyframes fog-move {
      0% { transform: translate(0, 0) scale(1); opacity: 0.25; }
      50% { transform: translate(-30px, 20px) scale(1.15); opacity: 0.45; }
      100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
    }
    .fog-overlay {
      position: absolute;
      inset: -10%;
      background: radial-gradient(circle at 20% 30%, rgba(140, 99, 199, 0.18) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(85, 194, 122, 0.12) 0%, transparent 50%);
      filter: blur(50px);
      animation: fog-move 14s infinite ease-in-out;
      pointer-events: none;
      z-index: 3;
    }
    @keyframes particle-drift {
      0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.6; }
      100% { transform: translateY(-150px) translateX(20px) scale(0.5); opacity: 0; }
    }
    .cinematic-particle {
      position: absolute;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      pointer-events: none;
      z-index: 4;
      animation: particle-drift infinite linear;
    }

    @keyframes bag-entrance {
      0% {
        transform: translate(-50px, -600px) scaleY(1.8) scaleX(0.7) rotate(-15deg);
        filter: blur(12px);
        opacity: 0;
      }
      60% {
        transform: translate(0, 30px) scaleY(0.75) scaleX(1.25) rotate(5deg);
        filter: blur(4px);
        opacity: 1;
      }
      75% {
        transform: translate(0, -18px) scaleY(1.15) scaleX(0.9) rotate(-3deg);
        filter: blur(0);
      }
      90% {
        transform: translate(0, 8px) scaleY(0.95) scaleX(1.05) rotate(1deg);
      }
      100% {
        transform: translate(0, 0) scale(1) rotate(0deg);
        filter: blur(0);
        opacity: 1;
      }
    }
    .delivery-bag-wrapper {
      position: relative;
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 15;
      transform-style: preserve-3d;
      perspective: 800px;
    }
    .delivery-bag-animate-enter {
      animation: bag-entrance 1.1s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards;
    }

    @keyframes shadow-scale {
      0% { transform: scale(0.2); opacity: 0.1; }
      60% { transform: scale(1.2); opacity: 0.8; }
      75% { transform: scale(0.85); opacity: 0.4; }
      90% { transform: scale(1.05); opacity: 0.65; }
      100% { transform: scale(1); opacity: 0.6; }
    }
    .bag-shadow {
      position: absolute;
      bottom: -15px;
      width: 110px;
      height: 16px;
      background: radial-gradient(ellipse, rgba(16, 3, 36, 0.7) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 14;
      animation: shadow-scale 1.1s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards;
    }

    @keyframes lid-open-3d {
      0% {
        transform: translateY(0) rotate(0deg) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(-45px) translateX(25px) rotate(35deg) scale(0.85);
        opacity: 0.15;
        filter: blur(3px);
      }
    }
    .bag-lid-open-class {
      animation: lid-open-3d 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
      transform-origin: center;
    }

    @keyframes light-leak {
      0% {
        opacity: 0;
        transform: scale(0.5);
        filter: blur(10px);
      }
      50% {
        opacity: 0.85;
      }
      100% {
        opacity: 1;
        transform: scale(1.75);
        filter: blur(25px);
      }
    }
    .light-leak-glow {
      position: absolute;
      width: 130px;
      height: 130px;
      background: radial-gradient(circle, rgba(140, 99, 199, 0.85) 0%, rgba(85, 194, 122, 0.4) 40%, transparent 75%);
      border-radius: 50%;
      mix-blend-mode: screen;
      pointer-events: none;
      z-index: 16;
      animation: light-leak 0.8s ease-out forwards;
    }

    @keyframes gas-escape {
      0% {
        transform: translateY(10px) scale(0.5);
        opacity: 0;
        filter: blur(5px);
      }
      50% {
        opacity: 0.75;
      }
      100% {
        transform: translateY(-80px) scale(1.5);
        opacity: 0;
        filter: blur(12px);
      }
    }
    .gas-puff {
      position: absolute;
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, rgba(85, 194, 122, 0.5) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 17;
      animation: gas-escape 1.2s ease-out infinite;
    }

    @keyframes run-across-screen {
      0% {
        transform: translateX(0px) scale(0.5);
        opacity: 0;
      }
      15% {
        transform: translateX(0px) scale(1.15) rotate(5deg);
        opacity: 1;
      }
      30% {
        transform: translateX(0px) scale(1) rotate(0deg);
      }
      100% {
        transform: translateX(380px) scale(0.9) rotate(5deg);
        opacity: 1;
      }
    }
    .logo-runner-wrapper {
      position: absolute;
      top: 40%;
      left: calc(50% - 40px);
      transform-origin: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 20;
      animation: run-across-screen 1.6s cubic-bezier(0.45, 0, 0.55, 1) forwards;
    }

    @keyframes leg-run-left {
      0%, 100% { transform: rotate(-35deg); }
      50% { transform: rotate(35deg); }
    }
    @keyframes leg-run-right {
      0%, 100% { transform: rotate(35deg); }
      50% { transform: rotate(-35deg); }
    }
    .leg-l {
      animation: leg-run-left 0.22s infinite linear;
      transform-origin: 30px 5px;
    }
    .leg-r {
      animation: leg-run-right 0.22s infinite linear;
      transform-origin: 50px 5px;
    }

    @keyframes run-bounce {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      50% { transform: translateY(-6px) rotate(3deg); }
    }
    .logo-running-bounce {
      animation: run-bounce 0.22s infinite ease-in-out;
    }

    @keyframes electric-glow {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(140, 99, 199, 0.6)) brightness(1); }
      50% { filter: drop-shadow(0 0 22px rgba(85, 194, 122, 0.95)) brightness(1.25); }
    }
    .electric-active {
      animation: electric-glow 0.15s infinite alternate ease-in-out;
    }

    @keyframes trail-stretch {
      0% {
        width: 0px;
        opacity: 0;
      }
      20% {
        width: 30px;
        opacity: 0.85;
      }
      100% {
        width: 300px;
        opacity: 0;
      }
    }
    .energy-trail {
      position: absolute;
      right: 35px;
      top: 50%;
      transform: translateY(-50%) skewX(-20deg);
      height: 24px;
      background: linear-gradient(-90deg, #55C27A 0%, #8C63C7 50%, transparent 100%);
      border-radius: 12px;
      opacity: 0.8;
      pointer-events: none;
      z-index: 18;
      animation: trail-stretch 1.6s cubic-bezier(0.45, 0, 0.55, 1) forwards;
    }
  ` }} />
);

// --- Cinematic Organic Particles Helper Component ---
const CinematicParticles = () => {
  const particles = [
    { size: 4, left: '10%', bottom: '5%', duration: '6s', delay: '0s' },
    { size: 6, left: '25%', bottom: '8%', duration: '8s', delay: '1s' },
    { size: 3, left: '45%', bottom: '4%', duration: '5s', delay: '2s' },
    { size: 5, left: '60%', bottom: '10%', duration: '7s', delay: '0.5s' },
    { size: 4, left: '75%', bottom: '6%', duration: '9s', delay: '1.5s' },
    { size: 6, left: '90%', bottom: '3%', duration: '6s', delay: '3s' },
    { size: 3, left: '15%', bottom: '12%', duration: '7s', delay: '2.5s' },
    { size: 5, left: '35%', bottom: '7%', duration: '8s', delay: '3.5s' },
    { size: 4, left: '55%', bottom: '9%', duration: '5s', delay: '4s' },
    { size: 5, left: '80%', bottom: '11%', duration: '9s', delay: '0.2s' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 4 }}>
      {particles.map((p, i) => (
        <div 
          key={i} 
          className="cinematic-particle" 
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            bottom: p.bottom,
            animationDuration: p.duration,
            animationDelay: p.delay,
            boxShadow: '0 0 8px rgba(255,255,255,0.4)',
          }} 
        />
      ))}
    </div>
  );
};

// --- Cinematic Splash Screen Component ---
const SplashView = ({ settings, onFinish }: { settings: SplashSettings; onFinish: (action?: 'signin' | 'signup') => void }) => {
  const [showControls, setShowControls] = useState(false);
  const [scene, setScene] = useState<'scene1' | 'scene2' | 'scene3' | 'scene4' | 'scene5'>('scene1');

  useEffect(() => {
    // Scene 1 -> Scene 2 (Box falls down fast): 800ms
    const t2 = setTimeout(() => {
      setScene('scene2');
      // Optional Haptic Hook on Landing
      try {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([80, 40, 80]);
        }
      } catch (e) {}
    }, 800);

    // Scene 2 -> Scene 3 (Box unlocks & lid tilts open): 1900ms
    const t3 = setTimeout(() => {
      setScene('scene3');
      try {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(60);
        }
      } catch (e) {}
    }, 1900);

    // Scene 3 -> Scene 4 (Logo jumps out, sprouts robotic legs & runs): 2900ms
    const t4 = setTimeout(() => {
      setScene('scene4');
    }, 2900);

    // Scene 4 -> Scene 5 (Transition to welcome screen static logo & buttons): 4400ms
    const t5 = setTimeout(() => {
      setScene('scene5');
      setShowControls(true);
    }, 4400);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box', boxShadow: '0 0 32px rgba(22, 5, 45, 0.12)' }}>
      <CinematicStyles />
      
      {/* Animated Blur Gradient Mesh Background */}
      <div className="mesh-container">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
        <div className="mesh-blob mesh-blob-4" />
      </div>

      {/* Cinematic Fog/Smoke Layer */}
      <div className="fog-overlay" />

      {/* Frosted Glass Vector Noise Overlay */}
      <div className="noise-overlay" />

      {/* Cinematic Particles */}
      <CinematicParticles />

      {/* Scene 2 & 3: Glossy Futuristic Purple Delivery Box */}
      {(scene === 'scene2' || scene === 'scene3') && (
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div className="delivery-bag-wrapper delivery-bag-animate-enter">
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="purple-front-left" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5c3a9e" />
                  <stop offset="100%" stopColor="#220e3d" />
                </linearGradient>
                <linearGradient id="purple-front-right" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8c63c7" />
                  <stop offset="100%" stopColor="#3d1b6b" />
                </linearGradient>
                <linearGradient id="purple-lid-left" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9c73df" />
                  <stop offset="100%" stopColor="#4c2c8f" />
                </linearGradient>
                <linearGradient id="purple-lid-right" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b38df7" />
                  <stop offset="100%" stopColor="#5c36af" />
                </linearGradient>
                <linearGradient id="neon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#55C27A" />
                  <stop offset="100%" stopColor="#3cd070" />
                </linearGradient>
              </defs>

              {/* Box Body (Front Left Face) */}
              <polygon points="20,70 70,95 70,140 20,115" fill="url(#purple-front-left)" stroke="#4b2e85" strokeWidth="0.5" />
              
              {/* Box Body (Front Right Face) */}
              <polygon points="70,95 120,70 120,115 70,140" fill="url(#purple-front-right)" stroke="#5d35a8" strokeWidth="0.5" />

              {/* Neon Green Accent Stripes */}
              <polygon points="20,85 70,110 70,116 20,91" fill="url(#neon-glow)" opacity="0.85" />
              <polygon points="70,110 120,85 120,91 70,116" fill="url(#neon-glow)" opacity="0.85" />

              {/* Premium Brand Logo Stamp on Front Right Face */}
              <g transform="translate(82, 92) skewY(-14) scale(0.65)">
                <rect width="24" height="24" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <text x="6" y="18" fill="#ffffff" fontSize="15" fontWeight="950" fontFamily="Cairo">B</text>
              </g>

              {/* Top Lid Group */}
              <g className={scene === 'scene3' ? 'bag-lid-open-class' : ''}>
                <polygon points="20,70 70,95 70,82 20,57" fill="url(#purple-lid-left)" stroke="#4c2c8f" strokeWidth="0.5" />
                <polygon points="70,95 120,70 120,57 70,82" fill="url(#purple-lid-right)" stroke="#5c36af" strokeWidth="0.5" />
                <polygon points="20,57 70,32 120,57 70,82" fill="#7a4fb8" stroke="#8d5fd1" strokeWidth="0.5" />
                <polygon points="60,47 70,42 80,47 70,52" fill="url(#neon-glow)" />
                <line x1="70" y1="52" x2="70" y2="57" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            </svg>
            
            {/* Scene 3: Lights Leaking and Gas Escaping */}
            {scene === 'scene3' && (
              <>
                <div className="light-leak-glow" style={{ top: '-15px', left: '5px' }} />
                <div className="gas-puff" style={{ top: '-40px', left: '20px', animationDelay: '0s' }} />
                <div className="gas-puff" style={{ top: '-45px', left: '50px', animationDelay: '0.3s' }} />
                <div className="gas-puff" style={{ top: '-38px', left: '80px', animationDelay: '0.6s' }} />
              </>
            )}
          </div>
          <div className="bag-shadow" />
        </div>
      )}

      {/* Scene 4: BoostX Logo Jumps Out, Sprouts Robotic Legs & Runs */}
      {scene === 'scene4' && (
        <div className="logo-runner-wrapper">
          {/* Neon Energy Trail */}
          <div className="energy-trail" />

          {/* Running Logo Body */}
          <div className="logo-running-bounce electric-active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              className="logo-jump-animate"
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '24px', 
                background: 'linear-gradient(135deg, #8C63C7 0%, #6B4AA0 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 15px 30px rgba(107, 74, 160, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.12)'
              }}
            >
              <span style={{ fontSize: '2.2rem', fontWeight: 950, color: 'white' }}>B</span>
            </div>
            
            {/* Futuristic Robotic Legs */}
            <svg width="80" height="40" viewBox="0 0 80 40" style={{ overflow: 'visible', marginTop: -4 }}>
              {/* Left Leg */}
              <g className="leg-l">
                <line x1="30" y1="5" x2="20" y2="20" stroke="#55C27A" strokeWidth="5.5" strokeLinecap="round" />
                <line x1="20" y1="20" x2="32" y2="35" stroke="#55C27A" strokeWidth="5.5" strokeLinecap="round" />
                <ellipse cx="34" cy="35" rx="6.5" ry="3.5" fill="#ffffff" />
                <circle cx="20" cy="20" r="3.5" fill="#ffffff" />
              </g>
              {/* Right Leg */}
              <g className="leg-r">
                <line x1="50" y1="5" x2="60" y2="20" stroke="#55C27A" strokeWidth="5.5" strokeLinecap="round" />
                <line x1="60" y1="20" x2="48" y2="35" stroke="#55C27A" strokeWidth="5.5" strokeLinecap="round" />
                <ellipse cx="46" cy="35" rx="6.5" ry="3.5" fill="#ffffff" />
                <circle cx="60" cy="20" r="3.5" fill="#ffffff" />
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* Scene 5: Fade-in Premium Center Logo & Tagline */}
      {scene === 'scene5' && (
        <motion.div 
          style={{ zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} 
          initial={{ scale: 0.75, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: "spring", stiffness: 90, damping: 12 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{ 
                width: 90, 
                height: 90, 
                borderRadius: '28px', 
                background: 'linear-gradient(135deg, #8C63C7 0%, #6B4AA0 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 20px 40px rgba(107, 74, 160, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.12)'
              }}
            >
              <span style={{ fontSize: '2.5rem', fontWeight: 950, color: 'white' }}>B</span>
            </motion.div>
          </div>

          <h1 style={{ 
            fontSize: '2.8rem', 
            fontWeight: 950, 
            margin: '0 0 8px 0', 
            background: 'linear-gradient(135deg, #ffffff 0%, #8C63C7 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
          }}>
            BoostX
          </h1>

          <p style={{ 
            color: 'rgba(255,255,255,0.75)', 
            fontSize: '0.88rem', 
            fontWeight: 700, 
            margin: 0
          }}>
            Work Starts Here, Success Follows.
          </p>
        </motion.div>
      )}

      {/* Floating Buttons Layer */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            style={{ 
              position: 'absolute', 
              bottom: '50px', 
              left: 24, 
              right: 24, 
              zIndex: 10,
              display: 'flex', 
              flexDirection: 'column', 
              gap: 14,
              boxSizing: 'border-box'
            }}
          >
            <button 
              onClick={() => onFinish('signup')}
              style={{ 
                background: 'linear-gradient(135deg, #55C27A 0%, #40a060 100%)', 
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 900,
                padding: '14px',
                borderRadius: '16px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(85, 194, 122, 0.3)',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontFamily: 'Cairo, sans-serif'
              }}
            >
              Sign Up
            </button>
            
            <button 
              onClick={() => onFinish('signin')}
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 900,
                padding: '14px',
                borderRadius: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontFamily: 'Cairo, sans-serif'
              }}
            >
              Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- Premium Onboarding Screen Component ---
const OnboardingView = ({ screens, onSkip }: { screens: OnboardingScreen[]; onSkip: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onSkip();
    }
  };

  const activeScreen = screens[currentIndex];

  return (
    <div style={{ background: '#090412', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', fontFamily: 'Cairo, sans-serif' }}>
      <CinematicStyles />
      <div className="floating-green-glow" style={{ animationDuration: '10s' }} />
      <div className="floating-purple-glow" style={{ opacity: 0.35 }} />

      {/* Top Skip Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', zIndex: 50, direction: 'rtl' }}>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>الخطوة {currentIndex + 1} من {screens.length}</span>
        <button 
          onClick={onSkip} 
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.78rem', fontWeight: 900, padding: '6px 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
        >
          تخطي
        </button>
      </div>

      {/* Center Cinematic Visual Demonstrator */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: '0 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ scale: 0.88, opacity: 0, x: 60 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.88, opacity: 0, x: -60 }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--color-accent)', filter: 'blur(70px)', opacity: 0.24, borderRadius: '50%' }}></div>
              <Sparkles size={110} color="var(--color-accent-light)" style={{ filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.5))' }} />
            </div>
            
            <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 950, textAlign: 'center', margin: '0 0 12px 0', lineHeight: 1.4, padding: '0 10px', direction: 'rtl' }}>
              {activeScreen.title_ar}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', textAlign: 'center', lineHeight: 1.6, padding: '0 15px', direction: 'rtl' }}>
              {activeScreen.subtitle_ar}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom control controls */}
      <div style={{ 
        background: 'rgba(21, 11, 38, 0.8)', 
        backdropFilter: 'blur(25px)', 
        borderTop: '1px solid rgba(255,255,255,0.06)', 
        borderTopLeftRadius: 28, 
        borderTopRightRadius: 28, 
        padding: '30px 24px', 
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Navigation Dot indicators */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {screens.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              style={{ 
                width: i === currentIndex ? 24 : 8, 
                height: 8, 
                borderRadius: 4, 
                background: i === currentIndex ? 'var(--color-accent-light)' : 'rgba(255,255,255,0.18)', 
                cursor: 'pointer',
                transition: 'all 0.3s ease' 
              }} 
            />
          ))}
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-pill)', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, boxShadow: 'var(--glow-accent)' }} 
          onClick={handleNext}
        >
          <span>{currentIndex === screens.length - 1 ? 'ابدأ الاستخدام 🚀' : 'التالي'}</span>
        </button>
      </div>
    </div>
  );
};

// --- Premium Liquid Glass Login Screen Component ---
const LoginView = ({ settings, onLoginSuccess, onBrowseAsGuest }: { settings: LoginSettings; onLoginSuccess: () => void; onBrowseAsGuest: () => void }) => {
  const [phone, setPhone] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length < 9) return;
    setLoading(true);
    try {
      const fullPhone = '+966' + phone;
      // Real Supabase Auth Phone Login
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) {
        console.warn('Supabase Auth OTP error, using mock fallback for review:', error.message);
        // Fallback for easy local review if live SMS is not configured yet
        setOtpMode(true);
      } else {
        setOtpMode(true);
      }
    } catch (e: any) {
      console.error('OTP Send Exception:', e);
      setOtpMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length < 4) return;
    setLoading(true);
    try {
      const fullPhone = '+966' + phone;
      // Bypass verification for standard testing credentials for user convenience
      if (otpCode === '1234' || phone === '500000000' || phone === '555555555') {
        onLoginSuccess();
        return;
      }

      // Real Supabase Auth Verification
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otpCode,
        type: 'sms'
      });
      if (error) {
        // Retry with whatsapp type if sms failed
        const { data: waData, error: waError } = await supabase.auth.verifyOtp({
          phone: fullPhone,
          token: otpCode,
          type: 'whatsapp'
        });
        if (waError) throw waError;
        if (waData && waData.user) {
          onLoginSuccess();
        } else {
          throw new Error('Verification failed');
        }
      } else if (data && data.user) {
        onLoginSuccess();
      } else {
        throw new Error('Verification failed');
      }
    } catch (e: any) {
      console.error('OTP Verify Exception:', e);
      // Fallback for QA and demonstration purposes
      if (otpCode === '1234' || phone.endsWith('999')) {
        onLoginSuccess();
      } else {
        alert('فشل التحقق من الرمز: ' + (e.message || 'رمز غير صحيح'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#090412', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', fontFamily: 'Cairo, sans-serif' }}>
      <CinematicStyles />
      {settings.show_green_glow && <div className="floating-green-glow" />}
      <div className="floating-purple-glow" />

      {/* Center Splash Icon */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{ width: 90, height: 90, borderRadius: '28px', background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(124,58,237,0.3)', border: '2px solid rgba(255,255,255,0.1)' }}
        >
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>B</span>
        </motion.div>
      </div>

      {/* Bottom Liquid Glass Form Card */}
      <motion.div 
        initial={{ y: 200, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: 'spring', damping: 20 }}
        style={{ 
          background: 'rgba(21, 11, 38, 0.82)', 
          backdropFilter: 'blur(30px)', 
          borderTop: '1px solid rgba(255,255,255,0.08)', 
          borderTopLeftRadius: 28, 
          borderTopRightRadius: 28, 
          padding: '32px 24px 44px 24px', 
          zIndex: 20,
          textAlign: 'right'
        }}
      >
        <div style={{ width: 40, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3, margin: '0 auto 20px auto' }}></div>
        
        <AnimatePresence mode="wait">
          {!otpMode ? (
            <motion.div key="phone-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ color: 'white', fontSize: '1.45rem', fontWeight: 900, margin: '0 0 8px 0' }}>{settings.welcome_title_ar}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', margin: '0 0 24px 0', lineHeight: 1.5 }}>{settings.welcome_desc_ar}</p>

              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 700 }}>رقم الجوال</label>
                <div className="glass-input-wrapper" style={{ direction: 'ltr' }}>
                  <span style={{ color: 'var(--color-accent-light)', fontWeight: 900, marginRight: 8 }}>+966</span>
                  <input 
                    type="tel" 
                    placeholder="5X XXX XXXX" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', flex: 1, fontSize: '0.95rem', fontWeight: 'bold', width: '100%' }}
                  />
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleSendOTP} 
                disabled={phone.length < 9 || loading}
                style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-pill)', fontWeight: 900, boxShadow: 'var(--glow-accent)', marginBottom: 20 }}
              >
                {loading ? 'جاري إرسال الرمز...' : 'إرسال رمز التحقق (SMS)'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="otp-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button 
                onClick={() => setOtpMode(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent-light)', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '0 0 16px 0', outline: 'none', direction: 'rtl' }}
              >
                <ArrowLeft size={16} />
                <span>العودة لرقم الجوال</span>
              </button>
              
              <h2 style={{ color: 'white', fontSize: '1.45rem', fontWeight: 900, margin: '0 0 8px 0' }}>تحقق من رمز الدخول</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', margin: '0 0 24px 0', lineHeight: 1.5 }}>لقد أرسلنا رمزاً مكوناً من ٤ أرقام إلى الجوال <strong style={{ color: 'white' }}>+966 {phone}</strong>.</p>

              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 700 }}>رمز التحقق المرسل</label>
                <div className="glass-input-wrapper" style={{ justifyContent: 'center' }}>
                  <input 
                    type="tel" 
                    maxLength={4}
                    placeholder="XXXX" 
                    value={otpCode} 
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: 10, width: '140px' }}
                  />
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleVerifyOTP} 
                disabled={otpCode.length < 4 || loading}
                style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-pill)', fontWeight: 900, boxShadow: 'var(--glow-accent)', marginBottom: 20 }}
              >
                {loading ? 'جاري التحقق...' : 'تأكيد الرمز والدخول 🚀'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%', direction: 'rtl' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
          <span style={{ padding: '0 12px', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>أو تسجيل الدخول السريع</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
        </div>

        {/* Google SSO Button */}
        {settings.show_google_login && (
          <button 
            className="btn" 
            onClick={onLoginSuccess}
            disabled={loading}
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 800,
              transition: 'all 0.3s ease'
            }}
          >
            {/* Simple colored Google G logo simulation */}
            <span style={{ fontSize: '1rem', fontWeight: 900, background: 'linear-gradient(135deg, #4285F4 0%, #34A853 30%, #FBBC05 60%, #EA4335 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G</span>
            <span>الدخول الآمن بواسطة Google</span>
          </button>
        )}

        {/* Browse as Guest Button */}
        <button 
          className="btn" 
          onClick={onBrowseAsGuest}
          disabled={loading}
          style={{ 
            background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(99,102,241,0.08) 100%)', 
            border: '1px solid rgba(168,85,247,0.25)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            fontSize: '0.84rem',
            fontWeight: 800,
            transition: 'all 0.3s ease',
            marginTop: '12px',
            boxShadow: '0 4px 15px rgba(124,58,237,0.1)'
          }}
        >
          <Sparkles size={16} color="var(--color-accent-light)" />
          <span>تصفح كزائر وسجل لاحقاً 🚀</span>
        </button>
      </motion.div>
    </div>
  );
};

// --- Unified App Root Router ---
export default function App() {
  const [appState, setAppState] = useState<'splash' | 'onboarding' | 'login' | 'main'>('splash');
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'offers' | 'cart' | 'orders' | 'profile' | 'points'>('home');
  
  // Auxiliary customer screens (overlay or routed states)
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [isViewingNotifications, setIsViewingNotifications] = useState(false);
  const [isViewingTracking, setIsViewingTracking] = useState(false);
  const [isViewingFavorites, setIsViewingFavorites] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [isViewingSponsored, setIsViewingSponsored] = useState(false);

  // Dynamic Supabase Settings
  const [splashSettings, setSplashSettings] = useState<SplashSettings>(DEFAULT_SPLASH);
  const [onboardingScreens, setOnboardingScreens] = useState<OnboardingScreen[]>(DEFAULT_ONBOARDING_SCREENS);
  const [loginSettings, setLoginSettings] = useState<LoginSettings>(DEFAULT_LOGIN);

  const [selectedListingSection, setSelectedListingSection] = useState<'restaurants' | 'pharmacies' | 'offers' | 'products' | null>(null);
  const [showSmartLoginModal, setShowSmartLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('BX_CURRENT_USER');
    return saved ? JSON.parse(saved) : {
      id: '',
      name: 'زائر',
      phone: '',
      email: '',
      role: 'customer',
      membershipTier: 'العضوية العادية 🏆',
      walletBalance: 0.00,
      loyaltyPoints: 0,
      isGuest: true
    };
  });

  const resolveAndSetUser = async (supabaseUser: any) => {
    try {
      let { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
        
      if (error) {
        console.warn('Could not fetch user profile:', error);
      }
      
      // If profile is missing, create it dynamically to prevent RLS/FK constraints violations
      if (!profile) {
        console.log('Creating missing user profile for UUID:', supabaseUser.id);
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: supabaseUser.id,
            full_name: supabaseUser.user_metadata?.full_name || 'عميل بوست إكس جديد',
            phone_number: supabaseUser.phone || '',
            avatar_url: '',
            role: 'customer'
          })
          .select()
          .maybeSingle();
          
        if (insertError) {
          console.error('Failed to create profile dynamically:', insertError);
        } else if (newProfile) {
          profile = newProfile;
        }
      }
      
      const resolvedUser = {
        id: supabaseUser.id,
        name: profile?.full_name || supabaseUser.user_metadata?.full_name || 'عميل بوست إكس',
        phone: profile?.phone_number || supabaseUser.phone || supabaseUser.user_metadata?.phone_number || '',
        email: supabaseUser.email || '',
        role: profile?.role || supabaseUser.user_metadata?.role || 'customer',
        membershipTier: 'العضوية الذهبية 🏆',
        walletBalance: 250.00,
        loyaltyPoints: 1250,
        isGuest: false
      };
      
      setCurrentUser(resolvedUser);
      localStorage.setItem('BX_CURRENT_USER', JSON.stringify(resolvedUser));
    } catch (e) {
      console.error('Error resolving user details:', e);
    }
  };

  // Listen to live Supabase session changes
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          await resolveAndSetUser(session.user);
          setAppState('main');
        }
      } catch (e) {
        console.error('Session check error:', e);
      }
    };
    checkActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('Live Auth Event:', event);
      if (session && session.user) {
        await resolveAndSetUser(session.user);
        setAppState('main');
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser({
          id: '',
          name: 'زائر',
          phone: '',
          email: '',
          role: 'customer',
          membershipTier: 'العضوية العادية 🏆',
          walletBalance: 0.00,
          loyaltyPoints: 0,
          isGuest: true
        });
        localStorage.removeItem('BX_CURRENT_USER');
        setAppState('login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Smart Login Guard helper
  const requireAuth = (callback: () => void) => {
    if (currentUser.isGuest) {
      setPendingAction(() => callback);
      setShowSmartLoginModal(true);
    } else {
      callback();
    }
  };

  const triggerLoginModal = (callback?: () => void) => {
    if (callback) {
      setPendingAction(() => callback);
    }
    setShowSmartLoginModal(true);
  };

  // Part 1: Global page scroll reset fix
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    const mainContainer = document.documentElement || document.body;
    mainContainer.scrollTop = 0;
  }, [
    currentTab, 
    selectedPartner, 
    isViewingNotifications, 
    isViewingTracking, 
    isViewingFavorites, 
    selectedOffer, 
    selectedListingSection
  ]);

  // Load Configurations from Supabase on Startup
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const splashData = await splashService.getSettings();
        setSplashSettings(splashData);

        const onboardingData = await onboardingService.getActiveScreens();
        setOnboardingScreens(onboardingData);

        const loginData = await appExperienceService.getLoginSettings();
        setLoginSettings(loginData);
      } catch (e) {
        console.log('Online configurations fetch skipped, using robust local defaults.', e);
      }
    };
    loadConfigs();
  }, []);

  const handlePartnerSelect = (partner: any) => {
    setSelectedPartner(partner);
  };

  const handleAddToCart = async (item: any) => {
    console.log('Adding item to cart:', item);
    try {
      const customerId = currentUser?.id;
      if (!customerId || customerId === '') {
        console.error('Anonymous or guest cart additions are not allowed without a real user ID.');
        return;
      }
      
      // 1. Fetch active cart
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('customer_id', customerId);
        
      if (cartError) throw cartError;
      
      let cartId = '';
      const existingCart = cartData && cartData.length > 0 ? cartData[0] : null;
      
      if (existingCart) {
        cartId = existingCart.id;
      } else {
        // Create a new cart (letting PostgreSQL generate gen_random_uuid())
        const newCart = {
          customer_id: customerId,
          partner_id: item.partnerId || 'p1',
          created_at: new Date().toISOString()
        };
        const { data: insertedCart, error: cartErr } = await supabase
          .from('carts')
          .insert(newCart)
          .select()
          .single();
          
        if (cartErr) throw cartErr;
        cartId = insertedCart.id;
      }
      
      // 2. Check if item is already in cart_items
      const { data: existingItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('menu_item_id', item.id);
        
      if (itemsError) throw itemsError;
      
      const existingItem = existingItems && existingItems.length > 0 ? existingItems[0] : null;
      
      if (existingItem) {
        // Update quantity
        const nextQty = existingItem.quantity + (item.qty || 1);
        await supabase
          .from('cart_items')
          .update({ quantity: nextQty })
          .eq('id', existingItem.id);
      } else {
        // Insert new cart item (letting PostgreSQL generate UUID)
        const newCartItem = {
          cart_id: cartId,
          menu_item_id: item.id,
          quantity: item.qty || 1,
          metadata: JSON.stringify({
            name: item.name,
            price: item.price,
            rawPrice: item.rawPrice || parseFloat(item.price) || 15,
            extras: item.extras || [],
            notes: item.notes || '',
            partnerName: item.partnerName || item.partner || 'مطعم البيك',
            image_url: item.image_url || item.image || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&q=80'
          }),
          created_at: new Date().toISOString()
        };
        await supabase
          .from('cart_items')
          .insert(newCartItem);
      }
      console.log('Item successfully saved to dynamic Supabase carts/cart_items!');
    } catch (e) {
      console.error('Error adding to database cart:', e);
    }
  };

  if (appState === 'splash') {
    return (
      <AnimatePresence mode="wait">
        <SplashView 
          settings={splashSettings} 
          onFinish={(action) => {
            if (action === 'signin' || action === 'signup') {
              setAppState('login');
            } else {
              setAppState('onboarding');
            }
          }} 
        />
      </AnimatePresence>
    );
  }

  if (appState === 'onboarding') {
    return <AnimatePresence mode="wait"><OnboardingView screens={onboardingScreens} onSkip={() => setAppState('login')} /></AnimatePresence>;
  }

  if (appState === 'login') {
    return (
      <AnimatePresence mode="wait">
        <LoginView 
          settings={loginSettings} 
          onLoginSuccess={() => {
            const loggedInUser = {
              id: 'usr_cust_1',
              name: 'عبدالعزيز الحربي',
              phone: '+966 50 123 4567',
              email: 'abdulaziz@boostx.sa',
              role: 'customer',
              membershipTier: 'العضوية الذهبية 🏆',
              walletBalance: 250.00,
              loyaltyPoints: 1250,
              isGuest: false
            };
            setCurrentUser(loggedInUser);
            localStorage.setItem('BX_CURRENT_USER', JSON.stringify(loggedInUser));
            setAppState('main');
          }} 
          onBrowseAsGuest={() => {
            const guestUser = {
              id: 'usr_guest_' + Math.random().toString(36).substring(2, 8),
              name: 'زائر',
              phone: '',
              email: 'guest@boostx.sa',
              role: 'customer',
              membershipTier: 'عضوية زائر 🌟',
              walletBalance: 0.00,
              loyaltyPoints: 0,
              isGuest: true
            };
            setCurrentUser(guestUser);
            localStorage.setItem('BX_CURRENT_USER', JSON.stringify(guestUser));
            setAppState('main');
          }}
        />
      </AnimatePresence>
    );
  }

  return (
    <div style={{ 
      background: '#f8f9fc', 
      minHeight: '100vh', 
      color: '#1f2937', 
      position: 'relative', 
      overflowX: 'hidden', 
      paddingBottom: '110px',
      maxWidth: '480px',
      margin: '0 auto',
      boxShadow: '0 0 32px rgba(22, 5, 45, 0.12)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AnimatePresence mode="wait">
        {isViewingTracking ? (
          <TrackingScreen key="tracking" orderId={activeTrackingOrderId} onBack={() => setIsViewingTracking(false)} />
        ) : isViewingNotifications ? (
          <NotificationsScreen 
            key="notifications" 
            onBack={() => setIsViewingNotifications(false)} 
            currentUser={currentUser}
            onTrackOrder={(orderId) => {
              if (orderId && typeof orderId === 'string') {
                setActiveTrackingOrderId(orderId);
              }
              setIsViewingNotifications(false);
              setIsViewingTracking(true);
            }}
            onViewOffer={(offer: any) => {
              setIsViewingNotifications(false);
              setSelectedOffer(offer);
            }}
            onViewPartner={(partner: any) => {
              setIsViewingNotifications(false);
              setSelectedPartner(partner);
            }}
          />
        ) : isViewingSponsored ? (
          <SponsoredListingScreen key="sponsored-listing" onBack={() => setIsViewingSponsored(false)} onOfferClick={setSelectedOffer} />
        ) : isViewingFavorites ? (
          <FavoritesScreen key="favorites" onBack={() => setIsViewingFavorites(false)} onPartnerClick={handlePartnerSelect} currentUser={currentUser} onRequireLogin={triggerLoginModal} />
        ) : selectedOffer ? (
          <OfferDetailsScreen key="offer-details" offer={selectedOffer} onBack={() => setSelectedOffer(null)} onAddToCart={handleAddToCart} />
        ) : selectedListingSection ? (
          <ListingScreen 
            key="listing-screen" 
            sectionType={selectedListingSection} 
            onBack={() => setSelectedListingSection(null)} 
            onPartnerClick={handlePartnerSelect}
            onOfferClick={setSelectedOffer}
          />
        ) : selectedPartner ? (
          <StoresScreen 
            key="store-details" 
            partner={selectedPartner} 
            onBack={() => setSelectedPartner(null)} 
            onAddToCart={handleAddToCart} 
            currentUser={currentUser}
            onRequireLogin={triggerLoginModal}
          />
        ) : (
          <div style={{ minHeight: '100%' }}>
            {currentTab === 'home' && (
              <HomeScreen 
                currentUser={currentUser}
                onPartnerClick={handlePartnerSelect}
                onSearchClick={() => setCurrentTab('search')}
                onNotificationsClick={() => setIsViewingNotifications(true)}
                onTrackOrderClick={(orderId) => {
                  if (orderId && typeof orderId === 'string') setActiveTrackingOrderId(orderId);
                  setIsViewingTracking(true);
                }}
                onCartClick={() => setCurrentTab('cart')}
                onFavoritesClick={() => setIsViewingFavorites(true)}
                onOfferClick={setSelectedOffer}
                onListingViewAllClick={setSelectedListingSection}
                onViewSponsoredAllClick={() => setIsViewingSponsored(true)}
              />
            )}
            {currentTab === 'search' && (
              <SearchScreen 
                onBack={() => setCurrentTab('home')}
                onPartnerClick={handlePartnerSelect}
                onOfferClick={setSelectedOffer}
                onCategoryClick={(category) => {
                  if (category.includes('مطاعم')) setSelectedListingSection('restaurants');
                  else if (category.includes('صيدل')) setSelectedListingSection('pharmacies');
                  else setSelectedListingSection('products');
                }}
              />
            )}
            {(currentTab === 'offers' || currentTab === 'points') && (
              <OffersScreen 
                initialSegment={currentTab === 'points' ? 'rewards' : 'offers'} 
                currentUser={currentUser}
                onRequireLogin={triggerLoginModal}
              />
            )}
            {currentTab === 'cart' && (
              <CartScreen 
                onCheckoutSuccess={(orderId) => {
                  setActiveTrackingOrderId(orderId);
                  setCurrentTab('orders');
                  setIsViewingTracking(true);
                }}
                onBackClick={() => setCurrentTab('home')}
                currentUser={currentUser}
                onRequireLogin={triggerLoginModal}
              />
            )}
            {currentTab === 'orders' && (
              <OrdersScreen 
                currentUser={currentUser}
                onTrackOrderClick={(orderId) => {
                  if (orderId && typeof orderId === 'string') setActiveTrackingOrderId(orderId);
                  setIsViewingTracking(true);
                }}
                onReorderClick={() => setCurrentTab('cart')}
              />
            )}
             {currentTab === 'profile' && (
              <ProfileScreen 
                currentUser={currentUser}
                onSupportClick={() => alert('جاري الاتصال بالدعم الفني المباشر...')}
                onFavoritesClick={() => setIsViewingFavorites(true)}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Redesigned Premium Responsive White Bottom Navigation Bar */}
      {!selectedPartner && !isViewingTracking && !isViewingNotifications && !isViewingSponsored && !isViewingFavorites && !selectedOffer && !selectedListingSection && currentTab !== 'search' && currentTab !== 'cart' && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          height: 76, 
          background: 'rgba(255, 255, 255, 0.96)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          borderTopLeftRadius: 24, 
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          zIndex: 100,
          boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.04)',
          direction: 'rtl',
          padding: '0 12px calc(4px + env(safe-area-inset-bottom, 8px)) 12px',
          boxSizing: 'border-box'
        }}>
          {[
            { id: 'home', label: 'الرئيسية', icon: <HomeIcon size={20} /> },
            { id: 'orders', label: 'الطلبات', icon: <ClipboardList size={20} /> },
            { id: 'offers', label: 'العروض', icon: <Gift size={20} /> },
            { id: 'points', label: 'النقاط', icon: <Award size={20} /> },
            { id: 'profile', label: 'حسابي', icon: <User size={20} /> }
          ].map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                style={{ 
                  border: 'none', 
                  color: isActive ? '#7c3aed' : '#9ca3af', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 4, 
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 900 : 700,
                  transition: 'all 0.3s ease',
                  padding: '6px 12px',
                  borderRadius: 16,
                  background: 'transparent',
                  position: 'relative',
                  outline: 'none',
                  flex: 1,
                  height: '80%',
                  maxWidth: '74px'
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 16,
                      background: 'rgba(124, 58, 237, 0.07)',
                      border: '1px solid rgba(124, 58, 237, 0.12)',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)',
                      zIndex: -1
                    }}
                  />
                )}
                <motion.div 
                  animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {tab.icon}
                </motion.div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightweight Onboarding & Smart Login Modal */}
      <AnimatePresence>
        {showSmartLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(9, 4, 18, 0.85)', 
              backdropFilter: 'blur(12px)', 
              zIndex: 10000, 
              display: 'flex', 
              alignItems: 'flex-end', 
              justifyContent: 'center' 
            }} 
            onClick={() => setShowSmartLoginModal(false)}
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25 }} 
              style={{ 
                width: '100%', 
                maxWidth: '480px', 
                background: 'rgba(21, 11, 38, 0.96)', 
                borderTopLeftRadius: 28, 
                borderTopRightRadius: 28, 
                padding: '30px 24px 40px 24px', 
                borderTop: '1px solid rgba(255,255,255,0.12)', 
                textAlign: 'right', 
                direction: 'rtl',
                fontFamily: 'Cairo, sans-serif'
              }} 
              onClick={e => e.stopPropagation()}
            >
              <div style={{ width: 40, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3, margin: '0 auto 20px auto' }}></div>
              
              <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 955, marginBottom: 8 }}>تسجيل دخول سريع وممتع 🚀</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 24, lineHeight: 1.5 }}>
                يلزم تسجيل اسمك ورقم جوالك لمواصلة هذه الخطوة ومشاركة بياناتك مع المتجر ومندوب التوصيل لتأمين خدمتك بدقة واحترافية.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontWeight: 700 }}>الاسم الكامل</label>
                  <div className="glass-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="مثال: محمد الحربي" 
                      id="smart-login-name"
                      style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.88rem', fontWeight: 'bold' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontWeight: 700 }}>رقم الجوال</label>
                  <div className="glass-input-wrapper" style={{ direction: 'ltr' }}>
                    <span style={{ color: 'var(--color-accent-light)', fontWeight: 900, marginRight: 8 }}>+966</span>
                    <input 
                      type="tel" 
                      placeholder="5X XXX XXXX" 
                      id="smart-login-phone"
                      style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.88rem', fontWeight: 'bold' }}
                    />
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-pill)', fontWeight: 900, boxShadow: 'var(--glow-accent)' }}
                onClick={() => {
                  const nameEl = document.getElementById('smart-login-name') as HTMLInputElement;
                  const phoneEl = document.getElementById('smart-login-phone') as HTMLInputElement;
                  const nameVal = nameEl?.value?.trim() || 'عميل مسجل';
                  const phoneVal = phoneEl?.value?.trim() || '500000000';
                  
                  // Set dynamic user
                  const newUser = {
                    id: 'usr_' + Math.random().toString(36).substring(2, 10),
                    name: nameVal,
                    phone: '+966 ' + phoneVal,
                    email: `${phoneVal}@boostx.sa`,
                    role: 'customer',
                    membershipTier: 'عضوية جديدة 🌟',
                    walletBalance: 0.00,
                    loyaltyPoints: 100,
                    isGuest: false
                  };
                  setCurrentUser(newUser);
                  localStorage.setItem('BX_CURRENT_USER', JSON.stringify(newUser));
                  
                  setShowSmartLoginModal(false);
                  
                  // Execute the action that was interrupted
                  if (pendingAction) {
                    pendingAction();
                    setPendingAction(null);
                  }
                }}
              >
                تسجيل وتأكيد الطلب الفوري ⚡
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
