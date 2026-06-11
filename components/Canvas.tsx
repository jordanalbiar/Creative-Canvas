import React, { useState, useEffect, useRef } from 'react';
import type { Scene, Source, InteractionState } from '../types';
import SourceRenderer from './SourceRenderer';

interface CanvasProps {
  scene: Scene | undefined;
  isLocked: boolean;
  selectedSourceId: string | null;
  onSelectSource: (id: string | null) => void;
  onUpdateSourceStyle: (id: string, style: Partial<Source['style']>) => void;
  onUpdateSource: (id: string, updatedSource: Partial<Source> | ((s: Source) => Partial<Source>)) => void;
  onInteractionEnd: () => void;
  isSnapToGridEnabled: boolean;
  canvasScale?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  onSourceContextMenu?: (e: React.MouseEvent, sourceId: string) => void;
  onCanvasContextMenu?: (e: React.MouseEvent) => void;
  isMobileMode?: boolean;
  left?: number;
  top?: number;
  interfaceAnimations?: string;
  framerateLimit?: string;
  isTransitioning?: boolean;
  currentPlayingTransition?: any | null;
}

const GRID_SIZE = 20;

const Grid: React.FC = () => (
    <div className="absolute inset-0 w-full h-full" style={{
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        zIndex: -1
    }}></div>
);

const Canvas: React.FC<CanvasProps> = ({ 
  scene, isLocked, selectedSourceId, onSelectSource, 
  onUpdateSourceStyle, onUpdateSource, onInteractionEnd, 
  isSnapToGridEnabled, canvasScale = 1, canvasWidth = 1920, canvasHeight = 1080,
  onSourceContextMenu, onCanvasContextMenu, isMobileMode = false, left, top,
  interfaceAnimations = 'enabled',
  framerateLimit = 'uncapped',
  isTransitioning = false,
  currentPlayingTransition = null
}) => {
  const [hoveredSourceId, setHoveredSourceId] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<InteractionState>({ type: 'none', sourceId: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startSourceX: 0, startSourceY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  // Fix: Initialize useRef with null for better type safety and to avoid potential runtime errors.
  const animationFrameRef = useRef<number | null>(null);

  const prevSceneRef = useRef<Scene | undefined>(undefined);
  const [moveStyles, setMoveStyles] = useState<Record<string, Partial<Source['style']>>>({});
  const [triggerMove, setTriggerMove] = useState(false);

  useEffect(() => {
    if (prevSceneRef.current && scene && prevSceneRef.current.id !== scene.id) {
      if (currentPlayingTransition?.type === 'move' && isTransitioning) {
        // Find matching sources
        const initialOverrideStyles: Record<string, Partial<Source['style']>> = {};
        
        scene.sources.forEach(newSrc => {
          // Look for matching sources based on same ID or same name & type
          const match = prevSceneRef.current?.sources.find(prevSrc => 
            prevSrc.id === newSrc.id || 
            (prevSrc.name.trim().toLowerCase() === newSrc.name.trim().toLowerCase() && prevSrc.type === newSrc.type)
          );

          if (match) {
            initialOverrideStyles[newSrc.id] = {
              x: match.style.x,
              y: match.style.y,
              width: match.style.width,
              height: match.style.height,
              opacity: match.style.opacity,
              scale: match.style.scale,
              rotation: match.style.rotation,
              scaleX: match.style.scaleX,
              scaleY: match.style.scaleY,
            };
          }
        });

        if (Object.keys(initialOverrideStyles).length > 0) {
          setMoveStyles(initialOverrideStyles);
          setTriggerMove(true);
        }
      }
    }
    prevSceneRef.current = scene;
  }, [scene?.id, currentPlayingTransition, isTransitioning, scene]);

  useEffect(() => {
    if (triggerMove) {
      let frame1: number;
      let frame2: number;
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          setMoveStyles({});
          setTriggerMove(false);
        });
      });
      return () => {
        cancelAnimationFrame(frame1);
        if (frame2) cancelAnimationFrame(frame2);
      };
    }
  }, [triggerMove]);

  const handleMouseDown = (e: React.MouseEvent, source: Source, interactionType: InteractionState['type']) => {
    if (isLocked || source.locked) {
        onSelectSource(source.id);
        return;
    }
    e.preventDefault();
    e.stopPropagation();

    onSelectSource(source.id);
    
    if (interactionType === 'none') {
        setInteraction({ type: 'none', sourceId: source.id, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startSourceX: 0, startSourceY: 0 });
        return;
    }

    setInteraction({
      type: interactionType,
      sourceId: source.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: source.style.width,
      startHeight: source.style.height,
      startSourceX: source.style.x,
      startSourceY: source.style.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, source: Source, interactionType: InteractionState['type']) => {
    if (isLocked || source.locked) {
        onSelectSource(source.id);
        return;
    }
    e.stopPropagation();

    onSelectSource(source.id);
    
    if (interactionType === 'none') {
        setInteraction({ type: 'none', sourceId: source.id, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startSourceX: 0, startSourceY: 0 });
        return;
    }

    const touch = e.touches[0];
    if (!touch) return;

    setInteraction({
      type: interactionType,
      sourceId: source.id,
      startX: touch.clientX,
      startY: touch.clientY,
      startWidth: source.style.width,
      startHeight: source.style.height,
      startSourceX: source.style.x,
      startSourceY: source.style.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (interaction.type === 'none' || !interaction.sourceId) return;
    e.preventDefault();

    if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
        const dx = (e.clientX - interaction.startX) / canvasScale;
        const dy = (e.clientY - interaction.startY) / canvasScale;

        let updates: Partial<Source['style']> = {};
        
        const snap = (value: number) => isSnapToGridEnabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

        switch (interaction.type) {
            case 'move':
                updates.x = snap(interaction.startSourceX + dx);
                updates.y = snap(interaction.startSourceY + dy);
                break;
            case 'resize-br':
                updates.width = snap(Math.max(50, interaction.startWidth + dx));
                updates.height = snap(Math.max(50, interaction.startHeight + dy));
                break;
            case 'resize-bl':
                updates.width = snap(Math.max(50, interaction.startWidth - dx));
                updates.height = snap(Math.max(50, interaction.startHeight + dy));
                updates.x = snap(interaction.startSourceX + dx);
                break;
            case 'resize-tr':
                updates.width = snap(Math.max(50, interaction.startWidth + dx));
                updates.height = snap(Math.max(50, interaction.startHeight - dy));
                updates.y = snap(interaction.startSourceY + dy);
                break;
            case 'resize-tl':
                updates.width = snap(Math.max(50, interaction.startWidth - dx));
                updates.height = snap(Math.max(50, interaction.startHeight - dy));
                updates.x = snap(interaction.startSourceX + dx);
                updates.y = snap(interaction.startSourceY + dy);
                break;
        }
        
        if (Object.keys(updates).length > 0) {
            onUpdateSourceStyle(interaction.sourceId!, updates);
        }
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (interaction.type === 'none' || !interaction.sourceId) return;
    if (e.cancelable) {
      e.preventDefault();
    }

    if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0];
        if (!touch) return;
        const dx = (touch.clientX - interaction.startX) / canvasScale;
        const dy = (touch.clientY - interaction.startY) / canvasScale;

        let updates: Partial<Source['style']> = {};
        
        const snap = (value: number) => isSnapToGridEnabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

        switch (interaction.type) {
            case 'move':
                updates.x = snap(interaction.startSourceX + dx);
                updates.y = snap(interaction.startSourceY + dy);
                break;
            case 'resize-br':
                updates.width = snap(Math.max(50, interaction.startWidth + dx));
                updates.height = snap(Math.max(50, interaction.startHeight + dy));
                break;
            case 'resize-bl':
                updates.width = snap(Math.max(50, interaction.startWidth - dx));
                updates.height = snap(Math.max(50, interaction.startHeight + dy));
                updates.x = snap(interaction.startSourceX + dx);
                break;
            case 'resize-tr':
                updates.width = snap(Math.max(50, interaction.startWidth + dx));
                updates.height = snap(Math.max(50, interaction.startHeight - dy));
                updates.y = snap(interaction.startSourceY + dy);
                break;
            case 'resize-tl':
                updates.width = snap(Math.max(50, interaction.startWidth - dx));
                updates.height = snap(Math.max(50, interaction.startHeight - dy));
                updates.x = snap(interaction.startSourceX + dx);
                updates.y = snap(interaction.startSourceY + dy);
                break;
        }
        
        if (Object.keys(updates).length > 0) {
            onUpdateSourceStyle(interaction.sourceId!, updates);
        }
    });
  };

  const handleMouseUp = () => {
    if (interaction.type !== 'none' && interaction.sourceId) {
        onInteractionEnd();
    }
    setInteraction({ type: 'none', sourceId: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0, startSourceX: 0, startSourceY: 0 });
    if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
    }
  };
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
        onSelectSource(null);
    }
  };

  useEffect(() => {
    if (interaction.type !== 'none' && interaction.sourceId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp, { once: true });
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interaction, isSnapToGridEnabled]);

  if (!scene) {
    return <div className="w-full h-full flex items-center justify-center">Loading scene...</div>;
  }
  
  const isInteracting = interaction.type !== 'none';
  const interactingSourceId = interaction.sourceId;

  const curLeft = left !== undefined ? left : window.innerWidth / 2;
  const curTop = top !== undefined ? top : window.innerHeight / 2;
  const halfW = (canvasWidth * canvasScale) / 2;
  const halfH = (canvasHeight * canvasScale) / 2;

  const xStart = curLeft - halfW;
  const xEnd = curLeft + halfW;
  const yStart = curTop - halfH;
  const yEnd = curTop + halfH;

  return (
    <div 
        className="absolute inset-0 overflow-hidden select-none bg-black flex items-center justify-center"
        onClick={handleCanvasClick}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget || (canvasRef.current && !canvasRef.current.contains(e.target as Node))) {
            e.preventDefault();
            if (onCanvasContextMenu) {
              onCanvasContextMenu(e);
            }
          }
        }}
    >
      {/* Matte Letterboxing / Pillarboxing Bars */}
      <div 
        className="absolute bg-black pointer-events-none z-30" 
        style={{ top: 0, bottom: 0, left: 0, width: Math.max(0, xStart) }}
      />
      <div 
        className="absolute bg-black pointer-events-none z-30" 
        style={{ top: 0, bottom: 0, left: `${Math.max(0, xEnd)}px`, right: 0 }}
      />
      <div 
        className="absolute bg-black pointer-events-none z-30" 
        style={{ top: 0, left: 0, right: 0, height: Math.max(0, yStart) }}
      />
      <div 
        className="absolute bg-black pointer-events-none z-30" 
        style={{ top: `${Math.max(0, yEnd)}px`, bottom: 0, left: 0, right: 0 }}
      />

      <div
          ref={canvasRef}
          className={`absolute origin-center ${interfaceAnimations === 'enabled' ? 'transition-all duration-300' : 'transition-none'}`}
          onContextMenu={(e) => {
            // If right-clicking empty space on canvas (not on any source)
            if (e.target === canvasRef.current) {
              e.preventDefault();
              if (onCanvasContextMenu) {
                onCanvasContextMenu(e);
              }
            }
          }}
          style={{
              left: left !== undefined ? `${left}px` : '50%',
              top: top !== undefined ? `${top}px` : '50%',
              width: canvasWidth,
              height: canvasHeight,
              transform: `translate(-50%, -50%) scale(${canvasScale})`,
              backgroundColor: scene.backgroundColor || '#000000',
              boxShadow: isLocked ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
          }}
      >
        {isSnapToGridEnabled && <Grid />}
        {scene.sources
          .filter(source => source.visible)
          .sort((a,b) => a.style.zIndex - b.style.zIndex)
          .map(source => {
            const overrideStyle = moveStyles[source.id];
            const renderSource = overrideStyle 
              ? { ...source, style: { ...source.style, ...overrideStyle } } 
              : source;
            return (
              <SourceRenderer
                key={source.id}
                source={renderSource}
                isLocked={isLocked}
                isSelected={selectedSourceId === source.id}
                isHovered={hoveredSourceId === source.id}
                isInteracting={isInteracting && interactingSourceId === source.id}
                interactionType={interaction.type}
                onMouseDown={(e, type) => handleMouseDown(e, source, type)}
                onTouchStart={(e, type) => handleTouchStart(e, source, type)}
                isMobileMode={isMobileMode}
                onMouseEnter={() => !isInteracting && setHoveredSourceId(source.id)}
                onMouseLeave={() => setHoveredSourceId(null)}
                onUpdateStyle={(style) => onUpdateSourceStyle(source.id, style)}
                onUpdate={(updates) => onUpdateSource(source.id, updates)}
                onContextMenu={(e) => {
                  if (onSourceContextMenu) {
                    onSourceContextMenu(e, source.id);
                  }
                }}
                framerateLimit={framerateLimit}
                isTransitioning={isTransitioning}
                currentPlayingTransition={currentPlayingTransition}
              />
            );
          })}
      </div>
    </div>
  );
};

export default Canvas;
