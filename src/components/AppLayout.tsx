import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/AuthModal';
import { NewsletterSignup } from './NewsletterSignup';
import { ProgressShowcase } from './ProgressShowcase';
import { ProductTour } from './ProductTour';
import { OfflineIndicator } from './OfflineIndicator';
import PricingSection from './PricingSection';

import PersonalizedDashboard from './PersonalizedDashboard';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { LogIn, User, Target, Compass, Bell } from 'lucide-react';





const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const [isTourActive, setIsTourActive] = useState(false);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);


  const heroSlides = [
    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759369590933_f4250ffb.webp',
      title: 'Ready to Change Course?',
      subtitle: 'Chart a new direction, navigate your journey with confidence, and reach the shores of your aspirations'
    },
    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759368658991_18e46462.webp',
      title: 'Create a New Path',
      subtitle: 'Every journey begins with a single step. Start climbing toward your dreams today'
    },
    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759369237407_872102c1.webp',
      title: 'Build Deeper Connections',
      subtitle: 'Strengthen relationships, create meaningful bonds, and discover the power of authentic connection'
    },
    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759516904849_23425d6f.webp',
      title: 'Live the life you want',
      subtitle: 'Embrace adventure, pursue your passions, and create unforgettable memories along the way'
    }
  ];



  useEffect(() => {
    if (!api) return;
    
    // Track current slide
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
    
    const interval = setInterval(() => {
      if (api && cycleCount < 3) {
        const currentIndex = api.selectedScrollSnap();
        const slideCount = api.scrollSnapList().length;
        
        // If we're at the last slide, go back to first and increment cycle count
        if (currentIndex === slideCount - 1) {
          api.scrollTo(0);
          setCycleCount(prev => prev + 1);
        } else {
          // Otherwise just go to next slide
          api.scrollNext();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api, cycleCount]);





  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>;
  }


  // Show personalized dashboard for authenticated users

  if (user) {
    return <PersonalizedDashboard />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header with Auth */}
      <div className="bg-white shadow-sm py-4 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-slate-700" />
            <h1 className="text-2xl font-bold text-gray-800">DEPO Goal Tracker</h1>


          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/test-subscriptions')} 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900"
            >
              Test Subscriptions
            </Button>
            <Button 
              onClick={() => navigate('/forums')} 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900"
            >
              Forums
            </Button>

            <Button 
              onClick={() => setIsTourActive(true)} 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900"
            >
              <Compass className="h-4 w-4 mr-2" />
              Take Tour
            </Button>
            <Button onClick={() => navigate('/demo')} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              See Demo
            </Button>


            {user ? <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <AuthModal trigger={<Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>} />
              </div> : <AuthModal trigger={<Button>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>} />}
          </div>
        </div>
      </div>

      {/* Hero Section with Carousel */}
      {heroSlides && heroSlides.length > 0 && (
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <section 
                  id="hero-section" 
                  className="relative h-96 flex items-center justify-center text-center px-4" 
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('${slide.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="max-w-4xl mx-auto text-white">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg text-white">
                      {slide.title}
                    </h1>

                    <p className="text-lg md:text-xl mb-6 text-white drop-shadow-md font-medium">
                      {user ? 'Welcome back! Track your progress below.' : slide.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <AuthModal 
                        trigger={
                          <Button size="lg" className="bg-white text-slate-800 hover:bg-gray-100 shadow-lg text-base font-semibold">
                            30 Day Free Trial
                          </Button>
                        }
                        defaultMode="signup"
                      />

                      {!user && (
                        <Button 
                          onClick={() => navigate('/demo')} 
                          size="lg" 
                          variant="outline" 
                          className="text-white border-white hover:bg-white hover:text-slate-700 bg-transparent backdrop-blur-sm font-semibold"
                        >
                          See Demo
                        </Button>
                      )}

                    </div>
                  </div>
                </section>

              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      )}






      {/* Features Section - DEPO System */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">The DEPO Success Framework</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our proven four-step methodology transforms your dreams into reality through structured goal achievement

            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div id="depo-d" className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 transition-all">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">D</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">DEFINE</h3>
              <p className="text-gray-600">Define your objective with crystal clarity and purpose</p>
            </div>

            
            <div id="depo-e" className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 transition-all">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">E</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">ESTABLISH</h3>
              <p className="text-gray-600">Establish the steps you need to take to reach your goal</p>
            </div>
            
            <div id="depo-p" className="text-center p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-100 border border-cyan-200 transition-all">
              <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">P</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">PREPARE</h3>
              <p className="text-gray-600">Prepare for your journey ahead</p>


            </div>

            
            <div id="depo-o" className="text-center p-6 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 transition-all">
              <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">O</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">OPPORTUNITIES</h3>
              <p className="text-gray-600">Take advantage to what comes to you</p>

            </div>


          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Community Goals Section */}

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Community Goals</h2>
            <p className="text-lg text-gray-600">Get inspired by goals shared by our community</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-center text-gray-600">Sign in to view and share goals with the community</p>
          </div>
        </div>
      </section>

      {/* Progress Showcase Section */}


      {/* Newsletter Section */}


      <NewsletterSignup />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2024 DEPO Goal Tracker. All rights reserved.</p>
        </div>

      </footer>
      
      {/* Product Tour */}
      <ProductTour isActive={isTourActive} onComplete={() => setIsTourActive(false)} />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>

  );
};

export default AppLayout;
