import sideMan from '../assets/side-man-v2.png';
import frontMan from '../assets/front-man.png';
import backMan from '../assets/back-man.png';
import fittingBackground from '../assets/bg-fitting.png';
import studioBackground from '../assets/bg-studio.png';
import cityBackground from '../assets/bg-city.png';
import loftBackground from '../assets/bg-loft.png';
import runwayBackground from '../assets/bg-runway.png';
import hairOverlays from '../assets/hair-overlays-refined.png';
import sideHairOverlays from '../assets/hair-overlays-side.png';
import backHairOverlays from '../assets/hair-overlays-back.png';
import afroHair from '../assets/afro-hair.png';
import buzzSideHair from '../assets/buzz-side.png';
import buzzBackHair from '../assets/buzz-back.png';
import afroSideHair from '../assets/afro-side.png';
import afroBackHair from '../assets/afro-back.png';
import { hairStyles, topStyles, type HairId, type TopId } from './FashionPanel';

type Props = { height: number; view: 'front' | 'right' | 'back' | 'left'; skinIndex: number; background: string; hair: HairId; top: TopId };

export function Avatar({ height, view, skinIndex, background, hair, top }: Props) {
  const sceneImages: Record<string, string> = { fitting: fittingBackground, studio: studioBackground, city: cityBackground, loft: loftBackground, runway: runwayBackground };
  // La taille reste progressive, mais le modèle de 2 m ne dépasse jamais
  // la taille de référence de l'image et reste entièrement dans le décor.
  const heightProgress = (height - 120) / 80;
  const scale = 0.82 + heightProgress * 0.18;
  const selectedHair = hairStyles.find((style) => style.id === hair);
  const activeHairSheet = view === 'back' ? backHairOverlays : view === 'front' ? hairOverlays : sideHairOverlays;
  const dedicatedHair = hair === 'afro'
    ? (view === 'front' ? afroHair : view === 'back' ? afroBackHair : afroSideHair)
    : hair === 'buzz' && view !== 'front'
      ? (view === 'back' ? buzzBackHair : buzzSideHair)
      : null;
  const selectedTop = topStyles.find((style) => style.id === top)!;
  return (
    <div className="avatar-stage" aria-label="Fashion model preview">
      <div className="scene photo-scene" style={{ backgroundImage: `url(${sceneImages[background]})` }} />
      <img key={view} className={`realistic-person character-view-${view} skin-tone-${skinIndex}`}
        src={view === 'front' ? frontMan : view === 'back' ? backMan : sideMan}
        alt={`Mannequin, vue ${view}`} style={{ '--body-scale': scale } as React.CSSProperties} />
      <span key={`${top}-${view}`} className={`photo-top photo-top-${view}`} style={{
        '--body-scale': scale,
        '--shirt-color': selectedTop.color,
        '--shirt-accent': selectedTop.accent,
      } as React.CSSProperties}>
        <i><b>{selectedTop.mark}</b></i>
      </span>
      {selectedHair && hair !== 'bald' && <span key={`${hair}-${view}`} className={`photo-hair-sprite photo-hair-sprite-${view} photo-hair-${hair}${dedicatedHair ? ' photo-hair-dedicated-wrap' : ''}`} style={{ '--body-scale': scale } as React.CSSProperties}>
        <i className={dedicatedHair ? 'photo-hair-dedicated' : undefined} style={{
          backgroundImage: `url(${dedicatedHair ?? activeHairSheet})`,
          backgroundPosition: dedicatedHair ? 'center' : `${selectedHair.overlayCol * (100 / 3)}% ${selectedHair.overlayRow * 50}%`,
        }} />
      </span>}
    </div>
  );
}
