import { useState, type CSSProperties } from 'react';
import hairSheet from '../assets/hair-style-sheet-gemini.png';

export const hairStyles = [
  { id: 'bald', name: 'Bald', col: 0, row: 0, overlayCol: 0, overlayRow: 0 },
  { id: 'buzz', name: 'Buzz cut', col: 1, row: 0, overlayCol: 1, overlayRow: 0 },
  { id: 'french-crop', name: 'French crop', col: 3, row: 0, overlayCol: 2, overlayRow: 0 },
  { id: 'waves', name: 'Waves', col: 4, row: 1, overlayCol: 3, overlayRow: 0 },
  { id: 'short-curls', name: 'Short curls', col: 0, row: 2, overlayCol: 0, overlayRow: 1 },
  { id: 'medium-curls', name: 'Medium curls', col: 1, row: 2, overlayCol: 1, overlayRow: 1 },
  { id: 'afro', name: 'Afro', col: 2, row: 2, overlayCol: 2, overlayRow: 1 },
  { id: 'twists', name: 'Short twists', col: 3, row: 2, overlayCol: 3, overlayRow: 1 },
  { id: 'cornrows', name: 'Cornrows', col: 4, row: 2, overlayCol: 0, overlayRow: 2 },
  { id: 'box-braids', name: 'Box braids', col: 0, row: 3, overlayCol: 1, overlayRow: 2 },
  { id: 'dreads', name: 'Dreadlocks', col: 1, row: 3, overlayCol: 2, overlayRow: 2 },
  { id: 'slick', name: 'Slick back', col: 2, row: 3, overlayCol: 3, overlayRow: 2 },
] as const;

export type HairId = typeof hairStyles[number]['id'];
export const topStyles = [
  { id: 'nike-black', name: 'Nike Black', color: '#171719', accent: '#f5f3ed', mark: 'NIKE' },
  { id: 'nike-white', name: 'Nike White', color: '#f2f0e9', accent: '#171719', mark: 'NIKE' },
  { id: 'nike-red', name: 'Nike Red', color: '#c93632', accent: '#ffffff', mark: 'NIKE' },
  { id: 'puma-black', name: 'Puma Black', color: '#202022', accent: '#f2f0e9', mark: 'PUMA' },
  { id: 'puma-white', name: 'Puma White', color: '#f6f4ee', accent: '#202022', mark: 'PUMA' },
  { id: 'puma-blue', name: 'Puma Blue', color: '#174e8d', accent: '#ffffff', mark: 'PUMA' },
  { id: 'adidas-navy', name: 'Adidas Navy', color: '#18263f', accent: '#ffffff', mark: 'ADIDAS' },
  { id: 'adidas-white', name: 'Adidas White', color: '#f5f3ed', accent: '#161616', mark: 'ADIDAS' },
  { id: 'adidas-green', name: 'Adidas Green', color: '#275c43', accent: '#ffffff', mark: 'ADIDAS' },
  { id: 'essential-gray', name: 'Essential Gray', color: '#8c8d8f', accent: '#ffffff', mark: 'ESSENTIAL' },
  { id: 'oversized-cream', name: 'Cream Oversized', color: '#d8cbb7', accent: '#292621', mark: 'CYL' },
  { id: 'street-orange', name: 'Street Orange', color: '#df6236', accent: '#ffffff', mark: 'STREET' },
  { id: 'classic-brown', name: 'Classic Brown', color: '#684438', accent: '#f2e7d7', mark: 'CYL' },
  { id: 'minimal-black', name: 'Minimal Black', color: '#111111', accent: '#ef513f', mark: 'CYL' },
  { id: 'sky-blue', name: 'Sky Blue', color: '#78a9c5', accent: '#ffffff', mark: 'CYL' },
] as const;
export type TopId = typeof topStyles[number]['id'];
type FashionCategory = 'tops' | 'bottoms' | 'accessories' | 'shoes' | 'hair';

type Props = {
  category: FashionCategory;
  hair: HairId;
  top: TopId;
  onCategory: (category: FashionCategory) => void;
  onHair: (hair: HairId) => void;
  onTop: (top: TopId) => void;
};

const categories: { id: FashionCategory; label: string }[] = [
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'hair', label: 'Hair' },
];

export function FashionPanel({ category, hair, top, onCategory, onHair, onTop }: Props) {
  const [topType, setTopType] = useState<'tshirts' | 'hoodies'>('tshirts');
  return <aside className="fashion-panel">
    <div className="fashion-heading"><span>YOUR WARDROBE</span><strong>Choose a category</strong></div>
    <nav className="fashion-categories" aria-label="Fashion categories">
      {categories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => onCategory(item.id)}>{item.label}</button>)}
    </nav>
    {category === 'tops' ? <div className="tops-browser">
      <nav className="top-type-tabs" aria-label="Top type">
        <button className={topType === 'tshirts' ? 'active' : ''} onClick={() => setTopType('tshirts')}>T-Shirts</button>
        <button className={topType === 'hoodies' ? 'active' : ''} onClick={() => setTopType('hoodies')}>Hoodies</button>
      </nav>
      {topType === 'tshirts' ? <div className="tshirt-grid">{topStyles.map((style) =>
        <button key={style.id} className={top === style.id ? 'active' : ''} onClick={() => onTop(style.id)}>
          <i style={{ '--shirt-color': style.color, '--shirt-accent': style.accent } as CSSProperties}><b>{style.mark}</b></i>
          <span>{style.name}</span>
        </button>
      )}</div> : <div className="fashion-placeholder"><span>Hoodies</span><strong>Coming next</strong><small>Your hoodie collection will be added next.</small></div>}
    </div> : category === 'hair' ? <div className="fashion-hair-grid">
      {hairStyles.map((style) => {
        const positionX = style.col * 25;
        const positionY = style.row * (100 / 3);
        const previewStyle = { backgroundImage: `url(${hairSheet})`, backgroundPosition: `${positionX}% ${positionY}%` } as CSSProperties;
        return <button key={style.id} className={hair === style.id ? 'active' : ''} onClick={() => onHair(style.id)}>
          <i style={previewStyle} /><span>{style.name}</span>
        </button>;
      })}
    </div> : <div className="fashion-placeholder"><span>{categories.find((item) => item.id === category)?.label}</span><strong>Coming next</strong><small>This category is ready for new items.</small></div>}
  </aside>;
}
