# FLOW - Immersive Focus Experience

A modern, performance-optimized web application for achieving flow state through interactive visualizations and ambient audio.

## Features

### 6 Visual Modes
- **Breathe**: Guided breathing with circular petal animation
- **Toroid**: Flowing particle torus with rotation controls
- **Weaver**: Interactive gravity well with particle connections
- **Starfield**: Warp speed through the cosmos
- **Matrix**: Digital rain code cascade
- **Orbs**: Orbital harmonics with Lissajous patterns

### Audio Presets
- **Ocean**: Calming wave sounds
- **Rain**: Gentle rainfall
- **Theta**: Binaural theta wave (6-8Hz) for focus
- **Ambient**: Atmospheric soundscape
- **Forest**: Nature ambience

### Gesture Controls
- **Swipe Left/Right**: Switch between visual modes
- **Swipe Up**: Open settings
- **Swipe Down**: Hide UI
- **Tap**: Toggle UI visibility
- **Long Press**: Pause/resume
- **Drag**: Interact with visualization
- **Pinch**: Adjust zoom (on supported modes)

### Keyboard Controls
- **Arrow Keys**: Navigate modes and settings
- **Space**: Pause/play
- **H**: Toggle UI visibility

## Technology Stack

- **React 18** + **TypeScript**
- **Three.js** for 3D graphics
- **Tone.js** for audio processing
- **Zustand** for state management
- **Framer Motion** for animations
- **TailwindCSS** for styling
- **Vite** for build tooling

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The app will be available at `http://localhost:5173`

## Architecture

```
src/
├── app/                    # Application components
│   ├── App.tsx            # Root component
│   └── Layout.tsx         # Main layout with Three.js
├── core/                  # Core systems
│   ├── audio/            # Audio engine and presets
│   ├── visuals/          # Visual mode system
│   │   └── modes/        # Individual visual modes
│   ├── gestures/         # Gesture handling
│   └── performance/      # Performance monitoring
├── ui/                   # UI components
│   ├── components/       # React components
│   └── theme/           # Design tokens
├── hooks/               # React hooks
├── store/              # Global state (Zustand)
└── utils/              # Utilities
```

## Performance

- **Target**: 60fps on modern devices (iPhone 12+, Galaxy S21+)
- **Adaptive Quality**: Automatically adjusts based on FPS
- **Mobile Optimized**: Reduced particle counts and effects
- **Bundle Size**: < 5MB (pre-gzip)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Android 90+

## Configuration

### Quality Levels
The app automatically adjusts quality based on performance:
- **High**: Full effects, maximum particles
- **Medium**: Balanced performance
- **Low**: Reduced effects for smooth performance

### Mode Settings
Each mode can be customized:
- **Speed**: Animation speed
- **Intensity**: Effect strength
- **Particle Count**: Number of particles
- **Color**: Primary color scheme

## Development Notes

### Adding a New Visual Mode

1. Create mode class extending `BaseMode`:
```typescript
// src/core/visuals/modes/MyMode.ts
export class MyMode extends BaseMode {
  async init() { /* setup */ }
  update(time, delta) { /* animate */ }
  destroy() { /* cleanup */ }
}
```

2. Register in `useVisualMode` hook:
```typescript
modeManager.registerMode(new MyMode(scene, camera, renderer));
```

3. Add to store types and UI selectors

### Adding Audio Presets

1. Add preset type to `AudioPreset` in `core/audio/types.ts`
2. Create preset in `AudioEngine.createAudioGraph()`
3. Add switch case in `switchPreset()`
4. Add to UI in `AudioControls.tsx`

## License

MIT

## Credits

Built with inspiration from:
- Flow state research by Mihaly Csikszentmihalyi
- Particle systems and WebGL techniques
- Modern UI/UX best practices

---

**Enter Flow. Focus Deep. Create More.**

