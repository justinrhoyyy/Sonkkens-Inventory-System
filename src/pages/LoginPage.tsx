import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from '../components/Toast';

interface LoginPageProps {
  session: any;
}

const ALLOWED_EMAIL = 'stockcontroller@inventory.local';

export default function LoginPage({ session }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setError(error?.message ?? 'Unable to sign in');
      setLoading(false);
      return;
    }

    if (data.user.email !== ALLOWED_EMAIL) {
      await supabase.auth.signOut();
      setError('Only the stock controller account may access this system.');
      setLoading(false);
      return;
    }

    toast('Signed in successfully');
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="page-shell" style={{ maxWidth: 480, margin: 'auto' }}>
      <div className="card" style={{ padding: '42px 32px' }}>
        <div style={{ display: 'grid', gap: 12, textAlign: 'center', marginBottom: 30 }}>
          <div className="brand-icon" style={{ margin: '0 auto' }}>S</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Stock Controller Login</h1>
            <p className="text-muted" style={{ margin: '8px 0 0' }}>
              Please sign in to manage inventory.
            </p>
          </div>
        </div>

        <form className="grid" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="stockcontroller@inventory.local" />
          </div>

          <div className="input-group">
            <label className="label">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" />
          </div>

          {error && <div style={{ color: '#c92a2a' }}>{error}</div>}

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
