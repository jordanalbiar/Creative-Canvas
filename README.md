# Creative Canvas Studio

![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-6-BD34FE?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge)
![No install](https://img.shields.io/badge/No_install-Runs_in_your_browser-22c55e?style=for-the-badge)

An OBS style broadcast studio that runs entirely in your browser. No install, no account, no server. Build scenes, layer sources, switch live, and compose your stream layout on a canvas.

**Try it live:** https://jordanalbiar.github.io/Creative-Canvas/

**Website:** https://jordanalbiar.github.io/Creative-Canvas/website/

## What it does

Creative Canvas Studio is a professional grade interactive canvas editor. Design responsive dynamic layouts, align media content, coordinate layer structures, and control scenes with a real time compositional preview.

* **Scenes** - Build as many scenes as you need and switch between them live. Transitions are Cut, Fade, Move, and Stinger.
* **Sources** - Layer 14 source types on the canvas: text, image, video, iframe, color, gallery, code, paint, camera, screen capture, audio visualizer, emoji, YouTube, and Twitch.
* **Layout composer** - Freely position, scale, align, or lock media blocks. Precise controls for depth sorting, opacity, borders, shadows, and color keys.
* **Chroma key and filters** - Key out a background color with adjustable sensitivity, and shape sources with hue, blur, sharpness, and shapes like circle, oval, triangle, diamond, star, and hexagon.
* **Audio visualizer** - A source that reacts to live audio, with adjustable sensitivity.
* **Code sandbox** - Live isolated rendering loops. Write HTML, CSS, and JavaScript inside responsive workspace widgets.
* **Paint brush** - Annotate or whiteboard directly on top of your live sources, with configurable brush sizes and colors.
* **Themes** - Nine built in themes: Light, Dark, Crimson, Metallic, Lime, Purple, Lemon, Silverado, and Orange.
* **Persistent blueprints** - Your whole workspace, scenes, layouts, and layer settings save to local profiles instantly, so your setup is still there when you come back.

## Demo scenes

The app ships with four demo scenes so you can see it working right away:

* **Main Scene** - A full broadcast layout with a background, logo, and video example.
* **Code Example** - A live Matrix rain code source.
* **Background Scene** - A clean backdrop scene to build on.
* **Blank** - An empty scene, ready for your own layout.

## Performance tips

Heavy web content can use a lot of your browser's resources. These keep the canvas smooth:

1. Lower the target frame rate preset inside the Canvas Panel to trim CPU use.
2. Hide or lock static sources when you are not using them, so they skip drawing work.
3. Throttle intensive setInterval loops in Code Sandbox sources to protect the main thread.

## Run it locally

Requirements: Node.js 18 or newer, and npm.

```bash
npm install
npm run dev
```

Open the local address Vite prints, usually http://localhost:5173.

Build a production copy:

```bash
npm run build
npm run preview
```

The production build output lands in `dist/`.

## Project layout

* `App.tsx` - App shell, scene switching, and demo scenes.
* `components/Canvas.tsx` - The stage renderer.
* `components/SceneManager.tsx` - Scene list and transitions.
* `components/SourceManager.tsx` - Source list and adding sources.
* `components/SourceRenderer.tsx` - How each source type draws.
* `components/FilterPanel.tsx` - Chroma key and filters.
* `components/SettingsPanel.tsx` - Canvas and app settings.
* `components/StatsPanel.tsx` - Performance stats.
* `components/UI.tsx` - Shared interface pieces.
* `types.ts` - Source, scene, theme, and filter types.

## Built by

Creative Canvas Studio was designed and built by [Jordan Albiar](https://jordanalbiar.github.io/), a designer and developer who creates Nova Bot, VDO Portal, and more. See his work at https://jordanalbiar.github.io/.

## License

MIT. See [LICENSE](LICENSE).
