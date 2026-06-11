

import React, { useState, useRef, useEffect } from 'react';
import type { Source, GalleryImage, Theme, CodeContent } from '../types';
import { themes } from './UI';

interface SettingsPanelProps {
  source: Source;
  onUpdate: (id: string, updates: Partial<Source> | ((s: Source) => Partial<Source>)) => void;
  onClose: () => void;
  theme: Theme;
}

const SettingsInput: React.FC<{label: string, children: React.ReactNode, className?: string, theme: Theme}> = ({label, children, className, theme}) => {
    const themeClasses = themes[theme];
    return (
        <div className={`mb-3 ${className}`}>
            <label className={`block text-xs font-bold mb-1 uppercase ${themeClasses.label}`}>{label}</label>
            {children}
        </div>
    );
};

const fontStyles = [
  { id: 'default', name: 'Default' },
  { id: 'gothic', name: 'Gothic' },
  { id: 'doubleStruck', name: 'Double-Struck' },
  { id: 'asian', name: 'Asian Style' },
  { id: 'circled', name: 'Circled' },
  { id: 'circledNegative', name: 'Circled (Negative)' },
  { id: 'squared', name: 'Squared' },
  { id: 'flag', name: 'Flag' },
  { id: 'slashed', name: 'Slashed' },
  { id: 'monospace', name: 'Monospace' },
  { id: 'superscript', name: 'Superscript' },
  { id: 'bold', name: 'Bold' },
];

const textStyleOptions = [
  { id: 'none', name: 'Normal / None' },
  { id: 'boldSerif', name: 'Bold Serif 𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳' },
  { id: 'boldSans', name: 'Bold Sans 𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝒋𝒌𝒍𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇' },
  { id: 'italic', name: 'Italic 𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛_𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧' },
  { id: 'boldItalic', name: 'Bold Italic 𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛' },
  { id: 'cursiveScript', name: 'Cursive / Script (Your example) 𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽<i>𝒿𝓀𝓁𝓂Externalℴ𝓅𝓆𝓇External𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏' },
  { id: 'boldCursive', name: 'Bold Cursive 𝓪𝓫🇨🇩𝓮𝓯𝓰𝓱_𝓲_𝓳𝓴_𝓵_🇲🇳𝓸𝓹𝓺𝓻𝓼...' },
  { id: 'frakturGothic', name: 'Fraktur / Gothic 𝔞𝔟𝔠𝔡𝔢... (Gothic)' },
  { id: 'boldGothic', name: 'Bold Gothic 𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒...' },
  { id: 'doubleStruck', name: 'Double Struck (Outline) 𝕔𝕝𝕒𝕤𝕤 𝕔𝕠𝕟𝕤𝕥...' },
  { id: 'monospaceTypewriter', name: 'Monospace (Typewriter) 𝚊𝚋𝚌𝚍...' },
  { id: 'smallCaps', name: 'Small Caps ᴀʙᴄᴅᴇғɢʜɪᴊᴋ... ' },
  { id: 'fullwidth', name: 'Fullwidth ａｂｃｄｅｆｇｈｉｊ...' },
  { id: 'squared', name: 'Squared 🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉' },
  { id: 'upsideDown', name: 'Upside Down zʎxʍʌnʇsɹpouʞlɯıɥƃɟǝpɔqɐ' },
  { id: 'doubleStruckRepeated', name: 'Double Struck (Outline) 𝕔𝕝𝕒𝕤𝕤 𝕔𝕠𝕟𝕤𝕥... [repeat]' },
  { id: 'frakturGothicRepeated', name: 'Fraktur (Gothic) 𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧... [repeat]' },
  { id: 'boldFraktur', name: 'Bold Fraktur 𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍...' },
  { id: 'scriptElegant', name: 'Script (Elegant) 𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽...' },
  { id: 'boldScript', name: 'Bold Script 𝓪𝓫🇨🇩𝓮𝓯...' },
  { id: 'monospaceCode', name: 'Monospace (Code) 𝚊𝚋𝚌𝚍...' },
  { id: 'sansSerif', name: 'Sans-Serif 𝖺𝖻𝖼𝖽𝖾𝖿...' },
  { id: 'boldSansSerif', name: 'Bold Sans-Serif 𝗮𝗯𝗰... ' },
  { id: 'sansSerifItalic', name: 'Sans-Serif Italic 𝘢𝘣𝘤𝘥...' },
  { id: 'boldSansSerifItalic', name: 'Bold Sans-Serif Italic 𝙖𝙗𝙘𝙙...' },
  { id: 'fullwidthSpaced', name: 'Fullwidth (Spaced) a b c d e...' },
  { id: 'circledBubble', name: 'Circled (Bubble) ⓐⓑⓒⓓⓔⓕ...' },
  { id: 'negativeCircled', name: 'Negative Circled 🅐🅑🅒🅓🅔🅕...' },
  { id: 'parenthesized', name: 'Parenthesized ⒜⒝⒞⒟⒠...' },
  { id: 'smallCapsRepeated', name: 'Small Caps ᴀʙᴄᴅᴇғɢʜ... [repeat]' },
  { id: 'superscriptTiny', name: 'Superscript (Tiny) ᵃᵇᶜᵈᵉ...' },
  { id: 'invertedUpsideDownRepeated', name: 'Inverted (Upside Down) zʎxʍ... [repeat]' },
  { id: 'tagSpecial', name: 'Tag (Special Unicode) 𝚊𝚋𝚌𝚍...' }
];

const matrixRainHTML = `<canvas id="canvas"></canvas>`;
const matrixRainCSS = `body, html { margin: 0; padding: 0; overflow: hidden; background-color: transparent; } canvas { display: block; }`;

const matrixRainJS_template = (size: number, speed: number, color: string) => `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
const fontSize = ${size};
const columns = canvas.width / fontSize;

const drops = Array.from({ length: columns }, () => ({
    y: Math.random() * -100, // Start above the screen randomly
    speed: (Math.random() * 0.5 + 0.5) * ${speed} // Varied speeds look nicer
}));

function draw() {
    // 1. Clear the canvas completely so it stays transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        
        // 2. Loop backwards to draw the trail behind the head of the drop
        const trailLength = 15; 
        for (let j = 0; j < trailLength; j++) {
            const trailY = drop.y - j;
            if (trailY < 0) continue; // Don't draw off-screen

            // Calculate opacity: the head (j=0) is bright, the tail (j=14) fades out
            const opacity = 1 - (j / trailLength);
            
            const text = letters[Math.floor(Math.random() * letters.length)];
            
            // Apply the opacity to the custom color using globalAlpha
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '${color}';
            ctx.fillText(text, i * fontSize, trailY * fontSize);
            ctx.restore();
        }

        // Move the drop down
        drop.y += drop.speed;

        // Reset drop to the top if it goes off screen
        if (drop.y * fontSize > canvas.height && Math.random() > 0.975) {
            drop.y = 0;
        }
    }
}

const interval = setInterval(draw, 33);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});`;

const snowHTML = `<canvas id="canvas"></canvas>`;
const snowCSS = `body { background-color: transparent; margin: 0; overflow: hidden; } canvas { display: block; }`;

const snowJS_template = (size: number, speed: number, color: string) => `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    const particleCount = 200;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * ${size} + 1,
            speed: (Math.random() * 2 + 1) * ${speed},
        });
    }
}
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.y += p.speed;
        if (p.y > canvas.height) {
            p.y = -p.radius;
            p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '${color}';
        ctx.fill();
    });
}
window.addEventListener('resize', resize);
resize();
animate();`;

const starTunnelHTML = `<canvas id="canvas"></canvas>`;
const starTunnelCSS = `body { background-color: transparent; margin: 0; overflow: hidden; } canvas { display: block; }`;

const starTunnelJS_template = (size: number, speed: number, color: string) => `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width, height;
let stars = [];
const numStars = 400;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: (Math.random() - 0.5) * width,
            y: (Math.random() - 0.5) * height,
            z: Math.random() * width,
        });
    }
}
function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        star.z -= 2 * ${speed};
        if (star.z <= 0) {
            star.x = (Math.random() - 0.5) * width;
            star.y = (Math.random() - 0.5) * height;
            star.z = width;
        }
        const k = 128.0 / star.z;
        const px = star.x * k;
        const py = star.y * k;
        const s = (1 - star.z / width) * ${size};
        ctx.beginPath();
        ctx.fillStyle = '${color}';
        ctx.arc(px, py, Math.max(0.1, s), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    requestAnimationFrame(draw);
}
window.addEventListener('resize', resize);
resize();
draw();`;

const getDefaultPresetSize = (presetName: string) => {
  if (presetName === 'matrixRain') return 10;
  if (presetName === 'snow') return 4;
  if (presetName === 'starTunnel') return 5;
  return 10;
};

const getDefaultPresetColor = (presetName: string) => {
  if (presetName === 'matrixRain') return '#00ff00';
  return '#ffffff';
};

const detectPresetType = (content: CodeContent): string => {
  if (!content || !content.js) return 'custom';
  if (content.js.includes("letters") && (content.js.includes("drops") || content.js.includes("drop.y") || content.js.includes("fontSize"))) return 'matrixRain';
  if (content.js.includes("particles") && (content.js.includes("p.radius") || content.js.includes("particleCount"))) return 'snow';
  if (content.js.includes("numStars") && (content.js.includes("star.z") || content.js.includes("stars") || content.js.includes("starTunnel"))) return 'starTunnel';
  return 'custom';
};

interface CustomPreset {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
}


const SettingsPanel: React.FC<SettingsPanelProps> = ({ source, onUpdate, onClose, theme }) => {
  const [localSource, setLocalSource] = useState(source);
  const [ytInputValue, setYtInputValue] = useState(source.type === 'youtube' ? (source.content as string) : '');
  
  // Twitch states
  const initialTwitchContent = source.type === 'twitch' ? (source.content as any) : null;
  const [twitchChannel, setTwitchChannel] = useState(initialTwitchContent?.channel || 'albiar');
  const [twitchParent, setTwitchParent] = useState(initialTwitchContent?.parent || window.location.hostname || 'localhost');
  const [twitchUrlInput, setTwitchUrlInput] = useState(initialTwitchContent?.urlInput || (initialTwitchContent?.channel ? `https://www.twitch.tv/${initialTwitchContent.channel}` : 'https://www.twitch.tv/albiar'));
  const [twitchLayout, setTwitchLayout] = useState<'video' | 'video-with-chat' | 'chat-only'>(initialTwitchContent?.layout || 'video-with-chat');
  const [twitchAutoplay, setTwitchAutoplay] = useState(initialTwitchContent?.autoplay !== false);
  const [twitchMuted, setTwitchMuted] = useState(initialTwitchContent?.muted === true);
  const [twitchTheme, setTwitchTheme] = useState<'light' | 'dark'>(initialTwitchContent?.theme || 'dark');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [activePreset, setActivePreset] = useState<string>('custom');
  const [videoDuration, setVideoDuration] = useState<number>(100);

  useEffect(() => {
    setLocalSource(source);
    if (source.type === 'youtube') {
      setYtInputValue(source.content as string);
    }
    if (source.type === 'twitch') {
      const tc = source.content as any;
      const chan = tc?.channel || '';
      setTwitchChannel(chan);
      setTwitchParent(tc?.parent || window.location.hostname || 'localhost');
      setTwitchUrlInput(tc?.urlInput || (chan ? `https://www.twitch.tv/${chan}` : ''));
      setTwitchLayout(tc?.layout || 'video-with-chat');
      setTwitchAutoplay(tc?.autoplay !== false);
      setTwitchMuted(tc?.muted === true);
      setTwitchTheme(tc?.theme || 'dark');
    }
  }, [source]);

  useEffect(() => {
    if (source.type === 'video' && source.content) {
      const tempVideo = document.createElement('video');
      tempVideo.src = source.content as string;
      const handleLoadedMetadata = () => {
        if (tempVideo.duration) {
          setVideoDuration(tempVideo.duration);
        }
      };
      tempVideo.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        tempVideo.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [source.content, source.type]);
  
  const themeClasses = themes[theme];

  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('scene_builder_custom_presets');
      if (stored) {
        setCustomPresets(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load custom presets", e);
    }
  }, []);

  const saveCustomPresets = (updated: CustomPreset[]) => {
    setCustomPresets(updated);
    try {
      localStorage.setItem('scene_builder_custom_presets', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save custom presets", e);
    }
  };

  const detectedPreset = source.type === 'code' ? detectPresetType(source.content as CodeContent) : 'custom';

  const presets = {
      matrixRain: { 
          html: matrixRainHTML, 
          css: matrixRainCSS, 
          js: matrixRainJS_template(
              localSource.style.codeSize ?? getDefaultPresetSize('matrixRain'),
              localSource.style.codeSpeed ?? 1.0,
              localSource.style.codeColor ?? getDefaultPresetColor('matrixRain')
          ) 
      },
      snow: { 
          html: snowHTML, 
          css: snowCSS, 
          js: snowJS_template(
              localSource.style.codeSize ?? getDefaultPresetSize('snow'),
              localSource.style.codeSpeed ?? 1.0,
              localSource.style.codeColor ?? getDefaultPresetColor('snow')
          ) 
      },
      starTunnel: { 
          html: starTunnelHTML, 
          css: starTunnelCSS, 
          js: starTunnelJS_template(
              localSource.style.codeSize ?? getDefaultPresetSize('starTunnel'),
              localSource.style.codeSpeed ?? 1.0,
              localSource.style.codeColor ?? getDefaultPresetColor('starTunnel')
          ) 
      },
  };

  useEffect(() => {
    if (source.type === 'code') {
        const currentContent = source.content as CodeContent;
        
        // 1. Check if it matches a custom saved preset
        const customMatched = customPresets.find(p => p.html === currentContent.html && p.css === currentContent.css && p.js === currentContent.js);
        if (customMatched) {
            setActivePreset(customMatched.id);
            return;
        }

        // 2. Check if it matches a detected built-in preset
        const presetType = detectPresetType(currentContent);
        if (presetType !== 'custom') {
            setActivePreset(presetType);
            return;
        }
    }
    setActivePreset('custom');
  }, [source.content, source.type, customPresets]);

  const handleStyleChange = <K extends keyof Source['style']>(key: K, value: Source['style'][K]) => {
    const updatedStyle = { ...localSource.style, [key]: value };
    setLocalSource({ ...localSource, style: updatedStyle });
    onUpdate(source.id, (s) => ({ style: { ...s.style, [key]: value }}));
  };

  const handleMultipleStylesChange = (updates: Partial<Source['style']>) => {
    const updatedStyle = { ...localSource.style, ...updates };
    setLocalSource({ ...localSource, style: updatedStyle });
    onUpdate(source.id, (s) => ({ style: { ...s.style, ...updates }}));
  };

  const applySizePreset = (preset: 'full' | '240' | '480' | '720' | '1080') => {
    let w = localSource.style.width;
    let h = localSource.style.height;
    let x = localSource.style.x;
    let y = localSource.style.y;

    if (preset === 'full') {
      w = window.innerWidth;
      h = window.innerHeight;
      x = 0;
      y = 0;
    } else if (preset === '240') {
      w = 426;
      h = 240;
    } else if (preset === '480') {
      w = 854;
      h = 480;
    } else if (preset === '720') {
      w = 1280;
      h = 720;
    } else if (preset === '1080') {
      w = 1920;
      h = 1080;
    }

    if (preset !== 'full') {
      const currentCenterX = localSource.style.x + localSource.style.width / 2;
      const currentCenterY = localSource.style.y + localSource.style.height / 2;
      x = currentCenterX - w / 2;
      y = currentCenterY - h / 2;
    }

    handleMultipleStylesChange({ width: w, height: h, x, y });
  };

  const centerSourceOnCanvas = () => {
    const w = localSource.style.width;
    const h = localSource.style.height;
    const x = (window.innerWidth - w) / 2;
    const y = (window.innerHeight - h) / 2;
    handleMultipleStylesChange({ x, y });
  };
  
  const handleSourceChange = <K extends keyof Source>(key: K, value: Source[K]) => {
    const updatedSource = { ...localSource, [key]: value };
    setLocalSource(updatedSource);
    onUpdate(source.id, { [key]: value });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        handleSourceChange('content', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gallery-specific handlers
  const handleGalleryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        addGalleryImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const addGalleryImage = (url: string) => {
    if (!url) return;
    const newImage: GalleryImage = { id: `img-${Date.now()}`, url, visible: true };
    const newContent = [...(localSource.content as GalleryImage[]), newImage];
    handleSourceChange('content', newContent);
    setGalleryUrl('');
  };

  const updateGalleryImage = (imgId: string, updates: Partial<GalleryImage>) => {
    const newContent = (localSource.content as GalleryImage[]).map(img => img.id === imgId ? {...img, ...updates} : img);
    handleSourceChange('content', newContent);
  };
  
  const removeGalleryImage = (imgId: string) => {
    const newContent = (localSource.content as GalleryImage[]).filter(img => img.id !== imgId);
    handleSourceChange('content', newContent);
  };

  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    const images = [...(localSource.content as GalleryImage[])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    [images[index], images[targetIndex]] = [images[targetIndex], images[index]];
    handleSourceChange('content', images);
  };

  const handleCodeContentChange = (field: 'html' | 'css' | 'js', value: string) => {
      const newContent = { ...(localSource.content as CodeContent), [field]: value };
      handleSourceChange('content', newContent);
  }

  const updatePresetJS = (presetName: string, sizeVal: number, speedVal: number, colorVal: string) => {
    let jsCode = '';
    if (presetName === 'matrixRain') {
      jsCode = matrixRainJS_template(sizeVal, speedVal, colorVal);
    } else if (presetName === 'snow') {
      jsCode = snowJS_template(sizeVal, speedVal, colorVal);
    } else if (presetName === 'starTunnel') {
      jsCode = starTunnelJS_template(sizeVal, speedVal, colorVal);
    } else {
      return;
    }
    const currentCode = localSource.content as CodeContent;
    handleSourceChange('content', { ...currentCode, js: jsCode });
  };

  const handlePresetSliderChange = (field: 'codeSize' | 'codeSpeed' | 'codeColor', value: any) => {
    handleMultipleStylesChange({ [field]: value });

    const size = field === 'codeSize' ? Number(value) : (localSource.style.codeSize ?? getDefaultPresetSize(detectedPreset));
    const speed = field === 'codeSpeed' ? Number(value) : (localSource.style.codeSpeed ?? 1.0);
    const color = field === 'codeColor' ? value : (localSource.style.codeColor ?? getDefaultPresetColor(detectedPreset));

    updatePresetJS(detectedPreset, size, speed, color);
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    const size = getDefaultPresetSize(presetName);
    const speed = 1.0;
    const color = getDefaultPresetColor(presetName);

    handleMultipleStylesChange({
      codeSize: size,
      codeSpeed: speed,
      codeColor: color
    });

    const preset = presets[presetName];
    const jsCode = presetName === 'matrixRain' ? matrixRainJS_template(size, speed, color) :
                   presetName === 'snow' ? snowJS_template(size, speed, color) :
                   presetName === 'starTunnel' ? starTunnelJS_template(size, speed, color) :
                   preset.js;

    handleSourceChange('content', { html: preset.html, css: preset.css, js: jsCode });
    setActivePreset(presetName);
  };

  const commonUrlInput = (label: string, type: 'image' | 'video') => (
    <SettingsInput label={label} theme={theme}>
        <div className="flex space-x-2">
            <input
                type="text"
                value={typeof localSource.content === 'string' && localSource.content.startsWith('data:') ? '(Local File)' : localSource.content as string}
                onChange={(e) => handleSourceChange('content', e.target.value)}
                readOnly={typeof localSource.content === 'string' && localSource.content.startsWith('data:')}
                className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className={`${themeClasses.button} text-xs px-2 rounded ${type === 'image' && !localSource.content ? 'pulse-glow-yellow' : ''}`}
            >
                Upload
            </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={`${type}/*`} className="hidden" />
    </SettingsInput>
  );

  const textInputClass = `w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;
  const codeTextareaClass = `${textInputClass} h-32 resize-y font-mono text-xs`;
  
  const getActiveFilterCount = () => {
    let count = 0;
    const { chromaKey, colorKey, filters } = source.style;
    if (chromaKey?.enabled) count++;
    if (colorKey?.enabled) count++;
    if (filters) {
        if (filters.blur > 0) count++;
        if (filters.hue > 0) count++;
        if (filters.sharpness > 0) count++;
        if (filters.shape !== 'none') count++;
    }
    return count;
  };
  const activeFilterCount = getActiveFilterCount();

  return (
    <div>
      <div className={`p-3 border-b ${themeClasses.border}`}>
        <h2 className="text-lg font-bold truncate">Settings: {localSource.name}</h2>
      </div>

       {activeFilterCount > 0 && (
            <div className={`p-2 bg-blue-900/50 text-blue-300 text-xs rounded mx-3 mt-3 text-center border border-blue-800`}>
                This source has <strong>{activeFilterCount} active filter(s)</strong>. Edit them in the <span className='font-bold'>Filters</span> tab.
            </div>
        )}
        
      <div className="p-3">
        <SettingsInput label="Name" theme={theme}><input type="text" value={localSource.name} onChange={(e) => handleSourceChange('name', e.target.value)} className={textInputClass}/></SettingsInput>

        {source.type === 'image' && (
            <>
                {commonUrlInput('Image URL', 'image')}
                <SettingsInput label="Resize Behavior on Window Resize" theme={theme}>
                    <select
                        value={localSource.style.resizeBehavior || 'static'}
                        onChange={(e) => handleStyleChange('resizeBehavior', e.target.value as any)}
                        className={textInputClass}
                    >
                        <option value="static">Static (Stay at exact size/position)</option>
                        <option value="fill">Fill Screen (Cover entire viewport)</option>
                        <option value="full-width">Full Width (Stretches horizontal)</option>
                        <option value="full-height">Full Height (Stretches vertical)</option>
                        <option value="center">Stay Centered (Keep size but center)</option>
                        <option value="proportional">Stay Aligned (Proportional scale & position)</option>
                    </select>
                </SettingsInput>
            </>
        )}
        {source.type === 'iframe' && 
            <>
                <SettingsInput label="Website URL" theme={theme}>
                    <input type="text" value={localSource.content as string} onChange={(e) => handleSourceChange('content', e.target.value)} className={textInputClass}/>
                    <p className={`text-xs mt-1 ${themeClasses.label}`}>Note: Some websites may not allow embedding.</p>
                </SettingsInput>
                 <SettingsInput label={`Zoom (${(localSource.style.scale || 1).toFixed(2)}x)`} theme={theme}><input type="range" min="0.1" max="5" step="0.01" value={localSource.style.scale || 1} onChange={(e) => handleStyleChange('scale', parseFloat(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}/></SettingsInput>
            </>
        }
        {source.type === 'youtube' && (
            <>
                <SettingsInput label="YouTube Connection Proxy" theme={theme}>
                    <div className="grid grid-cols-3 gap-2">
                        {(['none', 'invidious', 'piped'] as const).map(pKey => (
                            <button
                                key={pKey}
                                type="button"
                                onClick={() => handleStyleChange('youtubeProxy', pKey)}
                                className={`py-1 px-2 text-[10px] font-semibold border rounded transition duration-200 capitalize cursor-pointer active:scale-95 ${
                                    (source.style.youtubeProxy || 'none') === pKey
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : themeClasses.buttonSecondary
                                }`}
                            >
                                {pKey === 'none' ? 'None' : pKey}
                            </button>
                        ))}
                    </div>
                    <p className={`text-[10px] mt-1 ${themeClasses.label} opacity-85 leading-tight`}>
                        Use public instances of Invidious or Piped to bypass connections/restrictions as a proxy stream.
                    </p>
                </SettingsInput>

                <SettingsInput label="YouTube Link, Embed URL or Video ID" theme={theme}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const typed = ytInputValue.trim();
                            if (!typed) return;
                            let ytUrl = typed;
                            let videoId = '';
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                            const match = typed.match(regExp);
                            if (match && match[2].length === 11) {
                                videoId = match[2];
                                ytUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
                            } else if (typed.length === 11 && !typed.includes('http')) {
                                videoId = typed;
                                ytUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
                            } else if (typed && !typed.includes('enablejsapi=1')) {
                                if (typed.includes('?')) {
                                    ytUrl = `${typed}&enablejsapi=1`;
                                } else {
                                    ytUrl = `${typed}?enablejsapi=1`;
                                }
                            }
                            setYtInputValue(ytUrl);
                            handleSourceChange('content', ytUrl);
                        }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={ytInputValue}
                            onChange={(e) => setYtInputValue(e.target.value)}
                            className={`${textInputClass} flex-1`}
                            placeholder="e.g. dQw4w9WgXcQ or https://www.youtube.com/watch?v=..."
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 text-xs rounded transition-colors active:scale-95 cursor-pointer"
                        >
                            Apply
                        </button>
                    </form>
                    <p className={`text-[10px] mt-1.5 ${themeClasses.label} opacity-80 leading-normal`}>
                        Paste any YouTube watch link, copy-paste the share URL, or enter the 11-caracter Video ID and click <strong>Apply</strong>.
                    </p>
                </SettingsInput>


                <SettingsInput label="Video Control Panel" theme={theme}>
                    <div className="flex gap-2 mb-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const iframe = document.getElementById(`youtube-iframe-${source.id}`) as HTMLIFrameElement;
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                                }
                            }}
                            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded bg-green-600 hover:bg-green-500 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95`}
                            title="Play YouTube Video"
                        >
                            ▶️ Play
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const iframe = document.getElementById(`youtube-iframe-${source.id}`) as HTMLIFrameElement;
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                                }
                            }}
                            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded bg-yellow-600 hover:bg-yellow-500 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95`}
                            title="Pause YouTube Video"
                        >
                            ⏸️ Pause
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const iframe = document.getElementById(`youtube-iframe-${source.id}`) as HTMLIFrameElement;
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                                }
                            }}
                            className={`flex-1 py-1 px-2 text-[11px] font-medium rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-all cursor-pointer active:scale-95`}
                            title="Mute Audio"
                        >
                            🔇 Mute
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const iframe = document.getElementById(`youtube-iframe-${source.id}`) as HTMLIFrameElement;
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                                }
                            }}
                            className={`flex-1 py-1 px-2 text-[11px] font-medium rounded bg-zinc-700 hover:bg-zinc-650 text-white transition-all cursor-pointer active:scale-95`}
                            title="Unmute Audio"
                        >
                            🔊 Unmute
                        </button>
                    </div>
                    <p className={`text-[10px] mt-2 text-zinc-500 leading-normal`}>
                        Note: Controls send play/pause and mute/unmute commands directly to the YouTube iframe.
                    </p>
                </SettingsInput>
            </>
        )}

        {source.type === 'twitch' && (
            <>
                <div className={`p-4 border ${themeClasses.border} rounded-xl bg-violet-950/10 border-violet-800/20 mb-4 space-y-4`}>
                    <h4 className="text-violet-400 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎮</span> Twitch Interactive Stream Configurator
                    </h4>
                    
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Insert a Twitch Channel username or a full URL. The parser will automatically isolate the channel ID.
                    </p>

                    {/* Channel URL / Input Field */}
                    <SettingsInput label="Twitch Channel Name or URL" theme={theme}>
                        <div>
                            <input
                                type="text"
                                value={twitchUrlInput}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setTwitchUrlInput(val);
                                    
                                    let parsedChannel = val.trim();
                                    if (parsedChannel.includes('twitch.tv/')) {
                                        const parts = parsedChannel.split('twitch.tv/');
                                        if (parts[1]) {
                                            const sub = parts[1].split(/[/?# ]/);
                                            parsedChannel = sub[0];
                                        }
                                    }
                                    setTwitchChannel(parsedChannel);
                                    handleSourceChange('content', {
                                        channel: parsedChannel,
                                        parent: twitchParent,
                                        urlInput: val,
                                        layout: twitchLayout,
                                        autoplay: twitchAutoplay,
                                        muted: twitchMuted,
                                        theme: twitchTheme
                                    });
                                }}
                                className={`${textInputClass} border-violet-500/30 focus:border-violet-500`}
                                placeholder="e.g. monstercat or https://twitch.tv/monstercat"
                            />
                            {twitchChannel && (
                                <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400">
                                    <span>Active Channel Name:</span>
                                    <span className="font-mono px-1.5 py-0.5 rounded bg-violet-950 border border-violet-800 text-violet-300 font-bold">
                                        {twitchChannel}
                                    </span>
                                </div>
                            )}
                        </div>
                    </SettingsInput>

                    {/* Embedded Layout Selection (With Toggles for Functions) */}
                    <div>
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Interactive Layout Component
                        </span>
                        <div className="grid grid-cols-3 gap-1 bg-zinc-900/60 p-1 border border-zinc-700/40 rounded-lg">
                            <button
                                type="button"
                                onClick={() => {
                                    setTwitchLayout('video-with-chat');
                                    handleSourceChange('content', {
                                        channel: twitchChannel,
                                        parent: twitchParent,
                                        urlInput: twitchUrlInput,
                                        layout: 'video-with-chat',
                                        autoplay: twitchAutoplay,
                                        muted: twitchMuted,
                                        theme: twitchTheme
                                    });
                                }}
                                className={`text-[10px] font-bold py-1.5 rounded-md cursor-pointer transition ${twitchLayout === 'video-with-chat' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                Video + Chat
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTwitchLayout('video');
                                    handleSourceChange('content', {
                                        channel: twitchChannel,
                                        parent: twitchParent,
                                        urlInput: twitchUrlInput,
                                        layout: 'video',
                                        autoplay: twitchAutoplay,
                                        muted: twitchMuted,
                                        theme: twitchTheme
                                    });
                                }}
                                className={`text-[10px] font-bold py-1.5 rounded-md cursor-pointer transition ${twitchLayout === 'video' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                Video Only
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTwitchLayout('chat-only');
                                    handleSourceChange('content', {
                                        channel: twitchChannel,
                                        parent: twitchParent,
                                        urlInput: twitchUrlInput,
                                        layout: 'chat-only',
                                        autoplay: twitchAutoplay,
                                        muted: twitchMuted,
                                        theme: twitchTheme
                                    });
                                }}
                                className={`text-[10px] font-bold py-1.5 rounded-md cursor-pointer transition ${twitchLayout === 'chat-only' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                Chat Only
                            </button>
                        </div>
                    </div>

                    {/* Parent Domain Parameter */}
                    <SettingsInput label="Permitted Parent Domain" theme={theme}>
                        <div className="space-y-1.5">
                            <input
                                type="text"
                                value={twitchParent}
                                onChange={(e) => {
                                    const val = e.target.value.trim();
                                    setTwitchParent(val);
                                    handleSourceChange('content', {
                                        channel: twitchChannel,
                                        parent: val,
                                        urlInput: twitchUrlInput,
                                        layout: twitchLayout,
                                        autoplay: twitchAutoplay,
                                        muted: twitchMuted,
                                        theme: twitchTheme
                                    });
                                }}
                                className={`${textInputClass} border-violet-500/30 focus:border-violet-500`}
                                placeholder="e.g. localhost or customsite.com"
                            />
                            <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-0.5">
                                <span>Required for hosting previews:</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentHost = window.location.hostname || 'localhost';
                                        setTwitchParent(currentHost);
                                        handleSourceChange('content', {
                                            channel: twitchChannel,
                                            parent: currentHost,
                                            urlInput: twitchUrlInput,
                                            layout: twitchLayout,
                                            autoplay: twitchAutoplay,
                                            muted: twitchMuted,
                                            theme: twitchTheme
                                        });
                                    }}
                                    className="px-2 py-0.5 rounded bg-violet-900/60 hover:bg-violet-800 text-violet-200 cursor-pointer font-semibold transition active:scale-95"
                                >
                                    Set to {window.location.hostname || 'localhost'}
                                </button>
                            </div>
                        </div>
                    </SettingsInput>

                    {/* Playback Parameters & Extras, hidden for chat-only */}
                    {twitchLayout !== 'chat-only' && (
                        <div className="pt-1.5 border-t border-violet-900/10 grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={twitchAutoplay}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setTwitchAutoplay(checked);
                                        handleSourceChange('content', {
                                            channel: twitchChannel,
                                            parent: twitchParent,
                                            urlInput: twitchUrlInput,
                                            layout: twitchLayout,
                                            autoplay: checked,
                                            muted: twitchMuted,
                                            theme: twitchTheme
                                        });
                                    }}
                                    className="rounded border-zinc-700 text-violet-600 focus:ring-violet-500 bg-zinc-900 cursor-pointer w-3.5 h-3.5"
                                />
                                <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-200 transition">
                                    Autoplay Stream
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={twitchMuted}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setTwitchMuted(checked);
                                        handleSourceChange('content', {
                                            channel: twitchChannel,
                                            parent: twitchParent,
                                            urlInput: twitchUrlInput,
                                            layout: twitchLayout,
                                            autoplay: twitchAutoplay,
                                            muted: checked,
                                            theme: twitchTheme
                                        });
                                    }}
                                    className="rounded border-zinc-700 text-violet-600 focus:ring-violet-500 bg-zinc-900 cursor-pointer w-3.5 h-3.5"
                                />
                                <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-200 transition">
                                    Muted by Default
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Theme Toggles (Light/Dark style of twitch components) */}
                    <div className="pt-1.5 flex items-center justify-between border-t border-violet-900/10">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Embed Color Style
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setTwitchTheme('dark');
                                    handleSourceChange('content', {
                                        channel: twitchChannel,
                                        parent: twitchParent,
                                        urlInput: twitchUrlInput,
                                        layout: twitchLayout,
                                        autoplay: twitchAutoplay,
                                        muted: twitchMuted,
                                        theme: 'dark'
                                    });
                                }}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${twitchTheme === 'dark' ? 'bg-zinc-800 text-violet-400 border border-violet-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Dark Theme
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTwitchTheme('light');
                                    handleSourceChange('content', {
                                        channel: twitchChannel,
                                        parent: twitchParent,
                                        urlInput: twitchUrlInput,
                                        layout: twitchLayout,
                                        autoplay: twitchAutoplay,
                                        muted: twitchMuted,
                                        theme: 'light'
                                    });
                                }}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${twitchTheme === 'light' ? 'bg-zinc-200 text-zinc-900 border border-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Light Theme
                            </button>
                        </div>
                    </div>
                </div>

                {/* Compilation Preview block with automatic iframe source feedback */}
                <div className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-3 text-[10px] text-zinc-400 space-y-2 mb-4 leading-normal">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-300 uppercase tracking-wider text-[9px]">
                            Generated Live Embed Source
                        </span>
                        <span className="text-[9px] text-violet-400 font-mono font-bold">
                            {twitchLayout === 'chat-only' ? 'CHAT COMPONENT' : 'PLAYER COMPONENT'}
                        </span>
                    </div>
                    <code className="block bg-black p-2 rounded-lg text-[9.5px] break-all text-violet-300 border border-zinc-800/80 leading-normal font-mono select-all">
                        {twitchLayout === 'chat-only'
                            ? `https://www.twitch.tv/embed/${twitchChannel || 'username'}/chat?parent=${twitchParent || 'domain'}`
                            : `https://player.twitch.tv/?channel=${twitchChannel || 'username'}&parent=${twitchParent || 'domain'}&autoplay=${twitchAutoplay}&muted=${twitchMuted}&layout=${twitchLayout}&theme=${twitchTheme}`}
                    </code>
                </div>
            </>
        )}

        {source.type === 'color' && <SettingsInput label="Background Color" theme={theme}><input type="color" value={localSource.content as string} onChange={(e) => handleSourceChange('content', e.target.value)} className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded h-8 p-0 cursor-pointer`}/></SettingsInput>}

        {source.type === 'paint' && <>
            <SettingsInput label="Brush Color" theme={theme}>
                <input type="color" value={localSource.style.brushColor || '#ffffff'} onChange={e => handleStyleChange('brushColor', e.target.value)} className={`w-full h-8 p-0 cursor-pointer ${themeClasses.inputBg} border ${themeClasses.border} rounded`} />
            </SettingsInput>
            <SettingsInput label={`Brush Size (${localSource.style.brushSize || 5}px)`} theme={theme}>
                <input type="range" min="1" max="100" step="1" value={localSource.style.brushSize || 5} onChange={(e) => handleStyleChange('brushSize', parseInt(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </SettingsInput>
        </>}

        {source.type === 'video' && <>
            {commonUrlInput('Video URL', 'video')}
            
            <div className="flex items-center justify-between mt-3 p-1">
                <label className="text-sm font-bold">Playback State</label>
                <button 
                  onClick={() => handleStyleChange('videoPlaying', !(localSource.style.videoPlaying ?? true))} 
                  className={`px-4 py-1 text-xs font-bold rounded-full text-white transition-colors cursor-pointer ${(localSource.style.videoPlaying ?? true) ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                  {(localSource.style.videoPlaying ?? true) ? '⏸️ PAUSED' : '▶️ PLAYING'}
                </button>
            </div>

            <div className="mt-4 mb-4 p-2.5 border border-gray-700/50 rounded bg-gray-900/30">
               <span className="text-[11px] font-bold block mb-2 uppercase tracking-wide text-blue-400">Video Trim Timeline</span>
               
               <div className="mb-3">
                 <div className="flex justify-between text-xs mb-1">
                   <span>Start Playback At:</span>
                   <span className="font-mono font-bold text-blue-400">{(localSource.style.videoStart ?? 0).toFixed(1)}s</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max={videoDuration || 100} 
                   step="0.1"
                   value={localSource.style.videoStart ?? 0} 
                   onChange={e => {
                     const val = parseFloat(e.target.value);
                     const endVal = localSource.style.videoEnd ?? videoDuration;
                     handleStyleChange('videoStart', Math.min(val, endVal - 0.1));
                   }} 
                   className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
                 />
               </div>

               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span>Stop Playback At:</span>
                   <span className="font-mono font-bold text-red-500">{(localSource.style.videoEnd ?? videoDuration).toFixed(1)}s</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max={videoDuration || 100} 
                   step="0.1"
                   value={localSource.style.videoEnd ?? videoDuration} 
                   onChange={e => {
                     const val = parseFloat(e.target.value);
                     const startVal = localSource.style.videoStart ?? 0;
                     handleStyleChange('videoEnd', Math.max(val, startVal + 0.1));
                   }} 
                   className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
                 />
               </div>
            </div>

             <div className="flex items-center justify-between mt-3">
                <label className="text-sm">Loop Video</label>
                <button onClick={() => handleStyleChange('loop', !(localSource.style.loop ?? true))} className={`px-3 py-1 text-xs rounded-full ${(localSource.style.loop ?? true) ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}>
                    {(localSource.style.loop ?? true) ? 'ON' : 'OFF'}
                </button>
            </div>
             <SettingsInput label="Playback Speed" theme={theme}>
              <select value={localSource.style.playbackRate ?? 1} onChange={e => handleStyleChange('playbackRate', parseFloat(e.target.value))} className={textInputClass}>
                  <option value="0.5">0.5x</option><option value="1">1x (Normal)</option><option value="1.5">1.5x</option><option value="2">2x</option>
              </select>
            </SettingsInput>
            <SettingsInput label={`Volume (${Math.round((localSource.style.volume ?? 1) * 100)}%)`} theme={theme}>
                 <input type="range" min="0" max="1" step="0.01" value={localSource.style.volume ?? 1} onChange={e => handleStyleChange('volume', parseFloat(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}/>
            </SettingsInput>
            <div className="flex items-center justify-between">
                <label className="text-sm">Muted</label>
                <button onClick={() => handleStyleChange('muted', !(localSource.style.muted ?? true))} className={`px-3 py-1 text-xs rounded-full ${(localSource.style.muted ?? true) ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}>
                    {(localSource.style.muted ?? true) ? 'ON' : 'OFF'}
                </button>
            </div>
        </>}
        
        {source.type === 'text' && <>
            <SettingsInput label="Text Content" theme={theme}><textarea value={localSource.content as string} onChange={(e) => handleSourceChange('content', e.target.value)} className={`${textInputClass} h-24 resize-y`}/></SettingsInput>
            <div className="grid grid-cols-2 gap-x-4">
              <SettingsInput label="Font Style" theme={theme}>
                <select value={localSource.style.fontFamily || 'default'} onChange={e => handleStyleChange('fontFamily', e.target.value)} className={textInputClass}>
                  {fontStyles.map(font => (
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>
              </SettingsInput>
              <SettingsInput label="Text Style" theme={theme}>
                <select value={localSource.style.textStyle || 'none'} onChange={e => handleStyleChange('textStyle', e.target.value)} className={textInputClass}>
                  {textStyleOptions.map(style => (
                    <option key={style.id} value={style.id}>{style.name}</option>
                  ))}
                </select>
              </SettingsInput>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <SettingsInput label="Font Size" theme={theme}><input type="number" value={localSource.style.fontSize} onChange={e => handleStyleChange('fontSize', parseInt(e.target.value))} className={textInputClass}/></SettingsInput>
              <SettingsInput label="Font Color" theme={theme}><input type="color" value={localSource.style.textColor} onChange={e => handleStyleChange('textColor', e.target.value)} className={`w-full h-8 p-0 cursor-pointer ${themeClasses.inputBg} border ${themeClasses.border} rounded`}/></SettingsInput>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <SettingsInput label="Font Weight" theme={theme}><select value={localSource.style.fontWeight} onChange={e => handleStyleChange('fontWeight', e.target.value as Source['style']['fontWeight'])} className={textInputClass}><option value="normal">Normal</option><option value="bold">Bold</option></select></SettingsInput>
              <SettingsInput label="Text Align" theme={theme}><select value={localSource.style.textAlign} onChange={e => handleStyleChange('textAlign', e.target.value as Source['style']['textAlign'])} className={textInputClass}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></SettingsInput>
            </div>
        </>}
        
        {source.type === 'emoji' && (
          <>
            <div className={`mb-3 p-2 border rounded-md ${themeClasses.border} ${themeClasses.inputBg}`}>
              <label className="text-xs font-bold block mb-1 text-gray-400 uppercase tracking-wider">Select Emoji</label>
              <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1 text-center select-none bg-slate-950/20 rounded">
                {[
                  '😀', '😂', '🥰', '😎', '🤔', '🤫', '🔥', '✨', '🎉', '🚀', '💯', '❤️', '👑', '👀', '⚡', '💻', 
                  '🎯', '🎮', '👾', '🎨', '🎵', '🍿', '🍕', '🍔', '🍩', '🌈', '🐱', '🐶', '🦁', '👽', '💀', '💩', 
                  '💡', '📣', '💬', '⚙️', '⚠️', '✅', '❌', '📌', '🎁', '🔑', '🔒', '🔔', '📱', '📅', '🏆', '💎'
                ].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleSourceChange('content', emoji)}
                    className={`text-xl p-1 rounded hover:scale-125 hover:bg-indigo-600 transition-all flex items-center justify-center cursor-pointer ${localSource.content === emoji ? 'bg-indigo-600 border border-indigo-400 shadow-md ring-1 ring-indigo-500 scale-110' : ''}`}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <SettingsInput label="Or enter custom Emoji/Text" theme={theme}>
              <input
                type="text"
                value={localSource.content as string}
                onChange={(e) => {
                  handleSourceChange('content', e.target.value);
                }}
                className={textInputClass}
                placeholder="Type emoji here..."
              />
            </SettingsInput>

            <div className="grid grid-cols-2 gap-x-4">
              <SettingsInput label="Emoji Size" theme={theme}>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={localSource.style.fontSize || 120}
                  onChange={e => handleStyleChange('fontSize', parseInt(e.target.value) || 120)}
                  className={textInputClass}
                />
              </SettingsInput>
              <SettingsInput label="Alignment" theme={theme}>
                <select
                  value={localSource.style.textAlign || 'center'}
                  onChange={e => handleStyleChange('textAlign', e.target.value as any)}
                  className={textInputClass}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </SettingsInput>
            </div>
          </>
        )}

        {source.type === 'gallery' && <>
          <SettingsInput label="Slide Duration (sec)" theme={theme}><input type="number" value={localSource.style.slideDuration} onChange={e => handleStyleChange('slideDuration', parseInt(e.target.value))} min="1" className={textInputClass}/></SettingsInput>
          <div className={`p-2 border ${themeClasses.border} rounded-lg mt-2`}>
            <h4 className="font-bold text-sm mb-2">Manage Images</h4>
            <div className="flex space-x-2"><input type="text" placeholder="Add Image URL" value={galleryUrl} onChange={e => setGalleryUrl(e.target.value)} className={`flex-grow ${themeClasses.inputBg} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded px-2 py-1 text-sm`}/><button onClick={() => addGalleryImage(galleryUrl)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 rounded">+</button></div>
            <button onClick={() => galleryFileInputRef.current?.click()} className={`w-full ${themeClasses.button} text-xs py-1 mt-2 rounded`}>Upload Image</button>
            <input type="file" ref={galleryFileInputRef} onChange={handleGalleryImageUpload} accept="image/*" className="hidden"/>
            <div className="max-h-40 overflow-y-auto mt-2 space-y-2">
              {(localSource.content as GalleryImage[]).map((img, index) => (
                <div key={img.id} className={`flex items-center p-1 rounded ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-200/50'}`}>
                  <img src={img.url} className="w-8 h-8 object-cover rounded mr-2" alt=""/>
                  <span className="text-xs truncate flex-grow">{img.url.startsWith('data:') ? 'Local File' : img.url}</span>
                  <button onClick={() => updateGalleryImage(img.id, {visible: !img.visible})} title={img.visible ? 'Hide' : 'Show'} className="mx-1">{img.visible ? '👁️' : '🙈'}</button>
                  <button onClick={() => moveGalleryImage(index, 'up')} disabled={index===0} className="disabled:opacity-20">↑</button>
                  <button onClick={() => moveGalleryImage(index, 'down')} disabled={index===(localSource.content as GalleryImage[]).length-1} className="disabled:opacity-20">↓</button>
                  <button onClick={() => removeGalleryImage(img.id)} className="text-red-500 ml-1 text-lg">&times;</button>
                </div>
              ))}
            </div>
          </div>
        </>}
        
        {source.type === 'code' && <>
            <SettingsInput label="Presets" theme={theme}>
                <div className="flex flex-wrap gap-2 items-center mb-3">
                    <button 
                        onClick={() => applyPreset('matrixRain')} 
                        className={`text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer flex items-center justify-center ${activePreset === 'matrixRain' ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}
                    >
                        Matrix
                    </button>
                    <button 
                        onClick={() => applyPreset('snow')} 
                        className={`text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer flex items-center justify-center ${activePreset === 'snow' ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}
                    >
                        Snow
                    </button>
                    <button 
                        onClick={() => applyPreset('starTunnel')} 
                        className={`text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer flex items-center justify-center ${activePreset === 'starTunnel' ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}
                    >
                        Stars
                    </button>
                    
                    {/* Render custom saved presets */}
                    {customPresets.map(preset => (
                        <div key={preset.id} className="relative group/preset flex items-center">
                            <button 
                                onClick={() => {
                                    handleSourceChange('content', { html: preset.html, css: preset.css, js: preset.js });
                                    setActivePreset(preset.id);
                                }} 
                                className={`text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer flex items-center justify-center ${activePreset === preset.id ? 'bg-purple-600 text-white' : 'bg-purple-900/40 text-purple-200 border border-purple-800/50 hover:bg-purple-800/30'}`}
                            >
                                {preset.name}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = customPresets.filter(p => p.id !== preset.id);
                                    saveCustomPresets(filtered);
                                    if (activePreset === preset.id) {
                                        setActivePreset('custom');
                                    }
                                }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-red-500 shadow z-10 opacity-0 group-hover/preset:opacity-100 transition-opacity cursor-pointer"
                                title="Delete preset"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={() => setIsCreatingPreset(true)} 
                        className="text-xs px-2.5 py-1.5 rounded font-bold transition cursor-pointer flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-500"
                        title="New Preset from Current Code"
                    >
                        ➕
                    </button>

                    {/* Show save button if activePreset is a custom saved preset */}
                    {customPresets.some(p => p.id === activePreset) && (
                        <button 
                            onClick={() => {
                                const matchedIndex = customPresets.findIndex(p => p.id === activePreset);
                                if (matchedIndex !== -1) {
                                    const updated = [...customPresets];
                                    const currentC = localSource.content as CodeContent;
                                    updated[matchedIndex] = {
                                        ...updated[matchedIndex],
                                        html: currentC.html,
                                        css: currentC.css,
                                        js: currentC.js
                                    };
                                    saveCustomPresets(updated);
                                }
                            }}
                            className="text-xs px-2.5 py-1.5 rounded font-bold transition cursor-pointer flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500"
                            title="Save current code to preset"
                        >
                            💾
                        </button>
                    )}
                </div>

                {isCreatingPreset && (
                    <div className={`p-2 border.5 ${themeClasses.border} rounded-lg ${theme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-100/60'} space-y-2 mb-3`}>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Preset Name</span>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="E.g., Rain Matrix..." 
                                value={newPresetName} 
                                onChange={e => setNewPresetName(e.target.value)} 
                                className={`flex-grow ${themeClasses.inputBg} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded px-2.5 py-1 text-xs`}
                                autoFocus
                            />
                            <button 
                                onClick={() => {
                                    if (!newPresetName.trim()) return;
                                    const currentCode = localSource.content as CodeContent;
                                    const newPreset: CustomPreset = {
                                        id: `preset-${Date.now()}`,
                                        name: newPresetName.trim(),
                                        html: currentCode.html,
                                        css: currentCode.css,
                                        js: currentCode.js
                                    };
                                    const updated = [...customPresets, newPreset];
                                    saveCustomPresets(updated);
                                    setActivePreset(newPreset.id);
                                    setNewPresetName('');
                                    setIsCreatingPreset(false);
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded cursor-pointer"
                            >
                                Save
                            </button>
                            <button 
                                onClick={() => {
                                    setIsCreatingPreset(false);
                                    setNewPresetName('');
                                }}
                                className={`px-2 py-1 text-xs font-semibold rounded cursor-pointer ${themeClasses.buttonSecondary}`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </SettingsInput>

            {detectedPreset !== 'custom' && (
                <div className={`p-3 border ${themeClasses.border} rounded-lg mb-3 ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-100/40'} space-y-3`}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {detectedPreset === 'matrixRain' ? 'Matrix Rain Settings' : detectedPreset === 'snow' ? 'Snow particle Settings' : 'Stars Settings'}
                        </span>
                    </div>

                    {/* Size Slider */}
                    <div>
                        <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400 font-semibold">Size</span>
                            <span className="font-mono text-gray-300 font-bold">
                                {localSource.style.codeSize ?? getDefaultPresetSize(detectedPreset)}px
                            </span>
                        </div>
                        <input
                            type="range"
                            min="2"
                            max={detectedPreset === 'matrixRain' ? "40" : detectedPreset === 'snow' ? "15" : "30"}
                            value={localSource.style.codeSize ?? getDefaultPresetSize(detectedPreset)}
                            onChange={(e) => handlePresetSliderChange('codeSize', Number(e.target.value))}
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
                        />
                    </div>

                    {/* Speed Slider */}
                    <div>
                        <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400 font-semibold">Speed</span>
                            <span className="font-mono text-gray-300 font-bold">
                                {(localSource.style.codeSpeed ?? 1.0).toFixed(1)}x
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="5.0"
                            step="0.1"
                            value={localSource.style.codeSpeed ?? 1.0}
                            onChange={(e) => handlePresetSliderChange('codeSpeed', Number(e.target.value))}
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
                        />
                    </div>

                    {/* Color picker */}
                    <div>
                        <span className="block text-[11px] text-gray-400 font-semibold mb-1">Color</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={localSource.style.codeColor ?? getDefaultPresetColor(detectedPreset)}
                                onChange={(e) => handlePresetSliderChange('codeColor', e.target.value)}
                                className="w-8 h-8 rounded border border-gray-600 cursor-pointer p-0 bg-transparent"
                            />
                            <input
                                type="text"
                                value={localSource.style.codeColor ?? getDefaultPresetColor(detectedPreset)}
                                onChange={(e) => handlePresetSliderChange('codeColor', e.target.value)}
                                className={`flex-1 ${themeClasses.inputBg} border ${themeClasses.border} rounded px-2 py-1 text-xs font-mono`}
                                placeholder="#ffffff"
                            />
                        </div>
                    </div>
                </div>
            )}

            <SettingsInput label="HTML" theme={theme}><textarea value={(localSource.content as CodeContent).html} onChange={e => handleCodeContentChange('html', e.target.value)} className={codeTextareaClass} /></SettingsInput>
            <SettingsInput label="CSS" theme={theme}><textarea value={(localSource.content as CodeContent).css} onChange={e => handleCodeContentChange('css', e.target.value)} className={codeTextareaClass} /></SettingsInput>
            <SettingsInput label="JavaScript" theme={theme}><textarea value={(localSource.content as CodeContent).js} onChange={e => handleCodeContentChange('js', e.target.value)} className={codeTextareaClass} /></SettingsInput>
        </>}

        {source.type === 'visualizer' && (
            <>
                <SettingsInput label="Visualizer Style" theme={theme}>
                    <select
                        value={localSource.style.visualizerStyle || 'bars'}
                        onChange={(e) => handleStyleChange('visualizerStyle', e.target.value as any)}
                        className={textInputClass}
                    >
                        <option value="bars">Bars (Equalizer)</option>
                        <option value="wave">Wave (Oscilloscope)</option>
                        <option value="blocks">Blocks (Solid Grid)</option>
                    </select>
                </SettingsInput>
                <SettingsInput label="Visualizer Main Color" theme={theme}>
                    <input
                        type="color"
                        value={localSource.style.visualizerColor || '#3b82f6'}
                        onChange={(e) => handleStyleChange('visualizerColor', e.target.value)}
                        className={`w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded h-8 p-0 cursor-pointer`}
                    />
                </SettingsInput>
                <div className="flex items-center justify-between mt-3 mb-2">
                    <label className="text-sm font-bold">Inner Glow Accent</label>
                    <button
                        onClick={() => handleStyleChange('innerGlow', !localSource.style.innerGlow)}
                        className={`px-3 py-1 text-xs rounded-full ${localSource.style.innerGlow ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}
                    >
                        {localSource.style.innerGlow ? 'ON' : 'OFF'}
                    </button>
                </div>
                {localSource.style.innerGlow && (
                    <div className={`pl-3 mt-2 ml-2 border-l-2 ${themeClasses.border}`}>
                        <SettingsInput label="Glow Color" theme={theme}>
                            <input
                                type="color"
                                value={localSource.style.innerGlowColor || '#3b82f6'}
                                onChange={(e) => handleStyleChange('innerGlowColor', e.target.value)}
                                className={`w-full h-8 p-0 cursor-pointer ${themeClasses.inputBg} border ${themeClasses.border} rounded`}
                            />
                        </SettingsInput>
                        <SettingsInput label={`Glow Blur (${localSource.style.innerGlowBlur || 15}px)`} theme={theme}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={localSource.style.innerGlowBlur || 15}
                                onChange={(e) => handleStyleChange('innerGlowBlur', parseFloat(e.target.value))}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
                            />
                        </SettingsInput>
                    </div>
                )}
                <div className="flex items-center justify-between mt-3 mb-2">
                    <label className="text-sm font-bold">Transparent Background</label>
                    <button
                        onClick={() => handleStyleChange('visualizerTransparent', localSource.style.visualizerTransparent === false)}
                        className={`px-3 py-1 text-xs rounded-full ${localSource.style.visualizerTransparent !== false ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}
                    >
                        {localSource.style.visualizerTransparent !== false ? 'ON' : 'OFF'}
                    </button>
                </div>
            </>
        )}

        <hr className={`${themeClasses.border} my-4`} />
        <h3 className="font-bold mb-2">Transform & Style</h3>
        <div className="grid grid-cols-2 gap-x-4">
          <SettingsInput label="X Position" theme={theme}><input type="number" value={Math.round(localSource.style.x)} onChange={e => handleStyleChange('x', parseInt(e.target.value))} className={textInputClass}/></SettingsInput>
          <SettingsInput label="Y Position" theme={theme}><input type="number" value={Math.round(localSource.style.y)} onChange={e => handleStyleChange('y', parseInt(e.target.value))} className={textInputClass}/></SettingsInput>
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <SettingsInput label="Width" theme={theme}><input type="number" value={Math.round(localSource.style.width)} onChange={e => handleStyleChange('width', parseInt(e.target.value))} className={textInputClass}/></SettingsInput>
          <SettingsInput label="Height" theme={theme}><input type="number" value={Math.round(localSource.style.height)} onChange={e => handleStyleChange('height', parseInt(e.target.value))} className={textInputClass}/></SettingsInput>
        </div>
        <SettingsInput label={`Opacity (${Math.round(localSource.style.opacity * 100)}%)`} theme={theme}><input type="range" min="0" max="1" step="0.01" value={localSource.style.opacity} onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}/></SettingsInput>
        <SettingsInput label="Layer (z-index)" theme={theme}><input type="number" value={localSource.style.zIndex} onChange={e => handleStyleChange('zIndex', parseInt(e.target.value))} className={textInputClass}/></SettingsInput>
        
        <SettingsInput label={`Rotation (${localSource.style.rotation || 0}°)`} theme={theme}>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="0" 
              max="360" 
              step="1" 
              value={localSource.style.rotation || 0} 
              onChange={(e) => handleStyleChange('rotation', parseInt(e.target.value))} 
              className={`flex-grow h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
            />
            <input 
              type="number" 
              min="0" 
              max="360" 
              value={localSource.style.rotation || 0} 
              onChange={(e) => handleStyleChange('rotation', Math.min(360, Math.max(0, parseInt(e.target.value) || 0)))} 
              className={`w-14 text-xs p-1 rounded text-center border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-black'}`}
            />
          </div>
        </SettingsInput>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Flip Horizontal</span>
            <button
              type="button"
              onClick={() => handleStyleChange('scaleX', (localSource.style.scaleX || 1) * -1)}
              className={`w-full py-1.5 text-xs font-semibold rounded hover:bg-opacity-80 transition flex items-center justify-center gap-1 ${
                (localSource.style.scaleX || 1) === -1 
                  ? 'bg-blue-600 text-white' 
                  : themeClasses.buttonSecondary
              }`}
            >
              ↔️ { (localSource.style.scaleX || 1) === -1 ? 'Flipped' : 'Normal' }
            </button>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Flip Vertical</span>
            <button
              type="button"
              onClick={() => handleStyleChange('scaleY', (localSource.style.scaleY || 1) * -1)}
              className={`w-full py-1.5 text-xs font-semibold rounded hover:bg-opacity-80 transition flex items-center justify-center gap-1 ${
                (localSource.style.scaleY || 1) === -1 
                  ? 'bg-blue-600 text-white' 
                  : themeClasses.buttonSecondary
              }`}
            >
              ↕️ { (localSource.style.scaleY || 1) === -1 ? 'Flipped' : 'Normal' }
            </button>
          </div>
        </div>
        
        <div className="mt-4 mb-2 space-y-3">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Position Presets</span>
            <button
              onClick={centerSourceOnCanvas}
              type="button"
              className={`w-full py-1.5 text-xs font-semibold rounded ${themeClasses.buttonSecondary} hover:bg-opacity-80 transition flex items-center justify-center gap-1`}
            >
              🎯 Center on Canvas
            </button>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Aspect Ratio & Size Presets</span>
            <div className="grid grid-cols-5 gap-1">
              <button
                onClick={() => applySizePreset('full')}
                type="button"
                className={`py-1 text-[11px] font-semibold rounded ${themeClasses.buttonSecondary} hover:bg-blue-600 hover:text-white transition`}
                title="Full Screen / Fit"
              >
                Full
              </button>
              <button
                onClick={() => applySizePreset('240')}
                type="button"
                className={`py-1 text-[11px] font-semibold rounded ${themeClasses.buttonSecondary} hover:bg-opacity-80 transition`}
                title="426 x 240 (240p)"
              >
                240p
              </button>
              <button
                onClick={() => applySizePreset('480')}
                type="button"
                className={`py-1 text-[11px] font-semibold rounded ${themeClasses.buttonSecondary} hover:bg-opacity-80 transition`}
                title="854 x 480 (480p)"
              >
                480p
              </button>
              <button
                onClick={() => applySizePreset('720')}
                type="button"
                className={`py-1 text-[11px] font-semibold rounded ${themeClasses.buttonSecondary} hover:bg-opacity-80 transition`}
                title="1280 x 720 (720p HD)"
              >
                720p
              </button>
              <button
                onClick={() => applySizePreset('1080')}
                type="button"
                className={`py-1 text-[11px] font-semibold rounded ${themeClasses.buttonSecondary} hover:bg-opacity-80 transition`}
                title="1920 x 1080 (1080p FHD)"
              >
                1080p
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
            <label className="text-sm font-bold">Box Shadow</label>
            <button onClick={() => handleStyleChange('boxShadow', !localSource.style.boxShadow)} className={`px-3 py-1 text-xs rounded-full ${localSource.style.boxShadow ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}>{localSource.style.boxShadow ? 'ON' : 'OFF'}</button>
        </div>
        {localSource.style.boxShadow && (
            <div className={`pl-3 mt-2 ml-2 border-l-2 ${themeClasses.border}`}>
                <SettingsInput label="Shadow Color" theme={theme}><input type="color" value={localSource.style.shadowColor || '#000000'} onChange={e => handleStyleChange('shadowColor', e.target.value)} className={`w-full h-8 p-0 cursor-pointer ${themeClasses.inputBg} border ${themeClasses.border} rounded`}/></SettingsInput>
                <SettingsInput label={`Shadow Blur (${localSource.style.shadowBlur || 0}px)`} theme={theme}><input type="range" min="0" max="100" step="1" value={localSource.style.shadowBlur || 0} onChange={(e) => handleStyleChange('shadowBlur', parseFloat(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}/></SettingsInput>
            </div>
        )}

        <div className="flex items-center justify-between mt-4">
            <label className="text-sm font-bold">Stroke</label>
            <button onClick={() => handleStyleChange('stroke', !localSource.style.stroke)} className={`px-3 py-1 text-xs rounded-full ${localSource.style.stroke ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}>{localSource.style.stroke ? 'ON' : 'OFF'}</button>
        </div>
         {localSource.style.stroke && (
            <div className={`pl-3 mt-2 ml-2 border-l-2 ${themeClasses.border}`}>
                <SettingsInput label="Stroke Color" theme={theme}><input type="color" value={localSource.style.strokeColor || '#ffffff'} onChange={e => handleStyleChange('strokeColor', e.target.value)} className={`w-full h-8 p-0 cursor-pointer ${themeClasses.inputBg} border ${themeClasses.border} rounded`}/></SettingsInput>
                <SettingsInput label="Stroke Width" theme={theme}><input type="number" min="1" value={localSource.style.strokeWidth || 2} onChange={e => handleStyleChange('strokeWidth', parseInt(e.target.value))} className={textInputClass}/></SettingsInput>
            </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;