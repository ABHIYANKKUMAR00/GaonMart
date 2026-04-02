import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

type UserRole = 'buyer' | 'seller' | 'delivery' | 'hub';

interface AuthPageProps {
  selectedRole: UserRole;
  onBack: () => void;
}

const roleLabels: Record<UserRole, { en: string; hi: string; emoji: string }> = {
  buyer: { en: 'Buyer', hi: 'खरीदार', emoji: '🛒' },
  seller: { en: 'Shopkeeper', hi: 'दुकानदार', emoji: '🏪' },
  delivery: { en: 'Delivery Partner', hi: 'डिलीवरी पार्टनर', emoji: '🚚' },
  hub: { en: 'Packing Hub Manager', hi: 'पैकिंग हब मैनेजर', emoji: '📦' },
};

const AuthPage = ({ selectedRole, onBack }: AuthPageProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Common fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Extra fields
  const [shopName, setShopName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [address, setAddress] = useState('');

  const roleInfo = roleLabels[selectedRole];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        data: {
          name,
          role: selectedRole,
          shopName,
          vehicle,
          address,
        },
      },
    });

    if (error) setError(error.message);
    else window.location.href = `/otp?phone=${phone}`;;

    setLoading(false);
  };

  const inputClass =
    "w-full p-4 rounded-xl border border-border bg-card text-foreground text-base outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-sm">
          <ArrowLeft size={18} /> Back
        </button>

        {/* Header */}
        <div className="text-center">
          <span className="text-5xl">{roleInfo.emoji}</span>
          <h1 className="text-2xl font-bold">{roleInfo.en}</h1>
          <p>{roleInfo.hi}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* COMMON */}
          <input
            placeholder="नाम / Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className={inputClass}
            required
          />

          <input
            type="tel"
            placeholder="मोबाइल नंबर / Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={inputClass}
            required
          />

          {/* BUYER */}
          {selectedRole === "buyer" && (
            <input
              placeholder="पता / Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className={inputClass}
            />
          )}

          {/* SELLER */}
          {selectedRole === "seller" && (
            <>
              <input
                placeholder="दुकान का नाम / Shop Name"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className={inputClass}
                required
              />
              <input
                placeholder="पता / Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className={inputClass}
              />
            </>
          )}

          {/* DELIVERY */}
          {selectedRole === "delivery" && (
            <>
              <input
                placeholder="वाहन प्रकार / Vehicle"
                value={vehicle}
                onChange={e => setVehicle(e.target.value)}
                className={inputClass}
                required
              />
              <input
                placeholder="पता / Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className={inputClass}
              />
            </>
          )}

          {/* HUB */}
          {selectedRole === "hub" && (
            <input
              placeholder="हब लोकेशन / Hub Location"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className={inputClass}
              required
            />
          )}

          {/* ERROR */}
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold"
          >
            {loading ? "..." : "OTP भेजें / Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;