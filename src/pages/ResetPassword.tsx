import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('पासवर्ड मैच नहीं हो रहे / Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षर का होना चाहिए / Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setMessage('पासवर्ड बदल गया! अब लॉगिन करें। / Password updated! You can now login.');
      setTimeout(() => { window.location.href = '/'; }, 2000);
    }
    setLoading(false);
  };

  const inputClass = "w-full p-4 rounded-xl border border-border bg-card text-foreground text-base outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground";

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-4">
          <span className="text-5xl">🔗</span>
          <p className="text-muted-foreground text-lg">लिंक वैध नहीं है / Invalid or expired link</p>
          <a href="/" className="text-primary underline text-sm">वापस जाएं / Go back</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <a href="/" className="flex items-center gap-2 text-muted-foreground text-sm">
          <ArrowLeft size={18} /> वापस / Back
        </a>

        <div className="text-center space-y-2">
          <KeyRound className="mx-auto text-primary" size={48} />
          <h1 className="text-2xl font-bold text-foreground">नया पासवर्ड सेट करें</h1>
          <p className="text-muted-foreground">Set New Password</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="नया पासवर्ड / New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputClass}
            minLength={6}
            required
          />
          <input
            type="password"
            placeholder="पासवर्ड दोबारा डालें / Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className={inputClass}
            minLength={6}
            required
          />

          {error && <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl">{error}</p>}
          {message && <p className="text-sm bg-primary/10 text-primary p-3 rounded-xl">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? '...' : 'पासवर्ड बदलें / Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
