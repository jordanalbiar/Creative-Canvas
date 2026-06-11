import React, { useState, useEffect, useRef } from 'react';
import type { ActionLogEntry, Theme, Scene } from '../types';
import { themes } from './UI';
import { 
  renderOutput, 
  ScalingFilter, 
  OUTPUT_RESOLUTIONS, 
  Resolution 
} from '../utils/encoder';

interface StatsPanelProps {
  actionLog: ActionLogEntry[];
  onClearLog: () => void;
  theme: Theme;
  activeScene?: Scene;
  scenes?: Scene[];
  canvasResolution: string;
  performancePreset?: string;
  framerateLimit?: string;
  renderScale?: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getResolutionDimensions = (res: string) => {
  switch (res) {
    case '240': return { width: 426, height: 240 };
    case '480': return { width: 854, height: 480 };
    case '720': return { width: 1280, height: 720 };
    case '1080': return { width: 1920, height: 1080 };
    case '2k': return { width: 2560, height: 1440 };
    case '4k': return { width: 3840, height: 2160 };
    default: return { width: 1920, height: 1080 };
  }
};

const appStartTime = Date.now();

const StatsPanel: React.FC<StatsPanelProps> = ({ 
  actionLog, 
  onClearLog, 
  theme,
  activeScene,
  scenes = [],
  canvasResolution,
  performancePreset = 'high',
  framerateLimit = 'uncapped',
  renderScale = '1.0'
}) => {
    const [fps, setFps] = useState(0);
    const [frameTime, setFrameTime] = useState(0);
    const [memory, setMemory] = useState<any>(null);
    const [importedProfile, setImportedProfile] = useState<any>(null);
    const [tickTrigger, setTickTrigger] = useState(0);
    const [selectedSceneId, setSelectedSceneId] = useState<string>(activeScene?.id || '');
    const [timeSpent, setTimeSpent] = useState<string>('0s');

    useEffect(() => {
        const updateSec = () => {
          const seconds = Math.floor((Date.now() - appStartTime) / 1000);
          const h = Math.floor(seconds / 3600);
          const m = Math.floor((seconds % 3600) / 60);
          const s = seconds % 60;
          
          let durationStr = '';
          if (h > 0) durationStr += `${h}h `;
          if (m > 0 || h > 0) durationStr += `${m}m `;
          durationStr += `${s}s`;
          setTimeSpent(durationStr);
        };
        updateSec();
        const interval = setInterval(updateSec, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeScene) {
            setSelectedSceneId(activeScene.id);
        }
    }, [activeScene?.id]);

    const targetTelemetryScene = (scenes && scenes.length > 0)
        ? (scenes.find(s => s.id === selectedSceneId) || activeScene)
        : activeScene;

    const frameTimes = useRef<number[]>([]);
    const lastFrameTime = useRef(performance.now());
    const animationFrameRef = useRef<number | null>(null);
    const themeClasses = themes[theme];

    // Encoder properties
    const [scalingFilter, setScalingFilter] = useState<ScalingFilter>('Bilinear');
    const [outputResolution, setOutputResolution] = useState<Resolution>(OUTPUT_RESOLUTIONS[1]); // DEFAULT 720P
    const [encoderStatus, setEncoderStatus] = useState<string>('Bypass Active (Locked Aspect Ratio)');
    const [renderTime, setRenderTime] = useState<number>(0);
    const outputCanvasRef = useRef<HTMLCanvasElement>(null);

    const baseRes = getResolutionDimensions(canvasResolution);

    // Performance loops
    useEffect(() => {
        const animate = (now: number) => {
            const limit = framerateLimit === 'uncapped' ? 0 : 1000 / parseInt(framerateLimit, 10);
            const delta = now - lastFrameTime.current;
            
            if (limit > 0 && delta < limit) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }
            lastFrameTime.current = now - (delta % (limit || 16));

            frameTimes.current.push(delta);
            if (frameTimes.current.length > 60) {
                frameTimes.current.shift();
            }

            const totalFrameTime = frameTimes.current.reduce((acc, time) => acc + time, 0);
            const averageFrameTime = totalFrameTime / frameTimes.current.length;
            
            setFrameTime(averageFrameTime);
            setFps(1000 / averageFrameTime);
            setTickTrigger(prev => prev + 1);

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        const memoryInterval = setInterval(() => {
            if ('memory' in performance) {
                setMemory((performance as any).memory);
            }
        }, 1000);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            clearInterval(memoryInterval);
        };
    }, []);

    // Live software scaling loop (Throttled to maintain performance)
    useEffect(() => {
        if (!activeScene) return;

        let active = true;
        const tick = () => {
          if (!active) return;
          const t0 = performance.now();
          
          renderOutput(
            activeScene,
            baseRes.width,
            baseRes.height,
            outputResolution.width,
            outputResolution.height,
            scalingFilter,
            (renderedCanvas) => {
              const canvas = outputCanvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0,0, canvas.width, canvas.height);
                  ctx.drawImage(renderedCanvas, 0, 0, canvas.width, canvas.height);
                }
              }
              const t1 = performance.now();
              setRenderTime(t1 - t0);
            }
          );
        };

        // Render initially
        tick();

        // Update when changes happen or periodically
        const interval = setInterval(tick, 1000);

        return () => {
          active = false;
          clearInterval(interval);
        };
    }, [activeScene, canvasResolution, scalingFilter, outputResolution, baseRes.width, baseRes.height]);
    
    const handleExportLog = () => {
        const logText = actionLog
            .map(entry => `[${new Date(entry.timestamp).toISOString()}] ${entry.message}`)
            .reverse()
            .join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `creative-canvas-log-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportPerformanceProfile = () => {
        const profile = {
          type: 'creative_canvas_performance_profile',
          timestamp: new Date().toISOString(),
          fps: parseFloat(fps.toFixed(1)),
          frameTime: parseFloat(frameTime.toFixed(1)),
          memory: memory ? formatBytes(memory.usedJSHeapSize) : '9.3 MB',
          activePreset: performancePreset,
          framerateLimit: framerateLimit,
          renderScale: renderScale,
          canvasResolution,
          totalSources: activeScene?.sources.length || 0
        };
        const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-benchmark-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportPerformanceProfile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const parsed = JSON.parse(event.target?.result as string);
                if (parsed.type === 'creative_canvas_performance_profile') {
                  setImportedProfile(parsed);
                  alert(`Performance baseline imported! Baseline was ${parsed.fps} FPS @ ${parsed.frameTime}ms Frame Time.`);
                } else {
                  alert("Invalid file format. Must be a Creative Canvas Performance Profile backup JSON.");
                }
              } catch {
                alert("Corrupt or invalid JSON file.");
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
    };

    const handleExportPristineFrame = () => {
        if (!activeScene) return;
        renderOutput(
          activeScene,
          baseRes.width,
          baseRes.height,
          outputResolution.width,
          outputResolution.height,
          scalingFilter,
          (renderedCanvas) => {
            const dataUrl = renderedCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `encoder-output-${outputResolution.width}x${outputResolution.height}-${scalingFilter.toLowerCase()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        );
    };

    return (
        <div>
            <div className={`p-3 border-b ${themeClasses.border}`}>
                <h2 className="text-lg font-bold">Stats & Console</h2>
            </div>
            
            <div className="p-3 space-y-4">
                <div className={`p-3 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} space-y-3`}>
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs uppercase tracking-wide text-zinc-400">UI Preview Benchmarks</h3>
                        {importedProfile && (
                            <button 
                                onClick={() => setImportedProfile(null)} 
                                className="text-[9px] text-red-500 hover:text-red-400 font-bold bg-transparent border-none cursor-pointer"
                            >
                                Clear Comparison ✕
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                            <div className="font-bold text-green-400 text-base">{fps.toFixed(1)}</div>
                            <div className={`text-[10px] ${themeClasses.label}`}>FPS</div>
                            {importedProfile && (
                                <div className={`text-[9.5px] font-bold font-mono leading-none mt-1 ${fps >= importedProfile.fps ? 'text-green-400' : 'text-red-400'}`}>
                                    {fps >= importedProfile.fps ? '▲' : '▼'} {(fps - importedProfile.fps).toFixed(1)}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-yellow-400 text-base">{frameTime.toFixed(1)}ms</div>
                            <div className={`text-[10px] ${themeClasses.label}`}>Frame Time</div>
                            {importedProfile && (
                                <div className={`text-[9.5px] font-bold font-mono leading-none mt-1 ${frameTime <= importedProfile.frameTime ? 'text-green-400' : 'text-red-400'}`}>
                                    {frameTime <= importedProfile.frameTime ? '▲' : '▼'} {(frameTime - importedProfile.frameTime).toFixed(1)}ms
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-blue-400 text-base">{memory ? formatBytes(memory.usedJSHeapSize, 1) : '9.3 MB'}</div>
                            <div className={`text-[10px] ${themeClasses.label}`}>Memory</div>
                            {importedProfile && (
                                <div className="text-[9.5px] text-zinc-500 font-mono leading-none mt-1 truncate" title={`Base: ${importedProfile.memory}`}>
                                    Base: {importedProfile.memory}
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                {/* Browser environment & hardware telemetry card */}
                <div className={`p-3 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} space-y-2.5`}>
                    <h3 className="font-bold text-xs uppercase tracking-wide text-zinc-400">Browser Telemetry</h3>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-mono leading-relaxed text-zinc-350">
                        <div>🖥️ Screen: <span className="text-white font-semibold">{window.screen?.width || 0}x{window.screen?.height || 0}</span></div>
                        <div>🔌 CPU Cores: <span className="text-white font-semibold">{navigator.hardwareConcurrency || 'N/A'} Threads</span></div>
                        <div>💾 Device Mem: <span className="text-white font-semibold">{(navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'N/A'}</span></div>
                        <div>🌐 Connection: <span className="text-white font-semibold">
                          {(() => {
                            const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
                            const typeStr = conn ? (conn.type || conn.effectiveType || '') : '';
                            const status = typeStr ? `${typeStr.toUpperCase()}` : (navigator.onLine ? 'WiFi/Ethernet' : 'Offline');
                            return navigator.onLine ? `${status} (Online)` : 'Offline';
                          })()}
                        </span></div>
                        <div>🌐 Language: <span className="text-white font-semibold">{navigator.language || 'en-US'}</span></div>
                        <div>🕒 Time Zone: <span className="text-white font-semibold" title={Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}>
                          {Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
                        </span></div>
                        <div className="col-span-2">⏱️ App Time spent: <span className="text-emerald-400 font-semibold">{timeSpent}</span></div>
                        <div className="col-span-2 border-t border-zinc-800/60 pt-1.5 mt-1">
                          <div className="text-[10px] uppercase text-zinc-500 font-semibold mb-1">🔥 Most Used Features:</div>
                          <ul className="list-disc list-inside space-y-0.5 text-[10px] text-zinc-400">
                            {(() => {
                              try {
                                const saved = localStorage.getItem('creative_canvas_feature_usages');
                                if (saved) {
                                  const parsedObj = JSON.parse(saved);
                                  const sorted = Object.entries(parsedObj)
                                    .filter(([_, count]) => typeof count === 'number' && count > 0)
                                    .sort((a, b) => (b[1] as number) - (a[1] as number));
                                  if (sorted.length > 0) {
                                    return sorted.slice(0, 3).map(([feature, count]) => (
                                      <li key={feature} className="truncate">
                                        <span className="text-zinc-300">{feature}</span> <span className="text-indigo-400">({count} counts)</span>
                                      </li>
                                    ));
                                  }
                                }
                              } catch {}
                              return (
                                <>
                                  <li><span className="text-zinc-300">Source Customization</span> <span className="text-indigo-400">(Initial baseline)</span></li>
                                  <li><span className="text-zinc-300">Scene Management</span></li>
                                </>
                              );
                            })()}
                          </ul>
                        </div>
                        <div className="col-span-2 truncate border-t border-zinc-800/40 pt-1 text-[9.5px]" title={navigator.userAgent}>🤖 UA: <span className="text-zinc-500">{navigator.userAgent.slice(0, 75)}...</span></div>
                    </div>
                </div>

                {/* Source Diagnostics Telemetry */}
                <div className={`p-3 rounded-lg border ${themeClasses.border} ${themeClasses.inputBg} space-y-3`}>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold text-xs uppercase tracking-wide text-indigo-400 flex items-center gap-1.5">
                          📊 Scene Source Telemetry
                        </h3>
                        {scenes && scenes.length > 0 && (
                          <div className="flex flex-col gap-1.5 pb-1.5 border-b border-zinc-800/65">
                            <div className="flex items-center gap-1.5 pb-1 overflow-x-auto overflow-y-hidden max-h-12 scrollbar-none w-full">
                              {scenes.map(s => {
                                const isActive = s.id === selectedSceneId;
                                const isCurrentCanvas = activeScene?.id === s.id;
                                return (
                                  <button
                                    key={s.id}
                                    onClick={() => setSelectedSceneId(s.id)}
                                    title={s.name}
                                    className={`px-3 py-1 rounded text-sm transition-all duration-150 flex items-center justify-center gap-1 focus:outline-none whitespace-nowrap cursor-pointer h-7 ${
                                      isActive 
                                        ? 'bg-indigo-600 text-white font-bold scale-[1.02]' 
                                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
                                    }`}
                                  >
                                    <span>{s.icon || '🎬'}</span>
                                    {isCurrentCanvas && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse border border-green-600" title="Active on Canvas" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {(() => {
                              const selScene = scenes.find(s => s.id === selectedSceneId);
                              if (!selScene) return null;
                              return (
                                <div className="text-[11px] text-zinc-400 bg-zinc-950/40 px-2 py-1 rounded flex items-center gap-1 font-mono">
                                  <span>Selected:</span>
                                  <span className="text-white font-semibold font-sans">{selScene.icon} {selScene.name}</span>
                                  {activeScene?.id === selScene.id && (
                                    <span className="text-[9px] bg-green-950 text-green-300 border border-green-800 px-1 rounded ml-auto">Active</span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                    </div>
                    
                    {targetTelemetryScene && targetTelemetryScene.sources && targetTelemetryScene.sources.length > 0 ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {targetTelemetryScene.sources.map(src => {
                          const chromaOn = src.style.chromaKey?.enabled;
                          const colorKeyOn = src.style.colorKey?.enabled;
                          return (
                            <div key={src.id} className="bg-zinc-950/45 border border-zinc-800 rounded p-2 text-[11px] leading-normal font-mono space-y-1 hover:border-zinc-700 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white flex items-center gap-1">
                                  {src.type === 'image' && '🖼️'}
                                  {src.type === 'video' && '🎥'}
                                  {src.type === 'text' && '✍️'}
                                  {src.type === 'iframe' && '🌐'}
                                  {src.type === 'color' && '🎨'}
                                  {src.type === 'gallery' && '🎞️'}
                                  {src.type === 'code' && '💻'}
                                  {src.type === 'paint' && '🖌️'}
                                  {src.type === 'camera' && '📷'}
                                  {src.type === 'capture' && '🖥️'}
                                  {src.type === 'emoji' && '😀'}
                                  {src.type === 'visualizer' && '📊'}
                                  {src.name}
                                </span>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <span className={`px-1 rounded text-[9px] ${src.visible ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                                    {src.visible ? 'Visible' : 'Hidden'}
                                  </span>
                                  <span className={`px-1 rounded text-[9px] ${src.locked ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' : 'bg-blue-950 text-blue-300 border border-blue-800'}`}>
                                    {src.locked ? 'Locked' : 'Unlocked'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-2 text-zinc-400 text-[10px]">
                                <div>Pos: X:{Math.round(src.style.x)}, Y:{Math.round(src.style.y)}</div>
                                <div>Size: {Math.round(src.style.width)}x{Math.round(src.style.height)}px</div>
                                <div>Z-Layer: {src.style.zIndex}</div>
                                <div>Type: <span className="text-zinc-300">{src.type.toUpperCase()}</span></div>
                              </div>
                              
                              {/* Type specific specs */}
                              <div className="text-[9.5px] text-zinc-500 border-t border-zinc-900 pt-1 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                                {src.type === 'text' && <span>Size: {src.style.fontSize}px | Font: {src.style.fontFamily || 'Default'}</span>}
                                {src.type === 'emoji' && <span>Size: {src.style.fontSize || 120}px | Align: {src.style.textAlign || 'center'}</span>}
                                {src.type === 'video' && <span>Vol: {Math.round((src.style.volume ?? 1) * 100)}% | Speed: {src.style.playbackRate ?? 1}x | Muted: {src.style.muted ? 'Yes' : 'No'}</span>}
                                {src.type === 'gallery' && <span>Slide: {src.style.slideDuration}s | Items: {Array.isArray(src.content) ? src.content.length : 0}</span>}
                                {src.type === 'iframe' && <span className="truncate max-w-[200px]" title={src.content as string}>Url: {src.content as string}</span>}
                                {['video', 'camera', 'capture'].includes(src.type) && (window as any).mediaFpsStats?.[src.id] && (
                                  <span className="text-yellow-400 font-bold px-1 rounded bg-yellow-950/40">
                                    ★ Live FPS: {((window as any).mediaFpsStats[src.id].fps || 0).toFixed(1)}
                                  </span>
                                )}
                                {chromaOn && <span className="text-green-400 font-bold">● ChromaKey ({src.style.chromaKey?.color})</span>}
                                {colorKeyOn && <span className="text-indigo-400 font-bold">● ColorKey ({src.style.colorKey?.color})</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-[10px] italic">No sources in selected scene.</p>
                    )}
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-xs uppercase tracking-wide text-zinc-400">System Logs</h3>
                  <div className={`h-28 border rounded p-2 overflow-y-auto text-xs font-mono mb-2 ${themeClasses.border} ${themeClasses.inputBg}`}>
                      {actionLog.length > 0 ? (
                          actionLog.map((entry, idx) => (
                              <div key={idx} className="flex leading-relaxed">
                                  <span className="text-gray-500 mr-2">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                  <span className="flex-1 text-zinc-300">{entry.message}</span>
                              </div>
                          ))
                      ) : (
                          <p className="text-gray-500">No actions logged yet.</p>
                      )}
                  </div>

                  <div className="flex justify-end space-x-2">
                      <button onClick={onClearLog} className={`text-xs px-3 py-1.5 rounded font-medium ${themeClasses.buttonSecondary}`}>Clear Logs</button>
                      <button onClick={handleExportLog} className={`text-xs px-3 py-1.5 rounded font-medium ${themeClasses.button}`}>Export Full Log</button>
                  </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;
