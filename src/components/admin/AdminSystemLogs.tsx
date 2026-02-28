/**
 * ============================================
 * ADMIN SYSTEM LOGS — Audit Trail
 * ============================================
 * Shows all admin actions with timestamps.
 */

import { useState, useEffect } from 'react';
import { AdminLogDB } from '@/store/database';
import { Card, EmptyState } from '@/components/ui';
import { ScrollText, Shield, Clock } from 'lucide-react';
import type { AdminLog } from '@/types';
import { cn } from '@/utils/cn';

const actionColors: Record<string, string> = {
    'Approve Nurse': 'bg-emerald-100 text-emerald-700',
    'Reject Nurse': 'bg-red-100 text-red-700',
    'Cancel Booking': 'bg-amber-100 text-amber-700',
    'Suspend User': 'bg-red-100 text-red-700',
    'Activate User': 'bg-emerald-100 text-emerald-700',
    'AI Override': 'bg-purple-100 text-purple-700',
    'Add Shelter': 'bg-blue-100 text-blue-700',
    'Update Report': 'bg-amber-100 text-amber-700',
    'Deactivate Shelter': 'bg-red-100 text-red-700',
    'Activate Shelter': 'bg-emerald-100 text-emerald-700',
};

export function AdminSystemLogs() {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        AdminLogDB.getAll().then(setLogs).catch(() => setLogs([]));
    }, []);

    const filtered = filter
        ? logs.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()) ||
            l.target.toLowerCase().includes(filter.toLowerCase()) ||
            l.adminName.toLowerCase().includes(filter.toLowerCase()))
        : logs;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-indigo-600" /> System Audit Logs
                </h3>
                <span className="text-sm text-gray-500">{logs.length} entries</span>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search logs by action, target, or admin..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {filtered.length === 0 ? (
                <EmptyState
                    icon={<ScrollText className="w-8 h-8 text-gray-400" />}
                    title="No audit logs"
                    description={filter ? 'No logs match your search.' : 'Admin actions will appear here as they happen.'}
                />
            ) : (
                <div className="space-y-2">
                    {filtered.map(log => (
                        <Card key={log.id} className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 rounded-xl shrink-0 mt-0.5">
                                    <Shield className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={cn(
                                            'text-xs font-medium px-2 py-0.5 rounded-full',
                                            actionColors[log.action] || 'bg-gray-100 text-gray-700'
                                        )}>
                                            {log.action}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 truncate">{log.target}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> {log.adminName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
