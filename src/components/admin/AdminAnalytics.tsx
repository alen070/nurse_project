/**
 * ============================================
 * ADMIN ANALYTICS — Charts & Reports
 * ============================================
 * Pure CSS visual charts for bookings, nurse approvals,
 * AI accuracy, and shelter response metrics.
 */

import { useState, useEffect } from 'react';
import { BookingDB, NurseProfileDB, DocumentDB, ShelterReportDB, UserDB, ShelterDB } from '@/store/database';
import { Card, Badge, StatsCard } from '@/components/ui';
import { TrendingUp, Users, Stethoscope, Activity, BarChart3, PieChart } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MonthlyData { month: string; count: number; }

export function AdminAnalytics() {
    const [bookingsByMonth, setBookingsByMonth] = useState<MonthlyData[]>([]);
    const [stats, setStats] = useState({
        totalBookings: 0, completedBookings: 0, cancelledBookings: 0,
        totalNurses: 0, approvedNurses: 0, rejectedNurses: 0, pendingNurses: 0,
        totalDocs: 0, genuineDocs: 0, forgeryDocs: 0,
        totalReports: 0, resolvedReports: 0,
        totalUsers: 0, totalShelters: 0,
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [bookings, nurses, docs, reports, users, shelters] = await Promise.all([
                    BookingDB.getAll(),
                    NurseProfileDB.getAll(),
                    DocumentDB.getAll(),
                    ShelterReportDB.getAllOverview(),
                    UserDB.getAll(),
                    ShelterDB.getAll(),
                ]);

                // Monthly bookings (last 6 months)
                const months: MonthlyData[] = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
                    const y = d.getFullYear();
                    const m = d.getMonth();
                    const count = bookings.filter(b => {
                        const bd = new Date(b.createdAt);
                        return bd.getFullYear() === y && bd.getMonth() === m;
                    }).length;
                    months.push({ month: label, count });
                }
                setBookingsByMonth(months);

                setStats({
                    totalBookings: bookings.length,
                    completedBookings: bookings.filter(b => b.status === 'completed').length,
                    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
                    totalNurses: nurses.length,
                    approvedNurses: nurses.filter(n => n.verificationStatus === 'approved').length,
                    rejectedNurses: nurses.filter(n => n.verificationStatus === 'rejected').length,
                    pendingNurses: nurses.filter(n => n.verificationStatus === 'pending').length,
                    totalDocs: docs.length,
                    genuineDocs: docs.filter(d => d.aiAnalysis?.result === 'genuine').length,
                    forgeryDocs: docs.filter(d => d.aiAnalysis?.result === 'suspected_forgery').length,
                    totalReports: reports.length,
                    resolvedReports: reports.filter(r => r.status === 'resolved').length,
                    totalUsers: users.filter(u => u.role === 'user').length,
                    totalShelters: shelters.length,
                });
            } catch (e) {
                console.error('Failed to load analytics:', e);
            }
        };
        load();
    }, []);

    const maxBooking = Math.max(...bookingsByMonth.map(m => m.count), 1);

    const approvalRate = stats.totalNurses > 0
        ? Math.round((stats.approvedNurses / stats.totalNurses) * 100) : 0;
    const aiAccuracy = stats.totalDocs > 0
        ? Math.round(((stats.genuineDocs + stats.forgeryDocs) / stats.totalDocs) * 100) : 0;
    const resolutionRate = stats.totalReports > 0
        ? Math.round((stats.resolvedReports / stats.totalReports) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={<Users className="w-5 h-5 text-blue-600" />} label="Total Users" value={stats.totalUsers} color="bg-blue-50" />
                <StatsCard icon={<Stethoscope className="w-5 h-5 text-emerald-600" />} label="Active Nurses" value={stats.approvedNurses} color="bg-emerald-50" />
                <StatsCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} label="Total Bookings" value={stats.totalBookings} color="bg-purple-50" />
                <StatsCard icon={<Activity className="w-5 h-5 text-amber-600" />} label="Shelters" value={stats.totalShelters} color="bg-amber-50" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Bookings Bar Chart */}
                <Card className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" /> Bookings (Last 6 Months)
                    </h3>
                    <div className="flex items-end gap-2 h-48">
                        {bookingsByMonth.map(m => (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-gray-700">{m.count}</span>
                                <div className="w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-purple-400 transition-all"
                                    style={{ height: `${(m.count / maxBooking) * 100}%`, minHeight: m.count > 0 ? '8px' : '2px' }} />
                                <span className="text-xs text-gray-500">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Nurse Approval Donut */}
                <Card className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-emerald-600" /> Nurse Verification
                    </h3>
                    <div className="flex items-center gap-8">
                        {/* CSS Donut */}
                        <div className="relative w-32 h-32 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                                    strokeDasharray={`${approvalRate} ${100 - approvalRate}`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">{approvalRate}%</span>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-gray-600">Approved: <span className="font-bold">{stats.approvedNurses}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-gray-600">Rejected: <span className="font-bold">{stats.rejectedNurses}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-gray-600">Pending: <span className="font-bold">{stats.pendingNurses}</span></span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* AI Detection Accuracy */}
                <Card className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" /> AI Detection Accuracy
                    </h3>
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-blue-600">{aiAccuracy}%</p>
                            <p className="text-sm text-gray-500">Documents Analyzed</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-xl font-bold text-blue-600">{stats.totalDocs}</p>
                                <p className="text-xs text-gray-500">Total</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3">
                                <p className="text-xl font-bold text-emerald-600">{stats.genuineDocs}</p>
                                <p className="text-xs text-gray-500">Genuine</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-3">
                                <p className="text-xl font-bold text-red-600">{stats.forgeryDocs}</p>
                                <p className="text-xs text-gray-500">Forgery</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Booking Breakdown */}
                <Card className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-600" /> Booking Status Breakdown
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Completed', value: stats.completedBookings, total: stats.totalBookings, color: 'bg-emerald-500' },
                            { label: 'Cancelled', value: stats.cancelledBookings, total: stats.totalBookings, color: 'bg-red-500' },
                            { label: 'Active', value: stats.totalBookings - stats.completedBookings - stats.cancelledBookings, total: stats.totalBookings, color: 'bg-blue-500' },
                        ].map(item => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.label}</span>
                                    <span className="font-medium">{item.value} / {item.total}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={cn('h-full rounded-full transition-all', item.color)}
                                        style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Report Resolution */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Help Report Resolution Rate</span>
                            <Badge variant={resolutionRate > 50 ? 'success' : 'warning'}>{resolutionRate}%</Badge>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                            <div className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${resolutionRate}%` }} />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
