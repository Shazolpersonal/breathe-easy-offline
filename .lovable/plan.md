

# Soundscape Dies After 1-2 Seconds — Root Cause & Fix

## The Bug

In `src/lib/soundscapes.ts`, `start()` calls `this.stop()` first (line 13). Inside `stop()`, there's a delayed cleanup on a 600ms timeout (lines 50-63):

```text
stop() called by start():
  1. Sets this.currentType = "off"
  2. Fades master gain to 0
  3. Schedules cleanup in 600ms:
       → this.nodes.forEach(n => n.disconnect())  // ← uses `this`
       → this.ctx.close()                          // ← uses `this`
       → this.ctx = null

start() continues immediately:
  4. Sets this.currentType = "rain"
  5. Creates NEW AudioContext → this.ctx
  6. Creates new noise nodes → pushes to this.nodes
  7. Audio starts playing ✓

600ms later, the old cleanup fires:
  8. this.nodes now points to the NEW nodes from step 6
  9. Disconnects all new nodes → audio dies
  10. this.ctx.close() closes the NEW AudioContext
  11. Silence.
```

The cleanup timeout captures `this` (the singleton), not a snapshot of the old resources. So it destroys the freshly created audio.

## Fix

**File: `src/lib/soundscapes.ts`** — In `stop()`, capture `this.nodes`, `this.ctx`, and `this.masterGain` into local variables **before** clearing them on `this`. The timeout closure uses these locals instead of `this`, so a subsequent `start()` is not affected.

```typescript
stop() {
  this.timeoutIds.forEach(id => clearTimeout(id));
  this.timeoutIds = [];
  if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; }
  this.currentType = "off";

  // Capture old references before clearing
  const oldNodes = this.nodes;
  const oldCtx = this.ctx;
  const oldGain = this.masterGain;

  // Clear instance references immediately so start() gets fresh state
  this.nodes = [];
  this.ctx = null;
  this.masterGain = null;

  // Fade out and clean up old resources
  if (oldGain && oldCtx) {
    try { oldGain.gain.linearRampToValueAtTime(0, oldCtx.currentTime + 0.5); } catch {}
  }
  setTimeout(() => {
    oldNodes.forEach(n => { try { if (n instanceof AudioBufferSourceNode || n instanceof OscillatorNode) n.stop(); n.disconnect(); } catch {} });
    try { oldCtx?.close(); } catch {};
  }, 600);
}
```

This is a single-file, ~15-line change.

