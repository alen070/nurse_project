/**
 * ============================================
 * ADMIN NOTIFICATIONS — Alert Feed
 * ============================================
 * Real-time admin alert feed with priority colors
 * for pending verifications, forgery alerts, etc.
 */

import { useState, useEffect } from 'react';
import { NurseProfileDB, DocumentDB, BookingDB, ShelterReportDB, UserDB } from '@/store/database';
import { Card, Badge, EmptyState } from '@/components/ui';
import { Bell, AlertTriangle, UserPlus, FileWarning, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AdminAlert {
    id: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    icon: React.ReactNode;
    title: string;
    description: string;
    time: string;
}

export function AdminNotifications() {
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const [nurses, docs, bookings, reports] = await Promise.all([
                    NurseProfileDB.getAll(),
                    DocumentDB.getAll(),
                    BookingDB.getAll(),
                    ShelterReportDB.getAllOverview(),
                ]);

                // Resolve nurse names
                const nurseNames: Record<string, string> = {};
                for (const n of nurses) {
                    const u = await UserDB.getById(n.userId);
                    nurseNames[n.userId] = u?.name || 'Unknown';
                }

                const generated: AdminAlert[] = [];

                // 🔴 Forgery detected
                docs.filter(d => d.aiAnalysis?.result === 'suspected_forgery').forEach(d => {
                    generated.push({
                        id: `forgery-${d.id}`,
                        type: 'danger',
                        icon: <FileWarning className="w-5 h-5" />,
                        title: '🔴 Forgery Detected',
                        description: `Document "${d.fileName}" from ${nurseNames[d.nurseId] || 'Unknown'} flagged as suspected forgery (${Math.round((d.aiAnalysis?.confidenceScore || 0) * 100)}% confidence)`,
                        time: d.uploadedAt,
                    });
                });

                // 🟡 Pending nurse verification
                nurses.filter(n => n.verificationStatus === 'pending').forEach(n => {
                    generated.push({
                        id: `pending-${n.userId}`,
                        type: 'warning',
                        icon: <UserPlus className="w-5 h-5" />,
                        title: '🟡 New Nurse Application',
                        description: `${nurseNames[n.userId] || 'Unknown'} is awaiting verification. Review their documents and AI analysis.`,
                        time: new Date().toISOString(),
                    });
                });

                // 🔵 Pending bookings
                bookings.filter(b => b.status === 'pending').forEach(b => {
                    generated.push({
                        id: `booking-${b.id}`,
                        type: 'info',
                        icon: <Calendar className="w-5 h-5" />,
                        title: '🔵 Pending Booking',
                        description: `${b.userName} → ${b.nurseName} for ${b.serviceType}`,
                        time: b.createdAt,
                    });
                });

                // 🟠 Unresolved reports
                reports.filter(r => r.status === 'reported').forEach(r => {
                    generated.push({
                        id: `report-${r.id}`,
                        type: 'warning',
                        icon: <MapPin className="w-5 h-5" />,
                        title: '🟠 Help Report Awaiting',
                        description: `Report at ${r.locationDescription || 'Unknown location'} — no shelter assigned yet`,
                        time: r.createdAt,
                    });
                });

                // 🟢 Recently completed bookings
                bookings.filter(b => b.status === 'completed').slice(-3).forEach(b => {
                    generated.push({
                        id: `completed-${b.id}`,
                        type: 'success',
                        icon: <CheckCircle className="w-5 h-5" />,
                        title: '🟢 Booking Completed',
                        description: `${b.userName} completed ${b.serviceType} with ${b.nurseName}`,
                        time: b.createdAt,
                    });
                });

                // Sort by time (newest first)
                generated.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
                setAlerts(generated);
            } catch (e) {
                console.error('Failed to load alerts:', e);
            } finally {
                setLoading(false);
            }
        };
        loadAlerts();
    }, []);

    const typeConfig = {
        danger: { bg: 'bg-red-50 border-red-200', iconBg: 'bg-red-100 text-red-600' },
        warning: { bg: 'bg-amber-50 border-amber-200', iconBg: 'bg-amber-100 text-amber-600' },
        info: { bg: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-100 text-blue-600' },
        success: { bg: 'bg-emerald-50 border-emerald-200', iconBg: 'bg-emerald-100 text-emerald-600' },
    };

    const dangerCount = alerts.filter(a => a.type === 'danger').length;
    const warningCount = alerts.filter(a => a.type === 'warning').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" /> Admin Alerts
                </h3>
                <div className="flex gap-2">
                    {dangerCount > 0 && <Badge variant="danger">🔴 {dangerCount} Critical</Badge>}
                    {warningCount > 0 && <Badge variant="warning">🟡 {warningCount} Pending</Badge>}
                </div>
            </div>

            {/* Priority Banner */}
            {dangerCount > 0 && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <div>
                            <p className="font-semibold text-red-800">{dangerCount} Critical Alert{dangerCount > 1 ? 's' : ''}</p>
                            <p className="text-sm text-red-600">Suspected document forgery detected. Immediate review recommended.</p>
                        </div>
                    </div>
                </Card>
            )}

            {alerts.length === 0 ? (
                <EmptyState icon={<Bell className="w-8 h-8 text-gray-400" />} title="All clear!" description="No pending alerts at this time." />
            ) : (
                <div className="space-y-2">
                    {alerts.map(alert => {
                        const config = typeConfig[alert.type];
                        return (
                            <Card key={alert.id} className={cn('p-4 border', config.bg)}>
                                <div className="flex items-start gap-3">
                                    <div className={cn('p-2 rounded-xl shrink-0', config.iconBg)}>
                                        {alert.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{alert.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(alert.time).toLocaleString()}</p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
