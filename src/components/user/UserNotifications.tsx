import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { NotificationDB } from '@/store/database';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, Trash2, Check } from 'lucide-react';
import type { Notification } from '@/types';
import { cn } from '@/utils/cn';

export function UserNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifs = async () => {
        if (!user) return;
        try {
            const data = await NotificationDB.getByUserId(user.id);
            setNotifications(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifs();
    }, [user]);

    const markAsRead = async (id: string) => {
        await NotificationDB.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = async () => {
        if (!user) return;
        await NotificationDB.markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotif = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await NotificationDB.delete(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const icons = {
        info: <Info className="w-5 h-5 text-blue-500" />,
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />
    };

    const bgs = {
        info: 'bg-blue-50 border-blue-100',
        success: 'bg-emerald-50 border-emerald-100',
        warning: 'bg-amber-50 border-amber-100',
        error: 'bg-red-50 border-red-100'
    };

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-indigo-600" />
                    Notifications Center
                    {unreadCount > 0 && (
                        <Badge variant="danger" className="ml-2">{unreadCount} New</Badge>
                    )}
                </h2>

                {unreadCount > 0 && (
                    <Button variant="outline" onClick={() => markAllAsRead()} className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Mark All Read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <EmptyState
                    icon={<Bell className="w-8 h-8 text-gray-400" />}
                    title="All Caught Up!"
                    description="You don't have any notifications right now."
                />
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <Card
                            key={notif.id}
                            onClick={() => !notif.read && markAsRead(notif.id)}
                            className={cn(
                                'p-4 transition-all cursor-pointer border hover:shadow-md',
                                notif.read ? 'bg-white opacity-70' : bgs[notif.type]
                            )}
                        >
                            <div className="flex gap-4">
                                <div className="shrink-0 mt-1">{icons[notif.type]}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className={cn('text-sm font-semibold text-gray-900', !notif.read && 'text-gray-900')}>
                                                {notif.title || 'System Alert'}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteNotif(notif.id, e)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs text-gray-500">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </span>
                                        {!notif.read && (
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
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
