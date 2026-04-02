import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('पासवर्ड रीसेट लिंक भेज दिया गया! ईमेल चेक करें। / Password reset link sent! Check your email.');
    }
    setLoading(false);
  };

  const inputClass = "w-full p-4 rounded-xl border border-border bg-card text-foreground text-base outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <a href="/" className="flex items-center gap-2 text-muted-foreground text-sm">
          <ArrowLeft size={18} /> वापस / Back
        </a>

        <div className="text-center space-y-2">
          <Mail className="mx-auto text-primary" size={48} />
          <h1 className="text-2xl font-bold text-foreground">पासवर्ड भूल गए?</h1>
          <p className="text-muted-foreground">Forgot Password?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="ईमेल डालें / Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputClass}
            required
          />

          {error && <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl">{error}</p>}
          {message && <p className="text-sm bg-primary/10 text-primary p-3 rounded-xl">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? '...' : 'रीसेट लिंक भेजें / Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
