export type Category = 'hair' | 'tops' | 'bottoms' | 'shoes' | 'accessories';
export type Clothing = { id: string; name: string; category: Category; color: string; palette: string; icon: string; brand?: string };
export type Look = Record<Category, Clothing>;
export type SkinTone = { name: string; color: string; shadow: string };

export const skinTones: SkinTone[] = [
  { name: 'Porcelain', color: '#f2c9ad', shadow: '#d89d7b' },
  { name: 'Light', color: '#ddb08f', shadow: '#bd7e5c' },
  { name: 'Golden', color: '#c78b63', shadow: '#9d6044' },
  { name: 'Caramel', color: '#a96848', shadow: '#7d4634' },
  { name: 'Brown', color: '#7b4937', shadow: '#573025' },
  { name: 'Ebony', color: '#4b2b23', shadow: '#2f1b18' },
];

export const categoryLabels: Record<Category, string> = {
  hair: 'Coiffure', tops: 'Hauts', bottoms: 'Bas', shoes: 'Chaussures', accessories: 'Accessoires',
};

const item = (id: string, name: string, category: Category, color: string, palette: string, icon: string, brand?: string): Clothing =>
  ({ id, name, category, color, palette, icon, brand });

export const clothes: Clothing[] = [
  item('bald', 'Chauve', 'hair', 'transparent', 'neutral', ''), item('buzz', 'Buzz cut', 'hair', '#2d241f', 'dark', '◒'), item('curls', 'Boucles', 'hair', '#3b2b24', 'dark', '♒'),
  item('blond', 'Blond messy', 'hair', '#d5a84d', 'warm', '〰'), item('braids', 'Tresses', 'hair', '#201b19', 'dark', '≋'),
  item('afro', 'Afro volume', 'hair', '#211917', 'dark', '●'), item('waves', 'Waves', 'hair', '#35241e', 'dark', '≋'),
  item('mullet', 'Mullet cuivre', 'hair', '#8f4d32', 'warm', '〽'), item('silver', 'Crop argent', 'hair', '#b8b5ae', 'light', '≋'),
  item('dreads', 'Dreadlocks', 'hair', '#33231d', 'dark', '|||'), item('pink', 'Buzz rose', 'hair', '#d47d91', 'purple', '◒'),
  item('tee', 'T-shirt oversize', 'tops', '#f3f0e8', 'light', 'T'), item('hoodie', 'Hoodie cobalt', 'tops', '#3157d5', 'blue', '♜'),
  item('varsity', 'Veste varsity', 'tops', '#d9533f', 'warm', 'V'), item('shirt', 'Chemise sage', 'tops', '#8eaa88', 'green', 'Y'),
  item('jacket', 'Blouson noir', 'tops', '#252525', 'dark', 'J'), item('sweater', 'Pull lilas', 'tops', '#a891c7', 'purple', 'S'),
  item('nike-hoodie', 'Club hoodie', 'tops', '#1f1f20', 'dark', '✓', 'NIKE'), item('adidas-track', 'Track jacket', 'tops', '#3157d5', 'blue', '≡', 'ADIDAS'),
  item('puma-tee', 'Essential tee', 'tops', '#f0e9dc', 'light', 'P', 'PUMA'),
  item('cargo', 'Cargo sable', 'bottoms', '#b79a70', 'warm', 'Ⅱ'), item('jeans', 'Jean wide', 'bottoms', '#5379a5', 'blue', 'Ⅱ'),
  item('shorts', 'Short noir', 'bottoms', '#292929', 'dark', '∪'), item('tailored', 'Pantalon chic', 'bottoms', '#706b65', 'neutral', 'Ⅱ'),
  item('greenpants', 'Cargo olive', 'bottoms', '#68745a', 'green', 'Ⅱ'),
  item('nike-jogger', 'Club jogger', 'bottoms', '#343438', 'dark', 'Ⅱ', 'NIKE'), item('adidas-pants', '3-Stripes', 'bottoms', '#171719', 'dark', 'Ⅲ', 'ADIDAS'),
  item('puma-shorts', 'Team shorts', 'bottoms', '#b73d36', 'warm', '∪', 'PUMA'),
  item('sneakers', 'Sneakers cloud', 'shoes', '#f5f3ed', 'light', '⌁'), item('redshoe', 'Runner rouge', 'shoes', '#d9533f', 'warm', '⌁'),
  item('boots', 'Boots noires', 'shoes', '#252525', 'dark', '▰'), item('bluekick', 'Skate cobalt', 'shoes', '#3157d5', 'blue', '⌁'),
  item('nike-air', 'Air Max', 'shoes', '#f4f1e8', 'light', '✓', 'NIKE'), item('adidas-campus', 'Campus 00s', 'shoes', '#507153', 'green', '≡', 'ADIDAS'),
  item('puma-suede', 'Suede Classic', 'shoes', '#b9473e', 'warm', 'P', 'PUMA'),
  item('none', 'Sans lunettes', 'accessories', '#d8d2c8', 'neutral', '×'),
  item('chain', 'Chaîne argent', 'accessories', '#bfc4c8', 'light', '⛓'), item('glasses-black', 'Lunettes noires', 'accessories', '#252525', 'dark', '∞'),
  item('glasses-gold', 'Lunettes dorées', 'accessories', '#c6922f', 'warm', '∞'), item('glasses-red', 'Lunettes rouges', 'accessories', '#d84d42', 'warm', '∞'),
  item('glasses-blue', 'Lunettes bleues', 'accessories', '#3157d5', 'blue', '∞'), item('glasses-white', 'Lunettes blanches', 'accessories', '#f5f3ed', 'light', '∞'),
  item('cap', 'Casquette rouge', 'accessories', '#d9533f', 'warm', '⌒'), item('bag', 'Sac crossbody', 'accessories', '#8eaa88', 'green', '▱'),
  item('watch', 'Montre chrome', 'accessories', '#aeb4b8', 'neutral', '◉'),
];

const find = (id: string) => clothes.find((piece) => piece.id === id)!;
export const defaultLook: Look = { hair: find('curls'), tops: find('hoodie'), bottoms: find('cargo'), shoes: find('sneakers'), accessories: find('glasses-black') };
