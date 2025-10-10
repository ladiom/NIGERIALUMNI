import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

function SetupAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: rpcErr } = await supabase.rpc('has_admin');
        if (rpcErr) throw rpcErr;
        if (mounted) {
          if (data === true) {
            // An admin already exists; redirect to home.
            navigate('/');
          } else {
            setAllowed(true);
          }
        }
      } catch (e) {
        setError('Unable to check admin status. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      // 1) Sign up the admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      const userId = signUpData?.user?.id;
      const userEmail = signUpData?.user?.email ?? email;

      // If email confirmation is enabled, there may be no session yet.
      // Attempt to sign in so we have an authenticated session for the upsert.
      let session = signUpData?.session ?? null;
      if (!session) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) {
          setInfo('Sign-up succeeded. Please verify your email, then sign in to continue.');
          throw signInErr;
        }
        session = signInData?.session ?? null;
      }

      if (!userId) throw new Error('Missing user id after sign-up.');

      // 2) Upsert admin row into public.users.
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert({ id: userId, email: userEmail, roles: ['admin'] }, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;

      setInfo('Admin account created. Redirecting to Admin…');
      setTimeout(() => navigate('/admin'), 1200);
    } catch (e) {
      // Show a concise error; details can vary based on confirmation requirements.
      setError(e.message || 'Failed to create admin account.');
    } finally {
      setLoading(false);
    }
  };

  if (!allowed) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Setup Admin</h2>
        {loading ? <p>Checking setup status…</p> : <p>Redirecting…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h2>Create First Admin</h2>
      <p>This form is available only until the first admin exists.</p>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create Admin'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {info && <p style={{ color: 'green' }}>{info}</p>}
    </div>
  );
}

export default SetupAdmin;