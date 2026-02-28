import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { BookingDB } from '@/store/database';
import { Card, Spinner, EmptyState } from '@/components/ui';
import { Star, MessageSquare } from 'lucide-react';
import type { Booking } from '@/types';

export function NurseRatings() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            BookingDB.getByNurseId(user.id).then(data => {
                // Filter bookings that have feedback
                const withFeedback = data.filter(b => b.feedback && b.feedback.rating > 0);
                withFeedback.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
                setReviews(withFeedback);
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) {
        return <Card className="p-8 text-center"><Spinner size="sm" /><p className="text-gray-500 mt-2">Loading reviews...</p></Card>;
    }

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.feedback!.rating, 0) / totalReviews).toFixed(1)
        : 0;

    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.feedback!.rating === star).length;
        return { star, count, percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Ratings & Reviews</h2>
                <p className="text-gray-500 text-sm mt-1">See what patients are saying about your care.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start">
                {/* Rating Summary */}
                <Card className="p-6 text-center md:col-span-1 border-blue-100 bg-blue-50/50">
                    <h3 className="text-6xl font-black text-gray-900 mb-2">{averageRating}</h3>
                    <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star
                                key={i}
                                className={`w-6 h-6 ${i <= Number(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`}
                            />
                        ))}
                    </div>
                    <p className="text-gray-500 font-medium">Based on {totalReviews} reviews</p>

                    <div className="mt-6 space-y-2">
                        {distribution.map(({ star, count, percentage }) => (
                            <div key={star} className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 w-8 font-medium text-gray-700">
                                    {star} <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="w-6 text-right text-gray-500">{count}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Reviews List */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map(booking => (
                                <Card key={booking.id} className="p-5 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i <= booking.feedback!.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">{booking.endDate}</span>
                                    </div>
                                    {booking.feedback?.comment && (
                                        <p className="text-gray-800 text-sm italic border-l-2 border-gray-200 pl-3 mb-4">
                                            "{booking.feedback.comment}"
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                            {booking.userName.charAt(0).toUpperCase()}
                                        </div>
                                        {booking.userName} • {booking.serviceType}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No reviews yet"
                            description="When you complete bookings, patient feedback will appear here."
                            icon={<MessageSquare className="w-8 h-8 text-gray-300" />}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
