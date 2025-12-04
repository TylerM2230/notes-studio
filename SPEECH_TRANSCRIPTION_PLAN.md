# Speech Transcription Feature - Implementation Plan

## Overview
Add push-to-talk speech transcription feature using the Web Speech API that inserts transcribed text at the current cursor position in the notes editor.

## User Requirements
- **Push-to-talk**: Hold button to record, release to stop
- **Insertion**: Insert at current cursor position (like templates)
- **Visual Feedback**: Clear and distinctive but not intrusive
- **Language**: English only (en-US)
- **Format**: Insert transcribed text as-is (no auto-formatting)

## Architecture Summary
- **Technology**: Web Speech API (browser built-in, no dependencies)
- **Browser Support**: Chrome/Edge (full), Safari 14.1+ (partial), Firefox with flag
- **Configuration**: `continuous: true`, `interimResults: true`, `lang: 'en-US'`
- **Integration**: Follows existing template insertion pattern

---

## Implementation Steps

### Step 1: Add State Variables
**Location**: [src/app.js:33](src/app.js#L33) (after `monacoIntegrationRef`)

Add speech recognition state management:
```javascript
// Speech recognition state
const [isRecording, setIsRecording] = useState(false);
const [speechSupported, setSpeechSupported] = useState(false);
const [speechError, setSpeechError] = useState(null);
const [accumulatedTranscript, setAccumulatedTranscript] = useState("");
const recognitionRef = useRef(null);
```

### Step 2: Initialize Web Speech API
**Location**: [src/app.js:473](src/app.js#L473) (after Monaco initialization effects)

Detect browser support and create SpeechRecognition instance:
```javascript
// Initialize Speech Recognition
useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setSpeechSupported(false);
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    recognitionRef.current = recognition;
    setSpeechSupported(true);
  } catch (error) {
    setSpeechSupported(false);
    setSpeechError("Speech recognition initialization failed");
  }

  return () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };
}, []);
```

### Step 3: Configure Event Handlers
**Location**: [src/app.js:495](src/app.js#L495) (immediately after initialization effect)

Set up recognition event handlers:
```javascript
// Configure Speech Recognition event handlers
useEffect(() => {
  if (!recognitionRef.current) return;

  const recognition = recognitionRef.current;

  recognition.onstart = () => {
    setIsRecording(true);
    setSpeechError(null);
    setAccumulatedTranscript("");
  };

  recognition.onresult = (event) => {
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      }
    }

    if (finalTranscript) {
      setAccumulatedTranscript(prev => prev + finalTranscript);
    }
  };

  recognition.onend = () => {
    // Auto-restart if button still held
    if (isRecording) {
      try { recognition.start(); } catch (e) {}
    }
  };

  recognition.onerror = (event) => {
    switch (event.error) {
      case 'no-speech':
        setSpeechError("No speech detected");
        break;
      case 'audio-capture':
        setSpeechError("Microphone access failed");
        break;
      case 'not-allowed':
        setSpeechError("Microphone permission denied");
        setIsRecording(false);
        break;
      case 'network':
        setSpeechError("Network error");
        break;
      case 'aborted':
        setSpeechError(null);
        break;
      default:
        setSpeechError(`Error: ${event.error}`);
    }
  };

  return () => {
    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onend = null;
    recognition.onerror = null;
  };
}, [isRecording]);
```

### Step 4: Create Handler Functions
**Location**: [src/app.js:909](src/app.js#L909) (before keyboard shortcuts useEffect)

Add start/stop/insert functions:
```javascript
// Speech recognition handlers
const startRecording = useCallback(() => {
  if (!recognitionRef.current || !speechSupported) return;

  try {
    setAccumulatedTranscript("");
    setSpeechError(null);
    recognitionRef.current.start();
  } catch (error) {
    if (!error.message.includes('already started')) {
      setSpeechError("Failed to start recording");
      setIsRecording(false);
    }
  }
}, [speechSupported]);

const stopRecording = useCallback(() => {
  if (!recognitionRef.current) return;

  try {
    recognitionRef.current.stop();
    setIsRecording(false);

    if (accumulatedTranscript.trim()) {
      insertTextAtCursor(accumulatedTranscript.trim());
    }
  } catch (error) {
    setIsRecording(false);
  }
}, [accumulatedTranscript]);

const insertTextAtCursor = useCallback((text) => {
  if (monacoRef.current) {
    // Monaco editor insertion
    const position = monacoRef.current.getPosition();
    const model = monacoRef.current.getModel();
    const textToInsert = position.column > 1 ? ' ' + text : text;

    model.pushEditOperations(
      [],
      [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: textToInsert,
      }],
      () => null
    );

    const newValue = monacoRef.current.getValue();
    setCurrentNotes(newValue);
    updateStats(newValue);

    monacoRef.current.setPosition({
      lineNumber: position.lineNumber,
      column: position.column + textToInsert.length
    });
    monacoRef.current.focus();

  } else {
    // Textarea fallback
    const textarea = document.querySelector('textarea.courier-font');
    if (textarea) {
      const start = textarea.selectionStart;
      const textToInsert = start > 0 ? ' ' + text : text;
      const newText =
        currentNotes.substring(0, start) +
        textToInsert +
        currentNotes.substring(textarea.selectionEnd);

      setCurrentNotes(newText);
      updateStats(newText);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
        textarea.focus();
      }, 0);
    }
  }
}, [currentNotes, updateStats]);
```

### Step 5: Add UI Components
**Location**: [src/app.js:1267](src/app.js#L1267) (inside `<div className="flex space-x-2">`, before "Load Template" button)

Add speech button with visual feedback:
```javascript
{/* Speech-to-Text Button */}
{speechSupported && (
  <button
    onMouseDown={startRecording}
    onMouseUp={stopRecording}
    onMouseLeave={() => {
      if (isRecording) stopRecording();
    }}
    onTouchStart={startRecording}
    onTouchEnd={stopRecording}
    disabled={!speechSupported}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      isRecording ? 'button-accent pulse-glow' : 'button-accent'
    }`}
    style={{
      backgroundColor: isRecording
        ? getThemeColors(currentTheme).primary
        : getThemeColors(currentTheme).backgroundSecondary,
      borderColor: isRecording
        ? getThemeColors(currentTheme).primary
        : getThemeColors(currentTheme).border,
      color: isRecording ? '#ffffff' : getThemeColors(currentTheme).text,
      cursor: isRecording ? 'grabbing' : 'pointer',
    }}
    title="Hold to record speech"
    aria-label="Hold button to record speech and transcribe to text"
    aria-pressed={isRecording}
  >
    <i className={`fas ${isRecording ? 'fa-microphone' : 'fa-microphone-slash'} mr-2`}></i>
    {isRecording ? 'Recording...' : 'Hold to Speak'}
  </button>
)}

{/* Error message display */}
{speechError && (
  <div
    className="absolute top-full mt-2 text-xs px-3 py-2 rounded-lg flex items-center whitespace-nowrap"
    style={{
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.4)',
    }}
  >
    <i className="fas fa-exclamation-circle mr-2"></i>
    {speechError}
  </div>
)}
```

### Step 6: Add CSS Animation (Optional)
**Location**: [assets/styles.css](assets/styles.css) (end of file)

Add pulse animation for recording indicator:
```css
/* Speech recording pulse animation */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 107, 53, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
  }
}

.pulse-glow {
  animation: pulse-glow 1.5s ease-in-out infinite;
}
```

---

## Testing Checklist

### Basic Functionality
- [ ] Button appears when speech is supported
- [ ] Warning shown when speech not supported
- [ ] Hold button starts recording
- [ ] Release button stops and inserts text
- [ ] Text inserted at cursor position in Monaco
- [ ] Text inserted at cursor position in textarea fallback

### Visual Feedback
- [ ] Button changes appearance when recording
- [ ] Pulse animation during recording
- [ ] Icon changes to microphone during recording
- [ ] Clear visual distinction between states

### Error Handling
- [ ] Permission denied shows error
- [ ] No speech detected shows error
- [ ] Network error shows error
- [ ] Can recover from transient errors

### Edge Cases
- [ ] Drag mouse away while recording stops recording
- [ ] Touch events work on mobile
- [ ] Empty transcript doesn't insert anything
- [ ] Cursor positioning correct after insertion
- [ ] Word count updates after transcription
- [ ] Can continue typing after transcription

### Browser Testing
- [ ] Chrome/Edge (full support)
- [ ] Safari 14.1+ (test on macOS/iOS)
- [ ] Unsupported browsers show message gracefully

---

## Critical Files to Modify

1. **[src/app.js](src/app.js)** - Main implementation
   - Line 33: Add state variables
   - Line 473: Initialize Web Speech API
   - Line 495: Configure event handlers
   - Line 909: Add handler functions
   - Line 1267: Add UI button

2. **[assets/styles.css](assets/styles.css)** (optional) - Add pulse animation

3. **[CLAUDE.md](CLAUDE.md)** (post-implementation) - Update documentation

---

## Implementation Notes

### Key Features
- **No new dependencies**: Uses browser built-in Web Speech API
- **CDN-compatible**: No build process changes required
- **Fallback support**: Works with both Monaco and textarea
- **Accessibility**: ARIA labels, keyboard support via existing shortcuts
- **Theme-aware**: Uses existing theme system for styling

### Accuracy Optimizations
- `continuous: true` - Enables natural multi-sentence speech
- `interimResults: true` - Provides real-time feedback
- Auto-restart on `onend` - Maintains recognition while button held
- Smart spacing - Adds space before text if not at line start

### Edge Cases Handled
- "Already started" error when spamming button
- Mouse leave while recording (stops recording)
- Touch events for mobile support
- Empty transcripts (no insertion)
- Permission denied (permanent error state)
- Network errors (transient, allows retry)

---

## Estimated Implementation Time
**2-3 hours** for complete implementation and testing
