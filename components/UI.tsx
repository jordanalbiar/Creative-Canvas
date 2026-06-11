

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Scene, Source, SourceType, Theme, SceneTransition, ActionLogEntry } from '../types';
import SourceManager from './SourceManager';
import SceneManager from './SceneManager';
import SettingsPanel from './SettingsPanel';
import FilterPanel from './FilterPanel';
import StatsPanel from './StatsPanel';

export const themes: Record<Theme, Record<string, string>> = {
    light: {
        bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-200', inputBg: 'bg-gray-100', label: 'text-gray-500', button: 'bg-gray-200 hover:bg-gray-300', itemHover: 'hover:bg-gray-100', icon: 'text-gray-500 hover:text-black', buttonSecondary: 'bg-gray-300'
    },
    dark: {
        bg: 'bg-gray-800', text: 'text-white', border: 'border-gray-700', inputBg: 'bg-gray-900', label: 'text-gray-400', button: 'bg-gray-700 hover:bg-gray-600', itemHover: 'hover:bg-gray-700/70', icon: 'text-gray-400 hover:text-white', buttonSecondary: 'bg-gray-600'
    },
    crimson: {
        bg: 'bg-red-900', text: 'text-red-100', border: 'border-red-700', inputBg: 'bg-red-950', label: 'text-red-300', button: 'bg-red-800 hover:bg-red-700', itemHover: 'hover:bg-red-800/70', icon: 'text-red-300 hover:text-white', buttonSecondary: 'bg-red-800'
    },
    metallic: {
        bg: 'bg-slate-800', text: 'text-slate-200', border: 'border-slate-700', inputBg: 'bg-slate-900', label: 'text-slate-400', button: 'bg-slate-700 hover:bg-slate-600', itemHover: 'hover:bg-slate-700/70', icon: 'text-slate-400 hover:text-white', buttonSecondary: 'bg-slate-700'
    },
    lime: {
        bg: 'bg-lime-950', text: 'text-lime-200', border: 'border-lime-800', inputBg: 'bg-lime-900/50', label: 'text-lime-400', button: 'bg-lime-800 hover:bg-lime-700', itemHover: 'hover:bg-lime-800/70', icon: 'text-lime-300 hover:text-white', buttonSecondary: 'bg-lime-800'
    },
    purple: {
        bg: 'bg-purple-900', text: 'text-purple-200', border: 'border-purple-700', inputBg: 'bg-purple-950', label: 'text-purple-400', button: 'bg-purple-800 hover:bg-purple-700', itemHover: 'hover:bg-purple-800/70', icon: 'text-purple-300 hover:text-white', buttonSecondary: 'bg-purple-800'
    },
    lemon: {
        bg: 'bg-yellow-950', text: 'text-yellow-200', border: 'border-yellow-800', inputBg: 'bg-yellow-900/50', label: 'text-yellow-400', button: 'bg-yellow-800 hover:bg-yellow-700', itemHover: 'hover:bg-yellow-800/70', icon: 'text-yellow-300 hover:text-white', buttonSecondary: 'bg-yellow-800'
    },
    silverado: {
        bg: 'bg-zinc-800', text: 'text-zinc-200', border: 'border-zinc-700', inputBg: 'bg-zinc-900', label: 'text-zinc-400', button: 'bg-zinc-700 hover:bg-zinc-600', itemHover: 'hover:bg-zinc-700/70', icon: 'text-zinc-400 hover:text-white', buttonSecondary: 'bg-zinc-700'
    },
    orange: {
        bg: 'bg-orange-950', text: 'text-orange-200', border: 'border-orange-800', inputBg: 'bg-orange-900/50', label: 'text-orange-400', button: 'bg-orange-800 hover:bg-orange-700', itemHover: 'hover:bg-orange-800/70', icon: 'text-orange-300 hover:text-white', buttonSecondary: 'bg-orange-800'
    }
};

interface UIProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  isWelcomeVisible: boolean;
  onCloseWelcome: () => void;
  scenes: Scene[];
  activeScene: Scene | undefined;
  onSetActiveScene: (id: string) => void;
  isAddingScene: boolean;
  onAddScene: () => void;
  onConfirmAddScene: (name: string, icon: string) => void;
  onCancelAddScene: () => void;
  onDeleteScene: (id: string) => void;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onAddSource: (type: SourceType) => void;
  onDeleteSource: (id: string) => void;
  onUpdateSourceLayer: (id: string, direction: 'up' | 'down') => void;
  onImportSources: () => void;
  onExportSources: () => void;
  onImportProject: () => void;
  onExportProject: () => void;
  onCenterSource: (id: string) => void;
  onFullscreenSource: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedSource: Source | undefined;
  onUpdateSource: (id: string, updates: Partial<Source> | ((s: Source) => Partial<Source>)) => void;
  onSelectSource: (id: string | null) => void;
  isSnapToGridEnabled: boolean;
  onToggleSnapToGrid: () => void;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  filteringSource: Source | undefined;
  onOpenFilterPanel: (id: string) => void;
  onCloseFilterPanel: () => void;
  onUpdateSourceStyle: (id: string, style: Partial<Source['style']>) => void;
  onToggleSourceVisibility: (id: string) => void;
  onToggleSourceLock: (id: string) => void;
  onReorderSources: (orderedIds: string[]) => void;
  sceneTransition: SceneTransition;
  onSetSceneTransition: (transition: SceneTransition) => void;
  actionLog: ActionLogEntry[];
  onClearActionLog: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  editingScene: Scene | undefined;
  onOpenEditSceneModal: (id: string) => void;
  onDuplicateScene: (id: string) => void;
  onCloseEditSceneModal: () => void;
  onConfirmEditScene: (id: string, name: string, icon: string) => void;
  sourceToDelete: string | null;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isHotkeysEnabled: boolean;
  onToggleHotkeys: () => void;
  centerHotkey: string;
  onSetCenterHotkey: (key: string) => void;
  fullscreenHotkey: string;
  onSetFullscreenHotkey: (key: string) => void;
  lockHotkey: string;
  onSetLockHotkey: (key: string) => void;
  visibilityHotkey: string;
  onSetVisibilityHotkey: (key: string) => void;
  canvasResolution: string;
  onSetCanvasResolution: (res: string) => void;
  isAutoHideEnabled: boolean;
  onToggleAutoHide: () => void;
  onSourceContextMenu?: (e: React.MouseEvent, sourceId: string) => void;
  isMobileMode: boolean;
  onToggleMobileMode: () => void;
  isPoppedOut: boolean;
  onTogglePoppedOut: () => void;
  panelWidth: number;
  onPanelWidthChange: (width: number) => void;
  isHoveredOverLeft: boolean;
  onHoveredOverLeftChange: (hovered: boolean) => void;
  scrollbarColor: string;
  onSetScrollbarColor: (color: string) => void;
  performancePreset: string;
  onSetPerformancePreset: (preset: string) => void;
  framerateLimit: string;
  onSetFramerateLimit: (limit: string) => void;
  renderScale: string;
  onSetRenderScale: (scale: string) => void;
  interfaceAnimations: string;
  onSetInterfaceAnimations: (animations: string) => void;
  onExportCanvasSettings: () => void;
  onImportCanvasSettings: () => void;
  onExportMasterBackup: () => void;
  onImportMasterBackup: () => void;
  copiedSource: Source | null;
  onCopySource: (id: string) => void;
  onPasteSource: () => void;
  contextMenuTheme?: 'match' | Theme;
  onSetContextMenuTheme?: (theme: 'match' | Theme) => void;
  sceneHotkeys?: Record<string, string>;
  onSetSceneHotkey?: (sceneId: string, hotkey: string) => void;
}

export const WelcomeOverlay: React.FC<{onClose: () => void, theme: Theme}> = ({ onClose, theme }) => {
    const themeClasses = themes[theme];
    return (
        <div className="fixed inset-0 bg-black/80 z-[9999999] flex items-center justify-center p-4 transition-opacity duration-300 pointer-events-auto">
            <div className={`rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] md:max-h-[85vh] p-6 border relative text-left flex flex-col overflow-hidden ${themeClasses.bg} ${themeClasses.border}`}>
                <button onClick={onClose} className={`absolute top-2 right-2 text-3xl font-light hover:scale-110 transition-transform ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>&times;</button>
                <h1 className="text-2xl font-bold mb-4 text-blue-500 pr-8 select-none">Welcome to your Creative Canvas!</h1>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <p className={`text-sm md:text-base leading-relaxed ${themeClasses.text}`}>This is your personal digital studio, a versatile platform for creating dynamic visual scenes. Whether you're a streamer, presenter, educator, or just a creative soul, this canvas is your playground.</p>
                    
                    <div className="space-y-2 mt-4">
                        <details className="group border-b border-gray-700/40 pb-2 cursor-pointer">
                            <summary className="font-semibold text-blue-500 hover:text-blue-400 select-none flex justify-between items-center outline-none">
                                <span>🎬 Compose Scenes</span>
                                <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <p className={`mt-2 text-sm pl-4 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Build multiple scenes, each with its own unique layout of sources. Seamlessly switch between setups.
                            </p>
                        </details>
                        <details className="group border-b border-gray-700/40 pb-2 cursor-pointer">
                            <summary className="font-semibold text-blue-500 hover:text-blue-400 select-none flex justify-between items-center outline-none">
                                <span>📸 Add Rich Media</span>
                                <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <p className={`mt-2 text-sm pl-4 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Incorporate images, videos, live camera feeds, screen captures, and even live websites using URL links.
                            </p>
                        </details>
                        <details className="group border-b border-gray-700/40 pb-2 cursor-pointer">
                            <summary className="font-semibold text-blue-500 hover:text-blue-400 select-none flex justify-between items-center outline-none">
                                <span>✨ Layer & Animate</span>
                                <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <p className={`mt-2 text-sm pl-4 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Arrange sources in layers, apply scale/rotation transitions, and use green-screen chroma key effects.
                            </p>
                        </details>
                        <details className="group border-b border-gray-700/40 pb-2 cursor-pointer">
                            <summary className="font-semibold text-blue-500 hover:text-blue-400 select-none flex justify-between items-center outline-none">
                                <span>🎥 Live Production</span>
                                <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <p className={`mt-2 text-sm pl-4 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Seamlessly switch between scenes with smooth transitions, perfect for streaming, presentations, or local recording.
                            </p>
                        </details>
                        <details className="group border-b border-gray-700/40 pb-2 cursor-pointer">
                            <summary className="font-semibold text-blue-500 hover:text-blue-400 select-none flex justify-between items-center outline-none">
                                <span>💻 Interactive Design</span>
                                <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <p className={`mt-2 text-sm pl-4 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Add custom code (HTML/CSS/JS) to create fully custom widgets, particles, visualizers, or tools right on the canvas.
                            </p>
                        </details>
                        <details className="group border-b border-gray-700/40 pb-2 cursor-pointer">
                            <summary className="font-semibold text-blue-500 hover:text-blue-400 select-none flex justify-between items-center outline-none">
                                <span>📂 Save & Share</span>
                                <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <p className={`mt-2 text-sm pl-4 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Export your entire project setup or individual scene sources to a JSON file, and load them back anytime.
                            </p>
                        </details>
                    </div>
                    
                    <p className={`text-xs md:text-sm mt-4 leading-relaxed ${themeClasses.text}`}>Dive in and start creating! Hide this UI at any time using the toggle in the bottom right to enter "performance mode" and see your canvas in full brilliance.</p>
                </div>

                <div className="text-center mt-6 pt-3 border-t border-gray-700/40 flex flex-col sm:flex-row items-center justify-center gap-4 shrink-0">
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors w-full sm:w-auto cursor-pointer">
                        Got it, let's create!
                    </button>
                    <a 
                        href="https://www.paypal.com/paypalme/jordanalbiar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <span>☕</span>
                        <span>Buy me a coffee</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

const AddSceneModal: React.FC<{
    onConfirm: (name: string, icon: string) => void;
    onClose: () => void;
    theme: Theme;
}> = ({ onConfirm, onClose, theme }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('🎬');
    const themeClasses = themes[theme];
    const textInputClass = `w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;

    const emojis = ['🎬', '🎮', '💬', '📰', '🎙️', '🖼️', '✨', '🎥', '🔴', '🟢', '🔵', '💡', '🏆', '⭐', '❤️', '🔥'];
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onConfirm(name.trim(), icon);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[50001] flex items-center justify-center p-4 pointer-events-auto" onClick={onClose}>
            <div className={`rounded-lg shadow-2xl max-w-xs w-full p-5 border relative ${themeClasses.bg} ${themeClasses.border}`} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">Create New Scene</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className={`block text-xs font-bold mb-1 uppercase ${themeClasses.label}`}>Scene Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={textInputClass}
                            placeholder="My Awesome Scene"
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <label className={`block text-xs font-bold mb-1 uppercase ${themeClasses.label}`}>Icon</label>
                        <div className="grid grid-cols-8 gap-1">
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcon(emoji)}
                                    className={`text-lg p-1 rounded-md transition-all ${icon === emoji ? 'bg-blue-600 scale-110' : themeClasses.button}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className={`px-4 py-2 text-sm rounded ${themeClasses.buttonSecondary}`}>Cancel</button>
                        <button type="submit" disabled={!name.trim()} className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white disabled:bg-blue-800 disabled:cursor-not-allowed">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditSceneModal: React.FC<{
    scene: Scene;
    onConfirm: (id: string, name: string, icon: string) => void;
    onClose: () => void;
    theme: Theme;
}> = ({ scene, onConfirm, onClose, theme }) => {
    const [name, setName] = useState(scene.name);
    const [icon, setIcon] = useState(scene.icon || '🎬');
    const themeClasses = themes[theme];
    const textInputClass = `w-full ${themeClasses.inputBg} border ${themeClasses.border} rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;

    const emojis = ['🎬', '🎮', '💬', '📰', '🎙️', '🖼️', '✨', '🎥', '🔴', '🟢', '🔵', '💡', '🏆', '⭐', '❤️', '🔥', '💻'];
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onConfirm(scene.id, name.trim(), icon);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[50001] flex items-center justify-center p-4 pointer-events-auto" onClick={onClose}>
            <div className={`rounded-lg shadow-2xl max-w-xs w-full p-5 border relative ${themeClasses.bg} ${themeClasses.border}`} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">Edit Scene</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className={`block text-xs font-bold mb-1 uppercase ${themeClasses.label}`}>Scene Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={textInputClass}
                            placeholder="My Awesome Scene"
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <label className={`block text-xs font-bold mb-1 uppercase ${themeClasses.label}`}>Icon</label>
                        <div className="grid grid-cols-8 gap-1">
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcon(emoji)}
                                    className={`text-lg p-1 rounded-md transition-all ${icon === emoji ? 'bg-blue-600 scale-110' : themeClasses.button}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className={`px-4 py-2 text-sm rounded ${themeClasses.buttonSecondary}`}>Cancel</button>
                        <button type="submit" disabled={!name.trim()} className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white disabled:bg-blue-800 disabled:cursor-not-allowed">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{
  onConfirm: () => void;
  onClose: () => void;
  theme: Theme;
}> = ({ onConfirm, onClose, theme }) => {
  const themeClasses = themes[theme];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onConfirm();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onConfirm, onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 z-[50001] flex items-center justify-center p-4 pointer-events-auto" onClick={onClose}>
      <div className={`rounded-lg shadow-2xl max-w-sm w-full p-6 border relative text-center ${themeClasses.bg} ${themeClasses.border}`} onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-2">Are you sure?</h2>
        <p className={`text-sm mb-6 ${themeClasses.label}`}>This action cannot be undone.</p>
        <div className="flex justify-center space-x-4">
          <button onClick={onClose} className={`px-6 py-2 text-sm rounded-md font-semibold ${themeClasses.buttonSecondary}`}>
            No, Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2 text-sm rounded-md font-semibold bg-red-600 hover:bg-red-500 text-white">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};


const CanvasSettings: React.FC<{
    activeScene: Scene | undefined;
    onUpdateScene: (id: string, updates: Partial<Scene>) => void;
    theme: Theme;
    onSetTheme: (theme: Theme) => void;
    centerHotkey: string;
    onSetCenterHotkey: (key: string) => void;
    fullscreenHotkey: string;
    onSetFullscreenHotkey: (key: string) => void;
    lockHotkey: string;
    onSetLockHotkey: (key: string) => void;
    visibilityHotkey: string;
    onSetVisibilityHotkey: (key: string) => void;
    canvasResolution: string;
    onSetCanvasResolution: (res: string) => void;
    isMobileMode: boolean;
    onToggleMobileMode: () => void;
    scrollbarColor: string;
    onSetScrollbarColor: (color: string) => void;
    performancePreset: string;
    onSetPerformancePreset: (preset: string) => void;
    framerateLimit: string;
    onSetFramerateLimit: (limit: string) => void;
    renderScale: string;
    onSetRenderScale: (scale: string) => void;
    interfaceAnimations: string;
    onSetInterfaceAnimations: (animations: string) => void;
    onExportCanvasSettings: () => void;
    onImportCanvasSettings: () => void;
    onExportMasterBackup: () => void;
    onImportMasterBackup: () => void;
    contextMenuTheme?: 'match' | Theme;
    onSetContextMenuTheme?: (theme: 'match' | Theme) => void;
    sceneHotkeys?: Record<string, string>;
    onSetSceneHotkey?: (sceneId: string, hotkey: string) => void;
    scenes?: Scene[];
}> = ({ 
    activeScene, onUpdateScene, theme, onSetTheme,
    centerHotkey, onSetCenterHotkey,
    fullscreenHotkey, onSetFullscreenHotkey,
    lockHotkey, onSetLockHotkey,
    visibilityHotkey, onSetVisibilityHotkey,
    canvasResolution, onSetCanvasResolution,
    isMobileMode, onToggleMobileMode,
    scrollbarColor, onSetScrollbarColor,
    performancePreset, onSetPerformancePreset,
    framerateLimit, onSetFramerateLimit,
    renderScale, onSetRenderScale,
    interfaceAnimations, onSetInterfaceAnimations,
    onExportCanvasSettings, onImportCanvasSettings,
    onExportMasterBackup, onImportMasterBackup,
    contextMenuTheme = 'match',
    onSetContextMenuTheme = () => {},
    sceneHotkeys = {},
    onSetSceneHotkey = () => {},
    scenes = []
}) => {
    if (!activeScene) return null;
    const themeClasses = themes[theme];

    const [isGraphicOpen, setIsGraphicOpen] = useState(false);
    const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
    const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);

    const themeOptions: { id: Theme, name: string, colors: string }[] = [
        { id: 'light', name: 'Light', colors: 'bg-gray-200' },
        { id: 'dark', name: 'Dark', colors: 'bg-gray-700' },
        { id: 'crimson', name: 'Crimson', colors: 'bg-red-800' },
        { id: 'metallic', name: 'Metallic', colors: 'bg-slate-700' },
        { id: 'lime', name: 'Lime', colors: 'bg-lime-800' },
        { id: 'purple', name: 'Purple', colors: 'bg-purple-800' },
        { id: 'lemon', name: 'Lemon', colors: 'bg-yellow-800' },
        { id: 'silverado', name: 'Silverado', colors: 'bg-zinc-700' },
        { id: 'orange', name: 'Orange', colors: 'bg-orange-800' },
    ];

    return (
        <div className="p-3 space-y-4">
            {/* Graphic Settings Accordion */}
            <div className={`border-b ${themeClasses.border} pb-3`}>
                <button
                    type="button"
                    onClick={() => setIsGraphicOpen(!isGraphicOpen)}
                    className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-white transition"
                >
                    <span className="flex items-center gap-1.5">🎬 Graphic Settings</span>
                    <span className="text-[10px] opacity-60">{isGraphicOpen ? '▲' : '▼'}</span>
                </button>
                {isGraphicOpen && (
                    <div className="mt-3 space-y-4 pl-1">
                        <div>
                            <label className={`block text-xs font-bold mb-1 ${themeClasses.label} uppercase`}>Background Color</label>
                            <input 
                                type="color" 
                                value={activeScene.backgroundColor || '#000000'} 
                                onChange={(e) => onUpdateScene(activeScene.id, { backgroundColor: e.target.value })}
                                className={`w-full border-none rounded h-8 p-0 cursor-pointer ${themeClasses.inputBg}`}
                                style={{'--tw-ring-offset-shadow': 'none', '--tw-ring-shadow': 'none', 'boxShadow': 'none'} as React.CSSProperties}
                            />
                        </div>
                        
                        <div>
                            <label className={`block text-xs font-bold mb-1.5 ${themeClasses.label} uppercase`}>Canvas Resolution</label>
                            <select 
                                value={canvasResolution} 
                                onChange={(e) => onSetCanvasResolution(e.target.value)}
                                className={`w-full py-1.5 px-3 text-xs font-semibold rounded border transition-colors ${themeClasses.button} ${themeClasses.text} bg-transparent border-gray-700`}
                            >
                                <option value="240" className="bg-gray-800 text-white">240p (426 x 240) - 16:9 Mobile</option>
                                <option value="480" className="bg-gray-800 text-white">480p (854 x 480) - SD</option>
                                <option value="720" className="bg-gray-800 text-white">720p (1280 x 720) - HD</option>
                                <option value="1080" className="bg-gray-800 text-white">1080p (1920 x 1080) - Full HD</option>
                                <option value="2k" className="bg-gray-800 text-white">2K (2560 x 1440) - Quad HD</option>
                                <option value="4k" className="bg-gray-800 text-white">4K (3840 x 2160) - Ultra HD</option>
                            </select>
                            <span className="text-[10px] text-gray-500 block mt-1 leading-normal">Virtual target canvas resolution.</span>
                        </div>

                        <div>
                            <label className={`block text-xs font-bold mb-1.5 ${themeClasses.label} uppercase`}>Performance Preset</label>
                            <div className="grid grid-cols-3 gap-1">
                                {[
                                    { id: 'low', label: 'Max Perf', desc: 'Disables heavy effects' },
                                    { id: 'medium', label: 'Balanced', desc: 'Medium optimization' },
                                    { id: 'high', label: 'High Qual', desc: 'No optimizations' }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => onSetPerformancePreset(p.id)}
                                        className={`py-1 px-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${performancePreset === p.id ? 'bg-blue-600 border-blue-500 text-white shadow' : `${themeClasses.buttonSecondary} border-transparent text-gray-400 hover:text-white`}`}
                                        title={p.desc}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={`block text-xs font-bold mb-1.5 ${themeClasses.label} uppercase`}>FPS Refresh Limit</label>
                            <select 
                                value={framerateLimit} 
                                onChange={(e) => onSetFramerateLimit(e.target.value)}
                                className={`w-full py-1.5 px-3 text-xs font-semibold rounded border transition-colors ${themeClasses.button} ${themeClasses.text} bg-transparent border-gray-700`}
                            >
                                <option value="15" className="bg-gray-800 text-white">15 FPS (Lowest CPU usage)</option>
                                <option value="30" className="bg-gray-800 text-white">30 FPS (Optimized power saver)</option>
                                <option value="60" className="bg-gray-800 text-white">60 FPS (Fluid presentation)</option>
                                <option value="uncapped" className="bg-gray-800 text-white">Uncapped (Host native refresh)</option>
                            </select>
                        </div>

                        <div>
                            <label className={`block text-xs font-bold mb-1.5 ${themeClasses.label} uppercase`}>Render Scaling Ratio</label>
                            <div className="grid grid-cols-3 gap-1">
                                {[
                                    { id: '0.5', label: '50% (Fast)', title: 'Reduces viewport render overhead by 75%' },
                                    { id: '0.75', label: '75% (Opt)', title: 'Balanced look and CPU usage' },
                                    { id: '1.0', label: '100% (Crisp)', title: 'Pixel-perfect native resolution' }
                                ].map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => onSetRenderScale(s.id)}
                                        className={`py-1 px-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${renderScale === s.id ? 'bg-blue-600 border-blue-500 text-white shadow' : `${themeClasses.buttonSecondary} border-transparent text-gray-400 hover:text-white`}`}
                                        title={s.title}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={`block text-xs font-bold mb-1.5 ${themeClasses.label} uppercase`}>Interface Animations</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { id: 'enabled', label: '🎬 Enabled' },
                                    { id: 'disabled', label: '⚡ Disabled (Instant)' }
                                ].map(a => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => onSetInterfaceAnimations(a.id)}
                                        className={`py-1 px-2 rounded text-[10px] font-bold border transition-colors cursor-pointer ${interfaceAnimations === a.id ? 'bg-blue-600 border-blue-500 text-white' : `${themeClasses.buttonSecondary} border-transparent text-gray-400 hover:text-white`}`}
                                    >
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Appearance Settings Accordion */}
            <div className={`border-b ${themeClasses.border} pb-3`}>
                <button
                    type="button"
                    onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
                    className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-white transition"
                >
                    <span className="flex items-center gap-1.5">🎨 Appearance Settings</span>
                    <span className="text-[10px] opacity-60">{isAppearanceOpen ? '▲' : '▼'}</span>
                </button>
                {isAppearanceOpen && (
                    <div className="mt-3 space-y-4 pl-1">
                        <div>
                            <label className={`block text-xs font-bold mb-1 ${themeClasses.label} uppercase`}>UI Theme</label>
                            <p className="text-[10px] text-gray-400 mb-2 leading-tight">
                                Customize the global visual appearance of interface panels.
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {themeOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => onSetTheme(opt.id)}
                                        className={`py-1 px-2 text-[10px] font-bold rounded border flex items-center justify-start gap-1.5 transition cursor-pointer ${
                                            theme === opt.id 
                                                ? 'bg-indigo-650 font-bold border-indigo-500 shadow text-white' 
                                                : `${themeClasses.buttonSecondary} border-transparent text-gray-300 hover:text-white`
                                        }`}
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full inline-block shrink-0 ${opt.colors}`} />
                                        <span className="truncate">{opt.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Scrollbar Thumb Color Toggles */}
                        <div className="border-t border-gray-700/30 pt-3">
                            <label className={`block text-xs font-bold mb-1 ${themeClasses.label} uppercase`}>
                                Custom Scrollbar Color
                            </label>
                            <p className="text-[10px] text-gray-400 mb-2 leading-tight">
                                Toggle below to custom colorize the main window scrollbars.
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { color: '#6366f1', name: 'Indigo' },
                                    { color: '#8b5cf6', name: 'Violet' },
                                    { color: '#e11d48', name: 'Rose' },
                                    { color: '#a855f7', name: 'Purple' },
                                    { color: '#84cc16', name: 'Lime' },
                                    { color: '#f97316', name: 'Orange' },
                                    { color: '#06b6d4', name: 'Cyan' },
                                    { color: '#6b7280', name: 'Slate' }
                                ].map((col) => (
                                    <button
                                        key={col.color}
                                        type="button"
                                        onClick={() => onSetScrollbarColor(col.color)}
                                        className={`py-1 px-2 text-[10px] font-bold rounded border flex items-center justify-start gap-1.5 transition ${
                                            scrollbarColor === col.color 
                                                ? 'bg-indigo-650 font-bold border-indigo-500 shadow text-white' 
                                                : `${themeClasses.buttonSecondary} border-transparent text-gray-300 hover:text-white`
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: col.color }} />
                                        <span className="truncate">{col.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right-Click Menu Theme Toggles */}
                        <div className="border-t border-gray-700/30 pt-3">
                            <label className={`block text-xs font-bold mb-1 ${themeClasses.label} uppercase`}>
                                Right-Click Menu Theme
                            </label>
                            <p className="text-[10px] text-gray-400 mb-2 leading-tight">
                                Customize the theme styled exclusively on the right click menus.
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 font-sans">
                                <button
                                    type="button"
                                    onClick={() => onSetContextMenuTheme('match')}
                                    className={`py-1 px-2 text-[10px] font-bold rounded border flex items-center justify-start gap-1.5 transition cursor-pointer ${
                                        contextMenuTheme === 'match' 
                                            ? 'bg-indigo-650 font-bold border-indigo-500 shadow text-white' 
                                            : `${themeClasses.buttonSecondary} border-transparent text-gray-300 hover:text-white`
                                    }`}
                                >
                                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 bg-transparent border border-dashed border-gray-400" />
                                    <span className="truncate">Match UI Theme</span>
                                </button>
                                {themeOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => onSetContextMenuTheme(opt.id)}
                                        className={`py-1 px-2 text-[10px] font-bold rounded border flex items-center justify-start gap-1.5 transition cursor-pointer ${
                                            contextMenuTheme === opt.id 
                                                ? 'bg-indigo-650 font-bold border-indigo-500 shadow text-white' 
                                                : `${themeClasses.buttonSecondary} border-transparent text-gray-300 hover:text-white`
                                        }`}
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full inline-block shrink-0 ${opt.colors}`} />
                                        <span className="truncate">{opt.name} Menu</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-700/30 pt-3 flex items-center justify-between">
                            <div className="max-w-[180px]">
                                <label className={`block text-[11px] font-bold ${themeClasses.label} uppercase`}>Touch Mobile Mode</label>
                                <span className="text-[9px] text-gray-500 block leading-tight">Enlarge touch targets for mobile devices</span>
                            </div>
                            <button
                                onClick={onToggleMobileMode}
                                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer shrink-0 ${isMobileMode ? 'bg-indigo-600' : 'bg-gray-700'}`}
                            >
                                <div
                                    className={`w-4.5 h-4.5 rounded-full bg-white shadow transform transition-transform duration-200 ${isMobileMode ? 'translate-x-[18px]' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Keyboard Hotkeys Accordion */}
            <div className={`pb-3`}>
                <button
                    type="button"
                    onClick={() => setIsHotkeysOpen(!isHotkeysOpen)}
                    className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-white transition"
                >
                    <span className="flex items-center gap-1.5">⌨️ Keyboard Hotkeys</span>
                    <span className="text-[10px] opacity-60">{isHotkeysOpen ? '▲' : '▼'}</span>
                </button>
                {isHotkeysOpen && (
                    <div className="mt-3 space-y-3.5 pl-1">
                        <p className="text-[10px] text-gray-400 leading-normal">
                          Type keys in combination (e.g., <strong>shift+f</strong>, <strong>ctrl+l</strong>, or <strong>delete</strong>).
                        </p>
                        <div className="space-y-3">
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-1 font-medium uppercase">Center Selected Source</span>
                                <input
                                    type="text"
                                    value={centerHotkey}
                                    onChange={(e) => onSetCenterHotkey(e.target.value)}
                                    className={`w-full text-xs font-mono rounded px-2 py-1.5 border border-transparent ${themeClasses.inputBg} ${themeClasses.text} focus:outline-none focus:border-blue-500`}
                                    placeholder="shift+f"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-1 font-medium uppercase">Fullscreen Toggle</span>
                                <input
                                    type="text"
                                    value={fullscreenHotkey}
                                    onChange={(e) => onSetFullscreenHotkey(e.target.value)}
                                    className={`w-full text-xs font-mono rounded px-2 py-1.5 border border-transparent ${themeClasses.inputBg} ${themeClasses.text} focus:outline-none focus:border-blue-500`}
                                    placeholder="shift+s"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-1 font-medium uppercase">Toggle Lock Target</span>
                                <input
                                    type="text"
                                    value={lockHotkey}
                                    onChange={(e) => onSetLockHotkey(e.target.value)}
                                    className={`w-full text-xs font-mono rounded px-2 py-1.5 border border-transparent ${themeClasses.inputBg} ${themeClasses.text} focus:outline-none focus:border-blue-500`}
                                    placeholder="shift+l"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-1 font-medium uppercase">Toggle Visibility Target</span>
                                <input
                                    type="text"
                                    value={visibilityHotkey}
                                    onChange={(e) => onSetVisibilityHotkey(e.target.value)}
                                    className={`w-full text-xs font-mono rounded px-2 py-1.5 border border-transparent ${themeClasses.inputBg} ${themeClasses.text} focus:outline-none focus:border-blue-500`}
                                    placeholder="shift+v"
                                />
                            </div>

                            {scenes && scenes.length > 0 && (
                                <div className="border-t border-gray-700/30 pt-3 mt-3">
                                    <span className="text-[10px] text-gray-400 block mb-1.5 font-bold uppercase">🎬 Scene Switch Hotkeys</span>
                                    <p className="text-[9px] text-gray-500 mb-2 leading-relaxed">
                                        Activate each scene with a custom combo (e.g. <span className="font-mono">ctrl+1</span> or <span className="font-mono">shift+z</span>).
                                    </p>
                                    <div className="space-y-2 mt-1">
                                        {scenes.map((sc) => {
                                            const hkVal = sceneHotkeys[sc.id] || '';
                                            return (
                                                <div key={sc.id} className="flex items-center justify-between gap-2 bg-black/10 p-1.5 rounded border border-gray-800/20">
                                                    <span className="text-[11px] font-medium truncate flex-1 flex items-center gap-1.5">
                                                        <span className="text-sm shrink-0">{sc.icon || '🎬'}</span>
                                                        <span className="truncate text-zinc-300">{sc.name}</span>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={hkVal}
                                                        onChange={(e) => onSetSceneHotkey(sc.id, e.target.value)}
                                                        className={`w-32 text-xs font-mono rounded px-2 py-1 border border-zinc-700/50 ${themeClasses.inputBg} ${themeClasses.text} focus:outline-none focus:border-blue-500 text-center`}
                                                        placeholder="e.g. ctrl+1"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Backup & Restore Settings Panel */}
            <div className={`pt-3 border-t ${themeClasses.border} space-y-4`}>
                <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">📥 Individual Tab Backup</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onImportCanvasSettings}
                            className={`py-1.5 px-3 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${themeClasses.buttonSecondary} hover:text-white`}
                            title="Restore theme, layouts, hotkeys, scrollbars"
                        >
                            📥 Import Settings
                        </button>
                        <button
                            type="button"
                            onClick={onExportCanvasSettings}
                            className={`py-1.5 px-3 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${themeClasses.buttonSecondary} hover:text-white`}
                            title="Export theme, layouts, hotkeys, scrollbars"
                        >
                            📤 Export Settings
                        </button>
                    </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/20 rounded p-2.5 space-y-2">
                    <div>
                        <h4 className="text-[10.5px] font-bold text-blue-400 uppercase tracking-wider block">🌌 Master Backup</h4>
                        <span className="text-[9px] text-zinc-400 block leading-tight mt-0.5">Save/restore the ENTIRE setup: Scenes, Sources, Layers, Hotkeys, and Performance states.</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onImportMasterBackup}
                            className="py-1.5 px-2 text-[10.5px] font-bold rounded flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-md"
                        >
                            📥 Full Restore
                        </button>
                        <button
                            type="button"
                            onClick={onExportMasterBackup}
                            className="py-1.5 px-2 text-[10.5px] font-bold rounded flex items-center justify-center gap-1 bg-indigo-650 hover:bg-indigo-500 text-white transition cursor-pointer shadow-md"
                        >
                            📤 Full Backup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UIToggle: React.FC<{ 
    isUIVisible: boolean,
    onToggleUIVisibility: () => void,
    theme: Theme
}> = ({ isUIVisible, onToggleUIVisibility, theme }) => {
    const [isHovered, setIsHovered] = useState(false);
    const themeClasses = themes[theme];
    const buttonClass = `${themeClasses.button} ${themeClasses.text} hover:bg-blue-600 hover:text-white`;

    return (
        <div 
            className="fixed bottom-4 right-4 flex items-center space-x-2 pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={onToggleUIVisibility}
                title={isUIVisible ? "Lock Canvas & Hide UI" : "Unlock Canvas & Show UI"}
                className={`transition-all duration-300 ease-in-out ${buttonClass} font-bold p-3 rounded-full shadow-lg transform ${
                    isUIVisible || isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
            >
                {isUIVisible ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                )}
            </button>
        </div>
    );
};

const SceneSwitcher: React.FC<{
    scenes: Scene[];
    activeSceneId: string;
    onSelectScene: (id: string) => void;
    theme: Theme;
}> = ({ scenes, activeSceneId, onSelectScene, theme }) => {
    const [isHovered, setIsHovered] = useState(false);
    const themeClasses = themes[theme];
    return (
        <div 
            className="fixed bottom-4 left-4 pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`flex items-center space-x-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {scenes.map(scene => (
                    <button
                        key={scene.id}
                        onClick={() => onSelectScene(scene.id)}
                        title={scene.name}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors shadow-lg ${
                            activeSceneId === scene.id 
                            ? 'bg-blue-600 text-white' 
                            : `${themeClasses.button} ${themeClasses.text}`
                        }`}
                    >
                       {scene.icon} {scene.name}
                    </button>
                ))}
            </div>
        </div>
    )
}

const TabButton: React.FC<{
    id: string;
    icon: string;
    label: string;
    activeTab: string;
    setActiveTab: (id: string) => void;
    theme: Theme;
    hidden?: boolean;
    onClose?: () => void;
}> = ({ id, icon, label, activeTab, setActiveTab, theme, hidden = false, onClose }) => {
    if (hidden) return null;
    const isActive = activeTab === id;
    const themeClasses = themes[theme];
    return (
        <button 
            onClick={() => setActiveTab(id)}
            title={label}
            className={`p-2 rounded flex-grow transition-colors relative group ${isActive ? 'bg-blue-600 text-white' : `${themeClasses.button} ${themeClasses.itemHover}`}`}
            aria-label={label}
        >
            <span className="text-xl leading-none block" aria-hidden="true">{icon}</span>
            {onClose && (
                <span 
                    onClick={(e) => { e.stopPropagation(); onClose(); }} 
                    className="absolute top-0 right-0 text-xs px-1 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 hover:bg-red-500"
                    title="Close Panel"
                >
                    &times;
                </span>
            )}
        </button>
    );
};


const UI: React.FC<UIProps> = (props) => {
  const { 
    isVisible, onToggleVisibility, theme, activeTab, setActiveTab, 
    isAddingScene, onConfirmAddScene, onCancelAddScene,
    isMobileMode, onToggleMobileMode, isPoppedOut, onTogglePoppedOut,
    panelWidth, onPanelWidthChange, isHoveredOverLeft, onHoveredOverLeftChange,
    scrollbarColor, onSetScrollbarColor,
    performancePreset, onSetPerformancePreset,
    framerateLimit, onSetFramerateLimit,
    renderScale, onSetRenderScale,
    interfaceAnimations, onSetInterfaceAnimations,
    onExportCanvasSettings, onImportCanvasSettings,
    onExportMasterBackup, onImportMasterBackup
  } = props;
  
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // States for slide-out slide, pop-out and resizing behavior
  const [panelHeight, setPanelHeight] = useState(620);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startWidth = panelWidth;
      const startHeight = panelHeight;
      const startX = e.clientX;
      const startY = e.clientY;

      const handleMouseMoveResize = (moveEvent: MouseEvent) => {
          const newWidth = Math.max(285, Math.min(800, startWidth + (moveEvent.clientX - startX)));
          const newHeight = Math.max(300, Math.min(window.innerHeight - 40, startHeight + (moveEvent.clientY - startY)));
          onPanelWidthChange(newWidth);
          setPanelHeight(newHeight);
      };

      const handleMouseUpResize = () => {
          window.removeEventListener('mousemove', handleMouseMoveResize);
          window.removeEventListener('mouseup', handleMouseUpResize);
      };

      window.addEventListener('mousemove', handleMouseMoveResize);
      window.addEventListener('mouseup', handleMouseUpResize);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (panelRef.current) {
          const rect = panelRef.current.getBoundingClientRect();
          dragOffset.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
          };
          setIsDragging(true);
          document.body.style.userSelect = 'none';
      }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
      });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp, { once: true });
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const themeClasses = themes[theme];

  return (
    <div className="absolute inset-0 z-[50000] pointer-events-none">
      {isAddingScene && <AddSceneModal onConfirm={onConfirmAddScene} onClose={onCancelAddScene} theme={theme} />}
      {props.editingScene && (
        <EditSceneModal
          scene={props.editingScene}
          onConfirm={props.onConfirmEditScene}
          onClose={props.onCloseEditSceneModal}
          theme={theme}
        />
      )}
       {props.sourceToDelete && (
        <DeleteConfirmationModal
          onConfirm={props.onConfirmDelete}
          onClose={props.onCancelDelete}
          theme={theme}
        />
      )}
      {props.filteringSource && (
        <FilterPanel
          key={`${props.filteringSource.id}-filter`}
          source={props.filteringSource}
          onUpdateStyle={props.onUpdateSourceStyle}
          onClose={props.onCloseFilterPanel}
          theme={props.theme}
        />
      )}

      <UIToggle 
        isUIVisible={isVisible} 
        onToggleUIVisibility={onToggleVisibility}
        theme={props.theme}
      />
      {!isVisible && (
          <SceneSwitcher 
            scenes={props.scenes}
            activeSceneId={props.activeScene?.id || ''}
            onSelectScene={props.onSetActiveScene}
            theme={props.theme}
          />
      )}
      {(isVisible || isPoppedOut) && (
        <div 
            ref={panelRef}
            onMouseEnter={() => onHoveredOverLeftChange(true)}
            onMouseLeave={() => onHoveredOverLeftChange(false)}
            style={isPoppedOut ? {
                top: `${position.y}px`,
                left: `${position.x}px`,
                width: `${panelWidth}px`,
                height: `${panelHeight}px`,
                maxHeight: 'calc(100vh - 2rem)'
            } : {
                width: `${panelWidth}px`
            }}
            className={isPoppedOut 
                ? `absolute flex flex-col pointer-events-auto transition-all duration-300 ease-out z-[50000] border rounded-lg shadow-2xl ${themeClasses.bg} bg-opacity-85 backdrop-blur-md ${themeClasses.border} ${isVisible ? (props.isAutoHideEnabled && !isHoveredOverLeft ? 'opacity-0 scale-90 pointer-events-none translate-y-2' : 'opacity-100 scale-100 translate-y-0') : 'opacity-0 scale-95 pointer-events-none'}`
                : `fixed top-0 bottom-0 left-0 h-screen flex flex-col pointer-events-auto transition-transform duration-300 ease-in-out z-[50000] border-r ${themeClasses.bg} bg-opacity-95 backdrop-blur-md rounded-r-lg shadow-2xl ${themeClasses.border} ${ (isVisible && (!props.isAutoHideEnabled || isHoveredOverLeft)) ? 'translate-x-0' : '-translate-x-full'}`
            }
        >
            <div 
                onMouseDown={isPoppedOut ? handleMouseDown : undefined}
                className={`flex items-center justify-between px-3 py-2 border-b ${themeClasses.border} ${isPoppedOut ? 'cursor-move' : ''} ${themeClasses.label}`}
            >
                <span className="font-bold text-sm uppercase tracking-wider select-none">Dashboard</span>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={props.onToggleAutoHide}
                        title={props.isAutoHideEnabled ? "Disable auto hide dashboard" : "Enable auto hide dashboard"}
                        className={`px-2 py-0.5 rounded text-xs transition-colors font-medium cursor-pointer ${props.isAutoHideEnabled ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-gray-200'}`}
                    >
                        {props.isAutoHideEnabled ? 'UNHIDE' : 'HIDE'}
                    </button>
                    <button
                        onClick={props.onToggleHotkeys}
                        title={props.isHotkeysEnabled ? "Disable keyboard hotkeys" : "Enable keyboard hotkeys"}
                        className={`px-2 py-0.5 rounded text-xs transition-colors font-medium cursor-pointer ${props.isHotkeysEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-gray-200'}`}
                    >
                        {props.isHotkeysEnabled ? '⌨️ ON' : '⌨️ OFF'}
                    </button>
                    <button
                        onClick={onTogglePoppedOut}
                        title={isPoppedOut ? "Dock Dashboard to Left (Slide-out)" : "Pop Out Panel & Customize Dimensions"}
                        className={`px-2 py-0.5 rounded text-xs transition-colors bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer`}
                    >
                        {isPoppedOut ? '📥 Dock' : '↗️ Pop Out'}
                    </button>
                </div>
            </div>
            <div className={`flex items-center p-1 border-b ${themeClasses.border} space-x-1 flex-wrap`}>
                <TabButton id="sources" icon="📝" label="Sources" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
                <TabButton id="scenes" icon="🎬" label="Scenes" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
                <TabButton id="canvas" icon="🖼️" label="Canvas Settings" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
                <TabButton id="stats" icon="📊" label="Stats" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
                <TabButton id="settings" icon="⚙️" label="Source Settings" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} hidden={!props.selectedSource} onClose={() => { props.onSelectSource(null); setActiveTab('sources'); }} />
            </div>

            <div className="flex-grow overflow-y-auto overflow-x-hidden">
                 {activeTab === 'sources' && (
                    <SourceManager 
                        sources={props.activeScene?.sources || []} 
                        onAddSource={props.onAddSource}
                        onDeleteSource={props.onDeleteSource}
                        onUpdateSourceLayer={props.onUpdateSourceLayer}
                        onImportSources={props.onImportSources}
                        onExportSources={props.onExportSources}
                        onCenterSource={props.onCenterSource}
                        onFullscreenSource={props.onFullscreenSource}
                        onUndo={props.onUndo}
                        onRedo={props.onRedo}
                        canUndo={props.canUndo}
                        canRedo={props.canRedo}
                        selectedSourceId={props.selectedSource?.id || null}
                        onSelectSource={props.onSelectSource}
                        setActiveTab={setActiveTab}
                        isSnapToGridEnabled={props.isSnapToGridEnabled}
                        onToggleSnapToGrid={props.onToggleSnapToGrid}
                        theme={props.theme}
                        onOpenFilterPanel={props.onOpenFilterPanel}
                        onToggleSourceVisibility={props.onToggleSourceVisibility}
                        onToggleSourceLock={props.onToggleSourceLock}
                        onReorderSources={props.onReorderSources}
                        onSourceContextMenu={props.onSourceContextMenu}
                        copiedSource={props.copiedSource}
                        onCopySource={props.onCopySource}
                        onPasteSource={props.onPasteSource}
                    />
                 )}
                {activeTab === 'scenes' && (
                    <SceneManager 
                        scenes={props.scenes}
                        activeSceneId={props.activeScene?.id || ''}
                        onSelectScene={props.onSetActiveScene}
                        onAddScene={props.onAddScene}
                        onDeleteScene={props.onDeleteScene}
                        onImportProject={props.onImportProject}
                        onExportProject={props.onExportProject}
                        theme={props.theme}
                        sceneTransition={props.sceneTransition}
                        onSetSceneTransition={props.onSetSceneTransition}
                        onOpenEditSceneModal={props.onOpenEditSceneModal}
                        onDuplicateScene={props.onDuplicateScene}
                    />
                )}
                {activeTab === 'canvas' && (
                    <CanvasSettings 
                        activeScene={props.activeScene}
                        onUpdateScene={props.onUpdateScene}
                        theme={props.theme}
                        onSetTheme={props.onSetTheme}
                        centerHotkey={props.centerHotkey}
                        onSetCenterHotkey={props.onSetCenterHotkey}
                        fullscreenHotkey={props.fullscreenHotkey}
                        onSetFullscreenHotkey={props.onSetFullscreenHotkey}
                        lockHotkey={props.lockHotkey}
                        onSetLockHotkey={props.onSetLockHotkey}
                        visibilityHotkey={props.visibilityHotkey}
                        onSetVisibilityHotkey={props.onSetVisibilityHotkey}
                        canvasResolution={props.canvasResolution}
                        onSetCanvasResolution={props.onSetCanvasResolution}
                        isMobileMode={isMobileMode}
                        onToggleMobileMode={onToggleMobileMode}
                        scrollbarColor={scrollbarColor}
                        onSetScrollbarColor={onSetScrollbarColor}
                        performancePreset={performancePreset}
                        onSetPerformancePreset={onSetPerformancePreset}
                        framerateLimit={framerateLimit}
                        onSetFramerateLimit={onSetFramerateLimit}
                        renderScale={renderScale}
                        onSetRenderScale={onSetRenderScale}
                        interfaceAnimations={interfaceAnimations}
                        onSetInterfaceAnimations={onSetInterfaceAnimations}
                        onExportCanvasSettings={onExportCanvasSettings}
                        onImportCanvasSettings={onImportCanvasSettings}
                        onExportMasterBackup={onExportMasterBackup}
                        onImportMasterBackup={onImportMasterBackup}
                        contextMenuTheme={props.contextMenuTheme}
                        onSetContextMenuTheme={props.onSetContextMenuTheme}
                        sceneHotkeys={props.sceneHotkeys}
                        onSetSceneHotkey={props.onSetSceneHotkey}
                        scenes={props.scenes}
                    />
                )}
                {activeTab === 'stats' && (
                    <StatsPanel
                        actionLog={props.actionLog}
                        onClearLog={props.onClearActionLog}
                        theme={props.theme}
                        activeScene={props.activeScene}
                        scenes={props.scenes}
                        canvasResolution={props.canvasResolution}
                        performancePreset={performancePreset}
                        framerateLimit={framerateLimit}
                        renderScale={renderScale}
                    />
                )}
                {activeTab === 'settings' && props.selectedSource && (
                    <SettingsPanel
                        key={props.selectedSource.id}
                        source={props.selectedSource}
                        onUpdate={props.onUpdateSource}
                        onClose={() => { props.onSelectSource(null); setActiveTab('sources'); }}
                        theme={props.theme}
                    />
                )}
            </div>
            {isPoppedOut && (
                <div
                    onMouseDown={handleResizeMouseDown}
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5 group z-[60000]"
                    title="Drag to resize panel"
                >
                    <svg className="w-3 h-3 text-gray-500 hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 19H12M19 13h-4" />
                    </svg>
                </div>
            )}
            {props.isAutoHideEnabled && !isPoppedOut && isVisible && (
                <div 
                    className="absolute top-0 bottom-0 right-0 w-6 translate-x-full bg-transparent cursor-pointer z-[50002]"
                    title="Hover to show Dashboard"
                />
            )}
        </div>
      )}

      {/* Floating Mini Panel Handle for Popped-Out Auto Hidden State */}
      {isPoppedOut && props.isAutoHideEnabled && !isHoveredOverLeft && isVisible && (
          <div
              onMouseEnter={() => onHoveredOverLeftChange(true)}
              onClick={() => onHoveredOverLeftChange(true)}
              style={{
                  position: 'absolute',
                  top: `${position.y}px`,
                  left: `${position.x}px`,
              }}
              className="w-10 h-10 z-[50001] bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center text-sm cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 border border-indigo-400 group animate-pulse"
              title="Hover to expand Dashboard"
          >
              <span>📊</span>
              <span className="absolute left-12 bg-zinc-950/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-md border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Expand Dashboard
              </span>
          </div>
      )}
    </div>
  );
};

export default UI;