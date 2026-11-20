import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }
      localStorage.setItem('rg_admin_token', data.token);
      localStorage.setItem('rg_admin_user', JSON.stringify(data.admin));
      navigate('/rg-portal-9x/dashboard');
    } catch {
      setError('Unable to reach authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 text-white">
      <div className="bg-navy-dark border border-gold/30 rounded-lg max-w-md w-full p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/logo.svg"
            alt="Regal Global"
            className="h-14 w-auto object-contain mix-blend-screen mb-3"
          />
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">
            Restricted Access Portal
          </span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">
            Regal Global Command
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase font-bold text-stone mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@regalglobal.com"
              className="w-full bg-navy border border-navy-light focus:border-gold rounded px-3 py-2.5 text-white outline-none"
            />
          </div>
          <div>
            <label className="block uppercase font-bold text-stone mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-navy border border-navy-light focus:border-gold rounded px-3 py-2.5 text-white outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-dark text-navy font-bold py-3 rounded uppercase tracking-wider transition disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
