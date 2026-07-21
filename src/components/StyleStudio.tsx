import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { stylePrompts } from '../lib/stylePrompts';
import type { AppTheme } from './HomeScreen';

type Props = { onBack: () => void; theme: AppTheme };

const MAX_FILE_SIZE = 6 * 1024 * 1024;

export function StyleStudio({ onBack, theme }: Props) {
  const galleryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const cameraPreview = useRef<HTMLVideoElement>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageData, setImageData] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [styleId, setStyleId] = useState(stylePrompts[0]?.id ?? '');
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPhotoOptions, setShowPhotoOptions] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const selectedStyle = useMemo(() => stylePrompts.find((style) => style.id === styleId), [styleId]);

  useEffect(() => {
    if (cameraPreview.current && cameraStream) cameraPreview.current.srcObject = cameraStream;
    return () => cameraStream?.getTracks().forEach((track) => track.stop());
  }, [cameraStream]);

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    setResultUrl('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Choose a JPEG, PNG or WebP photo.');
    if (file.size > MAX_FILE_SIZE) return setError('The photo must be smaller than 6 MB.');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setSourceUrl(dataUrl);
      setImageData(dataUrl.split(',')[1] ?? '');
      setMimeType(file.type);
      setShowPhotoOptions(false);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setSourceUrl('');
    setImageData('');
    setMimeType('');
    setResultUrl('');
    setError('');
    setShowPhotoOptions(true);
  };

  const closeCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraOpen(false);
  };

  const openCamera = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInput.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setCameraStream(stream);
      setCameraOpen(true);
    } catch {
      setError('Camera access was denied. Allow camera permission in your browser or choose a photo from your library.');
    }
  };

  const capturePhoto = () => {
    const video = cameraPreview.current;
    if (!video?.videoWidth || !video.videoHeight) return setError('The camera is not ready yet.');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', .9);
    setSourceUrl(dataUrl);
    setImageData(dataUrl.split(',')[1] ?? '');
    setMimeType('image/jpeg');
    setResultUrl('');
    setShowPhotoOptions(false);
    closeCamera();
  };

  const generate = async () => {
    if (!imageData || !selectedStyle) return setError('Upload a photo and choose a style first.');
    setLoading(true);
    setError('');
    setResultUrl('');
    const { data, error: invokeError } = await supabase.functions.invoke('ai', {
      body: { mode: 'image-style', prompt: selectedStyle.prompt, imageData, mimeType },
    });
    setLoading(false);
    if (invokeError || data?.error) return setError(data?.error ?? invokeError?.message ?? 'Generation failed.');
    if (!data?.imageData) return setError('Gemini returned no image.');
    setResultUrl(`data:${data.mimeType ?? 'image/png'};base64,${data.imageData}`);
  };

  return <main className={`style-studio-page style-theme-${theme}`}>
    <div className="style-fashion-decor" aria-hidden="true"><i>◇</i><b>⌁</b><span>✦</span></div>
    <header className="style-studio-header">
      <button onClick={onBack}>← Back</button>
      <div><span>CYL LAB</span><strong>AI Style Studio</strong></div>
      <small>Powered by Gemini</small>
    </header>

    <section className="style-studio-intro">
      <p>TRY A NEW ERA</p>
      <h1>Your photo.<br /><em>Another style.</em></h1>
      <span>Upload one clear photo, select a look and let Gemini restyle it.</span>
    </section>

    <section className="style-workspace">
      <div className="style-photo-card">
        <div className="style-card-title"><span>01</span><strong>Upload photo</strong></div>
        <div className={`photo-drop ${sourceUrl ? 'has-photo' : ''}`}>
          {sourceUrl ? <img src={sourceUrl} alt="Uploaded preview" /> : <><b>＋</b><strong>Choose a photo</strong><small>JPEG, PNG or WebP · max 6 MB</small></>}
        </div>
        <input className="hidden-photo-input" ref={galleryInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} />
        <input className="hidden-photo-input" ref={cameraInput} type="file" accept="image/*" capture="user" onChange={selectPhoto} />
        {(!sourceUrl || showPhotoOptions) && <div className="photo-source-options">
          <button onClick={() => galleryInput.current?.click()}><b>▧</b><span><strong>Photo Library / Files</strong><small>Choose an existing photo</small></span></button>
          <button onClick={openCamera}><b>◎</b><span><strong>Take a Photo</strong><small>Open your phone camera</small></span></button>
        </div>}
        {sourceUrl && <div className="photo-actions">
          <button onClick={() => setShowPhotoOptions((visible) => !visible)}>Change photo</button>
          <button className="remove-photo" onClick={removePhoto}>Remove photo</button>
        </div>}
        <small className="photo-privacy">Your selected photo is sent to Gemini only when you press Generate.</small>
      </div>

      <div className="style-controls-card">
        <div className="style-card-title"><span>02</span><strong>Choose a style</strong></div>
        <div className="style-prompt-list">{stylePrompts.map((style) =>
          <button key={style.id} className={style.id === styleId ? 'active' : ''} onClick={() => setStyleId(style.id)}>
            <i>{style.name.slice(0, 1)}</i><span><strong>{style.name}</strong><small>{style.prompt}</small></span>
          </button>
        )}</div>
        {!stylePrompts.length && <p className="style-error">Add a .txt file to the prompts folder.</p>}
        {error && <p className="style-error">{error}</p>}
        <button className="generate-style" disabled={loading || !imageData || !selectedStyle} onClick={generate}>
          {loading ? 'GENERATING…' : 'GENERATE STYLE'} <span>✦</span>
        </button>
      </div>

      <div className="style-result-card">
        <div className="style-card-title"><span>03</span><strong>Your result</strong></div>
        <div className="style-result">{resultUrl ? <><img src={resultUrl} alt="Gemini styled result" /><button className="open-image-zoom" onClick={() => { setZoom(1); setZoomOpen(true); }} aria-label="Zoom generated image">⌕</button></> : <><b>✦</b><span>Your generated look will appear here.</span></>}</div>
        {resultUrl && <a className="download-style" href={resultUrl} download={`cyl-${styleId || 'style'}.png`}>Download image</a>}
      </div>
    </section>
    {cameraOpen && <div className="camera-dialog" role="dialog" aria-modal="true" aria-label="Take a photo">
      <div className="camera-panel">
        <div><strong>Take a Photo</strong><button onClick={closeCamera} aria-label="Close camera">×</button></div>
        <video ref={cameraPreview} autoPlay muted playsInline />
        <div className="camera-actions"><button onClick={closeCamera}>Cancel</button><button onClick={capturePhoto}>Capture</button></div>
      </div>
    </div>}
    {zoomOpen && resultUrl && <div className="image-zoom-dialog" role="dialog" aria-modal="true" aria-label="Generated image zoom" onClick={() => setZoomOpen(false)}>
      <header onClick={(event) => event.stopPropagation()}><strong>YOUR GENERATED LOOK</strong><button onClick={() => setZoomOpen(false)} aria-label="Close image">×</button></header>
      <div className="zoom-image-viewport" onClick={(event) => event.stopPropagation()}><img src={resultUrl} alt="Gemini styled result enlarged" style={{ transform: `scale(${zoom})` }} /></div>
      <nav onClick={(event) => event.stopPropagation()}>
        <button onClick={() => setZoom((value) => Math.max(1, value - .25))} disabled={zoom <= 1}>−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((value) => Math.min(3, value + .25))} disabled={zoom >= 3}>＋</button>
      </nav>
    </div>}
  </main>;
}
