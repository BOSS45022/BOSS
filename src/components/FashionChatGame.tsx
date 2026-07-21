import { useEffect, useRef, useState, type FormEvent, type TouchEvent } from 'react';
import { supabase } from '../lib/supabase';
import type { AppTheme } from './HomeScreen';
import { CharacterQuickDetails } from './CharacterQuickDetails';
import { functionErrorMessage } from '../lib/functionError';

type Gender = 'man' | 'woman';
type StylingMode = 'ai' | 'manual';
type Message = { id: number; role: 'assistant' | 'user'; text: string; image?: string };
type AiRating = { score: number; verdict: string; missing: string[] };
type SavedCharacter = { id: string; image: string; gender: Gender; savedAt: number };
type ChatHistory = { id: string; gender: Gender | null; characterImage: string; stylingMode: StylingMode | null; messages: Message[]; updatedAt: number };
type GameSession = {
  id: string; gender: Gender | null; characterImage: string; pendingCharacterImage: string;
  editingPendingCharacter: boolean; stylingMode: StylingMode | null; messages: Message[]; input: string;
  characterHeight: number; characterWeight: number; characterAge: number; skinTone: string; eyeColor: string;
  hairstyle: string; tshirt: string; sweater: string; bottom: string; socks: string; shoes: string;
  customizationOpen: boolean; occasion: string; season: string; budget: number; aiOptionsOpen: boolean;
};
type Props = { theme: AppTheme; onBack: () => void };

const DB_NAME = 'cyl-fashion-game';
const STORE_NAME = 'characters';

function characterStore() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putStoredValue(key: string, value: unknown) {
  const db = await characterStore();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function getStoredValue<T>(key: string) {
  const db = await characterStore();
  const value = await new Promise<T | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

export function FashionChatGame({ theme, onBack }: Props) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [characterImage, setCharacterImage] = useState('');
  const [pendingCharacterImage, setPendingCharacterImage] = useState('');
  const [editingPendingCharacter, setEditingPendingCharacter] = useState(false);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stylingMode, setStylingMode] = useState<StylingMode | null>(null);
  const [aiRating, setAiRating] = useState<AiRating | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [showSelfRating, setShowSelfRating] = useState(false);
  const [selfRating, setSelfRating] = useState(80);
  const [occasion, setOccasion] = useState('Everyday');
  const [season, setSeason] = useState('All season');
  const [budget, setBudget] = useState(200);
  const [aiOptionsOpen, setAiOptionsOpen] = useState(true);
  const [characterHeight, setCharacterHeight] = useState(175);
  const [characterWeight, setCharacterWeight] = useState(70);
  const [characterAge, setCharacterAge] = useState(20);
  const [skinTone, setSkinTone] = useState('Medium');
  const [eyeColor, setEyeColor] = useState('Brown');
  const [hairstyle, setHairstyle] = useState('Short');
  const [tshirt, setTshirt] = useState('Basic tee');
  const [sweater, setSweater] = useState('None');
  const [bottom, setBottom] = useState('Classic joggers');
  const [socks, setSocks] = useState('White');
  const [shoes, setShoes] = useState('Barefoot');
  const [customizationOpen, setCustomizationOpen] = useState(true);
  const [lookZoomOpen, setLookZoomOpen] = useState(false);
  const [lookZoomImage, setLookZoomImage] = useState('');
  const [lookZoom, setLookZoom] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', text: 'Welcome to CYL Fashion AI. Choose Man or Woman, then describe the character you want to create.' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(crypto.randomUUID());
  const historyReady = useRef(false);
  const sessionReady = useRef(false);
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);

  useEffect(() => {
    Promise.all([
      getStoredValue<SavedCharacter[]>('saved-characters'),
      getStoredValue<ChatHistory[]>('chat-history'),
      getStoredValue<{ image: string; gender: Gender }>('current'),
      getStoredValue<GameSession>('active-session'),
    ]).then(([characters, history, legacy, active]) => {
      const initialCharacters = characters ?? (legacy ? [{ id: crypto.randomUUID(), ...legacy, savedAt: Date.now() }] : []);
      setSavedCharacters(initialCharacters);
      setChatHistory(history ?? []);
      if (active) {
        sessionId.current = active.id;
        setGender(active.gender); setCharacterImage(active.characterImage); setPendingCharacterImage(active.pendingCharacterImage);
        setEditingPendingCharacter(active.editingPendingCharacter); setStylingMode(active.stylingMode); setMessages(active.messages);
        setInput(active.input); setCharacterHeight(active.characterHeight); setCharacterWeight(active.characterWeight); setCharacterAge(active.characterAge ?? 20);
        setSkinTone(active.skinTone); setEyeColor(active.eyeColor); setHairstyle(active.hairstyle);
        setTshirt(active.tshirt); setSweater(active.sweater); setBottom(active.bottom); setSocks(active.socks ?? 'White'); setShoes(active.shoes);
        setCustomizationOpen(active.customizationOpen); setOccasion(active.occasion); setSeason(active.season); setBudget(active.budget); setAiOptionsOpen(active.aiOptionsOpen ?? true);
      }
      if (!characters && initialCharacters.length) putStoredValue('saved-characters', initialCharacters);
      historyReady.current = true;
      sessionReady.current = true;
    }).catch(() => { historyReady.current = true; sessionReady.current = true; });
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    if (!historyReady.current || messages.length <= 1) return;
    const timer = window.setTimeout(() => {
      const compactMessages = messages.map(({ image: _image, ...message }) => message);
      const entry: ChatHistory = { id: sessionId.current, gender, characterImage, stylingMode, messages: compactMessages, updatedAt: Date.now() };
      setChatHistory((current) => {
        const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 20);
        putStoredValue('chat-history', next).catch(() => undefined);
        return next;
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [messages, gender, characterImage, stylingMode]);
  useEffect(() => {
    if (!sessionReady.current) return;
    const timer = window.setTimeout(() => putStoredValue('active-session', {
      id: sessionId.current, gender, characterImage, pendingCharacterImage, editingPendingCharacter,
      stylingMode, messages, input, characterHeight, characterWeight, characterAge, skinTone, eyeColor, hairstyle,
      tshirt, sweater, bottom, socks, shoes, customizationOpen, occasion, season, budget, aiOptionsOpen,
    } satisfies GameSession).catch(() => undefined), 250);
    return () => window.clearTimeout(timer);
  }, [gender, characterImage, pendingCharacterImage, editingPendingCharacter, stylingMode, messages, input,
    characterHeight, characterWeight, characterAge, skinTone, eyeColor, hairstyle, tshirt, sweater, bottom, socks, shoes,
    customizationOpen, occasion, season, budget, aiOptionsOpen]);

  const chooseGender = (value: Gender) => {
    setGender(value);
    setCustomizationOpen(true);
    setMessages((current) => [...current, {
      id: Date.now(), role: 'assistant',
      text: `Great. Describe your ${value}: height, skin tone, hairstyle, body shape, age and any details you want.`,
    }]);
  };

  const restoreSaved = (savedCharacter: SavedCharacter) => {
    setGender(savedCharacter.gender);
    setCharacterImage(savedCharacter.image);
    setPendingCharacterImage('');
    setStylingMode(null);
    setAiRating(null);
    setShowSelfRating(false);
    setLibraryOpen(false);
    setMessages((current) => [...current, { id: Date.now(), role: 'assistant', text: 'Your saved character is loaded. Choose who will create the outfit: you or the AI stylist.', image: savedCharacter.image }]);
  };

  const chooseStylingMode = (mode: StylingMode) => {
    setStylingMode(mode);
    if (mode === 'ai') setAiOptionsOpen(true);
    setMessages((current) => [...current, {
      id: Date.now(), role: 'assistant',
      text: mode === 'ai'
        ? 'AI Stylist is active. Describe a mood, occasion or one item, and I will create a complete coordinated model outfit.'
        : 'You Choose is active. I will add only the pieces you explicitly request. Unrequested clothing categories stay in the neutral base look.',
    }]);
  };

  const submitAiStylistOptions = () => {
    setAiOptionsOpen(false);
    setInput(`Create a complete outfit for ${occasion}, suitable for ${season.toLowerCase()}, with a maximum virtual budget of €${budget}.`);
    window.setTimeout(() => document.querySelector<HTMLFormElement>('#fashion-chat-form')?.requestSubmit(), 0);
  };

  const changeQuickDetail = (key: 'skinTone' | 'eyeColor' | 'hairstyle' | 'tshirt' | 'sweater' | 'bottom' | 'socks' | 'shoes', value: string) => {
    if (key === 'skinTone') setSkinTone(value);
    if (key === 'eyeColor') setEyeColor(value);
    if (key === 'hairstyle') setHairstyle(value);
    if (key === 'tshirt') setTshirt(value);
    if (key === 'sweater') setSweater(value);
    if (key === 'bottom') setBottom(value);
    if (key === 'socks') setSocks(value);
    if (key === 'shoes') setShoes(value);
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const writtenRequest = input.trim();
    const bmi = characterWeight / ((characterHeight / 100) ** 2);
    const bodyShape = bmi < 19 ? 'slim' : bmi < 25 ? 'balanced' : bmi < 30 ? 'broad' : 'plus-size';
    const selectedClothes = [tshirt, sweater, bottom].filter((item) => item !== 'None').join(', ');
    const footwearDescription = shoes === 'Barefoot'
      ? `${socks.toLowerCase()} ankle socks fully covering both feet, toes and heels, with no shoes`
      : `${socks.toLowerCase()} ankle socks worn normally inside ${shoes.toLowerCase()}`;
    const characterProfile = `${characterAge} years old, ${characterHeight} cm tall, approximately ${characterWeight} kg, with a realistic ${bodyShape} body proportion, ${skinTone.toLowerCase()} skin, ${eyeColor.toLowerCase()} eyes, ${hairstyle.toLowerCase()} hair, wearing ${selectedClothes.toLowerCase()}, and ${footwearDescription}`;
    const isPendingEdit = Boolean(pendingCharacterImage && editingPendingCharacter);
    const request = writtenRequest || (!characterImage && !pendingCharacterImage ? characterProfile : '');
    if (!request || !gender || loading || (pendingCharacterImage && !isPendingEdit) || (characterImage && !stylingMode)) return;
    setInput('');
    setSaved(false);
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text: writtenRequest || `Create my character: ${characterProfile}.` }]);
    setLoading(true);

    const sourceImage = characterImage || (isPendingEdit ? pendingCharacterImage : '');
    const currentImageData = sourceImage.split(',')[1] ?? '';
    const mode = sourceImage ? 'image-style' : 'fashion-character';
    const prompt = isPendingEdit
      ? `Keep this exact ${gender} character's identity, height, weight and body proportions unchanged. Modify only these additional details requested by the player: ${request}. Keep every other existing detail unchanged. Show the full character from head to feet.`
      : characterImage
      ? stylingMode === 'ai'
        ? `Keep this exact ${gender} character's identity, face, skin tone, hairstyle, height and body proportions unchanged. Act as a professional high-fashion stylist. Create a complete coordinated model outfit inspired by this player request: ${request}. Occasion: ${occasion}. Season: ${season}. Virtual maximum budget: €${budget}; choose believable pieces whose estimated total stays within this budget. You may choose complementary top, bottoms, shoes and accessories. Show the full outfit from head to shoes.`
        : `Keep this exact ${gender} character's identity, face, skin tone, hairstyle, height and body proportions unchanged. The player is manually building the outfit. Apply ONLY the clothing categories and exact details explicitly requested here: ${request}. Do not invent any unrequested garment or accessory. For every category not mentioned, use the neutral base state: plain briefs/underwear for unrequested bottoms, a simple neutral sleeveless base layer for an unrequested top, barefoot for unrequested shoes, and no accessories unless requested. If the player requests a top and shoes but no trousers or shorts, the briefs must remain clearly visible. Show the full character from head to feet.`
      : `Create one hyper-realistic full-body ${gender} fashion-game character. Required character details: ${characterProfile}. Additional player description: ${writtenRequest || 'No additional details; choose natural facial features.'}. Keep height and weight visually proportional and anatomically realistic. Show the entire person from head to feet, standing naturally and facing the camera. Use realistic human proportions and a clean neutral fashion-studio background. Follow the selected hair, clothes, socks and shoes exactly. Socks must be conventional ankle socks worn directly on the feet: they must completely cover every toe, the top and sole of each foot, and both heels, ending just above the ankles. Never create open-toe socks, stirrup socks, leg warmers, gaiters, knee-high socks or fabric covering the calves. Do not add accessories, text, a collage or extra people.`;

    const { data, error } = await supabase.functions.invoke('ai', {
      body: { mode, prompt, imageData: currentImageData, mimeType: sourceImage.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png' },
    });
    setLoading(false);
    if (error || data?.error || !data?.imageData) {
      const message = data?.error ?? await functionErrorMessage(error, 'I could not generate the image. Please try again.');
      setMessages((current) => [...current, { id: Date.now(), role: 'assistant', text: message }]);
      return;
    }
    const image = `data:${data.mimeType ?? 'image/png'};base64,${data.imageData}`;
    setAiRating(null);
    setRatingError('');
    setShowSelfRating(false);
    if (characterImage) setCharacterImage(image);
    else setPendingCharacterImage(image);
    setEditingPendingCharacter(false);
    setMessages((current) => [...current, {
      id: Date.now(), role: 'assistant', image,
      text: characterImage ? 'Here is the new outfit. Tell me what you want to change next.' : 'Your character preview is ready. Press Finalize Character to place it in the Your Character frame.',
    }]);
  };

  const finalizeCharacter = () => {
    if (!pendingCharacterImage) return;
    setCharacterImage(pendingCharacterImage);
    setPendingCharacterImage('');
    setEditingPendingCharacter(false);
    setMessages((current) => [...current, {
      id: Date.now(), role: 'assistant',
      text: 'Character finalized. It is now displayed in Your Character. Choose who will create the outfit.',
    }]);
  };

  const save = async () => {
    if (!characterImage || !gender) return;
    const entry: SavedCharacter = { id: crypto.randomUUID(), image: characterImage, gender, savedAt: Date.now() };
    const next = [entry, ...savedCharacters];
    await putStoredValue('saved-characters', next);
    setSavedCharacters(next);
    setSaved(true);
  };

  const deleteCharacter = async (id: string) => {
    const next = savedCharacters.filter((item) => item.id !== id);
    setSavedCharacters(next);
    await putStoredValue('saved-characters', next);
  };

  const restoreChat = (chat: ChatHistory) => {
    sessionId.current = chat.id;
    setGender(chat.gender);
    setCharacterImage(chat.characterImage);
    setPendingCharacterImage('');
    setStylingMode(chat.stylingMode);
    setMessages(chat.messages);
    setSaved(false);
    setAiRating(null);
    setHistoryOpen(false);
  };

  const deleteChat = async (id: string) => {
    const next = chatHistory.filter((item) => item.id !== id);
    setChatHistory(next);
    await putStoredValue('chat-history', next);
  };

  const deleteAllChats = async () => {
    setChatHistory([]);
    await putStoredValue('chat-history', []);
  };

  const rateWithAi = async () => {
    if (!characterImage || ratingLoading) return;
    setRatingLoading(true);
    setRatingError('');
    setAiRating(null);
    const { data, error } = await supabase.functions.invoke('ai', {
      body: {
        mode: 'fashion-rating',
        prompt: 'Review this finished fashion-game look and explain clearly how it could reach 100 percent.',
        imageData: characterImage.split(',')[1] ?? '',
        mimeType: characterImage.startsWith('data:image/jpeg') ? 'image/jpeg' : characterImage.startsWith('data:image/webp') ? 'image/webp' : 'image/png',
      },
    });
    setRatingLoading(false);
    if (error || data?.error || typeof data?.score !== 'number') {
      setRatingError(data?.error ?? await functionErrorMessage(error, 'The AI could not rate this look. Please try again.'));
      return;
    }
    setAiRating({ score: data.score, verdict: data.verdict, missing: data.missing ?? [] });
  };

  const startOver = () => {
    sessionId.current = crypto.randomUUID();
    setGender(null);
    setCharacterImage('');
    setPendingCharacterImage('');
    setSaved(false);
    setStylingMode(null);
    setAiRating(null);
    setRatingError('');
    setShowSelfRating(false);
    setMessages([{ id: Date.now(), role: 'assistant', text: 'Choose Man or Woman to create a new fashion character.' }]);
  };

  const leaveGame = () => {
    putStoredValue('active-session', {
      id: sessionId.current, gender, characterImage, pendingCharacterImage, editingPendingCharacter,
      stylingMode, messages, input, characterHeight, characterWeight, characterAge, skinTone, eyeColor, hairstyle,
      tshirt, sweater, bottom, socks, shoes, customizationOpen, occasion, season, budget, aiOptionsOpen,
    } satisfies GameSession).catch(() => undefined);
    if (messages.length > 1) {
      const compactMessages = messages.map(({ image: _image, ...message }) => message);
      const entry: ChatHistory = { id: sessionId.current, gender, characterImage, stylingMode, messages: compactMessages, updatedAt: Date.now() };
      const next = [entry, ...chatHistory.filter((item) => item.id !== entry.id)].slice(0, 20);
      putStoredValue('chat-history', next).catch(() => undefined);
    }
    onBack();
  };

  const touchDistance = (event: TouchEvent) => {
    const [first, second] = Array.from(event.touches);
    return first && second ? Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY) : 0;
  };

  const startPinch = (event: TouchEvent) => {
    if (event.touches.length === 2) pinchStart.current = { distance: touchDistance(event), zoom: lookZoom };
  };

  const movePinch = (event: TouchEvent) => {
    if (event.touches.length !== 2 || !pinchStart.current) return;
    event.preventDefault();
    const next = pinchStart.current.zoom * (touchDistance(event) / pinchStart.current.distance);
    setLookZoom(Math.max(1, Math.min(4, next)));
  };

  const openImageZoom = (image: string) => {
    setLookZoom(1);
    setLookZoomImage(image);
    setLookZoomOpen(true);
  };

  return <main className={`fashion-chat-page chat-theme-${theme}`}>
    <header className="fashion-chat-header">
      <button onClick={leaveGame}>← Home</button>
      <div><span>CYL</span><strong>Fashion AI</strong></div>
      <nav className="chat-header-actions">
        <button onClick={() => setLibraryOpen(true)}>♡ Saved ({savedCharacters.length})</button>
        <button onClick={() => setHistoryOpen(true)}>☰ Chat History</button>
        <button onClick={startOver}>＋ New</button>
      </nav>
    </header>

    <section className="fashion-chat-shell">
      <aside className="fashion-character-preview">
        <div>{characterImage ? <><img src={characterImage} alt="Current fashion character" /><button className="look-magnifier" onClick={() => openImageZoom(characterImage)} aria-label="View the complete result">⌕</button></> : <><b>✦</b><strong>Your character</strong><span>Describe it in the chat and Gemini will create it.</span></>}</div>
        {characterImage && <a className="download-look" href={characterImage} download="cyl-fashion-look.png">↓ Download Look</a>}
        <button disabled={!characterImage} onClick={save}>{saved ? '✓ Character saved' : '♡ Save character'}</button>
        {characterImage && <section className="look-rating">
          <span>FINISHED YOUR LOOK?</span>
          <div className="rating-buttons">
            <button onClick={rateWithAi} disabled={ratingLoading}>{ratingLoading ? 'Rating…' : '✦ Rate with AI'}</button>
            <button onClick={() => setShowSelfRating((value) => !value)}>Rate it myself</button>
          </div>
          {ratingError && <p className="rating-error">{ratingError}</p>}
          {aiRating && <div className="ai-rating-result">
            <strong>{aiRating.score}<small>%</small></strong>
            <div><b>{aiRating.verdict}</b>{aiRating.missing.length > 0
              ? <><span>What is missing for 100%:</span><ul>{aiRating.missing.map((item) => <li key={item}>{item}</li>)}</ul></>
              : <span>This look has everything it needs.</span>}</div>
          </div>}
          {showSelfRating && <label className="self-rating"><span>MY RATING <b>{selfRating}%</b></span><input type="range" min="0" max="100" value={selfRating} onChange={(event) => setSelfRating(Number(event.target.value))} /></label>}
        </section>}
      </aside>

      <section className="fashion-conversation">
        <div className="chat-messages">
          {messages.map((message) => <article key={message.id} className={`chat-message chat-${message.role}`}>
            <i>{message.role === 'assistant' ? '✦' : 'YOU'}</i>
            <div><p>{message.text}</p>{message.image && <div className="chat-result-image"><img src={message.image} alt="Complete generated fashion result" /><div><button onClick={() => openImageZoom(message.image!)}>⌕ View full image</button><a href={message.image} download="cyl-fashion-result.png">↓ Download</a></div></div>}</div>
          </article>)}
          {loading && <article className="chat-message chat-assistant chat-thinking"><i>✦</i><div><p>Gemini is designing your look…</p><span><b /><b /><b /></span></div></article>}
          <div ref={endRef} />
        </div>

        {!gender && <div className="gender-choice">
          <span>WHO DO YOU WANT TO CREATE?</span>
          <div><button onClick={() => chooseGender('man')}><b>MAN</b><small>Create a male character</small></button><button onClick={() => chooseGender('woman')}><b>WOMAN</b><small>Create a female character</small></button></div>
          {savedCharacters.length > 0 && <button className="load-character" onClick={() => setLibraryOpen(true)}>Open my saved characters ({savedCharacters.length})</button>}
        </div>}

        {gender && !characterImage && !pendingCharacterImage && customizationOpen && <div className="character-customization-panel"><section className="character-measurements">
          <span>QUICK CHARACTER DETAILS</span>
          <div>
            <label><span>HEIGHT <b>{characterHeight} cm</b></span><input type="range" min="120" max="210" value={characterHeight} onChange={(event) => setCharacterHeight(Number(event.target.value))} /><small>1.20 m</small><small>2.10 m</small></label>
            <label><span>WEIGHT <b>{characterWeight} kg</b></span><input type="range" min="35" max="160" value={characterWeight} onChange={(event) => setCharacterWeight(Number(event.target.value))} /><small>35 kg</small><small>160 kg</small></label>
            <label><span>AGE <b>{characterAge} years</b></span><input type="range" min="6" max="90" value={characterAge} onChange={(event) => setCharacterAge(Number(event.target.value))} /><small>CHILD · 6</small><small>OLDER · 90</small></label>
          </div>
          <p>BODY PROPORTION <strong>{characterWeight / ((characterHeight / 100) ** 2) < 19 ? 'SLIM' : characterWeight / ((characterHeight / 100) ** 2) < 25 ? 'BALANCED' : characterWeight / ((characterHeight / 100) ** 2) < 30 ? 'BROAD' : 'PLUS-SIZE'}</strong></p>
        </section>

        <CharacterQuickDetails skinTone={skinTone} eyeColor={eyeColor} hairstyle={hairstyle} tshirt={tshirt} sweater={sweater} bottom={bottom} socks={socks} shoes={shoes} onChange={changeQuickDetail} />
        <button type="submit" form="fashion-chat-form" className="close-customization" onClick={() => setCustomizationOpen(false)}>✓ FINISH PERSONALIZATION</button>
        </div>}

        {gender && !characterImage && !pendingCharacterImage && !customizationOpen && <button type="button" className="open-customization" onClick={() => setCustomizationOpen(true)}>✎ <span>PERSONALIZATION</span></button>}

        {gender && characterImage && !stylingMode && <div className="styling-mode-choice">
          <span>WHO CREATES THE OUTFIT?</span>
          <div>
            <button onClick={() => chooseStylingMode('manual')}><b>I CHOOSE</b><small>Add only the items I request</small></button>
            <button onClick={() => chooseStylingMode('ai')}><b>AI STYLIST</b><small>Create a complete model look</small></button>
          </div>
        </div>}

        {gender && pendingCharacterImage && <div className="finalize-character-panel">
          <span>{editingPendingCharacter ? 'WHAT WOULD YOU LIKE TO ADD?' : 'FINISH OR ADD SOMETHING?'}</span>
          <div>
            <button onClick={finalizeCharacter}>✓ Finish Character</button>
            {!editingPendingCharacter && <button className="add-character-detail" onClick={() => setEditingPendingCharacter(true)}>＋ Add Something</button>}
          </div>
        </div>}

        {gender && characterImage && stylingMode && <div className="active-styling-mode">
          <span>{stylingMode === 'manual' ? 'I CHOOSE · ONLY REQUESTED ITEMS' : 'AI STYLIST · COMPLETE LOOK'}</span>
          <button onClick={() => setStylingMode(null)}>Change mode</button>
        </div>}

        {gender && characterImage && stylingMode === 'ai' && aiOptionsOpen && <section className="ai-look-options">
          <div><label>OCCASION<select value={occasion} onChange={(event) => setOccasion(event.target.value)}><option>Everyday</option><option>School</option><option>Party</option><option>Wedding</option><option>Job interview</option><option>Date night</option><option>Sport</option><option>Travel</option></select></label><label>SEASON<select value={season} onChange={(event) => setSeason(event.target.value)}><option>All season</option><option>Spring</option><option>Summer</option><option>Autumn</option><option>Winter</option></select></label></div>
          <label className="virtual-budget"><span>VIRTUAL BUDGET <b>€{budget}</b></span><input type="range" min="50" max="1000" step="50" value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></label>
          <button type="button" className="finish-ai-options" onClick={submitAiStylistOptions}>✓ SEND TO CHAT</button>
        </section>}

        {gender && characterImage && stylingMode === 'ai' && !aiOptionsOpen && <button type="button" className="open-ai-options" onClick={() => setAiOptionsOpen(true)}>✎ AI STYLIST OPTIONS</button>}

        <label className="fashion-chat-label" htmlFor="fashion-extra-chat">CHAT · ADD EXTRA DETAILS</label>
        <form id="fashion-chat-form" className="fashion-chat-input" onSubmit={send}>
          <textarea id="fashion-extra-chat" value={input} disabled={!gender || loading || Boolean(pendingCharacterImage && !editingPendingCharacter) || Boolean(characterImage && !stylingMode)} onChange={(event) => setInput(event.target.value)} placeholder={pendingCharacterImage ? editingPendingCharacter ? 'Write what you want to add or change…' : 'Choose Finish or Add Something…' : characterImage ? stylingMode ? 'Chat: describe the clothes or changes you want…' : 'Choose an outfit mode first…' : gender ? 'Optional chat: hair colour, eye colour, eye shape, skin tone, age…' : 'Choose Man or Woman first…'} rows={1} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
          <button disabled={!gender || loading || Boolean(pendingCharacterImage ? !editingPendingCharacter || !input.trim() : characterImage ? !stylingMode || !input.trim() : false)} aria-label="Send">↑</button>
        </form>
        <small className="chat-note">AI images may vary. Avoid entering private information.</small>
      </section>
    </section>

    {libraryOpen && <div className="fashion-library-backdrop" onClick={() => setLibraryOpen(false)}>
      <section className="fashion-library" onClick={(event) => event.stopPropagation()}>
        <header><div><span>MY COLLECTION</span><strong>Saved Characters</strong></div><button onClick={() => setLibraryOpen(false)}>×</button></header>
        {savedCharacters.length === 0 ? <p className="empty-library">No saved character yet.</p> : <div className="library-grid">{savedCharacters.map((character, index) => <article key={character.id}>
          <div className="saved-character-number"><span>CHARACTER</span><strong>{savedCharacters.length - index}</strong></div>
          <small>{character.gender.toUpperCase()} · {new Date(character.savedAt).toLocaleDateString()}</small>
          <div><button onClick={() => restoreSaved(character)}>Open</button><button onClick={() => deleteCharacter(character.id)}>Delete</button></div>
        </article>)}</div>}
      </section>
    </div>}

    {historyOpen && <div className="fashion-library-backdrop" onClick={() => setHistoryOpen(false)}>
      <section className="fashion-library chat-history-panel" onClick={(event) => event.stopPropagation()}>
        <header><div><span>YOUR CONVERSATIONS</span><strong>Chat History</strong></div><div className="history-header-actions">{chatHistory.length > 0 && <button onClick={deleteAllChats}>Delete all</button>}<button onClick={() => setHistoryOpen(false)}>×</button></div></header>
        {chatHistory.length === 0 ? <p className="empty-library">Your conversations will appear here automatically.</p> : <div className="history-list">{chatHistory.map((chat) => {
          const firstRequest = chat.messages.find((message) => message.role === 'user')?.text ?? 'Fashion conversation';
          return <article key={chat.id}>{chat.characterImage ? <img src={chat.characterImage} alt="Chat look" /> : <i>✦</i>}<div><b>{firstRequest}</b><small>{new Date(chat.updatedAt).toLocaleString()} · {chat.messages.length} messages</small></div><button onClick={() => restoreChat(chat)}>Open</button><button className="delete-history" onClick={() => deleteChat(chat.id)}>×</button></article>;
        })}</div>}
      </section>
    </div>}
    {lookZoomOpen && lookZoomImage && <div className="look-zoom-dialog" onClick={() => setLookZoomOpen(false)} role="dialog" aria-modal="true" aria-label="Complete result zoom">
      <header onClick={(event) => event.stopPropagation()}><div><strong>YOUR FINAL LOOK</strong><small>Pinch with two fingers to zoom</small></div><button onClick={() => setLookZoomOpen(false)}>×</button></header>
      <div className="look-zoom-viewport" onClick={(event) => event.stopPropagation()} onTouchStart={startPinch} onTouchMove={movePinch} onTouchEnd={() => { pinchStart.current = null; }}><img src={lookZoomImage} alt="Complete result enlarged" style={{ transform: `scale(${lookZoom})` }} /></div>
      <nav onClick={(event) => event.stopPropagation()}><button onClick={() => setLookZoom((value) => Math.max(1, value - .25))}>−</button><span>{Math.round(lookZoom * 100)}%</span><button onClick={() => setLookZoom((value) => Math.min(4, value + .25))}>＋</button><a href={lookZoomImage} download="cyl-fashion-result.png">↓ Download</a></nav>
    </div>}
  </main>;
}
