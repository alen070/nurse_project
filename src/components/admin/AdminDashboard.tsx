/**
 * ============================================
 * ADMIN DASHBOARD
 * ============================================
 * Features: Overview stats, nurse verification with AI results,
 * user/booking management, shelter reports.
 *
 * Updated for async Supabase database operations.
 */

import { useState, useEffect } from 'react';
import { UserDB, NurseProfileDB, DocumentDB, BookingDB, ShelterReportDB, ShelterDB, AdminLogDB, NotificationDB } from '@/store/database';
import { Button, Card, Badge, Modal, StatsCard, EmptyState, ProgressBar, Input } from '@/components/ui';
import {
  LayoutDashboard, Users, Stethoscope, FileCheck, Calendar, MapPin,
  CheckCircle, XCircle, AlertTriangle, Eye, Shield, Clock, TrendingUp,
  Trash2, Building, Camera, Pencil, User as UserIcon, BarChart3, ScrollText, Bell, Activity
} from 'lucide-react';
import type { NurseProfile, NurseDocument, Booking, ShelterReport, Shelter } from '@/types';
import type { User } from '@/types';
import { cn } from '@/utils/cn';
import { useAuth } from '@/store/AuthContext';
import { AdminAIMonitor } from './AdminAIMonitor';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSystemLogs } from './AdminSystemLogs';
import { AdminNotifications } from './AdminNotifications';

type Tab = 'overview' | 'nurses' | 'ai' | 'users' | 'shelters' | 'bookings' | 'reports' | 'notifications' | 'analytics' | 'logs' | 'account';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'nurses' as Tab, label: 'Nurses', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'ai' as Tab, label: 'AI Analysis', icon: <Shield className="w-4 h-4" /> },
    { id: 'bookings' as Tab, label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
    { id: 'users' as Tab, label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'shelters' as Tab, label: 'Shelters', icon: <Building className="w-4 h-4" /> },
    { id: 'reports' as Tab, label: 'Help Reports', icon: <MapPin className="w-4 h-4" /> },
    { id: 'notifications' as Tab, label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
    { id: 'analytics' as Tab, label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'logs' as Tab, label: 'System Logs', icon: <ScrollText className="w-4 h-4" /> },
    { id: 'account' as Tab, label: 'My Account', icon: <UserIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer',
              activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900')}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewPanel />}
      {activeTab === 'nurses' && <NurseManagement />}
      {activeTab === 'ai' && <AdminAIMonitor />}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'shelters' && <ShelterManagement />}
      {activeTab === 'bookings' && <BookingManagement />}
      {activeTab === 'reports' && <ReportManagement />}
      {activeTab === 'notifications' && <AdminNotifications />}
      {activeTab === 'analytics' && <AdminAnalytics />}
      {activeTab === 'logs' && <AdminSystemLogs />}
      {activeTab === 'account' && <AdminMyAccount />}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*              OVERVIEW PANEL                 */
/* ─────────────────────────────────────────── */

function OverviewPanel() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalNurses: 0, pendingVerification: 0, approvedNurses: 0,
    totalBookings: 0, activeBookings: 0, totalShelters: 0, activeReports: 0, totalReports: 0,
    documentsUploaded: 0, genuineDocuments: 0, suspectedForgery: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, nurses, bookings, reports, documents, shelters] = await Promise.all([
          UserDB.getAll(),
          NurseProfileDB.getAll(),
          BookingDB.getAll(),
          ShelterReportDB.getAllOverview(),
          DocumentDB.getAllOverview(),
          ShelterDB.getAll(),
        ]);

        setStats({
          totalUsers: users.filter(u => u.role === 'user').length,
          totalNurses: nurses.length,
          pendingVerification: nurses.filter(n => n.verificationStatus === 'pending').length,
          approvedNurses: nurses.filter(n => n.verificationStatus === 'approved').length,
          totalBookings: bookings.length,
          activeBookings: bookings.filter(b => b.status === 'accepted').length,
          totalShelters: shelters.length,
          activeReports: reports.filter(r => r.status !== 'resolved').length,
          totalReports: reports.length,
          documentsUploaded: documents.length,
          genuineDocuments: documents.filter(d => d.aiAnalysis?.result === 'genuine').length,
          suspectedForgery: documents.filter(d => d.aiAnalysis?.result === 'suspected_forgery').length,
        });

        setRecentBookings(bookings.slice(-5).reverse());
      } catch (e) {
        console.error('Failed to load overview stats:', e);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Users className="w-5 h-5 text-blue-600" />} label="Total Users" value={stats.totalUsers} color="bg-blue-50" />
        <StatsCard icon={<Stethoscope className="w-5 h-5 text-emerald-600" />} label="Nurses" value={stats.totalNurses} color="bg-emerald-50" />
        <StatsCard icon={<Calendar className="w-5 h-5 text-purple-600" />} label="Bookings" value={stats.totalBookings} color="bg-purple-50" />
        <StatsCard icon={<Building className="w-5 h-5 text-amber-600" />} label="Shelters" value={stats.totalShelters} color="bg-amber-50" />
        <StatsCard icon={<MapPin className="w-5 h-5 text-rose-600" />} label="Help Reports" value={stats.totalReports} color="bg-rose-50" />
        <StatsCard icon={<Activity className="w-5 h-5 text-orange-600" />} label="Active Reports" value={stats.activeReports} color="bg-orange-50" />
      </div>

      {/* Pending Actions */}
      {stats.pendingVerification > 0 && (
        <Card className="p-5 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{stats.pendingVerification} Nurse{stats.pendingVerification > 1 ? 's' : ''} Awaiting Verification</p>
              <p className="text-sm text-gray-600">Review their documents and AI analysis results</p>
            </div>
            <Badge variant="warning">{stats.pendingVerification} Pending</Badge>
          </div>
        </Card>
      )}

      {/* AI Analysis Overview */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" /> AI Document Analysis Overview
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <FileCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.documentsUploaded}</p>
            <p className="text-sm text-gray-500">Total Documents</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{stats.genuineDocuments}</p>
            <p className="text-sm text-gray-500">Genuine</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.suspectedForgery}</p>
            <p className="text-sm text-gray-500">Suspected Forgery</p>
          </div>
        </div>
      </Card>

      {/* Recent Bookings */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" /> Recent Bookings
        </h3>
        {recentBookings.map(b => (
          <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{b.userName} → {b.nurseName}</p>
              <p className="text-xs text-gray-500">{b.serviceType}</p>
            </div>
            <Badge variant={b.status === 'completed' ? 'success' : b.status === 'pending' ? 'warning' : 'info'}>
              {b.status}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*          NURSE VERIFICATION                 */
/* ─────────────────────────────────────────── */

function NurseManagement() {
  const { user: admin } = useAuth();
  const [nurses, setNurses] = useState<NurseProfile[]>([]);
  const [nurseUsers, setNurseUsers] = useState<Record<string, User>>({});
  const [nurseDocs, setNurseDocs] = useState<Record<string, NurseDocument[]>>({});
  const [selectedNurse, setSelectedNurse] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [allNurses, allUsers, allDocs] = await Promise.all([
        NurseProfileDB.getAllOverview(),
        UserDB.getAll(),
        DocumentDB.getAllOverview()
      ]);
      setNurses(allNurses);

      const users: Record<string, User> = {};
      allUsers.forEach(u => { users[u.id] = u; });
      setNurseUsers(users);

      const docs: Record<string, NurseDocument[]> = {};
      allDocs.forEach(d => {
        if (!docs[d.nurseId]) docs[d.nurseId] = [];
        docs[d.nurseId].push(d);
      });
      setNurseDocs(docs);
    };
    load();
  }, []);

  const handleVerification = async (nurseId: string, status: 'approved' | 'rejected') => {
    await NurseProfileDB.update(nurseId, { verificationStatus: status });
    if (admin) {
      const nurseName = nurseUsers[nurseId]?.name || nurseId;
      await AdminLogDB.create({
        adminId: admin.id, adminName: admin.name,
        action: status === 'approved' ? 'Approve Nurse' : 'Reject Nurse',
        target: nurseName,
        details: `${status === 'approved' ? 'Approved' : 'Rejected'} nurse verification`,
      });
    }
    const allNurses = await NurseProfileDB.getAllOverview();
    setNurses(allNurses);
    setSelectedNurse(null);
  };

  const pendingNurses = nurses.filter(n => n.verificationStatus === 'pending');
  const approvedNurses = nurses.filter(n => n.verificationStatus === 'approved');
  const rejectedNurses = nurses.filter(n => n.verificationStatus === 'rejected');

  const renderNurseCard = (nurse: NurseProfile) => {
    const user = nurseUsers[nurse.userId];
    const docs = nurseDocs[nurse.userId] || [];

    return (
      <Card key={nurse.userId} className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
              {user?.name[0] || 'N'}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{user?.name}</h4>
              <p className="text-xs text-gray-500">{user?.email} · {nurse.location}</p>
            </div>
          </div>
          <Badge variant={nurse.verificationStatus === 'approved' ? 'success' : nurse.verificationStatus === 'rejected' ? 'danger' : 'warning'}>
            {nurse.verificationStatus}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {nurse.specializations.map(s => <Badge key={s} variant="info">{s}</Badge>)}
        </div>

        <div className="text-sm text-gray-600 mb-3">
          <p>📋 {nurse.experience} years experience · ₹{nurse.baseRate} / {nurse.rateType}</p>
          <p>📄 {docs.length} document{docs.length !== 1 ? 's' : ''} uploaded</p>
        </div>

        {/* AI Summary for documents */}
        {docs.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{doc.fileName}</span>
                {doc.aiAnalysis ? (
                  <Badge variant={doc.aiAnalysis.result === 'genuine' ? 'success' : 'danger'}>
                    {doc.aiAnalysis.result === 'genuine' ? '✓' : '⚠'} {(doc.aiAnalysis.confidenceScore * 100).toFixed(0)}%
                  </Badge>
                ) : (
                  <Badge variant="neutral">No analysis</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setSelectedNurse(nurse.userId)}>
            <Eye className="w-3.5 h-3.5" /> Review Details
          </Button>
          {nurse.verificationStatus === 'pending' && (
            <>
              <Button size="sm" variant="success" onClick={() => handleVerification(nurse.userId, 'approved')}>
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleVerification(nurse.userId, 'rejected')}>
                <XCircle className="w-3.5 h-3.5" /> Reject
              </Button>
            </>
          )}
          {nurse.verificationStatus === 'rejected' && (
            <Button size="sm" variant="success" onClick={() => handleVerification(nurse.userId, 'approved')}>
              Re-Approve
            </Button>
          )}
          {nurse.verificationStatus === 'approved' && (
            <Button size="sm" variant="danger" onClick={() => handleVerification(nurse.userId, 'rejected')}>
              Revoke
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {nurses.length === 0 && (
        <EmptyState icon={<Stethoscope className="w-8 h-8 text-gray-400" />} title="No nurses registered" description="No nurses have signed up on the platform yet." />
      )}

      {pendingNurses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" /> Pending Verification ({pendingNurses.length})
          </h3>
          {pendingNurses.map(renderNurseCard)}
        </div>
      )}

      {approvedNurses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" /> Approved ({approvedNurses.length})
          </h3>
          {approvedNurses.map(renderNurseCard)}
        </div>
      )}

      {rejectedNurses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" /> Rejected ({rejectedNurses.length})
          </h3>
          {rejectedNurses.map(renderNurseCard)}
        </div>
      )}

      {/* Detailed Review Modal */}
      {selectedNurse && (
        <Modal isOpen onClose={() => setSelectedNurse(null)} title="Nurse Verification Review" size="xl">
          <NurseReviewDetail nurseId={selectedNurse} onAction={(status) => handleVerification(selectedNurse, status)} />
        </Modal>
      )}
    </div>
  );
}

function NurseReviewDetail({ nurseId, onAction }: { nurseId: string; onAction: (status: 'approved' | 'rejected') => void }) {
  const [nurse, setNurse] = useState<NurseProfile | undefined>();
  const [user, setUser] = useState<User | undefined>();
  const [docs, setDocs] = useState<NurseDocument[]>([]);

  useEffect(() => {
    NurseProfileDB.getByUserId(nurseId).then(setNurse);
    UserDB.getById(nurseId).then(setUser);
    DocumentDB.getByNurseId(nurseId).then(setDocs);
  }, [nurseId]);

  if (!nurse || !user) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Nurse Info */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
          {user.name[0]}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email} · 📞 {user.phone}</p>
          <p className="text-sm text-gray-500">📍 {nurse.location} · {nurse.experience} years exp.</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
        <p className="text-sm text-gray-600">{nurse.bio}</p>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Specializations</h4>
        <div className="flex flex-wrap gap-2">
          {nurse.specializations.map(s => <Badge key={s} variant="info">{s}</Badge>)}
        </div>
      </div>

      {/* Documents with AI Analysis */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" /> Uploaded Documents & AI Analysis
        </h4>

        {docs.length === 0 ? (
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-amber-700">No documents uploaded yet</p>
          </div>
        ) : (
          docs.map(doc => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Document Preview */}
                {doc.fileData && !doc.fileData.includes('application/pdf') && (
                  <img src={doc.fileData} alt={doc.fileName} className="w-24 h-24 object-cover rounded-lg border" />
                )}

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-500 capitalize">{doc.documentType.replace('_', ' ')} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    {doc.aiAnalysis && (
                      <Badge variant={doc.aiAnalysis.result === 'genuine' ? 'success' : 'danger'}>
                        {doc.aiAnalysis.result === 'genuine' ? '✓ Genuine' : '⚠ Suspected Forgery'}
                        {' '}{(doc.aiAnalysis.confidenceScore * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>

                  {/* AI Metrics */}
                  {doc.aiAnalysis && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <MetricBar label="Edge" value={doc.aiAnalysis.edgeConsistency} />
                        <MetricBar label="Texture" value={doc.aiAnalysis.textureAnalysis} />
                        <MetricBar label="Compress" value={doc.aiAnalysis.compressionArtifacts} />
                        <MetricBar label="OCR" value={doc.aiAnalysis.ocrConsistency} />
                        <MetricBar label="Font" value={doc.aiAnalysis.fontConsistency} />
                        <MetricBar label="Align" value={doc.aiAnalysis.alignmentScore} />
                      </div>

                      {doc.aiAnalysis.anomalies.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-2">
                          <p className="text-xs font-medium text-red-700 mb-1">Anomalies:</p>
                          {doc.aiAnalysis.anomalies.map((a, i) => (
                            <p key={i} className="text-xs text-red-600">• {a}</p>
                          ))}
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">OCR Output:</p>
                        <p className="text-xs text-gray-500 font-mono">{doc.aiAnalysis.extractedText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Admin Decision */}
      <Card className="p-5 bg-indigo-50 border-indigo-200">
        <h4 className="font-semibold text-gray-900 mb-3">Admin Decision</h4>
        <p className="text-sm text-gray-600 mb-4">
          AI analysis assists your decision. You have the final say on whether to approve or reject this nurse's registration.
        </p>
        <div className="flex gap-3">
          <Button variant="success" onClick={() => onAction('approved')}>
            <CheckCircle className="w-4 h-4" /> Approve Nurse
          </Button>
          <Button variant="danger" onClick={() => onAction('rejected')}>
            <XCircle className="w-4 h-4" /> Reject Nurse
          </Button>
        </div>
      </Card>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-gray-600">{label}</span>
        <span className={cn('font-medium', value >= 0.7 ? 'text-emerald-600' : value >= 0.5 ? 'text-amber-600' : 'text-red-600')}>
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <ProgressBar value={value * 100} color={value >= 0.7 ? 'green' : value >= 0.5 ? 'amber' : 'red'} />
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*            USER MANAGEMENT                  */
/* ─────────────────────────────────────────── */

function UserManagement() {
  const { user: admin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const reload = () => UserDB.getAll().then(all => setUsers(all.filter(u => u.role !== 'admin' && u.role !== 'shelter')));

  useEffect(() => { reload(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await UserDB.delete(id);
      await NurseProfileDB.delete(id);
      if (admin) {
        await AdminLogDB.create({
          adminId: admin.id, adminName: admin.name,
          action: 'Delete User', target: name, details: `Deleted user account`,
        });
      }
      reload();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h3>

      {users.length === 0 ? (
        <EmptyState icon={<Users className="w-8 h-8 text-gray-400" />} title="No users" description="No user accounts found (admin and shelter accounts are shown in their respective tabs)." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {u.profile_photo ? (
                        <img src={u.profile_photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">{u.name[0]}</div>
                      )}
                      {u.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'nurse' ? 'success' : 'info'}>{u.role}</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{u.phone}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u.id, u.name)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*          SHELTER MANAGEMENT                 */
/* ─────────────────────────────────────────── */

function ShelterManagement() {
  const [shelters, setShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    ShelterDB.getAll().then(setShelters);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">All Shelters ({shelters.length})</h3>

      {shelters.length === 0 ? (
        <EmptyState icon={<Building className="w-8 h-8 text-gray-400" />} title="No shelters" description="No shelters have been registered yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Capacity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">GPS</th>
              </tr>
            </thead>
            <tbody>
              {shelters.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                        {s.name?.[0] || 'S'}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate" title={s.address}>{s.address}</td>
                  <td className="py-3 px-4 text-gray-600">{s.email || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{s.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <Badge variant={s.capacity > 0 ? 'info' : 'neutral'}>{s.capacity > 0 ? s.capacity : '—'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {s.latitude && s.longitude
                      ? `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*          BOOKING MANAGEMENT                 */
/* ─────────────────────────────────────────── */

function BookingManagement() {
  const { user: admin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    BookingDB.getAll().then(setBookings);
  }, []);

  const refresh = () => BookingDB.getAll().then(setBookings);

  const updateBookingStatus = async (b: Booking, status: string) => {
    await BookingDB.update(b.id, { status: status as Booking['status'] });
    if (admin) {
      await AdminLogDB.create({
        adminId: admin.id, adminName: admin.name,
        action: status === 'cancelled' ? 'Cancel Booking' : 'Update Booking',
        target: `Booking ${b.userName} → ${b.nurseName}`,
        details: `Changed status to ${status}`,
      });
    }
    refresh();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
      pending: 'warning', accepted: 'info', rejected: 'danger', completed: 'success', cancelled: 'neutral'
    };
    return <Badge variant={map[status] || 'neutral'}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">All Bookings ({bookings.length})</h3>

      {bookings.length === 0 ? (
        <EmptyState icon={<Calendar className="w-8 h-8 text-gray-400" />} title="No bookings" description="No bookings have been made yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Nurse</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Service</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Dates</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{b.userName}</td>
                  <td className="py-3 px-4 text-gray-600">{b.nurseName}</td>
                  <td className="py-3 px-4 text-gray-600">{b.serviceType}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{b.startDate} → {b.endDate}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">₹{b.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">{statusBadge(b.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {b.status === 'pending' && (
                        <Button size="sm" variant="danger" onClick={() => updateBookingStatus(b, 'cancelled')}>
                          Cancel
                        </Button>
                      )}
                      {(b.status === 'accepted') && (
                        <Button size="sm" variant="success" onClick={() => updateBookingStatus(b, 'completed')}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*        SHELTER REPORT MANAGEMENT            */
/* ─────────────────────────────────────────── */

function ReportManagement() {
  const [reports, setReports] = useState<ShelterReport[]>([]);
  const [allShelters, setAllShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    ShelterReportDB.getAll().then(setReports);
    ShelterDB.getAll().then(setAllShelters);
  }, []);

  const updateStatus = async (report: ShelterReport, status: 'notified' | 'resolved') => {
    await ShelterReportDB.update(report.id, { status });

    // Auto-dispatch notifications to nearest shelters when marked as 'notified'
    if (status === 'notified') {
      const nearShelters = report.nearbyShelters?.length > 0
        ? report.nearbyShelters
        : allShelters.map(s => ({
          ...s,
          distanceKm: haversineDistance(report.latitude, report.longitude, s.latitude, s.longitude)
        })).sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999)).slice(0, 3);

      for (const ns of nearShelters) {
        const fullShelter = allShelters.find(s => s.id === ns.id);
        if (fullShelter?.shelterUserId) {
          NotificationDB.create({
            userId: fullShelter.shelterUserId,
            title: 'New Help Report Alert',
            message: `A new humanitarian report requires your attention near ${report.locationDescription || 'your location'}.`,
            type: 'warning'
          }).catch(console.error);
        }
      }
    }

    const updated = await ShelterReportDB.getAll();
    setReports(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Humanitarian Help Reports ({reports.length})</h3>

      {reports.length === 0 ? (
        <EmptyState icon={<MapPin className="w-8 h-8 text-gray-400" />} title="No reports" description="No humanitarian reports have been submitted yet." />
      ) : (
        reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(report => (
          <Card key={report.id} className="p-5">
            <div className="flex items-start gap-4">
              {report.photo && (
                <img src={report.photo} alt="Report" className="w-20 h-20 object-cover rounded-lg border" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{report.locationDescription}</p>
                    <p className="text-xs text-gray-500">Reported by {report.reporterName} · {new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={report.status === 'resolved' ? 'success' : report.status === 'notified' ? 'info' : 'warning'}>
                    {report.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                <p className="text-xs text-gray-400">📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>

                {(() => {
                  const near = report.nearbyShelters?.length > 0
                    ? report.nearbyShelters
                    : allShelters.map(s => ({
                      ...s,
                      distanceKm: haversineDistance(report.latitude, report.longitude, s.latitude, s.longitude)
                    })).sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999)).slice(0, 3);

                  if (near.length === 0) return null;

                  return (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-500">Nearest Shelters based on GPS:</p>
                      {near.map(s => (
                        <p key={s.id} className="text-xs text-gray-600">
                          🏠 {s.name} — {s.distanceKm?.toFixed(1)} km · 📞 {s.phone || 'N/A'}
                        </p>
                      ))}
                    </div>
                  );
                })()}

                <div className="flex gap-2 mt-3">
                  {report.status === 'reported' && (
                    <Button size="sm" variant="primary" onClick={() => updateStatus(report, 'notified')}>
                      Mark Shelters Notified
                    </Button>
                  )}
                  {report.status === 'notified' && (
                    <Button size="sm" variant="success" onClick={() => updateStatus(report, 'resolved')}>
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*           ADMIN MY ACCOUNT                  */
/* ─────────────────────────────────────────── */

function AdminMyAccount() {
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
    await updateUser({ name: form.name, phone: form.phone, location: form.location });
    setSaving(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {user.profile_photo ? (
              <img src={user.profile_photo} alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-sm">
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
            <Badge variant="info" className="mt-1">Admin</Badge>
            <p className="text-xs text-gray-400 mt-1">Hover photo to change</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Pencil className="w-5 h-5 text-indigo-600" /> Edit Profile
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
          <Input label="Full Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Phone" type="tel" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Location" value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City name" />

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
/*        HELPERS                              */
/* ─────────────────────────────────────────── */

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
