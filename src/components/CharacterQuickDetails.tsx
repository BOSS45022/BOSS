type DetailKey = 'skinTone' | 'eyeColor' | 'hairstyle' | 'tshirt' | 'sweater' | 'bottom' | 'socks';
type Props = Record<DetailKey, string> & {
  shoes: string;
  onChange: (key: DetailKey | 'shoes', value: string) => void;
};

const groups = [
  { key: 'skinTone', label: 'SKIN', options: ['Deep', 'Dark', 'Medium', 'Light', 'Fair'] },
  { key: 'eyeColor', label: 'EYES', options: ['Brown', 'Dark brown', 'Hazel', 'Green', 'Blue', 'Grey'] },
  { key: 'hairstyle', label: 'HAIR', options: ['Buzz cut', 'Fade', 'Undercut', 'Bob', 'Pixie', 'Long straight', 'Wavy', 'Curly', 'Afro', 'Braids', 'Dreadlocks', 'Ponytail', 'Bun', 'Bald'] },
  { key: 'tshirt', label: 'T-SHIRT', options: ['None', 'Basic tee', 'Slim-fit tee', 'Oversized tee', 'Graphic tee', 'Long-sleeve tee', 'Crop top', 'Tank top', 'Polo shirt'] },
  { key: 'sweater', label: 'SWEATER', options: ['None', 'Pullover hoodie', 'Zip hoodie', 'Crewneck', 'V-neck sweater', 'Oversized sweater', 'Cable-knit sweater', 'Cardigan', 'Turtleneck'] },
  { key: 'bottom', label: 'JOGGERS', options: ['Classic joggers', 'Slim joggers', 'Baggy joggers', 'Cargo joggers', 'Wide-leg joggers', 'Flared joggers'] },
  { key: 'bottom', label: 'SHORTS', options: ['Denim shorts', 'Sport shorts', 'Cargo shorts', 'Bermuda shorts', 'Cycling shorts', 'Tailored shorts'] },
  { key: 'bottom', label: 'OTHER BOTTOMS', options: ['Jeans', 'Skirt', 'Cargo pants'] },
  { key: 'socks', label: 'SOCKS', options: ['White', 'Grey', 'Black'] },
  { key: 'shoes', label: 'SHOES', options: ['Barefoot', 'Sneakers', 'Boots', 'Heels', 'Loafers'] },
] as const;

export function CharacterQuickDetails({ skinTone, eyeColor, hairstyle, tshirt, sweater, bottom, socks, shoes, onChange }: Props) {
  const values = { skinTone, eyeColor, hairstyle, tshirt, sweater, bottom, socks, shoes };
  return <section className="character-quick-details">
    <header><span>QUICK STYLE DETAILS</span><small>Tap one choice per line</small></header>
    {groups.map((group) => <fieldset key={group.key}>
      <legend>{group.label}</legend>
      <div>{group.options.map((option) => <button type="button" key={option} className={values[group.key] === option ? 'selected' : ''} onClick={() => onChange(group.key, option)}>{option}</button>)}</div>
    </fieldset>)}
  </section>;
}
