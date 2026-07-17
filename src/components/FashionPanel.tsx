import type { CSSProperties } from 'react';
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
type FashionCategory = 'tops' | 'bottoms' | 'accessories' | 'shoes' | 'hair';

type Props = {
  category: FashionCategory;
  hair: HairId;
  onCategory: (category: FashionCategory) => void;
  onHair: (hair: HairId) => void;
};

const categories: { id: FashionCategory; label: string }[] = [
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'hair', label: 'Hair' },
];

export function FashionPanel({ category, hair, onCategory, onHair }: Props) {
  return <aside className="fashion-panel">
    <div className="fashion-heading"><span>YOUR WARDROBE</span><strong>Choose a category</strong></div>
    <nav className="fashion-categories" aria-label="Fashion categories">
      {categories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => onCategory(item.id)}>{item.label}</button>)}
    </nav>
    {category === 'hair' ? <div className="fashion-hair-grid">
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
