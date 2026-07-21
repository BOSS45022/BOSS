import { useEffect, useState } from 'react';
import { HomeScreen, type AppTheme } from './components/HomeScreen';
import { StyleStudio } from './components/StyleStudio';
import { FashionChatGame } from './components/FashionChatGame';

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [appTheme, setAppTheme] = useState<AppTheme>('gray');

  useEffect(() => {
    const handleNavigation = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const navigate = (path: '/' | '/game' | '/styles') => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setPathname(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pathname === '/styles') {
    return <StyleStudio theme={appTheme} onBack={() => navigate('/')} />;
  }

  if (pathname !== '/game') {
    return <HomeScreen theme={appTheme} onTheme={setAppTheme} onPlay={() => navigate('/game')} onStyles={() => navigate('/styles')} />;
  }
  return <FashionChatGame theme={appTheme} onBack={() => navigate('/')} />;
}
