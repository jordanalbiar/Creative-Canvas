
import React, { useState, useRef } from 'react';
import type { Source, SourceType, Theme } from '../types';
import { themes } from './UI';

interface SourceManagerProps {
  sources: Source[];
  onAddSource: (type: SourceType) => void;
  onDeleteSource: (id: string) => void;
  onUpdateSourceLayer: (id: string, direction: 'up' | 'down') => void;
  onImportSources: () => void;
  onExportSources: () => void;
  onCenterSource: (id: string) => void;
  onFullscreenSource: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedSourceId: string | null;
  onSelectSource: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  isSnapToGridEnabled: boolean;
  onToggleSnapToGrid: () => void;
  theme: Theme;
  onOpenFilterPanel: (id: string) => void;
  onToggleSourceVisibility: (id: string) => void;
  onToggleSourceLock: (id: string) => void;
  onReorderSources: (orderedIds: string[]) => void;
  onSourceContextMenu?: (e: React.MouseEvent, sourceId: string) => void;
  copiedSource: Source | null;
  onCopySource: (id: string) => void;
  onPasteSource: () => void;
}

const sourceTypes: {type: SourceType, label: string, icon: string}[] = [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'video', label: 'Video', icon: '📹' },
    { type: 'camera', label: 'Camera', icon: '📸' },
    { type: 'capture', label: 'Capture', icon: '🖥️'},
    { type: 'iframe', label: 'Web', icon: '🌐' },
    { type: 'color', label: 'Color', icon: '🎨' },
    { type: 'gallery', label: 'Gallery', icon: '🎞️' },
    { type: 'code', label: 'Code', icon: '💻' },
    { type: 'paint', label: 'Paint', icon: '🖌️' },
    { type: 'visualizer', label: 'Visualizer', icon: '📊' },
    { type: 'emoji', label: 'Emoji', icon: '😀' },
    { type: 'youtube', label: 'YouTube', icon: '📺' },
    { type: 'twitch', label: 'Twitch', icon: '🎮' }
];

const GridIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM10 4v16m4-16v16M4 10h16M4 14h16" /></svg> );
const UploadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> );
const DownloadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> );
const CenterIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l-7 7 7 7"/></svg> );
const FitToScreenIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg> );


const SourceManager: React.FC<SourceManagerProps> = (props) => {
  const { sources, onAddSource, onDeleteSource, onUpdateSourceLayer, onImportSources, onExportSources, onCenterSource, onFullscreenSource, selectedSourceId, onSelectSource, setActiveTab, isSnapToGridEnabled, onToggleSnapToGrid, theme, onOpenFilterPanel, onUndo, onRedo, canUndo, canRedo, onToggleSourceVisibility, onToggleSourceLock, onReorderSources, onSourceContextMenu, copiedSource, onCopySource, onPasteSource } = props;
  
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);
  const [isCopiedIndicatorDismissed, setCopiedIndicatorDismissed] = useState(false);

  React.useEffect(() => {
    if (copiedSource) {
      setCopiedIndicatorDismissed(false);
    } else {
      setCopiedIndicatorDismissed(true);
    }
  }, [copiedSource?.id]);

  const sortedSources = [...sources].sort((a,b) => b.style.zIndex - a.style.zIndex);
  const zIndexMinMax = sources.reduce((acc, s) => ({
      min: Math.min(acc.min, s.style.zIndex),
      max: Math.max(acc.max, s.style.zIndex),
  }), {min: Infinity, max: -Infinity});
  
  const selectedSourceZIndex = sources.find(s => s.id === selectedSourceId)?.style.zIndex;

  const handleDragStart = (id: string) => {
      dragItem.current = id;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, id: string) => {
      e.preventDefault();
      dragOverItem.current = id;
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      setDropPosition(e.clientY < midpoint ? 'top' : 'bottom');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
      if (e.relatedTarget !== e.currentTarget) {
          dragOverItem.current = null;
          setDropPosition(null);
      }
  };

  const handleDrop = () => {
      if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
          const currentIds = sortedSources.map(s => s.id);
          const dragItemIndex = currentIds.indexOf(dragItem.current);
          const dragOverItemIndex = currentIds.indexOf(dragOverItem.current);
          
          const newIds = [...currentIds];
          const [draggedItem] = newIds.splice(dragItemIndex, 1);
          
          let insertIndex = dragOverItemIndex;
          if (dropPosition === 'bottom') {
              insertIndex = dragOverItemIndex + 1;
              if (dragItemIndex < dragOverItemIndex) {
                 insertIndex -= 1;
              }
          } else { // 'top'
               if (dragItemIndex < dragOverItemIndex) {
                 // no change
               } else {
                 insertIndex = dragOverItemIndex;
               }
          }
          
          newIds.splice(insertIndex, 0, draggedItem);
          onReorderSources(newIds);
      }
      dragItem.current = null;
      dragOverItem.current = null;
      setDropPosition(null);
  };
  
  const themeClasses = themes[theme];
  const buttonClass = `p-1.5 rounded ${themeClasses.button} disabled:opacity-30 disabled:cursor-not-allowed`;
  const iconButtonClass = `${buttonClass} flex items-center justify-center text-lg`;

  return (
    <div>
      <div className={`flex justify-between items-center p-3 border-b ${themeClasses.border}`}>
        <h2 className="text-lg font-bold">Sources</h2>
        <div className="flex items-center space-x-1">
            <button onClick={onUndo} disabled={!canUndo} title="Undo" className={buttonClass}>↩️</button>
            <button onClick={onRedo} disabled={!canRedo} title="Redo" className={buttonClass}>↪️</button>
            <button onClick={onImportSources} title="Import Sources" className={buttonClass}><UploadIcon /></button>
            <button onClick={onExportSources} title="Export Sources" className={buttonClass}><DownloadIcon /></button>
            <button 
                onClick={onToggleSnapToGrid}
                title="Toggle Snap to Grid"
                className={`p-1 rounded ${isSnapToGridEnabled ? 'bg-blue-600 text-white' : themeClasses.button}`}
            >
                <GridIcon />
            </button>
        </div>
      </div>

      <div className={`p-2 border-b ${themeClasses.border} grid grid-cols-5 gap-1`}>
          {sourceTypes.map(({ type, label, icon }) => (
              <button
                  key={type}
                  onClick={() => onAddSource(type)}
                  title={`Add ${label} Source`}
                  className={`flex flex-col items-center justify-center p-1 rounded text-xs ${themeClasses.button} ${themeClasses.itemHover}`}
              >
                  <span className="text-lg">{icon}</span>
                  <span className="mt-1 text-[10px]">{label}</span>
              </button>
          ))}
      </div>

      {copiedSource && !isCopiedIndicatorDismissed && (
        <div className={`p-2 px-3 border-b ${themeClasses.border} flex items-center justify-between text-xs font-sans ${theme === 'dark' ? 'bg-emerald-950/20 text-emerald-300 border-emerald-900/40' : 'bg-emerald-50 text-emerald-800 border-emerald-200'} font-medium`}>
          <div className="flex items-center gap-1.5 truncate mr-2 flex-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="shrink-0 font-semibold text-emerald-600">Can Paste:</span>
            <span className="truncate underline font-mono text-[10.5px] max-w-[120px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-300">{copiedSource.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onPasteSource}
              className="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:scale-[1.03] transition-all cursor-pointer"
              title="Paste Into Active Scene"
            >
              Paste
            </button>
            <button
              onClick={() => setCopiedIndicatorDismissed(true)}
              className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold leading-none cursor-pointer text-sm"
              title="Dismiss Clipboard"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
      <div className={`border-b ${themeClasses.border}`} onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
        {sources.length > 0 ? (
          <ul>
            {sortedSources.map(source => (
              <li
                key={source.id}
                onClick={() => onSelectSource(source.id)}
                onContextMenu={(e) => {
                  if (onSourceContextMenu) {
                    onSourceContextMenu(e, source.id);
                  }
                }}
                className={`relative group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors border-l-4 ${!source.visible ? 'opacity-50' : ''} ${source.locked ? 'bg-red-500/10' : ''} ${selectedSourceId === source.id ? `bg-blue-500/30 border-blue-500 ${themeClasses.text}` : `border-transparent ${themeClasses.itemHover}`}`}
                draggable
                onDragStart={() => handleDragStart(source.id)}
                onDragEnter={(e) => handleDragEnter(e, source.id)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDrop}
              >
                {dragOverItem.current === source.id && dropPosition === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />}
                <div className="flex items-center truncate">
                   <button 
                      onClick={(e) => { e.stopPropagation(); onToggleSourceLock(source.id); }} 
                      title={source.locked ? 'Unlock Source' : 'Lock Source'}
                      className={`mr-2 p-1 rounded-full ${themeClasses.icon}`}
                  >
                      {source.locked ? '🔒' : '🔓'}
                  </button>
                  <button 
                      onClick={(e) => { e.stopPropagation(); onToggleSourceVisibility(source.id); }} 
                      title={source.visible ? 'Hide Source' : 'Show Source'}
                      className={`mr-2 p-1 rounded-full ${themeClasses.icon}`}
                  >
                      {source.visible ? '👁️' : '🙈'}
                  </button>
                  <span className="truncate text-sm font-medium">{source.name}</span>
                </div>
                 <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onCopySource(source.id); }} 
                        title="Copy Source Configuration"
                        className={`p-1 rounded ${themeClasses.icon}`}
                    >📋</button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSelectSource(source.id); setActiveTab('settings'); }} 
                        title="Settings"
                        className={`p-1 rounded ${themeClasses.icon}`}
                    >⚙️</button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenFilterPanel(source.id); }} 
                        title="Filters"
                        className={`p-1 rounded ${themeClasses.icon}`}
                    >🖌️</button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSource(source.id); }} 
                        title="Delete Source"
                        className="ml-2 text-red-500 hover:text-red-400 text-lg"
                    >
                        &times;
                    </button>
                 </div>
                {dragOverItem.current === source.id && dropPosition === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm p-3 text-center ${themeClasses.text} opacity-50`}>No sources in this scene.</p>
        )}
      </div>
      <div className={`p-2 flex items-center justify-between`}>
        <div className="flex items-center space-x-1">
            <button 
              onClick={() => selectedSourceId && onDeleteSource(selectedSourceId)} 
              disabled={!selectedSourceId} 
              className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg" 
              title="Delete Source"
            >
              🗑️
            </button>
            <button 
              onClick={() => selectedSourceId && onCopySource(selectedSourceId)} 
              disabled={!selectedSourceId} 
              className="px-2 py-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[11px] font-bold text-zinc-100" 
              title="Copy Selected"
            >
              📋 Copy
            </button>
            {copiedSource && (
              <button 
                onClick={onPasteSource} 
                className="px-2 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-[11px] font-bold text-white animate-pulse" 
                title="Paste Clipboard Source"
              >
                📋 Paste
              </button>
            )}
        </div>
        <div className="flex items-center space-x-1">
            <button onClick={() => selectedSourceId && onCenterSource(selectedSourceId)} disabled={!selectedSourceId} className={buttonClass} title="Center Source"><CenterIcon/></button>
            <button onClick={() => selectedSourceId && onFullscreenSource(selectedSourceId)} disabled={!selectedSourceId} className={buttonClass} title="Fit to Screen"><FitToScreenIcon/></button>
            <button onClick={() => selectedSourceId && onUpdateSourceLayer(selectedSourceId, 'up')} disabled={!selectedSourceId || selectedSourceZIndex === zIndexMinMax.max} className={iconButtonClass} title="Move Up">↑</button>
            <button onClick={() => selectedSourceId && onUpdateSourceLayer(selectedSourceId, 'down')} disabled={!selectedSourceId || selectedSourceZIndex === zIndexMinMax.min} className={iconButtonClass} title="Move Down">↓</button>
        </div>
      </div>
    </div>
  );
};

export default SourceManager;
