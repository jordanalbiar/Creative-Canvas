export type Theme = 'light' | 'dark' | 'crimson' | 'metallic' | 'lime' | 'purple' | 'lemon' | 'silverado' | 'orange';

export type SourceType = 'text' | 'image' | 'video' | 'iframe' | 'color' | 'gallery' | 'code' | 'paint' | 'camera' | 'capture' | 'visualizer' | 'emoji' | 'youtube' | 'twitch';

export interface GalleryImage {
  id: string;
  url: string;
  visible: boolean;
}

export interface CodeContent {
  html: string;
  css: string;
  js: string;
}

export interface TwitchContent {
  channel: string;
  parent: string;
  urlInput?: string;
  layout?: 'video' | 'video-with-chat' | 'chat-only';
  autoplay?: boolean;
  muted?: boolean;
  theme?: 'light' | 'dark';
}

export interface ChromaKey {
  enabled: boolean;
  color: string;
  sensitivity: number;
}

export type Shape = 'none' | 'circle' | 'oval' | 'triangle' | 'diamond' | 'star' | 'hexagon';

export interface Filters {
  hue: number; // 0-360
  blur: number; // in pixels
  sharpness: number; // 0-100
  shape: Shape;
  audioReactEnabled?: boolean;
  audioSensitivity?: number; // 1-10
}

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  visible: boolean;
  locked?: boolean;
  content: string | GalleryImage[] | CodeContent | TwitchContent;
  preFullscreenStyle?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    opacity: number;
    resizeBehavior?: 'static' | 'fill' | 'full-width' | 'full-height' | 'center' | 'proportional';
    scale?: number;
    rotation?: number;
    scaleX?: number; // For mirroring
    scaleY?: number; // For vertical flipping
    boxShadow: boolean;
    shadowColor?: string;
    shadowBlur?: number;
    stroke: boolean;
    strokeColor?: string;
    strokeWidth?: number;
    // Text-specific
    fontSize?: number;
    textColor?: string;
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter';
    textAlign?: 'left' | 'center' | 'right';
    fontFamily?: string;
    textStyle?: string;
    // Video-specific
    playbackRate?: number;
    loop?: boolean;
    volume?: number;
    muted?: boolean;
    videoPlaying?: boolean;
    videoStart?: number;
    videoEnd?: number;
    // Gallery-specific
    slideDuration?: number; // in seconds
    // Filter-specific
    chromaKey?: ChromaKey;
    colorKey?: ChromaKey;
    filters?: Filters;
    // Paint-specific
    brushColor?: string;
    brushSize?: number;
    // Visualizer-specific
    visualizerStyle?: 'bars' | 'wave' | 'blocks';
    visualizerColor?: string;
    visualizerTransparent?: boolean;
    innerGlow?: boolean;
    innerGlowColor?: string;
    innerGlowBlur?: number;
    youtubeProxy?: 'none' | 'invidious' | 'piped';
  };
}

export interface Scene {
  id:string;
  name: string;
  icon?: string;
  sources: Source[];
  backgroundColor?: string;
  transition?: SceneTransition;
}

export type SceneTransitionType = 'cut' | 'fade' | 'move' | 'stinger';

export interface SceneTransition {
    type: SceneTransitionType;
    stingerFile?: string;
    speed?: number;          // transition duration in milliseconds (e.g. 500)
    style?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'; // transition easing style
    color?: string;          // custom stinger overlay mask or fade-to-color
    stingerStart?: number;   // stinger custom video start point (s)
    stingerStop?: number;    // stinger custom video stop point (s)
    stingerSpeed?: number;   // stinger custom video playback velocity (e.g. 1.0)
}

export type InteractionState = {
  type: 'move' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl' | 'none';
  sourceId: string | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startSourceX: number;
  startSourceY: number;
};

export type ActionLogEntry = {
  timestamp: number;
  message: string;
};