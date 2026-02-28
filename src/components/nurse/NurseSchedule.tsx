import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { BookingDB } from '@/store/database';
import { Card, Badge, Spinner } from '@/components/ui';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Booking } from '@/types';

export function NurseSchedule() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            BookingDB.getByNurseId(user.id).then(data => {
                // Only show accepted or ongoing bookings
                const active = data.filter(b => b.status === 'accepted');
                setBookings(active);
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) {
        return <Card className="p-8 text-center"><Spinner size="sm" /><p className="text-gray-500 mt-2">Loading schedule...</p></Card>;
    }

    // Sort bookings by start date
    const sortedBookings = [...bookings].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysVisits = sortedBookings.filter(b => b.startDate <= todayStr && b.endDate >= todayStr);
    const upcomingVisits = sortedBookings.filter(b => b.startDate > todayStr);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">My Schedule</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your active and upcoming care visits.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Today's Visits */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Today's Visits</h3>
                        <Badge variant="success">{todaysVisits.length}</Badge>
                    </div>

                    {todaysVisits.length > 0 ? (
                        <div className="space-y-3">
                            {todaysVisits.map(booking => (
                                <Card key={booking.id} className="p-4 border-l-4 border-emerald-500">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{booking.userName}</h4>
                                            <p className="text-sm text-gray-500">{booking.serviceType}</p>
                                        </div>
                                        <Badge variant="success">Ongoing</Badge>
                                    </div>
                                    <div className="space-y-2 mt-3 text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-600" />
                                            {booking.startDate} to {booking.endDate}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            Contact visible in Bookings tab
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-6 text-center text-gray-500 bg-gray-50 border-dashed">
                            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p>No visits scheduled for today.</p>
                        </Card>
                    )}
                </div>

                {/* Upcoming Visits */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Upcoming Visits</h3>
                        <Badge variant="info">{upcomingVisits.length}</Badge>
                    </div>

                    {upcomingVisits.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingVisits.map(booking => (
                                <Card key={booking.id} className="p-4 border-l-4 border-blue-500">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{booking.userName}</h4>
                                            <p className="text-sm text-gray-500">{booking.serviceType}</p>
                                        </div>
                                        <Badge variant="info">Upcoming</Badge>
                                    </div>
                                    <div className="space-y-2 mt-3 text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            Starts: {booking.startDate}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            Ends: {booking.endDate}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-6 text-center text-gray-500 bg-gray-50 border-dashed">
                            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p>No future visits scheduled yet.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
