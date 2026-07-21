export type AppTheme = 'white' | 'gray' | 'dark';
import orangeWatch from '../assets/orange-watch.png';

type Props = {
  theme: AppTheme;
  onTheme: (theme: AppTheme) => void;
  onPlay: () => void;
  onStyles: () => void;
};

const themes: { id: AppTheme; name: string; color: string }[] = [
  { id: 'white', name: 'White', color: '#f4f2ed' },
  { id: 'gray', name: 'Grey', color: '#c9c8c4' },
  { id: 'dark', name: 'Dark', color: '#171717' },
];

export function HomeScreen({ theme, onTheme, onPlay, onStyles }: Props) {
  return <main className={`home-screen home-${theme}`}>
    <header><span className="home-mark">C</span><strong>CYL</strong></header>
    <svg className="dark-fashion-mark" viewBox="0 0 120 72" aria-hidden="true">
      <path d="M53 20c0-8 14-8 14 1 0 6-7 7-7 13M60 34 16 59h88L60 34Z" />
    </svg>
    <section className="home-title">
      <p>FASHION STUDIO</p>
      <h1>CREATE<br />YOUR <em className="look-word">L<img className="watch-letter" src={orangeWatch} alt="O" />OK</em></h1>
      <span>Your style. Your rules.</span>
    </section>
    <footer>
      <div className="home-themes"><span>CHOOSE YOUR THEME</span><div>{themes.map((item) => <button key={item.id} className={theme === item.id ? 'active' : ''} onClick={() => onTheme(item.id)}><i style={{ background:item.color }} />{item.name}</button>)}</div></div>
      <div className="home-actions">
        <button className="ai-style-button" onClick={onStyles}>AI STYLES <span>✦</span></button>
        <button className="play-button" onClick={onPlay}>PLAY <span>→</span></button>
      </div>
    </footer>
  </main>;
}
