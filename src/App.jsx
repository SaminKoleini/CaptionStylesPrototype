import { useState, useRef } from "react";
import { CaptionVideoPlayer } from "./CaptionVideo";
import "./App.css";

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [captions, setCaptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setError(null);
      setCaptions(null);

      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.src = url;
    }
  };

  const handleSubmit = async () => {
    if (!videoFile || !apiKey) {
      setError("Please upload a video and enter your API key");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("apiKey", apiKey);

      const res = await fetch("http://localhost:3001/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Transcription failed");
      }

      const words = await res.json();

      if (!words || words.length === 0) {
        throw new Error("No transcription data received");
      }

      setCaptions(words);
    } catch (err) {
      setError(err.message || "Failed to transcribe video");
      console.error("Transcription error:", err);
    } finally {
      setLoading(false);
    }
  };

  const durationInFrames = Math.ceil(videoDuration * 30);

  return (
    <div className="app">
      <div className="container">
        <h1>TikTok-Style Auto Caption</h1>
        <p className="subtitle">Upload a video and generate captions with OpenAI Whisper</p>

        <div className="upload-section">
          <div className="input-group">
            <label htmlFor="video-upload">Video File</label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              disabled={loading}
            />
            {videoFile && (
              <span className="file-name">{videoFile.name}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="api-key">OpenAI API Key</label>
            <input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!videoFile || !apiKey || loading}
            className="generate-btn"
          >
            {loading ? "Transcribing..." : "Generate Captions"}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Transcribing your video with Whisper API...</p>
            </div>
          )}
        </div>

        {captions && videoUrl && (
          <div className="player-section">
            <h2>Preview with Captions</h2>
            <CaptionVideoPlayer
              videoSrc={videoUrl}
              captions={captions}
              durationInFrames={durationInFrames}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
