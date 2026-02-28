/**
 * ============================================
 * USER (PATIENT/FAMILY) DASHBOARD
 * ============================================
 * Features: Search nurses, book services, manage bookings,
 * submit feedback, report homeless individuals.
 *
 * Updated for async Supabase database operations.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { NurseProfileDB, UserDB, BookingDB, ShelterReportDB, ShelterDB, NotificationDB } from '@/store/database';
import { Button, Input, Textarea, Card, Badge, Modal, StarRating, EmptyState, Select } from '@/components/ui';
import { Search, Calendar, MapPin, Star, Clock, MessageSquare, Camera, Send, FileText, Heart, AlertTriangle, User, Pencil, Home, CreditCard, Bell } from 'lucide-react';
import type { NurseProfile, Booking } from '@/types';
import type { ShelterReport } from '@/types';
import { cn } from '@/utils/cn';

// Import New Sub-Modules
import { UserHome } from './UserHome';
import { UserPayments } from './UserPayments';
import { UserNotifications } from './UserNotifications';
import { UserFeedback } from './UserFeedback';

type Tab = 'home' | 'search' | 'bookings' | 'payments' | 'report' | 'feedback' | 'notifications' | 'account';

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const tabs = [
    { id: 'home' as Tab, label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'search' as Tab, label: 'Find Nurses', icon: <Search className="w-4 h-4" /> },
    { id: 'bookings' as Tab, label: 'My Bookings', icon: <Calendar className="w-4 h-4" /> },
    { id: 'payments' as Tab, label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'report' as Tab, label: 'Help Report', icon: <Heart className="w-4 h-4" /> },
    { id: 'feedback' as Tab, label: 'Feedback', icon: <Star className="w-4 h-4" /> },
    { id: 'notifications' as Tab, label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
    { id: 'account' as Tab, label: 'My Account', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer',
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'home' && <UserHome onNavigate={(t) => setActiveTab(t as Tab)} />}
      {activeTab === 'search' && <NurseSearch />}
      {activeTab === 'bookings' && <MyBookings />}
      {activeTab === 'payments' && <UserPayments />}
      {activeTab === 'report' && <HomelessReport />}
      {activeTab === 'feedback' && <UserFeedback />}
      {activeTab === 'notifications' && <UserNotifications />}
      {activeTab === 'account' && <MyAccount />}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*              MY ACCOUNT                     */
/* ─────────────────────────────────────────── */

function MyAccount() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, phone: user.phone, location: user.location || '' });
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Photo must be under 2MB');
      return;
    }
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      await updateUser({ profile_photo: reader.result as string });
      setPhotoUploading(false);
      setMessage('Profile photo updated!');
      setTimeout(() => setMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    await updateUser({
      name: form.name,
      phone: form.phone,
      location: form.location,
    });
    setSaving(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Photo */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {user.profile_photo ? (
              <img
                src={user.profile_photo}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-sm">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photoUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <Badge variant={user.role === 'admin' ? 'info' : 'success'} className="mt-1">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
            <p className="text-xs text-gray-400 mt-1">Hover photo to change</p>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Pencil className="w-5 h-5 text-blue-600" /> Edit Profile
        </h3>

        {message && (
          <div className={cn(
            'mb-4 p-3 rounded-xl text-sm',
            message.includes('successfully') || message.includes('updated')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          )}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <Input
            label="Location"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="City name"
          />

          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm text-gray-700">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Joined</p>
              <p className="text-sm text-gray-700">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}


/* ─────────────────────────────────────────── */
/*            NURSE SEARCH & BOOKING           */
/* ─────────────────────────────────────────── */

function NurseSearch() {
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [minExp, setMinExp] = useState('0');
  const [reqAvailable, setReqAvailable] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<NurseProfile | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [results, setResults] = useState<NurseProfile[]>([]);
  const [filteredResults, setFilteredResults] = useState<NurseProfile[]>([]);
  const [nurseNames, setNurseNames] = useState<Record<string, string>>({});
  const [, setRefresh] = useState(0);

  // Search nurses (async)
  useEffect(() => {
    NurseProfileDB.search(location || undefined, service || undefined).then(setResults);
  }, [location, service, setRefresh]);

  // Apply UI Filters
  useEffect(() => {
    let filtered = results;
    if (minRating !== '0') {
      filtered = filtered.filter(n => n.rating >= Number(minRating));
    }
    if (minExp !== '0') {
      filtered = filtered.filter(n => n.experience >= Number(minExp));
    }
    if (reqAvailable) {
      filtered = filtered.filter(n => n.availability === true);
    }
    setFilteredResults(filtered);
  }, [results, minRating, minExp, reqAvailable]);

  // Resolve nurse names for the results
  useEffect(() => {
    const fetchNames = async () => {
      const names: Record<string, string> = {};
      for (const nurse of results) {
        const u = await UserDB.getById(nurse.userId);
        names[nurse.userId] = u?.name || 'Unknown';
      }
      setNurseNames(names);
    };
    if (results.length > 0) fetchNames();
  }, [results]);

  const getNurseName = (userId: string) => nurseNames[userId] || 'Unknown';

  const handleBook = useCallback((nurse: NurseProfile) => {
    setSelectedNurse(nurse);
    setShowBooking(true);
  }, []);

  const handleBookingCreated = () => {
    setShowBooking(false);
    setSelectedNurse(null);
    setRefresh(r => r + 1);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" /> Search Verified Nurses
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Input
            placeholder="Location (e.g., Mumbai)"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <Input
            placeholder="Service (e.g., Elder Care)"
            value={service}
            onChange={e => setService(e.target.value)}
          />
          <Select
            options={[
              { value: '0', label: 'Any Rating' },
              { value: '3', label: '3+ Stars' },
              { value: '4', label: '4+ Stars' },
              { value: '4.5', label: '4.5+ Stars' }
            ]}
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
          <Select
            options={[
              { value: '0', label: 'Any Experience' },
              { value: '1', label: '1+ Years' },
              { value: '3', label: '3+ Years' },
              { value: '5', label: '5+ Years' }
            ]}
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-1">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={reqAvailable}
              onChange={e => setReqAvailable(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            Currently Available Only
          </label>
        </div>
      </Card>

      {/* Results */}
      {filteredResults.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8 text-gray-400" />}
          title="No nurses found"
          description="Try adjusting your filters or search criteria."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredResults.map(nurse => (
            <Card key={nurse.userId} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{getNurseName(nurse.userId)}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5" /> {nurse.location}
                  </div>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{nurse.bio}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {nurse.specializations.map(s => (
                  <Badge key={s} variant="info">{s}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {nurse.experience} yrs</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {nurse.rating > 0 ? nurse.rating.toFixed(1) : 'New'}</span>
                <span className="font-medium text-gray-900">
                  ₹{nurse.baseRate}/{nurse.rateType.substring(0, 2)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBook(nurse)}>Book Now</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedNurse(nurse)}>
                  <FileText className="w-4 h-4" /> View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Nurse Profile Modal */}
      {selectedNurse && !showBooking && (
        <Modal isOpen onClose={() => setSelectedNurse(null)} title="Nurse Profile" size="lg">
          <NurseProfileView nurse={selectedNurse} onBook={() => setShowBooking(true)} />
        </Modal>
      )}

      {/* Booking Modal */}
      {showBooking && selectedNurse && user && (
        <Modal isOpen onClose={() => setShowBooking(false)} title="Book Nurse Service" size="md">
          <BookingForm nurse={selectedNurse} userId={user.id} userName={user.name} nurseName={getNurseName(selectedNurse.userId)} onComplete={handleBookingCreated} />
        </Modal>
      )}
    </div>
  );
}

function NurseProfileView({ nurse, onBook }: { nurse: NurseProfile; onBook: () => void }) {
  const [nurseName, setNurseName] = useState('');

  useEffect(() => {
    UserDB.getById(nurse.userId).then(u => {
      setNurseName(u?.name || 'Unknown');
    });
  }, [nurse.userId]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {nurseName[0] || '?'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{nurseName}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {nurse.location}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Math.round(nurse.rating)} readonly />
            <span className="text-sm text-gray-500">({nurse.totalReviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-2">About</h4>
        <p className="text-sm text-gray-600">{nurse.bio}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-blue-50 rounded-xl p-4 flex flex-col justify-center items-center">
          <p className="text-2xl font-bold text-blue-600">{nurse.experience}</p>
          <p className="text-xs text-gray-500">Years Exp.</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 flex flex-col justify-center items-center">
          <p className="text-2xl font-bold text-amber-600">{nurse.rating > 0 ? nurse.rating.toFixed(1) : 'N/A'}</p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>

      <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Pricing</h4>
          <p className="text-sm text-gray-500">Fixed base rate</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">₹{nurse.baseRate}</p>
          <p className="text-xs text-gray-500 font-medium">Per {nurse.rateType.charAt(0).toUpperCase() + nurse.rateType.slice(1)}</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Specializations</h4>
        <div className="flex flex-wrap gap-2">
          {nurse.specializations.map(s => <Badge key={s} variant="info">{s}</Badge>)}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Service Areas</h4>
        <div className="flex flex-wrap gap-2">
          {nurse.serviceAreas.map(a => <Badge key={a} variant="neutral">{a}</Badge>)}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">📞 +91 ••••• •••••</span>
          <Badge variant="warning">Hidden for privacy</Badge>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">* Contact details are automatically revealed once a booking is confirmed by the nurse.</p>
      </div>

      <Button onClick={onBook} className="w-full" size="lg">
        <Calendar className="w-4 h-4" /> Book This Nurse
      </Button>
    </div >
  );
}

function BookingForm({ nurse, userId, userName, nurseName, onComplete }: {
  nurse: NurseProfile; userId: string; userName: string; nurseName: string; onComplete: () => void;
}) {
  const [form, setForm] = useState({
    serviceType: nurse.specializations[0] || '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const totalDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const diff = new Date(form.endDate).getTime() - new Date(form.startDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [form.startDate, form.endDate]);

  const totalAmount = useMemo(() => {
    let multiplier = 1;
    if (nurse.rateType === 'hourly') multiplier = 8; // Assuming 8 hours for a daily booking
    if (nurse.rateType === 'weekly') multiplier = 1 / 7; // Rough estimate if booking by days
    if (nurse.rateType === 'monthly') multiplier = 1 / 30; // Rough estimate if booking by days

    return Math.round(totalDays * nurse.baseRate * multiplier);
  }, [totalDays, nurse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await BookingDB.create({
        userId,
        nurseId: nurse.userId,
        userName,
        nurseName,
        serviceType: form.serviceType,
        startDate: form.startDate,
        endDate: form.endDate,
        status: 'pending',
        paymentMethod: 'cod',
        totalAmount,
        notes: form.notes,
      });

      await NotificationDB.create({
        userId: nurse.userId,
        title: 'New Booking Request',
        message: `${userName} has requested your ${form.serviceType} services.`,
        type: 'info'
      });

      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
          {nurseName[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{nurseName}</p>
          <p className="text-sm text-gray-600">₹{nurse.baseRate} / {nurse.rateType.substring(0, 2)}</p>
        </div>
      </div>

      <Select
        label="Service Type"
        value={form.serviceType}
        onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
        options={nurse.specializations.map(s => ({ value: s, label: s }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Date" type="date" value={form.startDate}
          onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required
          min={new Date().toISOString().split('T')[0]} />
        <Input label="End Date" type="date" value={form.endDate}
          onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required
          min={form.startDate || new Date().toISOString().split('T')[0]} />
      </div>

      <Textarea label="Notes / Special Requirements" placeholder="Describe any specific needs..."
        value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Duration</span>
          <span className="font-medium">{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between items-center text-sm mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
          <span className="text-gray-600 font-medium">Rate:</span>
          <span className="font-bold text-emerald-700">₹{nurse.baseRate} / {nurse.rateType.substring(0, 2)}</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-blue-600 text-lg">₹{totalAmount.toLocaleString()}</span>
        </div>
        <Badge variant="info">💵 Cash on Delivery (COD)</Badge>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={!form.startDate || !form.endDate || totalDays <= 0 || submitting}>
        <Send className="w-4 h-4" /> {submitting ? 'Booking...' : 'Confirm Booking'}
      </Button>
    </form>
  );
}

/* ─────────────────────────────────────────── */
/*              MY BOOKINGS                    */
/* ─────────────────────────────────────────── */

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await BookingDB.getByUserId(user.id);
      setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const refresh = () => {
    loadBookings();
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    await BookingDB.update(id, { status: 'cancelled' });
    refresh();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
      pending: 'warning', accepted: 'info', rejected: 'danger', completed: 'success', cancelled: 'neutral'
    };
    return <Badge variant={map[status] || 'neutral'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const filteredBookings = bookings.filter(b => filterTab === 'all' || b.status === filterTab);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          My Bookings
        </h3>

        <div className="flex gap-1 overflow-x-auto hide-scrollbar bg-gray-100 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer',
                filterTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState icon={<Calendar className="w-8 h-8 text-gray-400" />} title="No bookings found" description="You don't have any bookings in this category." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredBookings.map(booking => (
            <Card key={booking.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3 border-b border-gray-100 pb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{booking.nurseName}</h4>
                  <p className="text-sm font-medium text-blue-600">{booking.serviceType}</p>
                </div>
                {statusBadge(booking.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <span>📅 {booking.startDate} → {booking.endDate}</span>
                <span className="text-right font-medium text-gray-900">₹{booking.totalAmount.toLocaleString()}</span>
              </div>

              {booking.notes && <p className="text-sm text-gray-500 mb-3">📝 {booking.notes}</p>}

              <div className="mt-auto pt-4 flex gap-2">
                {['pending', 'accepted'].includes(booking.status) && (
                  <Button size="sm" variant="danger" onClick={() => cancelBooking(booking.id)} className="w-full">
                    Cancel Booking
                  </Button>
                )}
                {booking.status === 'completed' && !booking.feedback && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-blue-600 bg-blue-50 border-blue-200"
                    disabled
                  >
                    <MessageSquare className="w-4 h-4" /> Go to Feedback Tab
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*        HOMELESS LOCATION REPORTING          */
/* ─────────────────────────────────────────── */

function HomelessReport() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ShelterReport[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      ShelterReportDB.getAll().then(all => setReports(all.filter(r => r.reportedBy === user.id)));
    }
  }, [user]);

  const refresh = () => {
    if (user) {
      ShelterReportDB.getAll().then(all => setReports(all.filter(r => r.reportedBy === user.id)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Humanitarian Help Reports</h3>
          <p className="text-sm text-gray-500">Report individuals in need to connect them with shelters</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Camera className="w-4 h-4" /> New Report
        </Button>
      </div>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Privacy Notice</p>
            <p className="text-xs text-amber-700 mt-1">
              This feature is designed with privacy-by-design principles. No facial recognition or identity tracking is used. Reports are shared only with verified shelters to provide assistance.
            </p>
          </div>
        </div>
      </Card>

      {reports.length > 0 && (
        <div className="space-y-3">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {showForm && (
        <Modal isOpen onClose={() => setShowForm(false)} title="Submit Humanitarian Report" size="lg">
          <ReportForm userId={user!.id} userName={user!.name} onComplete={() => { setShowForm(false); refresh(); }} />
        </Modal>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: ShelterReport }) {
  const [shelterName, setShelterName] = useState('');

  useEffect(() => {
    if (report.assignedShelterId) {
      ShelterDB.getById(report.assignedShelterId).then(s => {
        if (s) setShelterName(s.name);
      });
    }
  }, [report.assignedShelterId]);

  const statusVariant = (): 'success' | 'info' | 'warning' | 'danger' | 'neutral' => {
    switch (report.status) {
      case 'assigned': return 'success';
      case 'resolved': return 'success';
      case 'notified': return 'info';
      default: return 'warning';
    }
  };

  const statusLabel = () => {
    switch (report.status) {
      case 'assigned': return '✅ Accepted by Shelter';
      case 'resolved': return '✅ Resolved';
      case 'notified': return '📨 Shelters Notified';
      default: return '⏳ Reported';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {/* Image thumbnail */}
        {report.photo && (
          <img src={report.photo} alt="Report" className="w-20 h-20 object-cover rounded-lg border shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-gray-900">{report.locationDescription}</p>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{report.description}</p>
            </div>
            <Badge variant={statusVariant()}>{statusLabel()}</Badge>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)} · {new Date(report.createdAt).toLocaleDateString()}
          </p>

          {/* Assigned shelter info */}
          {report.status === 'assigned' && shelterName && (
            <div className="mt-2 bg-emerald-50 rounded-lg p-2">
              <p className="text-xs text-emerald-700">
                🏠 Accepted by <span className="font-semibold">{shelterName}</span>
                {report.acceptedAt && ` · ${new Date(report.acceptedAt).toLocaleDateString()}`}
              </p>
            </div>
          )}

          {/* Nearby Shelters (for non-assigned) */}
          {report.status !== 'assigned' && report.nearbyShelters.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Nearby Shelters:</p>
              {report.nearbyShelters.slice(0, 2).map(s => (
                <p key={s.id} className="text-xs text-gray-600">🏠 {s.name} — {s.distanceKm?.toFixed(1)} km</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function ReportForm({ userId, userName, onComplete }: {
  userId: string; userName: string; onComplete: () => void;
}) {
  const [form, setForm] = useState({
    photo: '',
    latitude: 0,
    longitude: 0,
    locationName: '',
    locationDescription: '',
    description: '',
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getLocationName = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      const addr = data.address || {};
      const parts = [
        addr.suburb || addr.neighbourhood || addr.village || addr.town,
        addr.city || addr.county || addr.state_district,
        addr.state,
      ].filter(Boolean);
      return parts.join(', ') || 'Kerala, India';
    } catch {
      return 'Kerala, India';
    }
  };

  const getLocation = () => {
    setGettingLocation(true);
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const name = await getLocationName(lat, lon);
          setForm(f => ({
            ...f,
            latitude: lat,
            longitude: lon,
            locationName: name,
            locationDescription: name,
          }));
          setLocationCaptured(true);
          setGettingLocation(false);
        },
        () => {
          setLocationError('Could not get location. Please type your location manually.');
          setGettingLocation(false);
        },
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
      );
    } else {
      setLocationError('Location not supported. Please type your location manually.');
      setGettingLocation(false);
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 800; // Compress image to max 800px

          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          setForm(f => ({ ...f, photo: canvas.toDataURL('image/jpeg', 0.6) }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const allShelters = await ShelterDB.getAll();
      const shelters = allShelters.map(s => ({
        ...s,
        distanceKm: haversineDistance(form.latitude || 9.9312, form.longitude || 76.2673, s.latitude, s.longitude),
      })).sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

      await ShelterReportDB.create({
        reportedBy: userId,
        reporterName: userName,
        photo: form.photo,
        latitude: form.latitude || 9.9312,
        longitude: form.longitude || 76.2673,
        locationDescription: form.locationDescription || form.locationName,
        description: form.description,
        nearbyShelters: shelters.slice(0, 3),
        status: 'reported',
      });

      onComplete();
    } catch (err: any) {
      console.error('Submit Error:', err);
      alert('Failed to submit report. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          📸 Photo <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50">
          {form.photo ? (
            <div className="space-y-2">
              <img src={form.photo} alt="Report" className="max-h-48 mx-auto rounded-lg object-cover" />
              <p className="text-xs text-green-600 font-medium">✅ Photo uploaded</p>
            </div>
          ) : (
            <div>
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Take or upload a photo</p>
              <p className="text-xs text-gray-400 mt-1">No facial recognition used</p>
            </div>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="mt-3 text-sm w-full" required />
        </div>
      </div>

      {/* Location Section - NO raw coordinates shown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          📍 Location <span className="text-red-500">*</span>
        </label>

        {/* Use My Location Button */}
        <button
          type="button"
          onClick={getLocation}
          disabled={gettingLocation}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-100 transition-colors disabled:opacity-60 mb-3"
        >
          <MapPin className="w-4 h-4" />
          {gettingLocation ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Detecting your location...
            </span>
          ) : (
            '📍 Use My Current Location'
          )}
        </button>

        {/* Location captured success */}
        {locationCaptured && form.locationName && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-3">
            <span className="text-green-500 text-lg">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-800">{form.locationName}</p>
              <p className="text-xs text-green-600">Location captured successfully</p>
            </div>
          </div>
        )}

        {/* Location error */}
        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-xs text-red-600">{locationError}</p>
          </div>
        )}

        {/* Manual location name input */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Location Name <span className="text-gray-400">(auto-filled or type manually)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Kakkanad, Ernakulam, Kerala"
            value={form.locationDescription}
            onChange={e => setForm(f => ({ ...f, locationDescription: e.target.value }))}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <Textarea
        label="Describe the Situation"
        placeholder="e.g., Elderly man sleeping near bus stand, appears unwell, needs food and shelter..."
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        required
      />

      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Report & Alert Shelters'}
      </Button>
    </form>
  );
}

/** Haversine formula for distance between two GPS coordinates */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
