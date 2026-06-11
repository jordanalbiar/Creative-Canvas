// High-fidelity software scaling and compositing algorithms for virtual studio-style encoder rendering
import type { Scene, Source } from '../types';

export type ScalingFilter = 'Bilinear' | 'Bicubic' | 'Lanczos-3' | 'NearestNeighbor';

export interface Resolution {
  width: number;
  height: number;
  label: string;
}

export const OUTPUT_RESOLUTIONS: Resolution[] = [
  { width: 1920, height: 1080, label: '1080p (1920x1080)' },
  { width: 1280, height: 720, label: '720p (1280x720)' },
  { width: 854, height: 480, label: '480p (854x480)' },
  { width: 640, height: 360, label: '360p (640x360)' },
  { width: 426, height: 240, label: '240p (426x240)' }
];

// 1. Bilinear Scaling Model
export function scaleBilinear(src: ImageData, dst: ImageData) {
  const w1 = src.width;
  const h1 = src.height;
  const w2 = dst.width;
  const h2 = dst.height;
  const srcData = src.data;
  const dstData = dst.data;

  const xRatio = (w1 - 1) / w2;
  const yRatio = (h1 - 1) / h2;

  for (let i = 0; i < h2; i++) {
    for (let j = 0; j < w2; j++) {
      const x = xRatio * j;
      const y = yRatio * i;
      const xDiff = x - Math.floor(x);
      const yDiff = y - Math.floor(y);
      const xLow = Math.floor(x);
      const yLow = Math.floor(y);
      const xHigh = Math.min(w1 - 1, xLow + 1);
      const yHigh = Math.min(h1 - 1, yLow + 1);

      // Indices of the four surrounding pixels
      const idxA = (yLow * w1 + xLow) * 4;
      const idxB = (yLow * w1 + xHigh) * 4;
      const idxC = (yHigh * w1 + xLow) * 4;
      const idxD = (yHigh * w1 + xHigh) * 4;

      const destIdx = (i * w2 + j) * 4;

      // Interpolate for red, green, blue, alpha
      for (let c = 0; c < 4; c++) {
        const val = srcData[idxA + c] * (1 - xDiff) * (1 - yDiff) +
                    srcData[idxB + c] * xDiff * (1 - yDiff) +
                    srcData[idxC + c] * (1 - xDiff) * yDiff +
                    srcData[idxD + c] * xDiff * yDiff;
        dstData[destIdx + c] = Math.round(val);
      }
    }
  }
}

// Cubic Hermite helper for Bicubic interpolation
function cubicHermite(A: number, B: number, C: number, D: number, t: number): number {
  const a = -0.5 * A + 1.5 * B - 1.5 * C + 0.5 * D;
  const b = A - 2.5 * B + 2 * C - 0.5 * D;
  const c = -0.5 * A + 0.5 * C;
  const d = B;
  return a * t * t * t + b * t * t + c * t + d;
}

// 2. Bicubic Scaling Model
export function scaleBicubic(src: ImageData, dst: ImageData) {
  const w1 = src.width;
  const h1 = src.height;
  const w2 = dst.width;
  const h2 = dst.height;
  const srcData = src.data;
  const dstData = dst.data;

  const xRatio = w1 / w2;
  const yRatio = h1 / h2;

  for (let i = 0; i < h2; i++) {
    const py = i * yRatio - 0.5;
    const yf = Math.floor(py);
    const dy = py - yf;

    for (let j = 0; j < w2; j++) {
      const px = j * xRatio - 0.5;
      const xf = Math.floor(px);
      const dx = px - xf;

      const destIdx = (i * w2 + j) * 4;

      for (let c = 0; c < 4; c++) {
        const rowVals = [0, 0, 0, 0];

        for (let m = 0; m < 4; m++) {
          const yIndex = Math.min(h1 - 1, Math.max(0, yf - 1 + m));
          const colVals = [0, 0, 0, 0];

          for (let n = 0; n < 4; n++) {
            const xIndex = Math.min(w1 - 1, Math.max(0, xf - 1 + n));
            const srcIdx = (yIndex * w1 + xIndex) * 4;
            colVals[n] = srcData[srcIdx + c];
          }

          rowVals[m] = cubicHermite(colVals[0], colVals[1], colVals[2], colVals[3], dx);
        }

        const finalVal = cubicHermite(rowVals[0], rowVals[1], rowVals[2], rowVals[3], dy);
        dstData[destIdx + c] = Math.min(255, Math.max(0, Math.round(finalVal)));
      }
    }
  }
}

// Lanczos-3 window functions
function sinc(x: number): number {
  if (x === 0) return 1;
  const piX = Math.PI * x;
  return Math.sin(piX) / piX;
}

function lanczosWeight(x: number): number {
  if (x === 0) return 1;
  if (x <= -3 || x >= 3) return 0;
  return sinc(x) * sinc(x / 3);
}

// 3. Lanczos-3 Scaling Model
export function scaleLanczos(src: ImageData, dst: ImageData) {
  const w1 = src.width;
  const h1 = src.height;
  const w2 = dst.width;
  const h2 = dst.height;
  const srcData = src.data;
  const dstData = dst.data;

  const xRatio = w1 / w2;
  const yRatio = h1 / h2;

  for (let i = 0; i < h2; i++) {
    const srcY = (i + 0.5) * yRatio - 0.5;
    const yStart = Math.max(0, Math.floor(srcY) - 2);
    const yEnd = Math.min(h1 - 1, Math.floor(srcY) + 3);

    for (let j = 0; j < w2; j++) {
      const srcX = (j + 0.5) * xRatio - 0.5;
      const xStart = Math.max(0, Math.floor(srcX) - 2);
      const xEnd = Math.min(w1 - 1, Math.floor(srcX) + 3);

      const destIdx = (i * w2 + j) * 4;

      // Compute weight combinations for Lanczos context window
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      let totalWeight = 0;

      for (let y = yStart; y <= yEnd; y++) {
        const weightY = lanczosWeight(y - srcY);
        for (let x = xStart; x <= xEnd; x++) {
          const weightX = lanczosWeight(x - srcX);
          const weight = weightX * weightY;

          if (weight > 0) {
            const srcIdx = (y * w1 + x) * 4;
            sumR += srcData[srcIdx] * weight;
            sumG += srcData[srcIdx + 1] * weight;
            sumB += srcData[srcIdx + 2] * weight;
            sumA += srcData[srcIdx + 3] * weight;
            totalWeight += weight;
          }
        }
      }

      if (totalWeight > 0) {
        dstData[destIdx] = Math.min(255, Math.max(0, Math.round(sumR / totalWeight)));
        dstData[destIdx + 1] = Math.min(255, Math.max(0, Math.round(sumG / totalWeight)));
        dstData[destIdx + 2] = Math.min(255, Math.max(0, Math.round(sumB / totalWeight)));
        dstData[destIdx + 3] = Math.min(255, Math.max(0, Math.round(sumA / totalWeight)));
      } else {
        // Fallback to closest pixel if weights evaluate to 0
        const closestX = Math.min(w1 - 1, Math.max(0, Math.round(srcX)));
        const closestY = Math.min(h1 - 1, Math.max(0, Math.round(srcY)));
        const fallbackIdx = (closestY * w1 + closestX) * 4;
        dstData[destIdx] = srcData[fallbackIdx];
        dstData[destIdx + 1] = srcData[fallbackIdx + 1];
        dstData[destIdx + 2] = srcData[fallbackIdx + 2];
        dstData[destIdx + 3] = srcData[fallbackIdx + 3];
      }
    }
  }
}

// 4. Nearest Neighbor Scaling Model (Comparison baseline)
export function scaleNearestNeighbor(src: ImageData, dst: ImageData) {
  const w1 = src.width;
  const h1 = src.height;
  const w2 = dst.width;
  const h2 = dst.height;
  const srcData = src.data;
  const dstData = dst.data;

  const xRatio = w1 / w2;
  const yRatio = h1 / h2;

  for (let i = 0; i < h2; i++) {
    const srcY = Math.min(h1 - 1, Math.floor(i * yRatio));
    for (let j = 0; j < w2; j++) {
      const srcX = Math.min(w1 - 1, Math.floor(j * xRatio));
      const srcIdx = (srcY * w1 + srcX) * 4;
      const destIdx = (i * w2 + j) * 4;

      dstData[destIdx] = srcData[srcIdx];
      dstData[destIdx + 1] = srcData[srcIdx + 1];
      dstData[destIdx + 2] = srcData[srcIdx + 2];
      dstData[destIdx + 3] = srcData[srcIdx + 3];
    }
  }
}

// Composites the scene onto a full 1920x1080 (or base) canvas and runs chosen high quality filter downscaling to target resolution.
export function renderOutput(
  scene: Scene,
  baseW: number,
  baseH: number,
  outW: number,
  outH: number,
  filter: ScalingFilter,
  onRendered: (canvas: HTMLCanvasElement) => void
) {
  // 1. Setup offscreen base canvas
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = baseW;
  srcCanvas.height = baseH;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return;

  // 2. Draw Scene Background
  srcCtx.fillStyle = scene.backgroundColor || '#000000';
  srcCtx.fillRect(0, 0, baseW, baseH);

  // 3. Draw grid if requested
  // We can skip grid so the stream itself is "pristine video output" bypass, but let's composite clean sources!
  const sortedSources = [...scene.sources]
    .filter(s => s.visible)
    .sort((a, b) => a.style.zIndex - b.style.zIndex);

  let pendingImagesCount = 0;

  function doSoftwareDownscale() {
    try {
      const dstCanvas = document.createElement('canvas');
      dstCanvas.width = outW;
      dstCanvas.height = outH;
      const dstCtx = dstCanvas.getContext('2d');
      if (!dstCtx) return;

      const srcImgData = srcCtx!.getImageData(0, 0, baseW, baseH);
      const dstImgData = dstCtx.createImageData(outW, outH);

      // Multi-filter Software Pipeline
      switch (filter) {
        case 'Bilinear':
          scaleBilinear(srcImgData, dstImgData);
          break;
        case 'Bicubic':
          scaleBicubic(srcImgData, dstImgData);
          break;
        case 'Lanczos-3':
          scaleLanczos(srcImgData, dstImgData);
          break;
        case 'NearestNeighbor':
        default:
          scaleNearestNeighbor(srcImgData, dstImgData);
          break;
      }

      dstCtx.putImageData(dstImgData, 0, 0);
      onRendered(dstCanvas);
    } catch (e) {
      console.error("Downscale software pipeline failed", e);
    }
  }

  // Draw any actual source content
  sortedSources.forEach(source => {
    const { x, y, width, height, opacity = 1 } = source.style;
    srcCtx.save();
    srcCtx.globalAlpha = opacity;

    // Optional Chroma Key or Border Clips
    if (source.chromaKey?.enabled) {
      // Simulate chroma background removal on context by setting matching colors translucent if needed
    }

    if (source.type === 'color') {
      srcCtx.fillStyle = source.colorContent || '#312e81';
      srcCtx.fillRect(x, y, width, height);
    } else if (source.type === 'text') {
      // Setup Text
      srcCtx.fillStyle = source.textStyle?.color || '#ffffff';
      const fontSize = source.textStyle?.fontSize || 24;
      const fontWeight = source.textStyle?.bold ? 'bold' : 'normal';
      const fontItalic = source.textStyle?.italic ? 'italic' : 'normal';
      const fontFamily = source.textStyle?.fontFamily || 'Inter';
      srcCtx.font = `${fontItalic} ${fontWeight} ${fontSize}px ${fontFamily}`;
      srcCtx.textBaseline = 'top';

      const text = source.textContent || 'Hello World';
      srcCtx.fillText(text, x, y, width);
    } else if (source.type === 'paint') {
      // Draw paint layer solid background and its strokes
      srcCtx.fillStyle = '#111827';
      srcCtx.fillRect(x, y, width, height);
      if (source.paintContent?.strokes && Array.isArray(source.paintContent.strokes)) {
        srcCtx.lineCap = 'round';
        srcCtx.lineJoin = 'round';
        source.paintContent.strokes.forEach(stroke => {
          srcCtx.beginPath();
          srcCtx.strokeStyle = stroke.color;
          srcCtx.lineWidth = stroke.width;
          if (stroke.points && stroke.points.length > 0) {
            stroke.points.forEach((pt: any, idx: number) => {
              const mappedX = x + (pt.x / 100) * width;
              const mappedY = y + (pt.y / 100) * height;
              if (idx === 0) srcCtx.moveTo(mappedX, mappedY);
              else srcCtx.lineTo(mappedX, mappedY);
            });
          }
          srcCtx.stroke();
        });
      }
    } else {
      // Fallback fallback rectangular placeholder for active device / feed
      srcCtx.fillStyle = 'rgba(31, 41, 55, 0.8)';
      srcCtx.fillRect(x, y, width, height);
      srcCtx.fillStyle = '#ffffff';
      srcCtx.font = '12px monospace';
      srcCtx.fillText(`[${source.type.toUpperCase()}] ${source.name}`, x + 10, y + 10, width - 20);
    }

    srcCtx.restore();
  });

  // Execute processing synchronous immediately since offscreen components are static canvas
  doSoftwareDownscale();
}
