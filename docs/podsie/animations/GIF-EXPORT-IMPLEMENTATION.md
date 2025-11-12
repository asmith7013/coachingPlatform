# GIF Export Button - Implementation Guide

## Overview
Add a generic "Export GIF" button to the animations playground that works with ANY animation without modifying the user's code.

## Strategy
Use `gif.js` library with canvas capture to record any p5.js animation running in the iframe.

## Implementation Steps

### 1. Add State for Recording

```typescript
const [isRecording, setIsRecording] = useState(false);
const [recordingProgress, setRecordingProgress] = useState(0);
const gifRecorderRef = useRef<any>(null);
```

### 2. Add gif.js Library

In the iframe HTML generation, add:

```html
<script src="https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"></script>
```

### 3. Add GIF Export Function

```typescript
const exportGif = () => {
  if (!currentSketchRef.current?.iframe) return;

  setIsRecording(true);
  setRecordingProgress(0);

  // Send message to iframe to start recording
  currentSketchRef.current.iframe.contentWindow?.postMessage({
    type: 'startGifRecording',
    duration: 10, // 10 seconds
    fps: 30
  }, '*');
};
```

### 4. Add Recording Logic in Iframe

Add this to the iframe content (after user code):

```javascript
// GIF Recording Setup
let gifRecorder = null;
let isRecordingGif = false;
let recordingFrameCount = 0;
let recordingFrameLimit = 0;

window.addEventListener('message', (event) => {
  if (event.data.type === 'startGifRecording') {
    startGifRecording(event.data.duration, event.data.fps);
  }
});

function startGifRecording(duration, fps) {
  if (isRecordingGif) return;

  // Initialize GIF recorder
  gifRecorder = new GIF({
    workers: 2,
    quality: 10,
    width: 400,
    height: 400,
    workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
  });

  // Setup progress callback
  gifRecorder.on('progress', (progress) => {
    window.parent.postMessage({
      type: 'gifProgress',
      progress: progress
    }, '*');
  });

  // Setup finished callback
  gifRecorder.on('finished', (blob) => {
    // Create download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.gif';
    a.click();
    URL.revokeObjectURL(url);

    // Notify parent
    window.parent.postMessage({
      type: 'gifComplete'
    }, '*');
  });

  isRecordingGif = true;
  recordingFrameCount = 0;
  recordingFrameLimit = duration * fps;

  console.log('Started GIF recording:', recordingFrameLimit, 'frames');
}

// Override p5's draw loop to capture frames
const originalDraw = window.draw;
if (originalDraw) {
  window.draw = function() {
    originalDraw();

    // Capture frame if recording
    if (isRecordingGif && recordingFrameCount < recordingFrameLimit) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        // Add frame to GIF (sample every other frame for 30fps from 60fps)
        if (recordingFrameCount % 2 === 0) {
          gifRecorder.addFrame(canvas, {copy: true, delay: 33}); // 33ms = ~30fps
        }
        recordingFrameCount++;

        // Check if done
        if (recordingFrameCount >= recordingFrameLimit) {
          isRecordingGif = false;
          console.log('Rendering GIF...');
          gifRecorder.render();
        }
      }
    }
  };
}
```

### 5. Handle Recording Messages in Parent

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'gifProgress') {
      setRecordingProgress(event.data.progress * 100);
    } else if (event.data.type === 'gifComplete') {
      setIsRecording(false);
      setRecordingProgress(0);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### 6. Add Export Button to UI

```tsx
<button
  onClick={exportGif}
  disabled={isRecording || !code}
  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isRecording ? (
    <>
      <span className="inline-block animate-spin mr-2">⏳</span>
      Recording ({Math.round(recordingProgress)}%)
    </>
  ) : (
    <>📹 Export GIF</>
  )}
</button>
```

## Alternative: Simpler Approach with p5.gif

If you want a simpler solution, inject p5.gif library and auto-capture:

```javascript
// Add to iframe head
<script src="https://cdn.jsdelivr.net/gh/antiboredom/p5.gif.js/p5.gif.js"></script>

// Add to iframe body (before user code)
<script>
let __gifCapturer = null;
let __gifReady = false;

// Listen for export command
window.addEventListener('message', (event) => {
  if (event.data.type === 'exportGif' && __gifReady) {
    __gifCapturer.start();
    setTimeout(() => {
      __gifCapturer.stop();
      __gifCapturer.save('animation.gif');
      window.parent.postMessage({ type: 'gifSaved' }, '*');
    }, event.data.duration * 1000);
  }
});

// Wrap setup
const __originalSetup = window.setup;
window.setup = function() {
  if (__originalSetup) __originalSetup();

  // Initialize capturer after user's setup
  __gifCapturer = createGif({
    fps: 30,
    duration: 10,
    quality: 10
  });
  __gifReady = true;

  window.parent.postMessage({ type: 'gifReady' }, '*');
};
</script>
```

## Recommended Settings

```javascript
const GIF_SETTINGS = {
  fps: 30,              // 30fps is good balance
  duration: 10,         // 10 seconds max
  quality: 10,          // 1-100 (10 = good)
  width: 400,
  height: 400,
  sampleInterval: 2     // Capture every 2nd frame
};
```

## User Experience Flow

1. User clicks "Export GIF"
2. Button shows "Recording (0%)"
3. Progress updates as frames captured
4. When done, button shows "Processing..."
5. GIF auto-downloads
6. Button returns to "Export GIF"

## File Size Optimization

```javascript
// For smaller GIFs:
- fps: 20 instead of 30
- duration: 6 seconds max
- quality: 8 instead of 10
- sampleInterval: 3 (every 3rd frame)

// Results:
- 30fps, 10sec, quality 10 = ~5-8MB
- 20fps, 6sec, quality 8 = ~2-3MB
```

## Testing Checklist

- [ ] Works with static sketches
- [ ] Works with animated sketches
- [ ] Works with interactive sketches
- [ ] Shows progress during recording
- [ ] Downloads with correct filename
- [ ] Can record multiple times
- [ ] Doesn't break existing functionality
- [ ] Works on mobile (may be slow)

## Future Enhancements

1. **Custom duration picker**
   ```tsx
   <input type="number" min="3" max="20" value={duration} />
   ```

2. **Quality selector**
   ```tsx
   <select>
     <option value="8">Small (fast)</option>
     <option value="10">Medium</option>
     <option value="15">Large (slow)</option>
   </select>
   ```

3. **Loop preview**
   - Show GIF preview before download
   - "Save" or "Retry" option

4. **Background processing**
   - Use Web Workers for encoding
   - Don't freeze UI during render

## Known Limitations

1. **Browser performance** - May slow down on older devices
2. **Memory usage** - Long recordings use significant RAM
3. **File size** - GIFs are large compared to video
4. **No audio** - GIFs don't support sound
5. **Color limitation** - GIF format limited to 256 colors

## Troubleshooting

**GIF doesn't download:**
- Check browser console for errors
- Verify gif.js loaded correctly
- Check CORS issues with CDN

**GIF quality poor:**
- Increase quality setting (10 → 15)
- Reduce duration (fewer frames)
- Check canvas size is 400x400

**Recording too slow:**
- Reduce FPS (30 → 20)
- Lower quality (10 → 8)
- Reduce duration (10 → 6)

**Memory error:**
- Reduce duration
- Close other tabs
- Use lower quality setting
