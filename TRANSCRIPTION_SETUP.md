# Transcription Service Setup Guide

The TranscriptionService component requires a separate Socket.IO backend server to handle real-time audio transcription with Google Cloud Speech-to-Text.

## Current Status

The component is integrated into the client dashboard but will show a connection error until you set up the backend server.

## Quick Fix: Disable Socket.IO Connection

If you don't need the transcription feature right now, the component will gracefully show an error message and disable the buttons. No action needed - the error loop has been fixed.

## Option 1: Set Up Backend Server (Recommended)

### 1. Create a separate Node.js backend with Socket.IO

```bash
mkdir transcription-backend
cd transcription-backend
npm init -y
npm install express socket.io @google-cloud/speech
```

### 2. Create `server.js`:

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const speech = require('@google-cloud/speech');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const client = new speech.SpeechClient({
  keyFilename: './google-credentials.json' // Your Google Cloud credentials
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  let recognizeStream = null;

  socket.on('startGoogleCloudStream', () => {
    recognizeStream = client
      .streamingRecognize({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
        },
        interimResults: true,
      })
      .on('data', (data) => {
        const result = data.results[0];
        if (result) {
          socket.emit('gcpTranscript', {
            text: result.alternatives[0].transcript,
            isFinal: result.isFinal,
          });
        }
      })
      .on('error', (error) => {
        console.error('Speech recognition error:', error);
        socket.emit('gcpTranscriptError', { error: error.message });
      });
  });

  socket.on('googleCloudAudioChunk', (audioChunk) => {
    if (recognizeStream) {
      recognizeStream.write(audioChunk);
    }
  });

  socket.on('endGoogleCloudStream', () => {
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream = null;
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (recognizeStream) {
      recognizeStream.end();
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
```

### 3. Get Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Speech-to-Text API
3. Create a service account and download the JSON key file
4. Save it as `google-credentials.json` in your backend folder

### 4. Start the backend server

```bash
node server.js
```

### 5. Update your `.env.local` in the frontend:

```env
NEXT_PUBLIC_SOCKET_IO_URL="http://localhost:4000"
```

## Option 2: Remove Transcription Feature

If you don't need the transcription feature, simply remove or comment out the TranscriptionService component from your client dashboard:

```tsx
// In app/client/dashboard/page.tsx

// Remove or comment out these lines:
// <div className="mb-6">
//   <TranscriptionService 
//     onNewTranscript={handleNewTranscript}
//     onNewSuggestion={handleNewSuggestion}
//   />
//   {transcript && (
//     <div className="mt-4 p-4 bg-secondary/20 rounded-lg border border-border">
//       <h3 className="text-sm font-semibold mb-2">Live Transcript:</h3>
//       <p className="text-sm text-muted-foreground">{transcript}</p>
//     </div>
//   )}
// </div>
```

## Troubleshooting

### "Cannot connect to transcription server" error

- Make sure your backend server is running
- Check that `NEXT_PUBLIC_SOCKET_IO_URL` is set correctly in `.env.local`
- Verify your backend server port matches the URL in `.env.local`
- Check browser console for detailed error messages

### Audio not being captured

- Make sure to allow microphone and screen sharing permissions when prompted
- Select "Share audio" when choosing which screen/tab to share
- Try different browsers (Chrome/Edge work best for screen audio capture)

##Socket.IO connection keeps timing out

- The component now limits reconnection attempts to 3 before showing an error
- Connection errors no longer cause infinite reconnection loops
- The error message will guide you on next steps
