/**
 * ============================================
 * CARECONNECT LANDING PAGE
 * Kerala-Focused Home Nurse Finder
 * ============================================
 */

import { useState } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import {
  Search, MapPin, Phone, Shield, Star, Clock, Users, Heart,
  Stethoscope, CheckCircle, ArrowRight, Menu, X,
  Home, Baby, HeartPulse, Activity, BadgeCheck, Camera,
  AlertTriangle, HandHeart, Building2, Send
} from 'lucide-react';
import { cn } from '@/utils/cn';
import logo from '@/assets/logo.png';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin?: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const handleLogin = onLogin || onGetStarted;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const allServices = ['Elderly Care', 'Post-Surgery Care', 'Newborn Care', 'Palliative Care'];

  const keralaPlaces = [
    'Thiruvananthapuram', 'Kazhakoottam', 'Neyyattinkara', 'Attingal', 'Varkala',
    'Kochi', 'Aluva', 'Kakkanad', 'Thrikkakara', 'Edappally', 'Kaloor', 'Fort Kochi',
    'Kozhikode', 'Vadakara', 'Koyilandy', 'Feroke', 'Beypore',
    'Thrissur', 'Guruvayur', 'Chalakudy', 'Irinjalakuda', 'Kunnamkulam',
    'Kollam', 'Karunagappally', 'Punalur', 'Paravur',
    'Alappuzha', 'Cherthala', 'Kayamkulam', 'Haripad', 'Ambalappuzha',
    'Palakkad', 'Ottapalam', 'Shoranur', 'Chittur', 'Mannarkkad',
    'Kottayam', 'Pala', 'Changanassery', 'Ettumanoor', 'Vaikom',
    'Malappuram', 'Manjeri', 'Perinthalmanna', 'Tirur', 'Ponnani',
    'Kannur', 'Thalassery', 'Payyanur', 'Mattannur', 'Iritty',
    'Kasaragod', 'Kanhangad', 'Nileshwar', 'Bekal',
    'Idukki', 'Munnar', 'Thodupuzha', 'Adimali', 'Kattappana',
    'Pathanamthitta', 'Adoor', 'Thiruvalla', 'Pandalam', 'Ranni',
    'Wayanad', 'Kalpetta', 'Sulthan Bathery', 'Mananthavady', 'Vythiri'
  ];

  const filteredServices = allServices.filter(s =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = keralaPlaces.filter(c =>
    c.toLowerCase().includes(location.toLowerCase())
  );

  const scrollToReport = () => {
    const el = document.getElementById('report-help');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════════════════════════════════════ */}
      {/* NAVIGATION BAR */}
      {/* ══════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left">
              <div className="p-1 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                <img src={logo} alt="CareConnect" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CareConnect</h1>
                <p className="hidden sm:block text-xs text-gray-500 -mt-0.5">Care Assistant Finder</p>
              </div>
            </button>

            <div className="hidden lg:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#why-us" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Why Us</a>
              <a href="#cities" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Districts</a>
              <button onClick={scrollToReport} className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1">
                <HandHeart className="w-4 h-4" /> Report & Help
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 ml-auto lg:ml-0">
              <Button variant="ghost" size="sm" onClick={handleLogin}>Sign In</Button>
              <Button size="sm" onClick={onGetStarted}>Get Started</Button>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <Button size="sm" onClick={onGetStarted} className="text-xs px-3 py-1.5">Get Started</Button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hidden sm:block lg:hidden p-2 rounded-lg hover:bg-gray-100">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block py-2 text-gray-600 hover:text-blue-600">Services</a>
              <a href="#how-it-works" className="block py-2 text-gray-600 hover:text-blue-600">How It Works</a>
              <a href="#why-us" className="block py-2 text-gray-600 hover:text-blue-600">Why Us</a>
              <a href="#cities" className="block py-2 text-gray-600 hover:text-blue-600">Districts</a>
              <button onClick={scrollToReport} className="block py-2 text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2">
                <HandHeart className="w-4 h-4" /> Report & Help Homeless
              </button>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Button variant="outline" className="w-full" onClick={handleLogin}>Sign In</Button>
                <Button className="w-full" onClick={onGetStarted}>Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="info" className="mb-4">
                  <Shield className="w-3 h-3 mr-1" /> AI-Powered Verification
                </Badge>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  Find Trusted{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Home Nurses</span>{' '}
                  Near You
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-xl">
                  Kerala&apos;s most trusted platform to connect with verified, experienced home nurses.
                  Serving all 14 districts with AI-verified and background-checked professionals.
                </p>
              </div>

              <Card className="p-4 shadow-lg border-0">
                <div className="grid sm:grid-cols-12 gap-3">
                  {/* SERVICE SEARCH WITH DROPDOWN */}
                  <div className="sm:col-span-5 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <input
                      type="text"
                      placeholder="What service do you need?"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setShowServiceDropdown(true); setShowCityDropdown(false); }}
                      onFocus={() => { setShowServiceDropdown(true); setShowCityDropdown(false); }}
                      className="w-full pl-10 h-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showServiceDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Our Services</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredServices.length > 0 ? filteredServices.map((service) => (
                            <button
                              key={service}
                              onClick={() => { setSearchQuery(service); setShowServiceDropdown(false); }}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                {service === 'Elderly Care' && <Home className="w-4 h-4 text-blue-600" />}
                                {service === 'Post-Surgery Care' && <Activity className="w-4 h-4 text-blue-600" />}
                                {service === 'Newborn Care' && <Baby className="w-4 h-4 text-blue-600" />}
                                {service === 'Palliative Care' && <HeartPulse className="w-4 h-4 text-blue-600" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{service}</p>
                                <p className="text-xs text-gray-500">
                                  {service === 'Elderly Care' && 'Medication, mobility & daily living'}
                                  {service === 'Post-Surgery Care' && 'Wound care & rehabilitation'}
                                  {service === 'Newborn Care' && 'Infant care & health monitoring'}
                                  {service === 'Palliative Care' && 'Comfort & end-of-life care'}
                                </p>
                              </div>
                            </button>
                          )) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No services found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CITY SEARCH WITH DROPDOWN */}
                  <div className="sm:col-span-4 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <input
                      type="text"
                      placeholder="Enter your city"
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setShowCityDropdown(true); setShowServiceDropdown(false); }}
                      onFocus={() => { setShowCityDropdown(true); setShowServiceDropdown(false); }}
                      className="w-full pl-10 h-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showCityDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Kerala Cities & Places</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCities.length > 0 ? filteredCities.map((city) => (
                            <button
                              key={city}
                              onClick={() => { setLocation(city); setShowCityDropdown(false); }}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                            >
                              <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                              <span className="text-sm text-gray-800">{city}</span>
                            </button>
                          )) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No places found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <Button className="w-full h-12 text-base" onClick={() => { setShowServiceDropdown(false); setShowCityDropdown(false); onGetStarted(); }}>
                      <Search className="w-4 h-4 mr-2" /> Search
                    </Button>
                  </div>
                </div>

                {/* Click outside to close dropdowns */}
                {(showServiceDropdown || showCityDropdown) && (
                  <div className="fixed inset-0 z-40" onClick={() => { setShowServiceDropdown(false); setShowCityDropdown(false); }}></div>
                )}
              </Card>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600"><strong>7,000+</strong> Verified Nurses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-gray-600"><strong>4.8</strong> Average Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-gray-600"><strong>100%</strong> Background Checked</span>
                </div>
              </div>

              {/* Report Homeless Link */}
              <button onClick={scrollToReport} className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm sm:text-base hover:underline transition-all">
                <HandHeart className="w-4 h-4" />
                <span>Spot someone in need? Report & Help Homeless</span>
              </button>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-2 aspect-square flex items-center justify-center overflow-hidden shadow-xl">
                  <div className="w-full h-full rounded-2xl overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1000"
                      alt="Care Assistant helping elderly"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                </div>
                <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-lg p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Verified</p>
                      <p className="text-xs text-gray-500">AI Document Check</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">4.9 Rating</p>
                      <p className="text-xs text-gray-500">2,000+ Reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >



      {/* ══════════════════════════════════════════════ */}
      {/* HUMANITARIAN INITIATIVE BANNER */}
      {/* ══════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 py-6 sm:py-8" style={{ position: 'relative', zIndex: 10 }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-white">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
                <HandHeart className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    🤝 Humanitarian Initiative
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                  See Someone Homeless? Help Them Get Shelter
                </h3>
                <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl">
                  Take a photo, share location — we&apos;ll alert nearby shelter homes across Kerala instantly. No facial recognition. Privacy-first.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-white/90">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-2">
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-medium">Photo</span>
                </div>
                <ArrowRight className="w-3 h-3 text-white/50" />
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">Location</span>
                </div>
                <ArrowRight className="w-3 h-3 text-white/50" />
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Alert Shelter</span>
                </div>
              </div>

              <button
                onClick={scrollToReport}
                className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                <Camera className="w-5 h-5" />
                Report & Help Now
              </button>
            </div>
          </div>

          <div className="flex sm:hidden items-center justify-center gap-2 mt-4 text-white/90">
            <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1.5">
              <Camera className="w-3 h-3" />
              <span className="text-[10px] font-medium">Photo</span>
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-white/50" />
            <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1.5">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] font-medium">Location</span>
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-white/50" />
            <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1.5">
              <Building2 className="w-3 h-3" />
              <span className="text-[10px] font-medium">Alert Shelter</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* HOSPITAL PARTNERS - INFINITE SCROLL          */}
      {/* ══════════════════════════════════════════════ */}
      <section className="border-t border-b border-gray-100 bg-gray-50/50 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Trusted by Healthcare Leaders</p>
        </div>
        <div className="relative flex overflow-x-hidden group">
          {/* Two identical blocks animating together for a mathematically perfect -50% loop */}
          <div className="py-2 flex animate-marquee">
            {[1, 2].map((groupIndex) => (
              <div key={groupIndex} className="flex flex-none items-center gap-12 sm:gap-24 pr-12 sm:pr-24">
                {['Aster Medcity', 'KIMS', 'Amrita Hospital', 'Lakeshore', 'Medical Trust'].map((hospital, idx) => (
                  <div key={`${groupIndex}-${idx}`} className="flex-none flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors cursor-default">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-lg sm:text-2xl font-bold whitespace-nowrap">{hospital}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* SERVICES SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section id="services" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Healthcare Services</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Elderly Care, Post-Surgery Care, Newborn Care &amp; Palliative Care — find specialized nurses for your needs
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} onClick={onGetStarted} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* HOW IT WORKS */}
      {/* ══════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">How CareConnect Works</h2>
            <p className="mt-4 text-lg text-gray-600">Get quality healthcare at home in 4 simple steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="w-8 h-8 mx-auto -mt-4 mb-4 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600 shadow-md ring-4 ring-gray-50 relative z-10">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[28px] left-[55%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-transparent z-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* WHY CHOOSE US */}
      {/* ══════════════════════════════════════════════ */}
      <section id="why-us" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Why Choose CareConnect?</h2>
              <p className="text-lg text-gray-600 mb-8">
                We combine advanced AI technology with human expertise to ensure you get the
                most reliable and trustworthy healthcare professionals at your doorstep.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Nurse Verification Process</h3>
                <div className="space-y-6">
                  <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-300" />
                      </div>
                      <h4 className="text-lg font-semibold">Document Authenticity Checks</h4>
                    </div>
                    <p className="text-blue-100 text-sm">AI-powered analysis to verify uploaded certificates and documents are genuine and unaltered</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <BadgeCheck className="w-5 h-5 text-amber-300" />
                      </div>
                      <h4 className="text-lg font-semibold">License &amp; Registration Validation</h4>
                    </div>
                    <p className="text-blue-100 text-sm">Cross-verification of nursing licenses, council registrations, and professional qualifications</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-300" />
                      </div>
                      <h4 className="text-lg font-semibold">Identity Confirmation</h4>
                    </div>
                    <p className="text-blue-100 text-sm">Government ID verification including Aadhaar, PAN, and other official identity documents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* STATS SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '7,000+', label: 'Verified Nurses' },
              { value: '35,000+', label: 'Happy Families' },
              { value: '14', label: 'Kerala Districts' },
              { value: '4.8/5', label: 'Average Rating' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-3xl lg:text-4xl font-bold">{stat.value}</p>
                <p className="text-blue-100 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* KERALA DISTRICTS */}
      {/* ══════════════════════════════════════════════ */}
      <section id="cities" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Available Across Kerala</h2>
            <p className="mt-4 text-lg text-gray-600">Find home nurses across all 14 districts of God&apos;s Own Country</p>
          </div>
          <div className="relative flex overflow-x-hidden group">
            {/* Two identical blocks animating together for a mathematically perfect -50% loop */}
            <div className="py-2 flex animate-marquee">
              {[1, 2].map((groupIndex) => (
                <div key={groupIndex} className="flex flex-none items-center gap-4 px-2">
                  {cities.map((city, index) => (
                    <button
                      key={`${groupIndex}-${index}`}
                      onClick={onGetStarted}
                      className="bg-white rounded-xl p-4 text-center hover:shadow-lg hover:border-green-400 transition-all border border-gray-100 group w-40 flex-none"
                    >
                      <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="font-medium text-gray-900 text-sm">{city.name}</p>
                      <p className="text-xs text-green-600 font-medium">{city.nurses} nurses</p>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* TESTIMONIALS */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">What Families Say</h2>
            <p className="mt-4 text-lg text-gray-600">Real stories from families who found care through CareConnect</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* REPORT & HELP HOMELESS - DETAILED SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section id="report-help" className="py-16 lg:py-24 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="warning" className="mb-4">
              <HandHeart className="w-3 h-3 mr-1" /> Humanitarian Initiative
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Help the Homeless. <span className="text-orange-600">Save a Life.</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Spot someone sleeping on the streets or wandering without shelter?
              Take a photo, share the location, and we&apos;ll alert the nearest shelter homes across Kerala to provide immediate help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">How It Works</h3>
              <div className="space-y-4">
                {[
                  { icon: Camera, title: 'Capture a Photo', description: 'Take a picture of the person in need (no facial recognition or identity tracking — fully ethical)', color: 'bg-orange-100 text-orange-600', step: '1' },
                  { icon: MapPin, title: 'Share Location', description: 'GPS location is captured automatically (with your consent) to identify the exact spot', color: 'bg-blue-100 text-blue-600', step: '2' },
                  { icon: Send, title: 'Submit Report', description: 'Your report is securely sent to the admin dashboard for review and action', color: 'bg-emerald-100 text-emerald-600', step: '3' },
                  { icon: Building2, title: 'Alert Nearby Shelters', description: 'The system calculates the nearest shelter homes and sends instant alerts to provide rescue', color: 'bg-purple-100 text-purple-600', step: '4' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="relative">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', item.color)}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Report Now</h3>
                    <p className="text-orange-100 text-sm">Help someone in need today</p>
                  </div>
                </div>
                <p className="text-orange-50 mb-6">
                  Sign in to submit a report with photo and GPS location. Our admin team will
                  review and immediately alert the nearest shelter homes in Kerala.
                </p>
                <Button
                  size="lg"
                  className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold text-base shadow-lg"
                  onClick={onGetStarted}
                >
                  <Camera className="w-5 h-5 mr-2" /> Sign Up to Report & Help
                </Button>
                <p className="text-xs text-orange-200 mt-3 text-center">
                  Already have an account? <button onClick={handleLogin} className="underline text-white font-medium">Sign In</button> to report
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  <h4 className="font-semibold text-gray-900">Privacy & Ethics First</h4>
                </div>
                <ul className="space-y-2">
                  {[
                    'No facial recognition or identity tracking',
                    'Photos are used only for rescue coordination',
                    'GPS data is secured and never shared publicly',
                    'Reports are reviewed by trained admin staff',
                    'Follows privacy-by-design ethical principles',
                  ].map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <Building2 className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">50+</p>
                  <p className="text-xs text-gray-500">Shelter Homes</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">200+</p>
                  <p className="text-xs text-gray-500">Lives Helped</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                  <MapPin className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">14</p>
                  <p className="text-xs text-gray-500">Districts Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* CTA SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Find Your Perfect Home Nurse?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of Kerala families who trust CareConnect for their healthcare needs.
            All nurses are AI-verified and background-checked across all 14 districts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" onClick={onGetStarted}>
              Find a Nurse Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={onGetStarted}>
              <Phone className="w-4 h-4 mr-2" /> Call Us: 1800-123-4567
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-4">Free consultation • No obligation • 24/7 support</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ══════════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                  <img src={logo} alt="CareConnect" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-xl font-bold text-white">CareConnect</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Kerala&apos;s most trusted platform for finding verified home nurses.
                AI-powered verification across all 14 districts.
              </p>
              <div className="flex gap-3">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="text-xs uppercase">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Our Services</h4>
              <ul className="space-y-2 text-sm">
                {['Elderly Care', 'Post-Surgery Care', 'Newborn Care', 'Palliative Care'].map((service) => (
                  <li key={service}><a href="#" className="hover:text-white transition-colors">{service}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {['About Us', 'How It Works', 'Careers', 'Blog', 'Press', 'Contact'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /><span>1800-123-4567 (Toll Free)</span></li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /><span>All 14 Districts, Kerala, India</span></li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><span>24/7 Customer Support</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2025 CareConnect. All rights reserved. AI-Powered Document Verification.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div >
  );
}

/* ─── Sub-components ─── */

function ServiceCard({ icon: Icon, title, description, nurses, onClick }: {
  icon: typeof Stethoscope;
  title: string;
  description: string;
  nurses: string;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card className="p-6 hover:shadow-lg transition-all group border-0 shadow-sm h-full">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
          <Icon className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{nurses} nurses available</span>
          <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </div>
  );
}

/* ─── Data ─── */

const services = [
  { icon: Home, title: 'Elderly Care', description: 'Compassionate care for seniors including medication management, mobility support, and daily living assistance', nurses: '2,500+' },
  { icon: Activity, title: 'Post-Surgery Care', description: 'Professional recovery support with wound care, pain management, and rehabilitation assistance', nurses: '1,800+' },
  { icon: Baby, title: 'Newborn Care', description: 'Expert neonatal nurses for infant care, breastfeeding support, and newborn health monitoring', nurses: '1,200+' },
  { icon: HeartPulse, title: 'Palliative Care', description: 'Compassionate end-of-life care focusing on comfort, dignity, and quality of life for patients and families', nurses: '1,500+' },
];

const steps = [
  { icon: Search, title: 'Search', description: 'Enter your location and the type of care you need' },
  { icon: Users, title: 'Compare', description: 'Browse verified nurses with ratings, experience, and reviews' },
  { icon: CheckCircle, title: 'Book', description: 'Select your preferred nurse and schedule a service' },
  { icon: Heart, title: 'Receive Care', description: 'Get quality healthcare at home from verified professionals' },
];

const features = [
  { icon: Shield, title: 'AI Document Verification', description: 'Every nurse document is analyzed using advanced AI to detect forgeries and ensure authenticity' },
  { icon: BadgeCheck, title: '100% Background Checked', description: 'All nurses undergo thorough background verification including police clearance' },
  { icon: Star, title: 'Rated & Reviewed', description: 'Read genuine reviews from families who have used our nursing services' },
  { icon: Clock, title: '24/7 Availability', description: 'Find nurses for emergency care, night shifts, or round-the-clock assistance' },
];

const cities = [
  { name: 'Thiruvananthapuram', nurses: '850+' },
  { name: 'Kochi', nurses: '1,200+' },
  { name: 'Kozhikode', nurses: '720+' },
  { name: 'Thrissur', nurses: '650+' },
  { name: 'Kollam', nurses: '480+' },
  { name: 'Alappuzha', nurses: '390+' },
  { name: 'Palakkad', nurses: '350+' },
  { name: 'Kottayam', nurses: '420+' },
  { name: 'Malappuram', nurses: '510+' },
  { name: 'Kannur', nurses: '440+' },
  { name: 'Kasaragod', nurses: '280+' },
  { name: 'Idukki', nurses: '210+' },
  { name: 'Pathanamthitta', nurses: '300+' },
  { name: 'Wayanad', nurses: '250+' },
];

const testimonials = [
  { text: 'CareConnect helped us find an excellent nurse for my father after his surgery at Medical College Thiruvananthapuram. The AI verification gave us confidence. Highly recommended!', name: 'Lakshmi Nair', location: 'Thiruvananthapuram, Kerala', rating: 5 },
  { text: 'We needed urgent elderly care for my grandmother in Kochi. Within hours, we had a verified nurse at our doorstep. The service is exceptional and the nurses are so caring.', name: 'Arun Menon', location: 'Kochi, Kerala', rating: 5 },
  { text: 'As an NRI, knowing my parents in Kozhikode are in good hands with a verified nurse gives me peace of mind. CareConnect is a blessing for Kerala families!', name: 'Deepa Krishnan', location: 'Kozhikode, Kerala', rating: 4 },
];
