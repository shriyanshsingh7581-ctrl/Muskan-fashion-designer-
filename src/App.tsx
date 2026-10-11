/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, CategoryId, BlouseDesign, Order, AdminSettings } from './types';
import { INITIAL_DESIGNS, DEFAULT_SETTINGS, BUSINESS_PHONE } from './data/initialData';
import { api } from './services/api';
import { generateWhatsAppGeneralUrl } from './utils/whatsapp';

// Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NavratriBanner } from './components/NavratriBanner';
import { DesignGallery } from './components/DesignGallery';
import { DesignDetailModal } from './components/DesignDetailModal';
import { CustomizationOrderFlow } from './components/CustomizationOrderFlow';
import { OrderTrackingView } from './components/OrderTrackingView';
import { HomeDeliverySection } from './components/HomeDeliverySection';
import { HowToOrderSection } from './components/HowToOrderSection';
import { MeasurementGuideModal } from './components/MeasurementGuideModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { PoliciesModal } from './components/PoliciesModal';
import { Footer } from './components/Footer';

import { MessageCircle } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('hi');
  const [designs, setDesigns] = useState<BlouseDesign[]>(INITIAL_DESIGNS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);

  // Modals & Flows
  const [selectedDesignForModal, setSelectedDesignForModal] = useState<BlouseDesign | null>(null);
  const [orderFlowOpen, setOrderFlowOpen] = useState(false);
  const [orderFlowDesign, setOrderFlowDesign] = useState<BlouseDesign | null>(null);
  const [measurementGuideOpen, setMeasurementGuideOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [policiesTab, setPoliciesTab] = useState<'shipping' | 'returns' | 'privacy' | 'terms'>('shipping');

  // Load initial designs & settings
  const loadData = async () => {
    try {
      const [fetchedDesigns, fetchedSettings] = await Promise.all([
        api.getDesigns(),
        api.getSettings(),
      ]);
      if (fetchedDesigns && fetchedDesigns.length > 0) {
        setDesigns(fetchedDesigns);
      }
      if (fetchedSettings) {
        setSettings(fetchedSettings);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Navigation smoothly scrolls to anchor sections
  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'measurement-guide') {
      setMeasurementGuideOpen(true);
      return;
    }
    if (sectionId === 'custom-order') {
      setOrderFlowDesign(null);
      setOrderFlowOpen(true);
      return;
    }

    const element = document.getElementById(`${sectionId}-section`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Open Order Flow for a specific design
  const handleOrderThisDesign = (design: BlouseDesign) => {
    setOrderFlowDesign(design);
    setOrderFlowOpen(true);
  };

  // Start Generic Order
  const handleStartGeneralOrder = () => {
    setOrderFlowDesign(null);
    setOrderFlowOpen(true);
  };

  const handleOpenPolicies = (tab: 'shipping' | 'returns' | 'privacy' | 'terms') => {
    setPoliciesTab(tab);
    setPoliciesOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2C1810]">
      
      {/* Top Navigation */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setAdminOpen(true)}
        onStartOrder={handleStartGeneralOrder}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          language={language}
          onExploreDesigns={() => handleNavigate('gallery')}
          onStartOrder={handleStartGeneralOrder}
        />

        {/* Navratri 2026 Festive Banner (if enabled in settings) */}
        {settings.navratriBannerActive && (
          <NavratriBanner
            language={language}
            onExploreNavratri={() => {
              setSelectedCategory('festive-navratri');
              handleNavigate('gallery');
            }}
          />
        )}

        {/* Product & Design Gallery */}
        <DesignGallery
          designs={designs}
          language={language}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onViewDetails={(design) => setSelectedDesignForModal(design)}
          onOrderThis={handleOrderThisDesign}
        />

        {/* 4-Step How to Order Section */}
        <HowToOrderSection
          language={language}
          onStartOrder={handleStartGeneralOrder}
        />

        {/* Dedicated Home Delivery Section */}
        <HomeDeliverySection
          language={language}
          onStartOrder={handleStartGeneralOrder}
        />

        {/* Customer Order Tracking Section */}
        <OrderTrackingView language={language} />
      </main>

      {/* Footer */}
      <Footer
        language={language}
        onNavigate={handleNavigate}
        onOpenPolicies={handleOpenPolicies}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* MODALS */}

      {/* 1. Design Details Modal */}
      {selectedDesignForModal && (
        <DesignDetailModal
          design={selectedDesignForModal}
          language={language}
          onClose={() => setSelectedDesignForModal(null)}
          onOrderThis={handleOrderThisDesign}
        />
      )}

      {/* 2. Customization & Step-by-Step Order Flow */}
      {orderFlowOpen && (
        <CustomizationOrderFlow
          designs={designs}
          initialDesign={orderFlowDesign}
          language={language}
          onClose={() => {
            setOrderFlowOpen(false);
            setOrderFlowDesign(null);
          }}
          onOpenMeasurementGuide={() => setMeasurementGuideOpen(true)}
          onOrderCompleted={(_order: Order) => {
            loadData();
          }}
        />
      )}

      {/* 3. Measurement Guide Modal */}
      {measurementGuideOpen && (
        <MeasurementGuideModal
          language={language}
          onClose={() => setMeasurementGuideOpen(false)}
        />
      )}

      {/* 4. Boutique Admin Dashboard */}
      {adminOpen && (
        <AdminDashboardModal
          onClose={() => setAdminOpen(false)}
          onDesignsUpdated={loadData}
        />
      )}

      {/* 5. Policies & Terms Modal */}
      {policiesOpen && (
        <PoliciesModal
          initialTab={policiesTab}
          language={language}
          onClose={() => setPoliciesOpen(false)}
        />
      )}

      {/* Floating Sticky WhatsApp Button (Adheres to $\le 15\%$ viewport cap) */}
      <div className="fixed bottom-5 right-5 z-40">
        <a
          href={generateWhatsAppGeneralUrl()}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp पर तुरंत संपर्क करें"
          className="group flex items-center gap-2.5 px-4 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs sm:text-sm rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-2 border-white/80"
        >
          <MessageCircle className="w-5 h-5 text-white animate-pulse" />
          <span className="hidden sm:inline">WhatsApp पर ऑर्डर करें</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
