import { useState } from 'react';
import { Avatar } from './components/Avatar';
import { skinTones } from './lib/clothes';
import { GoogleAuth } from './components/GoogleAuth';
import { HomeScreen, type AppTheme } from './components/HomeScreen';
import { FashionPanel, type HairId } from './components/FashionPanel';

export default function App() {
  const [started, setStarted] = useState(false);
  const [appTheme, setAppTheme] = useState<AppTheme>('gray');
  const [saved, setSaved] = useState(false);
  const [height, setHeight] = useState(175);
  const [skinIndex, setSkinIndex] = useState(3);
  const [customizing, setCustomizing] = useState(false);
  const [view, setView] = useState<'front' | 'right' | 'back' | 'left'>('right');
  const [background, setBackground] = useState<'fitting' | 'studio' | 'city' | 'loft' | 'runway'>('fitting');
  const [openPanel, setOpenPanel] = useState<'backgrounds' | 'customize' | null>(null);
  const [fashionCategory, setFashionCategory] = useState<'tops' | 'bottoms' | 'accessories' | 'shoes' | 'hair'>('hair');
  const [hair, setHair] = useState<HairId>('bald');
  const backgrounds = [
    { id: 'fitting', name: 'Fitting room' }, { id: 'studio', name: 'Studio' },
    { id: 'city', name: 'Paris' }, { id: 'loft', name: 'Loft' },
    { id: 'runway', name: 'Runway' },
  ] as const;

  if (!started) return <HomeScreen theme={appTheme} onTheme={setAppTheme} onPlay={() => setStarted(true)} />;

  return (
    <main className={`game-shell page-theme page-theme-${background} user-theme-${appTheme}`}>
      <header className="topbar">
        <button className="back-home" onClick={() => setStarted(false)}>← Back</button>
        <a className="brand" href="#top" aria-label="DRESSD home"><span>D</span> DRESSD</a>
        <div className="top-actions">
          <div className="coins">✦ <strong>2 480</strong></div>
          <GoogleAuth />
        </div>
      </header>

      <section className="intro" id="top">
        <div><p className="eyebrow">STYLE STUDIO</p><h1>Create your <em>look.</em></h1></div>
        <p>Build your unique style and become<br />this week's fashion icon.</p>
      </section>

      <section className="studio scene-layout">
        <div className="model-panel">
          <Avatar height={height} view={view} skinIndex={skinIndex} background={background} hair={hair} />
          <nav className="bottom-toolbar">
            <button onClick={() => setOpenPanel(openPanel === 'backgrounds' ? null : 'backgrounds')}>▧ Scenes</button>
            <button onClick={() => setView((current) => {
              const views = ['right', 'front', 'left', 'back'] as const;
              return views[(views.indexOf(current) + 1) % views.length];
            })}>↻ Rotate</button>
            <button onClick={() => { setOpenPanel(openPanel === 'customize' ? null : 'customize'); setCustomizing(true); }}>✦ Customize</button>
            <button className={saved ? 'saved' : ''} onClick={() => setSaved(true)}>{saved ? '✓ Saved' : '♡ Save'}</button>
          </nav>
          {openPanel === 'backgrounds' && <nav className="bottom-options background-options">{backgrounds.map((item) => <button key={item.id} className={background === item.id ? 'active' : ''} onClick={() => setBackground(item.id)}>{item.name}</button>)}</nav>}
          {customizing && openPanel === 'customize' && <div className="custom-panel bottom-panel">
            <div className="custom-title"><div><span>CUSTOMIZATION</span><strong>Your model</strong></div><button onClick={() => setCustomizing(false)} aria-label="Close">×</button></div>
            <div className="skin-picker">
              <span>SKIN TONE</span>
              <div>{skinTones.map((tone, index) => <button key={tone.name} className={skinIndex === index ? 'active' : ''} style={{ background: tone.color }} onClick={() => setSkinIndex(index)} title={tone.name} aria-label={tone.name} />)}</div>
            </div>
            <label className="height-picker">
              <span>HEIGHT <strong>{(height / 100).toFixed(2)} m</strong></span>
              <input type="range" min="120" max="200" value={height} onChange={(event) => setHeight(Number(event.target.value))} />
              <small><span>1.20 m</span><span>2.00 m</span></small>
            </label>
            <button className="confirm-custom" onClick={() => { setCustomizing(false); setOpenPanel(null); }}>Apply</button>
          </div>}
        </div>
        <FashionPanel category={fashionCategory} hair={hair} onCategory={setFashionCategory} onHair={setHair} />
      </section>
    </main>
  );
}
