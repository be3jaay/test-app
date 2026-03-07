// components/TranscriptionService.js
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Button } from "./ui/button";
import { Mic } from "lucide-react";

let socketClientIo;
let mediaRecorder = null;
let audioContext = null;
let mixedStreamDestination = null;
let systemAudioSource = null;
let micAudioSource = null;
let systemStream = null; // Stream from getDisplayMedia
let micStream = null; // Stream from getUserMedia
let combinedStream = null; // The mixed stream for MediaRecorder

export default function TranscriptionService({
  onNewTranscript,
  onNewSuggestion,
}) {
  const [isListening, setIsListening] = useState(false);
  const currentUtteranceBuffer = useRef("");

  // --- useEffect for Socket.IO setup and cleanup ---
  useEffect(() => {
    console.log("FRONTEND_TS: TranscriptionService mounting/re-rendering");
    socketClientIo = io(process.env.NEXT_PUBLIC_APP_URL);

    socketClientIo.on("connect", () =>
      console.log("FRONTEND_TS: Connected to backend"),
    );
    socketClientIo.on("connect_error", (err) =>
      console.error("FRONTEND_TS: Socket.IO connection error:", err),
    );
    socketClientIo.on("gcpTranscript", (data) => {
      // ... (your existing gcpTranscript handling logic) ...
      console.log(
        "FRONTEND_TS: Received gcpTranscript event from backend:",
        JSON.stringify(data, null, 2),
      );
      if (data && typeof data.text !== "undefined") {
        if (data.text && data.text.trim() !== "") {
          if (data.isFinal) {
            currentUtteranceBuffer.current += data.text + " ";
            onNewTranscript(currentUtteranceBuffer.current, true);
            if (
              socketClientIo &&
              socketClientIo.connected &&
              data.text.trim()
            ) {
              socketClientIo.emit("transcriptChunk", data.text.trim());
            }
          } else {
            onNewTranscript(currentUtteranceBuffer.current + data.text, false);
          }
        } else if (data.isFinal) {
          onNewTranscript(currentUtteranceBuffer.current, true);
        }
      }
    });
    socketClientIo.on("gcpTranscriptError", (errorData) => {
      console.error(
        "FRONTEND_TS: Error from backend (Google STT):",
        errorData.error,
      );
      stopTranscriptionLogic();
    });
    socketClientIo.on("scriptSuggestion", onNewSuggestion);

    return () => {
      console.log("FRONTEND_TS: Cleanup effect");
      if (socketClientIo) {
        if (isListening) socketClientIo.emit("endGoogleCloudStream");
        socketClientIo.disconnect();
      }
      stopMediaAndAudioContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNewSuggestion]); // isListening removed

  const stopMediaAndAudioContext = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    mediaRecorder = null;

    if (systemStream) systemStream.getTracks().forEach((track) => track.stop());
    systemStream = null;
    if (micStream) micStream.getTracks().forEach((track) => track.stop());
    micStream = null;

    combinedStream = null; // Clear the reference

    if (systemAudioSource) systemAudioSource.disconnect();
    systemAudioSource = null;
    if (micAudioSource) micAudioSource.disconnect();
    micAudioSource = null;
    if (mixedStreamDestination) mixedStreamDestination = null; // It doesn't have a disconnect method

    if (audioContext && audioContext.state !== "closed") {
      audioContext.close();
    }
    audioContext = null;
    console.log(
      "FRONTEND_TS: All media and audio context stopped and cleaned up.",
    );
  };

  const stopTranscriptionLogic = () => {
    console.log("FRONTEND_TS: stopTranscriptionLogic called");
    stopMediaAndAudioContext();
    if (socketClientIo && socketClientIo.connected && isListening) {
      // only emit if was listening
      socketClientIo.emit("endGoogleCloudStream");
    }
    setIsListening(false);
  };

  const startTranscription = async () => {
    console.log("FRONTEND_TS: startTranscription called");
    if (isListening) return;

    if (!socketClientIo || !socketClientIo.connected) {
      alert("Cannot connect to transcription server.");
      return;
    }

    try {
      // 1. Get System/Tab Audio
      console.log(
        "FRONTEND_TS: Requesting system/tab audio via getDisplayMedia...",
      );
      systemStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Often required to get audio sharing options properly
        audio: {
          // Request browser default processing for these for now
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const systemAudioTracks = systemStream.getAudioTracks();
      if (systemAudioTracks.length === 0) {
        alert(
          "No system/tab audio track was shared. Please select an audio source to share.",
        );
        systemStream.getTracks().forEach((track) => track.stop()); // Stop video track if any
        systemStream = null;
        return;
      }
      console.log(
        "FRONTEND_TS: System/tab audio track obtained:",
        systemAudioTracks[0].label,
      );

      // 2. Get Microphone Audio
      console.log(
        "FRONTEND_TS: Requesting microphone audio via getUserMedia...",
      );
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // You might want to disable these if system audio already has them,
          // or if mixing causes issues. Experimentation needed.
          // autoGainControl: false,
          // echoCancellation: false,
          // noiseSuppression: false,
        },
      });
      const micAudioTracks = micStream.getAudioTracks();
      if (micAudioTracks.length === 0) {
        alert("Could not access microphone.");
        stopMediaAndAudioContext(); // Clean up systemStream too
        return;
      }
      console.log(
        "FRONTEND_TS: Microphone audio track obtained:",
        micAudioTracks[0].label,
      );

      // 3. Mix Audio Streams
      console.log("FRONTEND_TS: Initializing AudioContext for mixing...");
      audioContext = new AudioContext();
      mixedStreamDestination = audioContext.createMediaStreamDestination();

      systemAudioSource = audioContext.createMediaStreamSource(systemStream);
      systemAudioSource.connect(mixedStreamDestination);
      console.log("FRONTEND_TS: System audio source connected to mixer.");

      micAudioSource = audioContext.createMediaStreamSource(micStream);
      micAudioSource.connect(mixedStreamDestination);
      console.log("FRONTEND_TS: Microphone audio source connected to mixer.");

      combinedStream = mixedStreamDestination.stream; // This stream has both audio tracks mixed
      // Add the video track from systemStream if you want MediaRecorder to record it (optional)
      // If you only want audio, this is fine. If you wanted video too:
      // systemStream.getVideoTracks().forEach(videoTrack => combinedStream.addTrack(videoTrack));

      setIsListening(true);
      currentUtteranceBuffer.current = "";
      socketClientIo.emit("startGoogleCloudStream");
      console.log(
        "FRONTEND_TS: Emitted startGoogleCloudStream with mixed audio setup.",
      );

      // 4. Initialize MediaRecorder with the MIXED stream
      let mediaRecorderOptions = { mimeType: "audio/webm;codecs=opus" };
      if (!MediaRecorder.isTypeSupported(mediaRecorderOptions.mimeType)) {
        console.warn(
          `FRONTEND_TS: MIME type ${mediaRecorderOptions.mimeType} not supported. Trying audio/webm...`,
        );
        mediaRecorderOptions = { mimeType: "audio/webm" };
        if (!MediaRecorder.isTypeSupported(mediaRecorderOptions.mimeType)) {
          console.error(
            `FRONTEND_TS: MIME type ${mediaRecorderOptions.mimeType} also not supported. Trying default.`,
          );
          mediaRecorderOptions = {};
        }
      }
      console.log(
        "FRONTEND_TS: Attempting MediaRecorder with options:",
        mediaRecorderOptions,
      );
      mediaRecorder = new MediaRecorder(combinedStream, mediaRecorderOptions); // Use the mixed stream
      console.log(
        "FRONTEND_TS: MediaRecorder initialized with mixed stream. Actual MimeType:",
        mediaRecorder.mimeType,
      );

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketClientIo && socketClientIo.connected) {
          console.log(
            "FRONTEND_TS: Sending mixed audio chunk to backend, size:",
            event.data.size,
          );
          socketClientIo.emit("googleCloudAudioChunk", event.data);
        }
      };
      mediaRecorder.onerror = (event) => {
        console.error(
          "FRONTEND_TS: MediaRecorder Error:",
          event.error || event,
        );
        stopTranscriptionLogic();
      };
      mediaRecorder.onstop = () =>
        console.log("FRONTEND_TS: MediaRecorder stopped.");

      mediaRecorder.start(250);
      console.log("FRONTEND_TS: MediaRecorder started with mixed audio.");
    } catch (error) {
      console.error(
        "FRONTEND_TS: Error in startTranscription (capturing/mixing audio):",
        error.name,
        error.message,
        error,
      );
      alert(
        `Could not start audio capture/mixing: ${error.name} - ${error.message}`,
      );
      stopMediaAndAudioContext(); // Ensure full cleanup
      setIsListening(false);
    }
  };
  const {
    mutateAsync: stopTranscription,
    sentimentData,
    isPending,
  } = useGetSentimentAnalysis();

  const handleStopTranscription = async () => {
    try {
      console.log("FRONTEND_TS: stopTranscription button clicked.");
      stopTranscriptionLogic();
      await stopTranscription("call_pm_test_001");
    } catch (error) {
      console.error(
        "FRONTEND_TS: Error in handleStopTranscription:",
        error.name,
        error.message,
        error,
      );
      alert(`Error stopping transcription: ${error.name} - ${error.message}`);
    }
  };

  return (
    <div className="w-full flex items-center justify-between mb-4 gap-2">
      <Button onClick={startTranscription} disabled={isListening} className="">
        Start Listening (Mic + Speakers)
        <Mic />
      </Button>
      <Button
        onClick={handleStopTranscription}
        disabled={isListening}
        className=""
      >
        Stop Listening (Mic + Speakers)
        <Mic />
      </Button>
    </div>
  );
}
