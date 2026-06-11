import React, { useState, useEffect, useRef } from 'react';
import type { Source, Theme, ChromaKey, Filters, Shape } from '../types';
import { themes } from './UI';

interface FilterPanelProps {
  source: Source;
  onUpdateStyle: (id: string, updates: Partial<Source['style']>) => void;
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

const shapes: {id: Shape, name: string}[] = [
    {id: 'circle', name: 'Circle'},
    {id: 'oval', name: 'Oval'},
    {id: 'triangle', name: 'Triangle'},
    {id: 'diamond', name: 'Diamond'},
    {id: 'star', name: 'Star'},
    {id: 'hexagon', name: 'Hexagon'},
];

const FilterPanel: React.FC<FilterPanelProps> = ({ source, onUpdateStyle, onClose, theme }) => {
  const { id, style } = source;
  const chromaKey = style.chromaKey || { enabled: false, color: '#00ff00', sensitivity: 20 };
  const colorKey = style.colorKey || { enabled: false, color: '#ff00ff', sensitivity: 20 };
  const filters = style.filters || { hue: 0, blur: 0, sharpness: 0, shape: 'none' };
  
  const themeClasses = themes[theme];

  const [position, setPosition] = useState({ x: 200, y: 150 });
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(550);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const x = Math.max(50, (window.innerWidth - width) / 2);
    const y = Math.max(50, (window.innerHeight - height) / 2);
    setPosition({ x, y });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newX = Math.max(0, Math.min(window.innerWidth - width, moveEvent.clientX - dragOffset.current.x));
        const newY = Math.max(0, Math.min(window.innerHeight - height, moveEvent.clientY - dragOffset.current.y));
        setPosition({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startWidth = width;
    const startHeight = height;
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMoveResize = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(340, Math.min(1000, startWidth + (moveEvent.clientX - startX)));
      const newHeight = Math.max(300, Math.min(window.innerHeight - 40, startHeight + (moveEvent.clientY - startY)));
      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handleMouseUpResize = () => {
      window.removeEventListener('mousemove', handleMouseMoveResize);
      window.removeEventListener('mouseup', handleMouseUpResize);
    };

    window.addEventListener('mousemove', handleMouseMoveResize);
    window.addEventListener('mouseup', handleMouseUpResize);
  };

  const handleChromaKeyChange = (updates: Partial<ChromaKey>) => {
      onUpdateStyle(id, { chromaKey: { ...chromaKey, ...updates }});
  }

  const handleColorKeyChange = (updates: Partial<ChromaKey>) => {
      onUpdateStyle(id, { colorKey: { ...colorKey, ...updates }});
  }

  const handleFilterChange = (updates: Partial<Filters>) => {
      onUpdateStyle(id, { filters: { ...filters, ...updates } });
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 110000
      }}
      className={`flex flex-col border rounded-xl shadow-2xl overflow-hidden backdrop-blur-md ${themeClasses.bg} bg-opacity-90 ${themeClasses.border} pointer-events-auto`}
    >
      {/* Header bar */}
      <div
        onMouseDown={handleMouseDown}
        className={`flex items-center justify-between px-4 py-3 border-b cursor-move select-none ${themeClasses.border} ${themeClasses.label}`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-xl">🎨</span>
          <h2 className="text-sm font-bold truncate max-w-[200px]">Filters: {source.name}</h2>
        </div>
        <button 
          onClick={onClose} 
          title="Close Filters Window" 
          className={`text-2xl font-light leading-none hover:scale-110 transition-transform cursor-pointer ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
        >
          &times;
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 text-left">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-blue-500">Color Key</h3>
          <div className="flex items-center justify-between">
              <label className="text-sm">Enable Filter</label>
              <button onClick={() => handleColorKeyChange({ enabled: !colorKey.enabled })} className={`px-3 py-1 text-xs rounded-full cursor-pointer ${colorKey.enabled ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}>{colorKey.enabled ? 'ON' : 'OFF'}</button>
          </div>
          {colorKey.enabled && (
               <div className={`pl-3 mt-2 ml-2 border-l-2 ${themeClasses.border}`}>
                  <SettingsInput label="Key Color" theme={theme}>
                      <input type="color" value={colorKey.color} onChange={e => handleColorKeyChange({ color: e.target.value })} className={`w-full h-8 p-0 cursor-pointer ${themeClasses.inputBg} border ${themeClasses.border} rounded`}/>
                  </SettingsInput>
                   <SettingsInput label={`Sensitivity (${colorKey.sensitivity})`} theme={theme}>
                      <input type="range" min="0" max="100" step="1" value={colorKey.sensitivity} onChange={(e) => handleColorKeyChange({ sensitivity: parseInt(e.target.value, 10)})} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}/>
                  </SettingsInput>
               </div>
          )}
        </div>

        <hr className={`${themeClasses.border} my-4`} />
        
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-blue-500">Chroma Key</h3>
          <div className="flex items-center justify-between">
              <label className="text-sm">Enable Filter</label>
              <button onClick={() => handleChromaKeyChange({ enabled: !chromaKey.enabled })} className={`px-3 py-1 text-xs rounded-full cursor-pointer ${chromaKey.enabled ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}>{chromaKey.enabled ? 'ON' : 'OFF'}</button>
          </div>
          {chromaKey.enabled && (
               <div className={`pl-3 mt-2 ml-2 border-l-2 ${themeClasses.border}`}>
                  <SettingsInput label="Key Color" theme={theme}>
                      <input type="color" value={chromaKey.color} onChange={e => handleChromaKeyChange({ color: e.target.value })} className={`w-full h-8 p-0 cursor-pointer ${themeClasses.inputBg} border ${themeClasses.border} rounded`}/>
                  </SettingsInput>
                   <SettingsInput label={`Sensitivity (${chromaKey.sensitivity})`} theme={theme}>
                      <input type="range" min="0" max="100" step="1" value={chromaKey.sensitivity} onChange={(e) => handleChromaKeyChange({ sensitivity: parseInt(e.target.value, 10)})} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}/>
                  </SettingsInput>
               </div>
          )}
        </div>

        <hr className={`${themeClasses.border} my-4`} />
        
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-blue-500">Color & Effects</h3>
          <div className="space-y-3">
            <SettingsInput label={`Hue Rotate (${filters.hue}°)`} theme={theme}>
                <input type="range" min="0" max="360" value={filters.hue} onChange={e => handleFilterChange({ hue: parseInt(e.target.value) })} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </SettingsInput>
            <SettingsInput label={`Blur (${filters.blur}px)`} theme={theme}>
                <input type="range" min="0" max="50" value={filters.blur} onChange={e => handleFilterChange({ blur: parseInt(e.target.value) })} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </SettingsInput>
            <SettingsInput label={`Sharpness (${filters.sharpness}%)`} theme={theme}>
                <input type="range" min="0" max="100" value={filters.sharpness} onChange={e => handleFilterChange({ sharpness: parseInt(e.target.value) })} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </SettingsInput>
          </div>
        </div>

        <hr className={`${themeClasses.border} my-4`} />

        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-blue-500">Audio Mic Reaction</h3>
          <div className="flex items-center justify-between">
              <label className="text-sm">Scale & Shake with Audio</label>
              <button 
                onClick={() => handleFilterChange({ audioReactEnabled: !filters.audioReactEnabled })} 
                className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-colors ${filters.audioReactEnabled ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}
              >
                {filters.audioReactEnabled ? 'ON' : 'OFF'}
              </button>
          </div>
          {filters.audioReactEnabled && (
               <div className={`pl-3 mt-2 ml-2 border-l-2 ${themeClasses.border}`}>
                   <SettingsInput label={`Mic Sensitivity (${filters.audioSensitivity ?? 5})`} theme={theme}>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1" 
                        value={filters.audioSensitivity ?? 5} 
                        onChange={(e) => handleFilterChange({ audioSensitivity: parseInt(e.target.value, 10)})} 
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
                      />
                      <span className="text-[10px] text-gray-400 block mt-1">Controls how much the source scales and shakes to live microphone volume.</span>
                  </SettingsInput>
               </div>
          )}
        </div>

        <hr className={`${themeClasses.border} my-4`} />
        
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-blue-500">Shape Filter (Clip-Path)</h3>
          <div className="grid grid-cols-3 gap-2 pb-6">
              <button onClick={() => handleFilterChange({ shape: 'none' })} className={`py-1.5 text-xs rounded cursor-pointer ${filters.shape === 'none' ? 'bg-blue-600 text-white' : themeClasses.buttonSecondary}`}>Default</button>
              {shapes.map(shape => (
                  <button 
                      key={shape.id}
                      onClick={() => handleFilterChange({ shape: filters.shape === shape.id ? 'none' : shape.id })}
                      className={`py-1.5 text-xs rounded cursor-pointer ${filters.shape === shape.id ? 'bg-blue-600 text-white' : themeClasses.button}`}
                  >
                      {shape.name}
                  </button>
              ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={`p-4 border-t ${themeClasses.border} flex justify-end space-x-2 bg-black bg-opacity-10`}>
          <button 
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
              Done
          </button>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-0.5 z-[130000]"
        title="Drag to resize panel"
      >
        <svg className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 19H12M19 13h-4" />
        </svg>
      </div>
    </div>
  );
};

export default FilterPanel;
