# FLOW Application - Testing Guide

## 🎉 Implementation Complete!

The FLOW application has been completely rebuilt from scratch with modern architecture, 6 refined visual modes, comprehensive audio system, and full gesture support.

## What's Been Built

### ✅ Core Infrastructure
- [x] Base visual mode system with lifecycle management
- [x] Mode manager with smooth transitions
- [x] Performance monitoring with adaptive quality
- [x] Gesture handler (touch + mouse)
- [x] Enhanced audio engine with 5 presets

### ✅ Visual Modes (6 Total)
- [x] **Breathe** - Guided breathing with petal animation
- [x] **Toroid** - Particle torus with drag rotation
- [x] **Weaver** - Gravity well with particle connections
- [x] **Starfield** - Warp speed star field
- [x] **Matrix** - Digital rain effect
- [x] **Orbs** - Lissajous curve orbital motion

### ✅ Audio System
- [x] **Ocean** - Wave sounds with LFO modulation
- [x] **Rain** - Variable intensity rainfall
- [x] **Theta** - 6Hz binaural beats for focus
- [x] **Ambient** - Atmospheric pads with chords
- [x] **Forest** - Nature ambience

### ✅ UI Components
- [x] Splash screen with onboarding
- [x] Auto-hiding UI container
- [x] Mode selector (bottom dots)
- [x] Audio controls (top-right pills)
- [x] Quick settings drawer
- [x] FPS counter (dev mode)

### ✅ Gesture Controls
- [x] Swipe left/right - Mode switching
- [x] Swipe up - Open settings
- [x] Swipe down - Hide UI
- [x] Tap - Show UI
- [x] Long press - Pause
- [x] Drag - Interact with mode

### ✅ State Management
- [x] Zustand store with slices
- [x] Mode configurations
- [x] Audio settings
- [x] UI state
- [x] Session tracking

## Testing Checklist

### 1. Visual Verification

Open http://localhost:5173 and verify:

- [ ] Splash screen appears with "FLOW" logo
- [ ] Onboarding shows 3 steps with gestures
- [ ] Click "Start Flow" to enter app
- [ ] Breathe mode starts with petal animation
- [ ] Bottom dots show all 6 modes

### 2. Mode Switching

Test all 6 visual modes:

- [ ] **Breathe**: Petals pulse in/out rhythmically
- [ ] **Toroid**: Particle torus flows smoothly
  - [ ] Drag to rotate
- [ ] **Weaver**: Particles respond to touch
  - [ ] Touch/drag creates gravity well
  - [ ] Lines connect nearby particles
- [ ] **Starfield**: Stars move forward
  - [ ] Click/touch to accelerate
- [ ] **Matrix**: Green digital rain falls
  - [ ] Occasional glitch effects
- [ ] **Orbs**: Spheres follow orbital paths
  - [ ] Trail rendering visible

### 3. Gesture Controls

- [ ] **Swipe Right**: Switches to next mode
- [ ] **Swipe Left**: Switches to previous mode
- [ ] **Swipe Up**: Opens settings drawer
- [ ] **Swipe Down**: Hides all UI
- [ ] **Tap (when hidden)**: Shows UI again
- [ ] **Long Press**: Pauses/resumes animation
- [ ] **Drag**: Interacts with current mode

### 4. Audio System

Click audio preset pills (top-right):

- [ ] **Ocean**: Hear wave sounds
- [ ] **Rain**: Hear rainfall
- [ ] **Theta**: Hear deep drone with pulsing
- [ ] **Ambient**: Hear atmospheric pads
- [ ] **Forest**: Hear nature sounds
- [ ] Volume slider in settings works
- [ ] Audio crossfades smoothly between presets

### 5. Settings Panel

Open settings (swipe up or gear icon):

- [ ] Speed slider changes animation speed
- [ ] Intensity slider changes effect strength
- [ ] Particle count slider updates (may need mode restart)
- [ ] Volume slider adjusts audio
- [ ] Haptic toggle works (on mobile)
- [ ] FPS toggle shows frame rate
- [ ] Close button hides settings

### 6. Keyboard Controls (Desktop)

- [ ] **Arrow Left/Right**: Switch modes
- [ ] **Arrow Up**: Open settings
- [ ] **Arrow Down**: Hide UI
- [ ] **Space**: Pause/play
- [ ] **H**: Toggle UI visibility

### 7. Performance

- [ ] FPS stays above 50 on desktop
- [ ] FPS stays above 30 on mobile
- [ ] No lag when switching modes
- [ ] Smooth animations throughout
- [ ] Memory doesn't grow over time

### 8. Mobile Specific

Test on mobile device:

- [ ] Touch gestures work correctly
- [ ] Haptic feedback (if enabled)
- [ ] UI scales properly
- [ ] Audio works after first interaction
- [ ] Can install as PWA (if configured)
- [ ] Screen doesn't sleep during use
- [ ] Landscape orientation works

### 9. Edge Cases

- [ ] Rapidly switch modes (no crashes)
- [ ] Open/close settings repeatedly
- [ ] Switch audio while mode changing
- [ ] Pause and resume multiple times
- [ ] Resize window (desktop)
- [ ] Rotate device (mobile)
- [ ] Tab away and return (pauses rendering)

## Known Limitations

1. **Audio Context**: Some browsers require user interaction before audio plays (this is by design)
2. **Performance**: Low-end devices may see reduced particle counts
3. **Gestures**: Pinch gesture not fully implemented yet
4. **Safari**: May need `-webkit-` prefixes for some features

## Debug Tips

### Enable FPS Counter
1. Open settings (swipe up)
2. Toggle "Show FPS"
3. FPS appears in top-left corner

### Check Console
Open browser DevTools (F12) and check console for:
- Initialization messages
- Mode switch logs
- Any errors or warnings

### Performance Issues?
- Try reducing particle count in settings
- Switch to a less demanding mode (Breathe, Matrix)
- Close other browser tabs
- Check if quality level auto-downgraded (console message)

## What to Report

If you encounter issues, please note:
1. Which mode/feature
2. Browser and version
3. Device (desktop/mobile)
4. Steps to reproduce
5. Console errors
6. Expected vs actual behavior

## Next Steps

Once basic testing passes:
1. Add more visual modes (Cymatics, etc.)
2. Implement session timer
3. Add breathwork guide
4. Create focus presets
5. Add PWA manifest
6. Optimize bundle size
7. Add analytics (optional)
8. Deploy to production

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check
```

## Success Criteria

The app is ready when:
- ✅ All 6 modes work smoothly
- ✅ Audio plays correctly
- ✅ Gestures feel responsive
- ✅ FPS stays above targets
- ✅ UI is intuitive
- ✅ No console errors
- ✅ Works on mobile

---

**Happy Testing! 🚀**

