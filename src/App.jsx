import { useEffect, useState, useRef } from "react";
import { CaptionVideoPlayer } from "./CaptionVideo";
import { CaptionVideoPlayer2 } from "./CaptionVideo2";
import { CaptionVideoPlayer3 } from "./CaptionVideo3";
import { CaptionVideoPlayer4 } from "./CaptionVideo4";
import { CaptionVideoPlayer5 } from "./CaptionVideo5";
import { CaptionVideoPlayer6 } from "./CaptionVideo6";
import { CaptionVideoPlayer7 } from "./CaptionVideo7";
import { CaptionVideoPlayer8 } from "./CaptionVideo8";
import { exportVideoWithCaptions, exportVideoWithCaptions2, exportVideoWithCaptions3, exportVideoWithCaptions4 } from "./videoExport";
import { clusterWords, extractClusterFrames } from "./captionHelpers5";
import "./App.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/+$/, "");

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [captions, setCaptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const lastSelectedUrlRef = useRef(null);

  // Section 2 state
  const [videoFile2, setVideoFile2] = useState(null);
  const [videoUrl2, setVideoUrl2] = useState(null);
  const [videoDuration2, setVideoDuration2] = useState(0);
  const [captions2, setCaptions2] = useState(null);
  const [loading2, setLoading2] = useState(false);
  const [error2, setError2] = useState(null);
  const [exporting2, setExporting2] = useState(false);
  const [exportProgress2, setExportProgress2] = useState(0);
  const lastSelectedUrl2Ref = useRef(null);

  // Section 4 state
  const [videoFile4, setVideoFile4] = useState(null);
  const [videoUrl4, setVideoUrl4] = useState(null);
  const [videoDuration4, setVideoDuration4] = useState(0);
  const [captions4, setCaptions4] = useState(null);
  const [loading4, setLoading4] = useState(false);
  const [error4, setError4] = useState(null);
  const [exporting4, setExporting4] = useState(false);
  const [exportProgress4, setExportProgress4] = useState(0);
  const lastSelectedUrl4Ref = useRef(null);

  // Section 5 state
  const [videoFile5, setVideoFile5] = useState(null);
  const [videoUrl5, setVideoUrl5] = useState(null);
  const [videoDuration5, setVideoDuration5] = useState(0);
  const [videoAspectRatio5, setVideoAspectRatio5] = useState(null);
  const [captions5, setCaptions5] = useState(null);
  const [layoutData5, setLayoutData5] = useState(null);
  const [loading5, setLoading5] = useState(false);
  const [analyzing5, setAnalyzing5] = useState(false);
  const [analyzeProgress5, setAnalyzeProgress5] = useState(0);
  const [error5, setError5] = useState(null);
  const [exporting5, setExporting5] = useState(false);
  const [exportProgress5, setExportProgress5] = useState(0);
  const lastSelectedUrl5Ref = useRef(null);

  // Section 7 state
  const [videoFile7, setVideoFile7] = useState(null);
  const [videoUrl7, setVideoUrl7] = useState(null);
  const [videoDuration7, setVideoDuration7] = useState(0);
  const [captions7, setCaptions7] = useState(null);
  const [loading7, setLoading7] = useState(false);
  const [error7, setError7] = useState(null);
  const [exporting7, setExporting7] = useState(false);
  const [exportProgress7, setExportProgress7] = useState(0);
  const lastSelectedUrl7Ref = useRef(null);

  // Section 8 state
  const [videoFile8, setVideoFile8] = useState(null);
  const [videoUrl8, setVideoUrl8] = useState(null);
  const [videoDuration8, setVideoDuration8] = useState(0);
  const [captions8, setCaptions8] = useState(null);
  const [loading8, setLoading8] = useState(false);
  const [error8, setError8] = useState(null);
  const [exporting8, setExporting8] = useState(false);
  const [exportProgress8, setExportProgress8] = useState(0);
  const lastSelectedUrl8Ref = useRef(null);

  // Section 6 state
  const [videoFile6, setVideoFile6] = useState(null);
  const [videoUrl6, setVideoUrl6] = useState(null);
  const [videoDuration6, setVideoDuration6] = useState(0);
  const [captions6, setCaptions6] = useState(null);
  const [loading6, setLoading6] = useState(false);
  const [error6, setError6] = useState(null);
  const [exporting6, setExporting6] = useState(false);
  const [exportProgress6, setExportProgress6] = useState(0);
  const lastSelectedUrl6Ref = useRef(null);

  // Section 3 state
  const [videoFile3, setVideoFile3] = useState(null);
  const [videoUrl3, setVideoUrl3] = useState(null);
  const [videoDuration3, setVideoDuration3] = useState(0);
  const [captions3, setCaptions3] = useState(null);
  const [title3, setTitle3] = useState(null);
  const [loading3, setLoading3] = useState(false);
  const [error3, setError3] = useState(null);
  const [exporting3, setExporting3] = useState(false);
  const [exportProgress3, setExportProgress3] = useState(0);
  const lastSelectedUrl3Ref = useRef(null);

  useEffect(() => {
    const cached = localStorage.getItem("openai_api_key");
    if (cached) setApiKey(cached);
  }, []);

  useEffect(() => {
    if (apiKey) localStorage.setItem("openai_api_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    return () => {
      if (lastSelectedUrlRef.current) {
        URL.revokeObjectURL(lastSelectedUrlRef.current);
      }
      if (lastSelectedUrl2Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl2Ref.current);
      }
      if (lastSelectedUrl3Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl3Ref.current);
      }
      if (lastSelectedUrl4Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl4Ref.current);
      }
      if (lastSelectedUrl5Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl5Ref.current);
      }
      if (lastSelectedUrl6Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl6Ref.current);
      }
      if (lastSelectedUrl7Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl7Ref.current);
      }
      if (lastSelectedUrl8Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl8Ref.current);
      }
    };
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (lastSelectedUrlRef.current) {
        URL.revokeObjectURL(lastSelectedUrlRef.current);
      }
      setVideoFile(file);
      setError(null);
      setCaptions(null);

      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      lastSelectedUrlRef.current = url;

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
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
    setErrorDetails(null);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("apiKey", apiKey);

      const res = await fetch(API_BASE_URL + "/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Transcription failed");
        setErrorDetails(errorData.details);
        return;
      }

      const words = await res.json();

      if (!words || words.length === 0) {
        setError("No transcription data received. The video may not contain any speech.");
        return;
      }

      setCaptions(words);
    } catch (err) {
      setError(err.message || "Failed to transcribe video. Please check your connection.");
      console.error("Transcription error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (lastSelectedUrl2Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl2Ref.current);
      }
      setVideoFile2(file);
      setError2(null);
      setCaptions2(null);

      const url = URL.createObjectURL(file);
      setVideoUrl2(url);
      lastSelectedUrl2Ref.current = url;

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setVideoDuration2(video.duration);
      };
      video.src = url;
    }
  };

  const handleSubmit2 = async () => {
    if (!videoFile2 || !apiKey) {
      setError2("Please upload a video and enter your API key");
      return;
    }

    setLoading2(true);
    setError2(null);

    try {
      const formData = new FormData();
      formData.append("video", videoFile2);
      formData.append("apiKey", apiKey);

      const res = await fetch(API_BASE_URL + "/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError2(errorData.error || "Transcription failed");
        return;
      }

      const words = await res.json();

      if (!words || words.length === 0) {
        setError2("No transcription data received. The video may not contain any speech.");
        return;
      }

      setCaptions2(words);
    } catch (err) {
      setError2(err.message || "Failed to transcribe video. Please check your connection.");
    } finally {
      setLoading2(false);
    }
  };

  const handleDownload2 = async () => {
    if (!videoUrl2 || !videoFile2 || !captions2) return;

    setExporting2(true);
    setExportProgress2(0);
    try {
      const outputUrl = await exportVideoWithCaptions2(
        videoUrl2,
        captions2,
        (pct) => setExportProgress2(pct)
      );
      const baseName = videoFile2.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `${baseName}_bold_captioned.webm`;
      a.click();
      URL.revokeObjectURL(outputUrl);
    } catch (err) {
      console.error("Export failed:", err);
      setError2("Export failed: " + err.message);
    } finally {
      setExporting2(false);
      setExportProgress2(0);
    }
  };

  const handleVideoChange3 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (lastSelectedUrl3Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl3Ref.current);
      }
      setVideoFile3(file);
      setError3(null);
      setCaptions3(null);
      setTitle3(null);

      const url = URL.createObjectURL(file);
      setVideoUrl3(url);
      lastSelectedUrl3Ref.current = url;

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => setVideoDuration3(video.duration);
      video.src = url;
    }
  };

  const handleSubmit3 = async () => {
    if (!videoFile3 || !apiKey) {
      setError3("Please upload a video and enter your API key");
      return;
    }

    setLoading3(true);
    setError3(null);
    setCaptions3(null);
    setTitle3(null);

    try {
      // Step 1: transcribe
      const formData = new FormData();
      formData.append("video", videoFile3);
      formData.append("apiKey", apiKey);

      const transcribeRes = await fetch(API_BASE_URL + "/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) {
        const errorData = await transcribeRes.json();
        setError3(errorData.error || "Transcription failed");
        return;
      }

      const words = await transcribeRes.json();

      if (!words || words.length === 0) {
        setError3("No transcription data received. The video may not contain any speech.");
        return;
      }

      setCaptions3(words);

      // Step 2: generate editorial title from transcript
      const transcriptText = words.map((w) => w.word).join(" ");
      try {
        const titleRes = await fetch(API_BASE_URL + "/generate-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcriptText, apiKey }),
        });
        if (titleRes.ok) {
          const { title } = await titleRes.json();
          setTitle3(title || null);
        }
      } catch {
        // Title generation failing is non-critical — captions still show
      }
    } catch (err) {
      setError3(err.message || "Failed to transcribe video. Please check your connection.");
    } finally {
      setLoading3(false);
    }
  };

  const handleDownload3 = async () => {
    if (!videoUrl3 || !videoFile3 || !captions3) return;

    setExporting3(true);
    setExportProgress3(0);
    try {
      const outputUrl = await exportVideoWithCaptions3(
        videoUrl3,
        captions3,
        title3,
        (pct) => setExportProgress3(pct)
      );
      const baseName = videoFile3.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `${baseName}_editorial_captioned.webm`;
      a.click();
      URL.revokeObjectURL(outputUrl);
    } catch (err) {
      console.error("Export failed:", err);
      setError3("Export failed: " + err.message);
    } finally {
      setExporting3(false);
      setExportProgress3(0);
    }
  };

  const handleVideoChange4 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (lastSelectedUrl4Ref.current) URL.revokeObjectURL(lastSelectedUrl4Ref.current);
      setVideoFile4(file);
      setError4(null);
      setCaptions4(null);
      const url = URL.createObjectURL(file);
      setVideoUrl4(url);
      lastSelectedUrl4Ref.current = url;
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => setVideoDuration4(v.duration);
      v.src = url;
    }
  };

  const handleSubmit4 = async () => {
    if (!videoFile4 || !apiKey) {
      setError4("Please upload a video and enter your API key");
      return;
    }
    setLoading4(true);
    setError4(null);
    setCaptions4(null);
    try {
      const formData = new FormData();
      formData.append("video", videoFile4);
      formData.append("apiKey", apiKey);
      const res = await fetch(API_BASE_URL + "/transcribe", { method: "POST", body: formData });
      if (!res.ok) {
        const errorData = await res.json();
        setError4(errorData.error || "Transcription failed");
        return;
      }
      const words = await res.json();
      if (!words || words.length === 0) {
        setError4("No transcription data received. The video may not contain any speech.");
        return;
      }
      setCaptions4(words);
    } catch (err) {
      setError4(err.message || "Failed to transcribe video. Please check your connection.");
    } finally {
      setLoading4(false);
    }
  };

  const handleDownload4 = async () => {
    if (!videoUrl4 || !videoFile4 || !captions4) return;
    setExporting4(true);
    setExportProgress4(0);
    try {
      const outputUrl = await exportVideoWithCaptions4(
        videoUrl4,
        captions4,
        (pct) => setExportProgress4(pct)
      );
      const baseName = videoFile4.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `${baseName}_wordpop_captioned.webm`;
      a.click();
      URL.revokeObjectURL(outputUrl);
    } catch (err) {
      console.error("Export failed:", err);
      setError4("Export failed: " + err.message);
    } finally {
      setExporting4(false);
      setExportProgress4(0);
    }
  };

  // ─── Section 5 handlers ────────────────────────────────────────────────────

  const handleVideoChange5 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (lastSelectedUrl5Ref.current) {
        URL.revokeObjectURL(lastSelectedUrl5Ref.current);
      }
      setVideoFile5(file);
      setError5(null);
      setCaptions5(null);
      setLayoutData5(null);
      setVideoAspectRatio5(null);

      const url = URL.createObjectURL(file);
      setVideoUrl5(url);
      lastSelectedUrl5Ref.current = url;

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setVideoDuration5(video.duration);
        if (video.videoWidth && video.videoHeight) {
          setVideoAspectRatio5(video.videoWidth / video.videoHeight);
        }
      };
      video.src = url;
    }
  };

  // Step 1: transcribe with Whisper (uses fallback placement zones in preview).
  const handleSubmit5 = async () => {
    if (!videoFile5 || !apiKey) {
      setError5("Please upload a video and enter your API key");
      return;
    }

    setLoading5(true);
    setError5(null);
    setLayoutData5(null);
    setCaptions5(null);

    try {
      const formData = new FormData();
      formData.append("video", videoFile5);
      formData.append("apiKey", apiKey);

      const res = await fetch(API_BASE_URL + "/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError5(errorData.error || "Transcription failed");
        return;
      }

      const words = await res.json();

      if (!words || words.length === 0) {
        setError5("No transcription data received. The video may not contain any speech.");
        return;
      }

      setCaptions5(words);
    } catch (err) {
      setError5(err.message || "Failed to transcribe video. Please check your connection.");
    } finally {
      setLoading5(false);
    }
  };

  // Step 2 (optional): run AI layout analysis for intelligent word placement.
  // Extracts one frame per cluster from the video (client-side canvas),
  // sends them to the server which calls GPT-4.1 vision, and returns
  // per-cluster word placements that replace the fallback zones.
  const handleAnalyzeLayout5 = async () => {
    if (!captions5 || !videoUrl5 || !apiKey) return;

    setAnalyzing5(true);
    setAnalyzeProgress5(0);
    setError5(null);

    try {
      // Build clusters from the transcription.
      const clusters = clusterWords(captions5, 6);

      // Extract one representative frame per cluster (browser canvas).
      setAnalyzeProgress5(10);
      const frames = await extractClusterFrames(videoUrl5, clusters);
      setAnalyzeProgress5(30);

      // Build the request payload: words (strings) + optional base64 frame.
      const payload = clusters.map((c, i) => ({
        words: c.words.map((w) => w._text),
        frameDataUrl: frames[i] ?? null,
      }));

      const res = await fetch(API_BASE_URL + "/analyze-spatial-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, clusters: payload }),
      });

      setAnalyzeProgress5(80);

      if (!res.ok) {
        const errData = await res.json();
        setError5(errData.error || "Layout analysis failed");
        return;
      }

      const data = await res.json();
      setLayoutData5(data);
      setAnalyzeProgress5(100);
    } catch (err) {
      setError5("Layout analysis failed: " + err.message);
      console.error("Layout analysis error:", err);
    } finally {
      setAnalyzing5(false);
      setAnalyzeProgress5(0);
    }
  };

  const handleDownload5 = async () => {
    if (!videoUrl5 || !videoFile5 || !captions5) return;

    // Simple canvas export: draw video frame + floating words at their positions.
    setExporting5(true);
    setExportProgress5(0);
    try {
      const { exportSpatialWhisper } = await import("./videoExport");
      const outputUrl = await exportSpatialWhisper(
        videoUrl5,
        captions5,
        layoutData5,
        (pct) => setExportProgress5(pct)
      );
      const baseName = videoFile5.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `${baseName}_spatial_whisper.webm`;
      a.click();
      URL.revokeObjectURL(outputUrl);
    } catch (err) {
      console.error("Export failed:", err);
      setError5("Export failed: " + err.message);
    } finally {
      setExporting5(false);
      setExportProgress5(0);
    }
  };

  // ─── Section 7 handlers ────────────────────────────────────────────────────

  const handleVideoChange7 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (lastSelectedUrl7Ref.current) URL.revokeObjectURL(lastSelectedUrl7Ref.current);
      setVideoFile7(file);
      setError7(null);
      setCaptions7(null);
      const url = URL.createObjectURL(file);
      setVideoUrl7(url);
      lastSelectedUrl7Ref.current = url;
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => setVideoDuration7(video.duration);
      video.src = url;
    }
  };

  const handleSubmit7 = async () => {
    if (!videoFile7 || !apiKey) {
      setError7("Please upload a video and enter your API key");
      return;
    }
    setLoading7(true);
    setError7(null);
    setCaptions7(null);
    try {
      const formData = new FormData();
      formData.append("video", videoFile7);
      formData.append("apiKey", apiKey);
      const res = await fetch(API_BASE_URL + "/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const d = await res.json();
        setError7(d.error || "Transcription failed");
        return;
      }
      const words = await res.json();
      if (!words?.length) {
        setError7("No transcription data received.");
        return;
      }
      setCaptions7(words);
    } catch (err) {
      setError7(err.message || "Failed to transcribe video.");
    } finally {
      setLoading7(false);
    }
  };

  const handleDownload7 = async () => {
    if (!videoUrl7 || !videoFile7 || !captions7) return;
    setExporting7(true);
    setExportProgress7(0);
    try {
      const { exportGlowCaptions } = await import("./videoExport");
      const outputUrl = await exportGlowCaptions(
        videoUrl7,
        captions7,
        (pct) => setExportProgress7(pct)
      );
      const baseName = videoFile7.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `${baseName}_glow_impact.webm`;
      a.click();
      URL.revokeObjectURL(outputUrl);
    } catch (err) {
      setError7("Export failed: " + err.message);
    } finally {
      setExporting7(false);
      setExportProgress7(0);
    }
  };

  // ─── Section 6 handlers ────────────────────────────────────────────────────

  const handleVideoChange6 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (lastSelectedUrl6Ref.current) URL.revokeObjectURL(lastSelectedUrl6Ref.current);
      setVideoFile6(file);
      setError6(null);
      setCaptions6(null);
      const url = URL.createObjectURL(file);
      setVideoUrl6(url);
      lastSelectedUrl6Ref.current = url;
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => setVideoDuration6(video.duration);
      video.src = url;
    }
  };

  const handleSubmit6 = async () => {
    if (!videoFile6 || !apiKey) {
      setError6("Please upload a video and enter your API key");
      return;
    }
    setLoading6(true);
    setError6(null);
    setCaptions6(null);
    try {
      const formData = new FormData();
      formData.append("video", videoFile6);
      formData.append("apiKey", apiKey);
      const res = await fetch(API_BASE_URL + "/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        setError6(errorData.error || "Transcription failed");
        return;
      }
      const words = await res.json();
      if (!words || words.length === 0) {
        setError6("No transcription data received.");
        return;
      }
      setCaptions6(words);
    } catch (err) {
      setError6(err.message || "Failed to transcribe video.");
    } finally {
      setLoading6(false);
    }
  };

  const handleDownload6 = async () => {
    if (!videoUrl6 || !videoFile6 || !captions6) return;
    setExporting6(true);
    setExportProgress6(0);
    try {
      const { exportProgressiveQuote } = await import("./videoExport");
      const outputUrl = await exportProgressiveQuote(
        videoUrl6,
        captions6,
        (pct) => setExportProgress6(pct)
      );
      const baseName = videoFile6.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `${baseName}_progressive_quote.webm`;
      a.click();
      URL.revokeObjectURL(outputUrl);
    } catch (err) {
      setError6("Export failed: " + err.message);
    } finally {
      setExporting6(false);
      setExportProgress6(0);
    }
  };

  // ─── Section 8 handlers ────────────────────────────────────────────────────

  const handleVideoChange8 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (lastSelectedUrl8Ref.current) URL.revokeObjectURL(lastSelectedUrl8Ref.current);
      setVideoFile8(file);
      setError8(null);
      setCaptions8(null);
      const url = URL.createObjectURL(file);
      setVideoUrl8(url);
      lastSelectedUrl8Ref.current = url;
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => setVideoDuration8(video.duration);
      video.src = url;
    }
  };

  const handleSubmit8 = async () => {
    if (!videoFile8 || !apiKey) {
      setError8("Please upload a video and enter your API key");
      return;
    }
    setLoading8(true);
    setError8(null);
    setCaptions8(null);
    try {
      const formData = new FormData();
      formData.append("video", videoFile8);
      formData.append("apiKey", apiKey);
      const res = await fetch(API_BASE_URL + "/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const d = await res.json();
        setError8(d.error || "Transcription failed");
        return;
      }
      const words = await res.json();
      if (!words?.length) {
        setError8("No transcription data received.");
        return;
      }
      setCaptions8(words);
    } catch (err) {
      setError8(err.message || "Failed to transcribe video.");
    } finally {
      setLoading8(false);
    }
  };

  const handleDownload8 = async () => {
    if (!videoUrl8 || !videoFile8 || !captions8) return;
    setExporting8(true);
    setExportProgress8(0);
    try {
      const { exportStaircaseImpact } = await import("./videoExport");
      const outputUrl = await exportStaircaseImpact(
        videoUrl8,
        captions8,
        (pct) => setExportProgress8(pct)
      );
      const baseName = videoFile8.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `${baseName}_staircase_impact.webm`;
      a.click();
      URL.revokeObjectURL(outputUrl);
    } catch (err) {
      setError8("Export failed: " + err.message);
    } finally {
      setExporting8(false);
      setExportProgress8(0);
    }
  };

  const handleGenerateForStyle = (styleId) => {
    if (styleId === "simple-readable") {
      handleSubmit();
    } else if (styleId === "bold-highlighted") {
      handleSubmit2();
    } else if (styleId === "editorial-podcast") {
      handleSubmit3();
    } else if (styleId === "word-pop") {
      handleSubmit4();
    } else if (styleId === "spatial-whisper") {
      handleSubmit5();
    } else if (styleId === "progressive-quote") {
      handleSubmit6();
    } else if (styleId === "dynamic-punch") {
      handleSubmit7();
    } else if (styleId === "staircase-impact") {
      handleSubmit8();
    }
  };

  const handleDownload = async () => {
    if (!videoUrl || !videoFile || !captions) return;

    setExporting(true);
    setExportProgress(0);
    try {
      const outputUrl = await exportVideoWithCaptions(
        videoUrl,
        captions,
        (pct) => setExportProgress(pct)
      );
      const baseName = videoFile.name.replace(/\.[^/.]+$/, "");
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `${baseName}_captioned.webm`;
      a.click();
      URL.revokeObjectURL(outputUrl);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed: " + err.message);
    } finally {
      setExporting(false);
      setExportProgress(0);
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

          <div className="input-group">
            <label htmlFor="video-upload">Video File</label>
            <input
              id="video-upload"
              type="file"
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={handleVideoChange}
              disabled={loading}
            />
            {videoFile && <span className="file-name">{videoFile.name}</span>}
            <span className="hint">Supported formats: MP4, MPEG, WEBM</span>
          </div>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
              {errorDetails && (
                <details style={{ marginTop: "10px", fontSize: "0.9em" }}>
                  <summary style={{ cursor: "pointer", color: "#a00" }}>
                    Show technical details
                  </summary>
                  <div style={{ marginTop: "8px", padding: "8px", background: "#fff", borderRadius: "4px", color: "#333" }}>
                    <p><strong>Status Code:</strong> {errorDetails.status}</p>
                    <p><strong>Error Type:</strong> {errorDetails.type}</p>
                    {errorDetails.code && <p><strong>Error Code:</strong> {errorDetails.code}</p>}
                    <p><strong>Original Message:</strong> {errorDetails.originalMessage}</p>
                  </div>
                </details>
              )}
            </div>
          )}

          {loading && (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Transcribing your video with Whisper API...</p>
            </div>
          )}
        </div>

        <div className="style-section">
          <div className="style-section-header">
            <span className="style-badge">1</span>
            <div>
              <h2 className="style-title">Simple and Readable</h2>
              <p className="style-desc">Clean centered captions, subtle outline, natural line breaks</p>
            </div>
          </div>

          <div className="style-actions">
            <button
              onClick={() => handleGenerateForStyle("simple-readable")}
              disabled={!videoFile || !apiKey || loading}
              className="generate-btn style-generate-btn"
            >
              {loading ? "Transcribing..." : "Generate Captions"}
            </button>
          </div>

          {captions && videoUrl ? (
            <>
              <CaptionVideoPlayer
                videoSrc={videoUrl}
                captions={captions}
                durationInFrames={durationInFrames}
              />

              <div className="download-row">
                <button
                  className="download-btn"
                  onClick={handleDownload}
                  disabled={exporting}
                >
                  {exporting
                    ? `Exporting… ${exportProgress}%`
                    : "Download Video with Captions"}
                </button>
              </div>
            </>
          ) : (
            <div className="style-empty">
              Upload a video and generate captions to preview this style.
            </div>
          )}
        </div>

        {/* Section 2: Bold and Highlighted */}
        <div className="style-section">
          <div className="style-section-header">
            <span className="style-badge">2</span>
            <div>
              <h2 className="style-title">Bold and Highlighted</h2>
              <p className="style-desc">Large bold white text with thick black outline — the currently spoken word glows green. Built for horizontal videos.</p>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="video-upload-2">Video File (horizontal)</label>
            <input
              id="video-upload-2"
              type="file"
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={handleVideoChange2}
              disabled={loading2}
            />
            {videoFile2 && <span className="file-name">{videoFile2.name}</span>}
            <span className="hint">Supported formats: MP4, MPEG, WEBM</span>
          </div>

          {error2 && (
            <div className="error-message" style={{ marginBottom: "16px" }}>
              <strong>Error:</strong> {error2}
            </div>
          )}

          {loading2 && (
            <div className="loading-message" style={{ marginBottom: "16px" }}>
              <div className="spinner"></div>
              <p>Transcribing your video with Whisper API...</p>
            </div>
          )}

          <div className="style-actions">
            <button
              onClick={() => handleGenerateForStyle("bold-highlighted")}
              disabled={!videoFile2 || !apiKey || loading2}
              className="generate-btn style-generate-btn"
            >
              {loading2 ? "Transcribing..." : "Generate Captions"}
            </button>
          </div>

          {captions2 && videoUrl2 ? (
            <>
              <CaptionVideoPlayer2
                videoSrc={videoUrl2}
                captions={captions2}
                durationInFrames={Math.ceil(videoDuration2 * 30)}
              />

              <div className="download-row">
                <button
                  className="download-btn"
                  onClick={handleDownload2}
                  disabled={exporting2}
                >
                  {exporting2
                    ? `Exporting… ${exportProgress2}%`
                    : "Download Video with Captions"}
                </button>
              </div>
            </>
          ) : (
            <div className="style-empty">
              Upload a horizontal video and generate captions to preview this style.
            </div>
          )}
        </div>

        {/* Section 3: Editorial Podcast */}
        <div className="style-section">
          <div className="style-section-header">
            <span className="style-badge">3</span>
            <div>
              <h2 className="style-title">Editorial Podcast</h2>
              <p className="style-desc">Elegant serif subtitles with a generated title card — soft, cream-white, premium. Perfect for podcast clips and aesthetic social content.</p>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="video-upload-3">Video File (vertical)</label>
            <input
              id="video-upload-3"
              type="file"
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={handleVideoChange3}
              disabled={loading3}
            />
            {videoFile3 && <span className="file-name">{videoFile3.name}</span>}
            <span className="hint">Supported formats: MP4, MPEG, WEBM</span>
          </div>

          {error3 && (
            <div className="error-message" style={{ marginBottom: "16px" }}>
              <strong>Error:</strong> {error3}
            </div>
          )}

          {loading3 && (
            <div className="loading-message" style={{ marginBottom: "16px" }}>
              <div className="spinner"></div>
              <p>Transcribing and generating title...</p>
            </div>
          )}

          <div className="style-actions">
            <button
              onClick={() => handleGenerateForStyle("editorial-podcast")}
              disabled={!videoFile3 || !apiKey || loading3}
              className="generate-btn style-generate-btn"
            >
              {loading3 ? "Generating..." : "Generate Captions"}
            </button>
          </div>

          {title3 && (
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#888", marginBottom: "8px" }}>
              Generated title: <strong style={{ color: "#555" }}>{title3}</strong>
            </p>
          )}

          {captions3 && videoUrl3 ? (
            <>
              <CaptionVideoPlayer3
                videoSrc={videoUrl3}
                captions={captions3}
                title={title3}
                durationInFrames={Math.ceil(videoDuration3 * 30)}
              />

              <div className="download-row">
                <button
                  className="download-btn"
                  onClick={handleDownload3}
                  disabled={exporting3}
                >
                  {exporting3
                    ? `Exporting… ${exportProgress3}%`
                    : "Download Video with Captions"}
                </button>
              </div>
            </>
          ) : (
            <div className="style-empty">
              Upload a vertical video and generate captions to preview this style.
            </div>
          )}
        </div>

        {/* Section 4: Word Pop */}
        <div className="style-section">
          <div className="style-section-header">
            <span className="style-badge">4</span>
            <div>
              <h2 className="style-title">Motivational Rhythm</h2>
              <p className="style-desc">Preset-driven phrase layout — short phrases shift between top, centre, and lower-third positions, with inline teal accent on power words and stacked-build sequences for rhetorical pacing. Built for vertical videos.</p>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="video-upload-4">Video File (vertical)</label>
            <input
              id="video-upload-4"
              type="file"
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={handleVideoChange4}
              disabled={loading4}
            />
            {videoFile4 && <span className="file-name">{videoFile4.name}</span>}
            <span className="hint">Supported formats: MP4, MPEG, WEBM</span>
          </div>

          {error4 && (
            <div className="error-message" style={{ marginBottom: "16px" }}>
              <strong>Error:</strong> {error4}
            </div>
          )}

          {loading4 && (
            <div className="loading-message" style={{ marginBottom: "16px" }}>
              <div className="spinner"></div>
              <p>Transcribing your video with Whisper API...</p>
            </div>
          )}

          <div className="style-actions">
            <button
              onClick={() => handleGenerateForStyle("word-pop")}
              disabled={!videoFile4 || !apiKey || loading4}
              className="generate-btn style-generate-btn"
            >
              {loading4 ? "Transcribing..." : "Generate Captions"}
            </button>
          </div>

          {captions4 && videoUrl4 ? (
            <>
              <CaptionVideoPlayer4
                videoSrc={videoUrl4}
                transcription={captions4}
                durationInFrames={Math.ceil(videoDuration4 * 30)}
              />

              <div className="download-row">
                <button
                  className="download-btn"
                  onClick={handleDownload4}
                  disabled={exporting4}
                >
                  {exporting4
                    ? `Exporting… ${exportProgress4}%`
                    : "Download Video with Captions"}
                </button>
              </div>
            </>
          ) : (
            <div className="style-empty">
              Upload a vertical video and generate captions to preview this style.
            </div>
          )}
        </div>

        {/* Section 5: Spatial Whisper */}
        <div className="style-section">
          <div className="style-section-header">
            <span className="style-badge">5</span>
            <div>
              <h2 className="style-title">Spatial Whisper</h2>
              <p className="style-desc">
                Words float slowly around the speaker, settling into negative space one by one.
                Airy, cinematic, and minimal — perfect for reflective podcast clips, therapy content,
                and emotional storytelling. Use "Analyze Layout" for AI-guided placement.
              </p>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="video-upload-5">Video File (vertical or horizontal)</label>
            <input
              id="video-upload-5"
              type="file"
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={handleVideoChange5}
              disabled={loading5}
            />
            {videoFile5 && <span className="file-name">{videoFile5.name}</span>}
            <span className="hint">Supported formats: MP4, MPEG, WEBM</span>
          </div>

          {error5 && (
            <div className="error-message" style={{ marginBottom: "16px" }}>
              <strong>Error:</strong> {error5}
            </div>
          )}

          {loading5 && (
            <div className="loading-message" style={{ marginBottom: "16px" }}>
              <div className="spinner"></div>
              <p>Transcribing your video with Whisper API...</p>
            </div>
          )}

          {analyzing5 && (
            <div className="loading-message" style={{ marginBottom: "16px" }}>
              <div className="spinner"></div>
              <p>Analyzing frame composition with AI… {analyzeProgress5 > 0 ? `${analyzeProgress5}%` : ""}</p>
            </div>
          )}

          <div className="style-actions" style={{ gap: "10px", flexWrap: "wrap" }}>
            {/* Step 1 — transcribe */}
            <button
              onClick={() => handleGenerateForStyle("spatial-whisper")}
              disabled={!videoFile5 || !apiKey || loading5 || analyzing5}
              className="generate-btn style-generate-btn"
            >
              {loading5 ? "Transcribing..." : "Generate Captions"}
            </button>

            {/* Step 2 — AI layout analysis (only visible after transcription) */}
            {captions5 && (
              <button
                onClick={handleAnalyzeLayout5}
                disabled={analyzing5 || loading5}
                className="generate-btn style-generate-btn"
                style={{
                  background: layoutData5
                    ? "linear-gradient(135deg,#4a9e8a,#3a7d6c)"
                    : "linear-gradient(135deg,#6b5ce7,#8b6cf7)",
                }}
              >
                {analyzing5
                  ? `Analyzing… ${analyzeProgress5}%`
                  : layoutData5
                  ? "✦ Re-analyze Layout"
                  : "✦ Analyze Layout with AI"}
              </button>
            )}
          </div>

          {layoutData5 && (
            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#6b8", marginBottom: "6px" }}>
              ✦ AI layout applied — words placed around the speaker
            </p>
          )}

          {captions5 && videoUrl5 ? (
            <>
              <CaptionVideoPlayer5
                videoSrc={videoUrl5}
                transcription={captions5}
                layoutData={layoutData5}
                videoAspectRatio={videoAspectRatio5}
                durationInFrames={Math.ceil(videoDuration5 * 30)}
              />

              <div className="download-row">
                <button
                  className="download-btn"
                  onClick={handleDownload5}
                  disabled={exporting5}
                >
                  {exporting5
                    ? `Exporting… ${exportProgress5}%`
                    : "Download Video with Captions"}
                </button>
              </div>
            </>
          ) : (
            <div className="style-empty">
              Upload a video and generate captions to preview this style.
            </div>
          )}
        </div>

        {/* Section 6: Progressive Quote Stack */}
        <div className="style-section">
          <div className="style-section-header">
            <span className="style-badge">6</span>
            <div>
              <h2 className="style-title">Progressive Quote Stack</h2>
              <p className="style-desc">
                Thin golden serif lines build one-by-one into a centered stacked composition.
                Each new line appears beneath the last — all lines stay visible — until the
                complete quote sits perfectly centered in the frame. Elegant, poetic, editorial.
              </p>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="video-upload-6">Video File</label>
            <input
              id="video-upload-6"
              type="file"
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={handleVideoChange6}
              disabled={loading6}
            />
            {videoFile6 && <span className="file-name">{videoFile6.name}</span>}
            <span className="hint">Supported formats: MP4, MPEG, WEBM</span>
          </div>

          {error6 && (
            <div className="error-message" style={{ marginBottom: "16px" }}>
              <strong>Error:</strong> {error6}
            </div>
          )}

          {loading6 && (
            <div className="loading-message" style={{ marginBottom: "16px" }}>
              <div className="spinner"></div>
              <p>Transcribing your video with Whisper API...</p>
            </div>
          )}

          <div className="style-actions">
            <button
              onClick={() => handleGenerateForStyle("progressive-quote")}
              disabled={!videoFile6 || !apiKey || loading6}
              className="generate-btn style-generate-btn"
            >
              {loading6 ? "Transcribing..." : "Generate Captions"}
            </button>
          </div>

          {captions6 && videoUrl6 ? (
            <>
              <CaptionVideoPlayer6
                videoSrc={videoUrl6}
                transcription={captions6}
                durationInFrames={Math.ceil(videoDuration6 * 30)}
              />
              <div className="download-row">
                <button
                  className="download-btn"
                  onClick={handleDownload6}
                  disabled={exporting6}
                >
                  {exporting6
                    ? `Exporting… ${exportProgress6}%`
                    : "Download Video with Captions"}
                </button>
              </div>
            </>
          ) : (
            <div className="style-empty">
              Upload a video and generate captions to preview this style.
            </div>
          )}
        </div>

        {/* Section 7: Dynamic Punch Captions */}
        <div className="style-section">
          <div className="style-section-header">
            <span className="style-badge">7</span>
            <div>
              <h2 className="style-title">Glowing Impact Captions</h2>
              <p className="style-desc">
                A bold 3-phase caption system. Phase 1 builds a glowing white headline near the top — words appear one-by-one, key word glows orange — then fades behind the speaker. Phase 2 switches to simple centered bold white text. Phase 3 returns to the glowing headline style for a punchy finish.
              </p>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="video-upload-7">Video File (vertical)</label>
            <input
              id="video-upload-7"
              type="file"
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={handleVideoChange7}
              disabled={loading7}
            />
            {videoFile7 && <span className="file-name">{videoFile7.name}</span>}
            <span className="hint">Supported formats: MP4, MPEG, WEBM</span>
          </div>

          {error7 && (
            <div className="error-message" style={{ marginBottom: "16px" }}>
              <strong>Error:</strong> {error7}
            </div>
          )}

          {loading7 && (
            <div className="loading-message" style={{ marginBottom: "16px" }}>
              <div className="spinner"></div>
              <p>Transcribing your video with Whisper API...</p>
            </div>
          )}

          <div className="style-actions">
            <button
              onClick={() => handleGenerateForStyle("dynamic-punch")}
              disabled={!videoFile7 || !apiKey || loading7}
              className="generate-btn style-generate-btn"
            >
              {loading7 ? "Transcribing..." : "Generate Captions"}
            </button>
          </div>

          {captions7 && videoUrl7 ? (
            <>
              <CaptionVideoPlayer7
                videoSrc={videoUrl7}
                transcription={captions7}
                durationInFrames={Math.ceil(videoDuration7 * 30)}
              />
              <div className="download-row">
                <button
                  className="download-btn"
                  onClick={handleDownload7}
                  disabled={exporting7}
                >
                  {exporting7
                    ? `Exporting… ${exportProgress7}%`
                    : "Download Video with Captions"}
                </button>
              </div>
            </>
          ) : (
            <div className="style-empty">
              Upload a vertical video and generate captions to preview this style.
            </div>
          )}
        </div>

        {/* Section 8: Staircase Impact */}
        <div className="style-section">
          <div className="style-section-header">
            <span className="style-badge">8</span>
            <div>
              <h2 className="style-title">Staircase Impact</h2>
              <p className="style-desc">
                A bold 3-phase impact system. Phase 1 builds a left-anchored staircase headline word-by-word — final word in yellow with underline. Phase 2 switches to clean centered captions. Phase 3 returns to the staircase for the closing punchline, final word in red.
              </p>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: "16px" }}>
            <label htmlFor="video-upload-8">Video File</label>
            <input
              id="video-upload-8"
              type="file"
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={handleVideoChange8}
              disabled={loading8}
            />
            {videoFile8 && <span className="file-name">{videoFile8.name}</span>}
            <span className="hint">Supported formats: MP4, MPEG, WEBM</span>
          </div>

          {error8 && (
            <div className="error-message" style={{ marginBottom: "16px" }}>
              <strong>Error:</strong> {error8}
            </div>
          )}

          {loading8 && (
            <div className="loading-message" style={{ marginBottom: "16px" }}>
              <div className="spinner"></div>
              <p>Transcribing your video with Whisper API...</p>
            </div>
          )}

          <div className="style-actions">
            <button
              onClick={() => handleGenerateForStyle("staircase-impact")}
              disabled={!videoFile8 || !apiKey || loading8}
              className="generate-btn style-generate-btn"
            >
              {loading8 ? "Transcribing..." : "Generate Captions"}
            </button>
          </div>

          {captions8 && videoUrl8 ? (
            <>
              <CaptionVideoPlayer8
                videoSrc={videoUrl8}
                transcription={captions8}
                durationInFrames={Math.ceil(videoDuration8 * 30)}
              />
              <div className="download-row">
                <button
                  className="download-btn"
                  onClick={handleDownload8}
                  disabled={exporting8}
                >
                  {exporting8
                    ? `Exporting… ${exportProgress8}%`
                    : "Download Video with Captions"}
                </button>
              </div>
            </>
          ) : (
            <div className="style-empty">
              Upload a video and generate captions to preview this style.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
