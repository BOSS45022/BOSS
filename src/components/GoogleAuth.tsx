import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function GoogleAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  async function continueWithGoogle() {
    setBusy(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (authError) {
      setError(authError.message);
      setBusy(false);
    }
  }

  if (session) {
    const avatar = session.user.user_metadata.avatar_url as string | undefined;
    const name = (session.user.user_metadata.full_name as string | undefined) ?? session.user.email ?? 'Account';
    return <div className="google-account">
      {avatar ? <img src={avatar} alt="" /> : <span>{name[0].toUpperCase()}</span>}
      <strong>{name}</strong>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>;
  }

  return <div className="google-login">
    <button onClick={continueWithGoogle} disabled={busy}><b>G</b>{busy ? 'Connecting…' : 'Continue with Google'}</button>
    {error && <small>{error}</small>}
  </div>;
}
