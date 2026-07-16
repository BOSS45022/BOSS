import { categoryLabels, clothes, type Category, type Clothing, type Look } from '../lib/clothes';

type Props = { category: Category; look: Look; onCategory: (category: Category) => void; onSelect: (item: Clothing) => void };

export function Wardrobe({ category, look, onCategory, onSelect }: Props) {
  const categories = Object.keys(categoryLabels) as Category[];
  const filtered = clothes.filter((item) => item.category === category);
  return (
    <div className="wardrobe">
      <div className="wardrobe-heading"><div><p className="eyebrow">TON DRESSING</p><h2>Choisis tes pièces</h2></div><span>{filtered.length} ARTICLES</span></div>
      <nav className="categories" aria-label="Catégories de vêtements">
        {categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => onCategory(item)} key={item}>{categoryLabels[item]}</button>)}
      </nav>
      <div className="clothes-grid">
        {filtered.map((item) => {
          const selected = look[category].id === item.id;
          return <button className={selected ? 'clothing selected' : 'clothing'} onClick={() => onSelect(item)} key={item.id}>
            <span className="item-art" style={{ '--item-color': item.color } as React.CSSProperties}>{item.icon}</span>
            {item.brand && <span className={`brand-tag brand-${item.brand.toLowerCase()}`}>{item.brand}</span>}
            <span className="item-name">{item.name}</span><small>{selected ? 'PORTÉ' : 'ESSAYER'}</small>
          </button>;
        })}
      </div>
      <div className="drop-banner"><span>NOUVEAU DROP</span><strong>Summer in the city</strong><small>12 nouvelles pièces →</small></div>
    </div>
  );
}
