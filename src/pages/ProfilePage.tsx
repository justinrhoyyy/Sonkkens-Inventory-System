import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from '../components/Toast';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return;
    }
    setUserId(user.id);
    setEmail(user.email ?? '');
    setDisplayName((user.user_metadata?.name as string) ?? '');
  }

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const updates: any = {
      email: email.trim(),
      data: { name: displayName.trim() },
    };
    if (password.trim()) {
      updates.password = password.trim();
    }

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      toast(error.message);
    } else {
      toast('Profile updated');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="page-shell" style={{ maxWidth: 640, margin: 'auto' }}>
      <h1 className="page-title">View Profile</h1>
      <div className="card">
        <form className="grid" onSubmit={handleUpdateProfile}>
          <div className="input-group">
            <label className="label">Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="stock controller" />
          </div>
          <div className="input-group">
            <label className="label">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div className="input-group">
            <label className="label">New password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Leave blank to keep current password" />
          </div>
          <button className="button" type="submit" disabled={loading}>{loading ? 'Updating…' : 'Update profile'}</button>
        </form>
      </div>
    </div>
  );
}
