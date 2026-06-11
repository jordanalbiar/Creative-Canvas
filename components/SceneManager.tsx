import React, { useRef, useState } from 'react';
import type { Scene, Theme, SceneTransition, SceneTransitionType } from '../types';
import { themes } from './UI';

interface SceneManagerProps {
  scenes: Scene[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
  onDeleteScene: (id: string) => void;
  onImportProject: () => void;
  onExportProject: () => void;
  theme: Theme;
  sceneTransition: SceneTransition;
  onSetSceneTransition: (transition: SceneTransition) => void;
  onOpenEditSceneModal: (id: string) => void;
  onDuplicateScene: (id: string) => void;
}

export const TRANSITION_EMOJIS: Record<SceneTransitionType, string> = {
  cut: '✂️',
  fade: '🌫️',
  move: '➡️',
  stinger: '🎬'
};

const UploadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> );
const DownloadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> );

const SceneManager: React.FC<SceneManagerProps> = ({ 
  scenes, 
  activeSceneId, 
  onSelectScene, 
  onAddScene, 
  onDeleteScene, 
  onImportProject, 
  onExportProject, 
  theme, 
  sceneTransition, 
  onSetSceneTransition, 
  onOpenEditSceneModal,
  onDuplicateScene
}) => {
  const themeClasses = themes[theme];
  const stingerFileInputRef = useRef<HTMLInputElement>(null);
  const [isTransitionSettingsOpen, setIsTransitionSettingsOpen] = useState(false);

  const handleTransitionChange = (type: SceneTransitionType) => {
    onSetSceneTransition({ ...sceneTransition, type });
  };
  
  const handleStingerFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onSetSceneTransition({ ...sceneTransition, stingerFile: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const transitionTypes: { id: SceneTransitionType, label: string }[] = [
    { id: 'cut', label: 'Cut' },
    { id: 'fade', label: 'Fade' },
    { id: 'move', label: 'Move' },
    { id: 'stinger', label: 'Stinger' },
  ];

  return (
    <div>
      <div className={`flex justify-between items-center p-3 border-b ${themeClasses.border}`}>
        <h2 className="text-lg font-bold">Scenes</h2>
        <div className="flex items-center space-x-2">
            <button onClick={onImportProject} title="Import Project" className={`p-1 rounded ${themeClasses.button}`}><UploadIcon /></button>
            <button onClick={onExportProject} title="Export Project" className={`p-1 rounded ${themeClasses.button}`}><DownloadIcon /></button>
            <button onClick={onAddScene} title="Add Scene" className="bg-blue-600 hover:bg-blue-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-lg active:scale-95 cursor-pointer">+</button>
        </div>
      </div>
      <div className={`border-b ${themeClasses.border}`}>
        {scenes.length > 0 ? (
          <ul>
            {scenes.map(scene => (
              <li
                key={scene.id}
                onClick={() => onSelectScene(scene.id)}
                className={`relative group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors border-l-4 ${activeSceneId === scene.id ? `bg-blue-500/30 border-blue-500 ${themeClasses.text}` : `border-transparent ${themeClasses.itemHover}`}`}
              >
                <div className="flex items-center truncate">
                  <span className="text-2xl mr-3 w-8 text-center">{scene.icon || '🎬'}</span>
                  <span className="truncate text-sm font-medium">{scene.name}</span>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {scene.transition && (
                      <span 
                        className="text-xs mr-1 bg-zinc-800/80 border border-zinc-700 font-bold px-1 rounded"
                        title={`Scene-specific Transition Override Set: ${scene.transition.type}`}
                      >
                        {TRANSITION_EMOJIS[scene.transition.type] || '✨'}
                      </span>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenEditSceneModal(scene.id); }}
                        title={`Edit ${scene.name}`}
                        className={`p-1 rounded ${themeClasses.icon}`}
                    >
                        ⚙️
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDuplicateScene(scene.id); }}
                        title={`Duplicate layout of ${scene.name}`}
                        className={`p-1 rounded ${themeClasses.icon} ml-1`}
                    >
                        👯
                    </button>
                    {scenes.length > 1 && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteScene(scene.id); }}
                          title={`Delete ${scene.name}`}
                          className="ml-2 text-red-500 hover:text-red-400 text-lg"
                      >
                          &times;
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm p-3 text-center ${themeClasses.text} opacity-50`}>No scenes available.</p>
        )}
      </div>
       <div className={`p-3 flex flex-col border-b ${themeClasses.border} pb-3`}>
        <div className="flex items-center justify-between mb-2">
          <label className={`text-xs font-bold ${themeClasses.label} uppercase`}>Scene Transitions</label>
          <button 
            type="button" 
            onClick={() => setIsTransitionSettingsOpen(true)}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 bg-transparent border-none cursor-pointer"
          >
            ⚙️ Customize
          </button>
        </div>
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
          {transitionTypes.map(t => (
            <button
              key={t.id}
              onClick={() => handleTransitionChange(t.id)}
              className={`px-2.5 py-1 text-[10.5px] font-semibold rounded-full active:scale-95 transition-all text-center flex items-center gap-1 cursor-pointer ${sceneTransition.type === t.id ? 'bg-blue-600 text-white shadow-md' : themeClasses.buttonSecondary}`}
            >
              <span>{TRANSITION_EMOJIS[t.id]}</span>
              <span>{t.label}</span>
            </button>
          ))}
          {sceneTransition.type === 'stinger' && (
            <>
              <button onClick={() => stingerFileInputRef.current?.click()} title="Upload Stinger Video" className="p-1 rounded-full bg-green-600 hover:bg-green-500 text-white">🎬</button>
              <input type="file" ref={stingerFileInputRef} onChange={handleStingerFileChange} accept="video/*" className="hidden" />
            </>
          )}
        </div>
      </div>
      <div className="p-3 space-y-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">📥 Scene Tab Backup</span>
        <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={onImportProject} 
                className={`py-1.5 px-3 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${themeClasses.buttonSecondary} hover:text-white`}
                title="Import scenes from a JSON project file"
            >
                📥 Import Scenes
            </button>
            <button 
                onClick={onExportProject} 
                className={`py-1.5 px-3 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition cursor-pointer ${themeClasses.buttonSecondary} hover:text-white`}
                title="Export all scenes & layouts to a JSON project file"
            >
                📤 Export Scenes
            </button>
        </div>
      </div>

      {isTransitionSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 z-[65000] flex items-center justify-center p-4 cursor-default pointer-events-auto" onClick={() => setIsTransitionSettingsOpen(false)}>
          <div className={`rounded-lg shadow-2xl max-w-sm w-full p-5 border relative text-white ${themeClasses.bg} ${themeClasses.border}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-1">⚙️ Transition Settings Adjustment</h3>
              <button onClick={() => setIsTransitionSettingsOpen(false)} className="text-zinc-400 hover:text-white font-bold text-lg cursor-pointer">&times;</button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 uppercase text-zinc-400 text-[10px]">Transition Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['cut', 'fade', 'move', 'stinger'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onSetSceneTransition({ ...sceneTransition, type })}
                      className={`py-1 px-1.5 rounded border text-[10px] font-bold text-center transition cursor-pointer active:scale-95 ${
                        sceneTransition.type === type ? 'bg-blue-600 border-blue-500 text-white shadow' : `${themeClasses.buttonSecondary}`
                      }`}
                    >
                      {TRANSITION_EMOJIS[type]}
                      <span className="block text-[8px] uppercase">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase text-zinc-400 text-[10px]">Duration (Speed): {sceneTransition.speed ?? 500}ms</label>
                <input 
                  type="range" 
                  min="50" 
                  max="5000" 
                  step="50"
                  value={sceneTransition.speed ?? 500}
                  onChange={(e) => onSetSceneTransition({ ...sceneTransition, speed: parseInt(e.target.value, 10) })}
                  className="w-full h-2 rounded bg-zinc-800 appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase text-zinc-400 text-[10px]">Motion Easing Style</label>
                <select
                  value={sceneTransition.style || 'ease-in-out'}
                  onChange={(e) => onSetSceneTransition({ ...sceneTransition, style: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-300"
                >
                  <option value="ease">Ease</option>
                  <option value="linear">Linear</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In-Out</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 uppercase text-zinc-400 text-[10px]">Transition Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={sceneTransition.color || '#000000'} 
                    onChange={(e) => onSetSceneTransition({ ...sceneTransition, color: e.target.value })}
                    className="w-9 h-8 rounded border-none bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={sceneTransition.color || '#000000'} 
                    onChange={(e) => onSetSceneTransition({ ...sceneTransition, color: e.target.value })}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-300 text-[11px] font-mono"
                  />
                </div>
              </div>

              {sceneTransition.type === 'stinger' && (
                <div className="border-t border-zinc-800 pt-3 space-y-3">
                  <h4 className="font-bold text-yellow-500 uppercase tracking-widest text-[9px]">🎞️ Stinger Clip Adjustments</h4>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-400 text-[10px]">Stinger File</label>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => stingerFileInputRef.current?.click()} 
                        className="py-1 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer active:scale-95"
                      >
                        📂 Select Video File
                      </button>
                      <input type="file" ref={stingerFileInputRef} onChange={handleStingerFileChange} accept="video/*" className="hidden" />
                      {sceneTransition.stingerFile ? <span className="text-zinc-500 truncate text-[10px] max-w-[200px]">Active Custom Clip Loaded</span> : <span className="text-zinc-650 italic text-[10px]">No file loaded yet</span>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1 text-zinc-400 text-[10px]">Clipping Start (sec)</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.1"
                        value={sceneTransition.stingerStart || 0}
                        onChange={(e) => onSetSceneTransition({ ...sceneTransition, stingerStart: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-zinc-400 text-[10px]">Clipping Stop (sec)</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.1"
                        value={sceneTransition.stingerStop || 0}
                        placeholder="End of Clip"
                        onChange={(e) => onSetSceneTransition({ ...sceneTransition, stingerStop: parseFloat(e.target.value) || undefined })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-white text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-zinc-400 text-[10px]">Playback velocity multiplier</label>
                    <select
                      value={sceneTransition.stingerSpeed || 1.0}
                      onChange={(e) => onSetSceneTransition({ ...sceneTransition, stingerSpeed: parseFloat(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-300 text-[11px]"
                    >
                      <option value="0.25">0.25x SlowMo</option>
                      <option value="0.5">0.5x Half Speed</option>
                      <option value="0.75">0.75x Speed</option>
                      <option value="1.0">1.0x Normal Velocity</option>
                      <option value="1.25">1.25x Speed</option>
                      <option value="1.5">1.5x Fast</option>
                      <option value="2.0">2.0x Double speed</option>
                      <option value="3.0">3.0x Hyper speed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-5 flex justify-end">
              <button 
                type="button"
                onClick={() => setIsTransitionSettingsOpen(false)}
                className="px-4 py-2 text-xs rounded font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95"
              >
                Apply & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneManager;
