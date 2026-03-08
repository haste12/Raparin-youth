'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo / Header */}
        <div style={styles.header}>
          <div style={styles.logoWrap}>
            <img src="/logo.png" alt="Raparin Youth Logo" style={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>Raparin Youth Organization</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
          <div style={styles.field}>
            <label style={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter username"
              required
              autoComplete="username"
              spellCheck={false}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <a href="/" style={styles.backLink}>← Back to Website</a>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus { outline: none; border-color: #0FC2C0 !important; }
        button:hover:not(:disabled) { background: linear-gradient(135deg, #0FC2C0 0%, #0891B2 100%) !important; transform: translateY(-1px); }
        button:active:not(:disabled) { transform: translateY(0); }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0A1628 0%, #0D2244 50%, #0A1628 100%)',
    fontFamily: "'Inter', sans-serif",
    padding: '16px',
  },
  card: {
    background: 'rgba(13, 34, 68, 0.9)',
    border: '1px solid rgba(15, 194, 192, 0.2)',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    backdropFilter: 'blur(20px)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  logo: {
    width: '72px',
    height: '72px',
    objectFit: 'contain',
    borderRadius: '50%',
    padding: '8px',
    background: 'rgba(15,194,192,0.1)',
    border: '1px solid rgba(15,194,192,0.3)',
  },
  title: {
    color: '#E2E8F0',
    fontSize: '26px',
    fontWeight: 700,
    margin: '0 0 6px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    color: '#64748B',
    fontSize: '14px',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: '#94A3B8',
    fontSize: '13px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#E2E8F0',
    fontSize: '15px',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#FCA5A5',
    fontSize: '14px',
    textAlign: 'center',
  },
  btn: {
    background: 'linear-gradient(135deg, #33AAFF 0%, #0FC2C0 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '13px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.2px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  backLink: {
    color: '#475569',
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
};
