import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { Card, Input, Button } from '@/components/ui';
import { User, LogOut, Shield, Key } from 'lucide-react';

export function NurseAccount() {
    const { user, updateUser, logout, resetPassword } = useAuth();

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (user) {
                await updateUser({ name: form.name, phone: form.phone });
                setMessage('Account details updated successfully.');
            }
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleResetPassword = async () => {
        if (!user?.email) return;
        setResetting(true);
        try {
            const result = await resetPassword(user.email);
            if (result.success) {
                setMessage('Password reset email sent (Check your inbox or spam folder).');
            } else {
                setMessage(result.error || 'Failed to send reset email.');
            }
        } finally {
            setResetting(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your personal information and security.</p>
            </div>

            {message && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-100">
                    {message}
                </div>
            )}

            {/* Profile Details */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                        <p className="text-sm text-gray-500">Update your basic account information.</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                    />
                    <Input
                        label="Phone Number"
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        required
                    />
                    <Input
                        label="Email Address"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50 cursor-not-allowed text-gray-500"
                    />
                    <div className="pt-2">
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Security */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                        <p className="text-sm text-gray-500">Manage your password and authentication.</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Password Reset</p>
                        <p className="text-sm text-gray-500">We will email you a secure link to reset your password.</p>
                    </div>
                    <Button variant="outline" onClick={handleResetPassword} disabled={resetting}>
                        {resetting ? 'Sending...' : <span className="flex items-center gap-2"><Key className="w-4 h-4" /> Reset Password</span>}
                    </Button>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-red-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-red-700">Log Out</h3>
                        <p className="text-sm text-red-600/80">Securely sign out of your account on this device.</p>
                    </div>
                    <Button variant="danger" onClick={logout}>
                        <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</span>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
