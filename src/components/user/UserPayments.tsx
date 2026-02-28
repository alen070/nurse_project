import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { BookingDB, NotificationDB } from '@/store/database';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { CreditCard, CheckCircle, Clock, FileText, Download, Building } from 'lucide-react';
import type { Booking } from '@/types';

export function UserPayments() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingFor, setPayingFor] = useState<string | null>(null);

    const loadData = async () => {
        if (!user) return;
        try {
            // Only show accepted, ongoing, or completed bookings (no pending/cancelled)
            const data = await BookingDB.getByUserId(user.id);
            const invoiceable = data.filter(b => ['accepted', 'ongoing', 'completed'].includes(b.status));
            // Sort: Pending payments first, then by date desc
            invoiceable.sort((a, b) => {
                if (a.paymentStatus === 'pending' && b.paymentStatus !== 'pending') return -1;
                if (a.paymentStatus !== 'pending' && b.paymentStatus === 'pending') return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setBookings(invoiceable);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handlePayOnline = async (booking: Booking) => {
        setPayingFor(booking.id);
        try {
            // Simulate payment gateway delay
            await new Promise(r => setTimeout(r, 1500));

            await BookingDB.update(booking.id, { paymentStatus: 'completed' });

            // Notify Nurse & User
            await NotificationDB.create({
                userId: booking.nurseId,
                title: 'Payment Received',
                message: `${booking.userName} has paid ₹${booking.totalAmount} online for their booking.`,
                type: 'success'
            });
            await NotificationDB.create({
                userId: booking.userId,
                title: 'Payment Successful',
                message: `Your payment of ₹${booking.totalAmount} was successful.`,
                type: 'success'
            });

            await loadData();
        } catch (e) {
            console.error(e);
        } finally {
            setPayingFor(null);
        }
    };

    const downloadReceipt = (booking: Booking) => {
        const text = `
CARECONNECT INVOICE
===================
Booking ID: ${booking.id}
Date: ${new Date().toLocaleDateString()}

Patient: ${booking.userName}
Care Provider: ${booking.nurseName}
Service: ${booking.serviceType.toUpperCase()}
Amount: ₹${booking.totalAmount}
Payment Method: ${booking.paymentMethod.toUpperCase()}
Status: ${booking.paymentStatus?.toUpperCase() || 'PENDING'}

Thank you for using CareConnect!
    `.trim();

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${booking.id.slice(0, 8)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

    if (bookings.length === 0) {
        return (
            <EmptyState
                icon={<CreditCard className="w-8 h-8 text-gray-400" />}
                title="No Payment History"
                description="You have no active or completed bookings that require payment."
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    Payments & Invoices
                </h2>
            </div>

            <div className="grid gap-4">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="p-5 overflow-hidden relative">
                        {/* Status Ribbon */}
                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-lg
              ${booking.paymentStatus === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}
            `}>
                            {booking.paymentStatus === 'completed' ? 'PAID' : 'DUE'}
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mt-2">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{booking.serviceType} Care</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-sm text-gray-600">{new Date(booking.startDate).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Building className="w-4 h-4" /> Provider: {booking.nurseName}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="neutral">{booking.paymentMethod.toUpperCase()}</Badge>
                                    <span className="text-sm font-medium text-gray-900">₹{booking.totalAmount}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {booking.paymentStatus !== 'completed' && booking.paymentMethod === 'online' && (
                                    <Button
                                        onClick={() => handlePayOnline(booking)}
                                        loading={payingFor === booking.id}
                                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Pay ₹{booking.totalAmount} Online
                                    </Button>
                                )}

                                {booking.paymentStatus !== 'completed' && booking.paymentMethod === 'cod' && (
                                    <Badge variant="warning" className="px-3 py-2 flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> Pay via Cash on Delivery
                                    </Badge>
                                )}

                                {booking.paymentStatus === 'completed' && (
                                    <>
                                        <Badge variant="success" className="px-3 py-2 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> Payment Completed
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            onClick={() => downloadReceipt(booking)}
                                            className="flex items-center gap-2 shrink-0"
                                        >
                                            <Download className="w-4 h-4" /> Receipt
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
