/**
 * ============================================
 * APP - Main Entry Point
 * ============================================
 * CareConnect - Home Nurse Finder System
 *
 * Architecture:
 * - AuthContext manages authentication state
 * - Role-based routing renders appropriate dashboard
 * - Local storage simulates MongoDB collections
 * - AI module performs real pixel-level document analysis
 */

import { AuthProvider, useAuth } from '@/store/AuthContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { LandingPage } from '@/components/landing/LandingPage';
import { UserDashboard } from '@/components/user/UserDashboard';
import { NurseDashboard } from '@/components/nurse/NurseDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ShelterDashboard } from '@/components/shelter/ShelterDashboard';
import { NotificationDB } from '@/store/database';
import { useState, useEffect } from 'react';
import {
  LogOut, Bell, User, Stethoscope, Shield,
  Menu, X, Loader2, Building
} from 'lucide-react';
import { cn } from '@/utils/cn';
import logo from '@/assets/logo.png';
import { Badge, Card } from '@/components/ui';
import type { Notification } from '@/types';

function AppContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // When session is restored after refresh, skip landing page
  // Also, when user logs in/registers successfully, hide landing
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setShowLanding(false);
    }
  }, [loading, isAuthenticated]);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      NotificationDB.getByUserId(user.id).then(setNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);
  // Go back to landing page (stays logged in)
  const goToLanding = () => {
    setShowLanding(true);
    setMobileMenuOpen(false);
    setShowNotifications(false);
  };

  // Actual logout - signs out and goes to landing
  const handleLogout = async () => {
    await logout();
    setShowLanding(true);
    setMobileMenuOpen(false);
  };

  // Show loading spinner while restoring session
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading CareConnect...</p>
        </div>
      </div>
    );
  }

  // Show landing page (both for authenticated and unauthenticated users when logo is clicked)
  if (showLanding) {
    return <LandingPage
      onGetStarted={() => { if (isAuthenticated) { setShowLanding(false); } else { setAuthMode('register'); setShowLanding(false); } }}
      onLogin={() => { if (isAuthenticated) { setShowLanding(false); } else { setAuthMode('login'); setShowLanding(false); } }}
    />;
  }

  // Not authenticated → show login page
  if (!isAuthenticated || !user) {
    return <AuthPage initialMode={authMode} onBackToLanding={() => setShowLanding(true)} />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleConfig = {
    user: { label: 'Patient', color: 'from-blue-500 to-blue-600', icon: <User className="w-4 h-4" />, bgColor: 'bg-blue-50 text-blue-700' },
    nurse: { label: 'Nurse', color: 'from-emerald-500 to-emerald-600', icon: <Stethoscope className="w-4 h-4" />, bgColor: 'bg-emerald-50 text-emerald-700' },
    admin: { label: 'Admin', color: 'from-indigo-500 to-indigo-600', icon: <Shield className="w-4 h-4" />, bgColor: 'bg-indigo-50 text-indigo-700' },
    shelter: { label: 'Shelter', color: 'from-amber-500 to-amber-600', icon: <Building className="w-4 h-4" />, bgColor: 'bg-amber-50 text-amber-700' },
  } as const;

  const config = roleConfig[user.role];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Click to go to Landing Page */}
            <button onClick={goToLanding} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="p-1 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                <img src={logo} alt="CareConnect" className="w-9 h-9 object-contain" />
              </div>
              <div className="hidden sm:block text-left">
                <h1 className="text-lg font-bold text-gray-900">CareConnect</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Care Assistant Finder</p>
              </div>
            </button>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Role Badge (desktop only) */}
              <div className={cn('hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', config.bgColor)}>
                {config.icon}
                {config.label}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative cursor-pointer">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationPanel
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              {/* User Info + Logout (always visible) */}
              <div className="flex items-center gap-2">
                {/* Profile Avatar */}
                {user.profile_photo ? (
                  <img src={user.profile_photo} alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br', config.color)}>
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => handleLogout()}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer sm:hidden">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden py-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-3 px-2">
                <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', config.bgColor)}>
                  {config.icon} {config.label}
                </div>
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <div className="flex gap-2 px-2">
                <button onClick={() => { setShowNotifications(!showNotifications); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 cursor-pointer">
                  <Bell className="w-4 h-4" /> Notifications
                  {unreadCount > 0 && <Badge variant="danger">{unreadCount}</Badge>}
                </button>
                <button onClick={() => logout()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Notification Dropdown (mobile) */}
      {showNotifications && (
        <div className="sm:hidden fixed inset-x-0 top-16 z-30 p-4">
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            mobile
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome Banner */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 mt-1">
            {user.role === 'user' && 'Find trusted, verified home nurses near you.'}
            {user.role === 'nurse' && 'Manage your profile, documents, and bookings.'}
            {user.role === 'admin' && 'Oversee the platform, verify nurses, and manage reports.'}
            {user.role === 'shelter' && 'View assigned reports and help those in need.'}
          </p>
        </div>

        {/* Role-based Dashboard */}
        {user.role === 'user' && <UserDashboard />}
        {user.role === 'nurse' && <NurseDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'shelter' && <ShelterDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={goToLanding} className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
              <img src={logo} alt="CareConnect" className="w-4 h-4 object-contain" />
              <span className="text-sm text-gray-600">CareConnect — Care Assistant Finder</span>
            </button>
            <p className="text-xs text-gray-400">
              Home Care Assistant
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Notification Panel ─── */
function NotificationPanel({ notifications, onClose, mobile }: {
  notifications: Notification[];
  onClose: () => void;
  mobile?: boolean;
}) {
  const markRead = (id: string) => {
    NotificationDB.markAsRead(id);
  };

  return (
    <>
      {!mobile && <div className="fixed inset-0" onClick={onClose} />}
      <Card className={cn(
        'shadow-lg border border-gray-200 z-50',
        mobile ? 'w-full' : 'absolute right-0 top-12 w-80'
      )}>
        <div className="p-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
          ) : (
            notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map(n => (
              <div key={n.id}
                className={cn('p-3 border-b border-gray-50 text-sm cursor-pointer hover:bg-gray-50', !n.read && 'bg-blue-50/50')}
                onClick={() => markRead(n.id)}>
                <p className={cn('text-gray-700', !n.read && 'font-medium')}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}

/** Get time-based greeting */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** Root App with AuthProvider */
export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
