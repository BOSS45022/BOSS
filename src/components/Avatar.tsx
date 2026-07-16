import sideMan from '../assets/side-man-v2.png';
import frontMan from '../assets/front-man.png';
import backMan from '../assets/back-man.png';
import fittingBackground from '../assets/bg-fitting.png';
import studioBackground from '../assets/bg-studio.png';
import cityBackground from '../assets/bg-city.png';
import loftBackground from '../assets/bg-loft.png';
import runwayBackground from '../assets/bg-runway.png';

type Props = { height: number; view: 'front' | 'right' | 'back' | 'left'; skinIndex: number; background: string };

export function Avatar({ height, view, skinIndex, background }: Props) {
  const sceneImages: Record<string, string> = { fitting: fittingBackground, studio: studioBackground, city: cityBackground, loft: loftBackground, runway: runwayBackground };
  // 1,75 m est l'échelle de référence. À 2 m, le corps et les vêtements
  // grandissent ensemble selon le rapport réel 200 / 175.
  const scale = height / 175;
  return (
    <div className="avatar-stage" aria-label="Fashion model preview">
      <div className="scene photo-scene" style={{ backgroundImage: `url(${sceneImages[background]})` }} />
      <img key={view} className={`realistic-person character-view-${view} skin-tone-${skinIndex}`}
        src={view === 'front' ? frontMan : view === 'back' ? backMan : sideMan}
        alt={`Mannequin, vue ${view}`} style={{ '--body-scale': scale } as React.CSSProperties} />
    </div>
  );
}
