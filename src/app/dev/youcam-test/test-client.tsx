/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import type {
  YouCamFeature,
  SkinAnalysisAction,
  YouCamUploadResult,
  YouCamTaskResult,
  YouCamErrorBody,
} from "@/lib/youcam";

const AVAILABLE_ACTIONS: SkinAnalysisAction[] = [
  "wrinkle",
  "droopy_upper_eyelid",
  "droopy_lower_eyelid",
  "firmness",
  "acne",
  "moisture",
  "eye_bag",
  "dark_circle_v2",
  "age_spot",
  "radiance",
  "redness",
  "oiliness",
  "pore",
  "texture",
  "tear_trough",
  "skin_type",
];

interface LogEntry {
  id: string;
  time: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
  data?: unknown;
}

export default function YouCamTestClient() {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [feature, setFeature] = useState<YouCamFeature>("skin-analysis");
  const [uploadResult, setUploadResult] = useState<YouCamUploadResult | null>(null);

  // Task State
  const [selectedActions, setSelectedActions] = useState<SkinAnalysisAction[]>([
    "acne",
    "wrinkle",
    "texture",
    "redness",
  ]);
  const [lipstickColor, setLipstickColor] = useState<string>("#D62828");
  const [lipstickTexture, setLipstickTexture] = useState<string>("matte");
  const [taskId, setTaskId] = useState<string>("");
  const [taskResult, setTaskResult] = useState<YouCamTaskResult | null>(null);

  // Execution & Polling State
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [globalError, setGlobalError] = useState<YouCamErrorBody | string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  function addLog(level: LogEntry["level"], message: string, data?: unknown) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      level,
      message,
      data,
    };
    setLogs((prev) => [entry, ...prev]);
  }

  // Handle File selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadResult(null);
      setTaskId("");
      setTaskResult(null);
      setGlobalError(null);
      addLog("info", `Selected local file: ${file.name} (${(file.size / 1024).toFixed(1)} KB, ${file.type})`);
    }
  }

  // Upload to YouCam File API
  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    setGlobalError(null);
    addLog("info", `Uploading ${selectedFile.name} for feature '${feature}'...`);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("feature", feature);

      const res = await fetch("/api/youcam/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        const err = json.error ?? { code: "unknown", message: `HTTP ${res.status}` };
        setGlobalError(err);
        addLog("error", `Upload failed: ${err.message || JSON.stringify(err)}`, json);
        return;
      }

      setUploadResult(json);
      addLog("success", `Image registered & uploaded. File ID: ${json.fileId}`, json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGlobalError(msg);
      addLog("error", `Upload exception: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  }

  // Create AI Task
  async function handleCreateTask() {
    const currentFileId = uploadResult?.fileId;
    if (!currentFileId) {
      setGlobalError("Please upload an image first to obtain a file ID.");
      return;
    }

    setIsCreatingTask(true);
    setGlobalError(null);
    setTaskResult(null);
    setTaskId("");

    try {
      if (feature === "skin-analysis") {
        addLog("info", `Creating skin-analysis task with ${selectedActions.length} actions...`, {
          actions: selectedActions,
          fileId: currentFileId,
        });

        const res = await fetch("/api/youcam/skin-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: currentFileId,
            actions: selectedActions,
          }),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          const err = json.error ?? { code: "unknown", message: `HTTP ${res.status}` };
          setGlobalError(err);
          addLog("error", `Task creation failed: ${err.message}`, json);
          return;
        }

        setTaskId(json.taskId);
        addLog("success", `Skin analysis task created: ${json.taskId}`, json);
        // Automatically start polling
        startPolling(json.taskId, "skin-analysis");
      } else {
        // makeup-vto
        const effects = [
          {
            category: "lip_color",
            palettes: [
              {
                color: lipstickColor,
                texture: lipstickTexture,
                colorIntensity: 80,
              },
            ],
          },
        ];

        addLog("info", `Creating makeup-vto task...`, { effects, fileId: currentFileId });

        const res = await fetch("/api/youcam/try-on", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: currentFileId,
            effects,
          }),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          const err = json.error ?? { code: "unknown", message: `HTTP ${res.status}` };
          setGlobalError(err);
          addLog("error", `Task creation failed: ${err.message}`, json);
          return;
        }

        setTaskId(json.taskId);
        addLog("success", `Try-on task created: ${json.taskId}`, json);
        // Automatically start polling
        startPolling(json.taskId, "makeup-vto");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGlobalError(msg);
      addLog("error", `Create task exception: ${msg}`);
    } finally {
      setIsCreatingTask(false);
    }
  }

  // Poll Task Status
  async function pollSingle(tid: string, feat: YouCamFeature): Promise<YouCamTaskResult | null> {
    try {
      const res = await fetch(`/api/youcam/task/${encodeURIComponent(tid)}?feature=${feat}`);
      const json = await res.json();

      if (!res.ok || json.error) {
        const err = json.error ?? { code: "unknown", message: `HTTP ${res.status}` };
        setGlobalError(err);
        addLog("error", `Task query failed: ${err.message}`, json);
        return null;
      }

      setTaskResult(json);
      return json as YouCamTaskResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog("error", `Poll request error: ${msg}`);
      return null;
    }
  }

  function startPolling(targetTaskId: string, feat: YouCamFeature) {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setIsPolling(true);
    setPollCount(0);
    let attempts = 0;

    addLog("info", `Starting task polling for ${targetTaskId}...`);

    const interval = setInterval(async () => {
      attempts++;
      setPollCount(attempts);

      const result = await pollSingle(targetTaskId, feat);
      if (!result) {
        stopPolling();
        return;
      }

      if (result.status === "success") {
        addLog("success", `Task completed successfully!`, result);
        stopPolling();
      } else if (result.status === "error") {
        addLog("error", `Task failed: ${result.error?.message ?? "Unknown error"}`, result);
        stopPolling();
      } else {
        addLog("info", `Poll attempt #${attempts}: Task is still running...`);
      }

      // Safeguard max attempts (e.g. 60 attempts * 1.5s = 90s)
      if (attempts >= 60) {
        addLog("warn", `Polling timed out after ${attempts} attempts.`);
        stopPolling();
      }
    }, 1500);

    pollIntervalRef.current = interval;
  }

  function stopPolling() {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function toggleAction(action: SkinAnalysisAction) {
    setSelectedActions((prev) => {
      if (prev.includes(action)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((a) => a !== action);
      } else {
        if (prev.length >= 7) return prev; // max 7
        return [...prev, action];
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Interactive Controls */}
      <div className="lg:col-span-7 space-y-6">
        {/* Step 1: Feature & File Upload */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-xs font-bold">1</span>
              Upload Image to YouCam File API
            </h2>
            <span className="text-xs text-slate-400">POST /s2s/v2.0/file/{feature}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Target Feature</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFeature("skin-analysis");
                    setUploadResult(null);
                  }}
                  className={`px-4 py-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                    feature === "skin-analysis"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50"
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold text-sm">Skin Analysis</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Diagnose skin concerns & metrics</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeature("makeup-vto");
                    setUploadResult(null);
                  }}
                  className={`px-4 py-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                    feature === "makeup-vto"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50"
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold text-sm">Makeup Try-On (VTO)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Virtual makeup simulation</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Test Portrait Image (JPEG/PNG)</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer bg-slate-950/60 border border-slate-800 rounded-lg p-1.5"
              />
            </div>

            {previewUrl && (
              <div className="flex items-center gap-4 p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-slate-700" />
                <div className="text-xs text-slate-300 space-y-0.5 flex-1 min-w-0">
                  <p className="font-medium truncate text-white">{selectedFile?.name}</p>
                  <p className="text-slate-400">Size: {((selectedFile?.size ?? 0) / 1024).toFixed(1)} KB</p>
                  <p className="text-slate-400">Type: {selectedFile?.type}</p>
                </div>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-sm transition-all"
                >
                  {isUploading ? "Uploading..." : "Upload to YouCam"}
                </button>
              </div>
            )}

            {uploadResult && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>✓ Upload Registered Successfully</span>
                  <span className="font-mono text-[10px] uppercase bg-emerald-500/20 px-2 py-0.5 rounded">{uploadResult.feature}</span>
                </div>
                <div className="font-mono text-slate-300 text-[11px] truncate">
                  <span className="text-slate-500">File ID:</span> {uploadResult.fileId}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Step 2: Create AI Task */}
        <section className={`bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 transition-opacity ${!uploadResult ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-xs font-bold">2</span>
              Create AI Task
            </h2>
            <span className="text-xs text-slate-400">
              POST /s2s/v2.0/task/{feature}
            </span>
          </div>

          {feature === "skin-analysis" ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300">
                    Select Skin Actions ({selectedActions.length} selected, max 7)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedActions(["acne", "wrinkle", "texture", "redness"])}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Reset Defaults
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_ACTIONS.map((action) => {
                    const isSelected = selectedActions.includes(action);
                    return (
                      <button
                        key={action}
                        type="button"
                        onClick={() => toggleAction(action)}
                        className={`px-2.5 py-1.5 rounded text-xs border text-left font-mono transition-all ${
                          isSelected
                            ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {isSelected ? "☑ " : "☐ "} {action}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateTask}
                disabled={isCreatingTask || isPolling || !uploadResult}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isCreatingTask ? "Creating Skin Task..." : "Run Skin Analysis Task & Poll"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Lipstick Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={lipstickColor}
                      onChange={(e) => setLipstickColor(e.target.value)}
                      className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={lipstickColor}
                      onChange={(e) => setLipstickColor(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Texture</label>
                  <select
                    value={lipstickTexture}
                    onChange={(e) => setLipstickTexture(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="matte">Matte</option>
                    <option value="glossy">Glossy</option>
                    <option value="shimmer">Shimmer</option>
                    <option value="satin">Satin</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateTask}
                disabled={isCreatingTask || isPolling || !uploadResult}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isCreatingTask ? "Creating Try-On Task..." : "Run Virtual Try-On Task & Poll"}
              </button>
            </div>
          )}

          {taskId && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Task ID:</span>
                <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {taskId}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                <span className="text-slate-400">Status:</span>
                <div className="flex items-center gap-2">
                  {isPolling && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                  <span
                    className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                      taskResult?.status === "success"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : taskResult?.status === "error"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {taskResult?.status ?? (isPolling ? "Polling..." : "Created")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {isPolling ? (
                  <button
                    type="button"
                    onClick={stopPolling}
                    className="w-full py-1.5 bg-rose-900/40 border border-rose-700/50 hover:bg-rose-900/60 text-rose-200 text-xs rounded transition-all"
                  >
                    Stop Polling (Attempt #{pollCount})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startPolling(taskId, feature)}
                    className="w-full py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs rounded transition-all"
                  >
                    Poll Again
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Global Error Banner */}
        {globalError && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2 text-xs text-rose-200">
            <div className="flex items-center gap-2 font-semibold text-rose-400">
              <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>API Error Encountered</span>
            </div>
            <pre className="font-mono text-[11px] bg-black/40 p-2.5 rounded overflow-x-auto text-rose-300">
              {typeof globalError === "string" ? globalError : JSON.stringify(globalError, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Right Column: Normalized Results & Diagnostics */}
      <div className="lg:col-span-5 space-y-6">
        {/* Normalized Task Results Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">Normalized Result Display</h2>
            {taskResult && (
              <span className="text-xs font-mono text-slate-400 uppercase">
                {taskResult.status}
              </span>
            )}
          </div>

          {!taskResult && (
            <div className="py-12 text-center text-xs text-slate-500">
              Results will appear here once an AI task has completed.
            </div>
          )}

          {taskResult?.status === "success" && taskResult.skinAnalysis && (
            <div className="space-y-4">
              <div className="text-xs text-emerald-400 font-medium">
                ✓ Extracted {taskResult.skinAnalysis.metrics.length} Skin Metrics
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {taskResult.skinAnalysis.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                        {metric.type.replace(/_/g, " ")}
                      </span>
                      {metric.score !== undefined && (
                        <span className="font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 font-bold">
                          Score: {metric.score}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      {metric.uiScore !== undefined && (
                        <div>UI Score: <span className="text-slate-200 font-mono">{metric.uiScore}</span></div>
                      )}
                      {metric.rawScore !== undefined && (
                        <div>Raw Score: <span className="text-slate-200 font-mono">{metric.rawScore}</span></div>
                      )}
                      {metric.region && (
                        <div>Region: <span className="text-slate-200 font-mono">{metric.region}</span></div>
                      )}
                      <div>Masks: <span className="text-slate-200 font-mono">{metric.maskUrls.length}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {taskResult?.status === "success" && taskResult.tryOn && (
            <div className="space-y-3">
              <div className="text-xs text-emerald-400 font-medium">
                ✓ Virtual Try-On Rendered
              </div>
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={taskResult.tryOn.imageUrl}
                  alt="Try-on Result"
                  className="w-full max-h-80 object-contain"
                />
              </div>
              <a
                href={taskResult.tryOn.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs text-indigo-400 hover:underline"
              >
                Open image directly (valid 2h) ↗
              </a>
            </div>
          )}

          {taskResult?.status === "error" && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg text-xs text-rose-300 space-y-1">
              <p className="font-semibold">Task Failed Upstream</p>
              <p className="text-slate-300">{taskResult.error?.message}</p>
              {taskResult.error?.upstreamCode && (
                <p className="text-slate-400 font-mono text-[10px]">
                  Code: {taskResult.error.upstreamCode}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Live Diagnostics Log */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Diagnostic Logs ({logs.length})
            </h3>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          <div className="h-64 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-slate-600">No events yet</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded border ${
                    log.level === "success"
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                      : log.level === "error"
                      ? "bg-rose-950/20 border-rose-500/20 text-rose-300"
                      : log.level === "warn"
                      ? "bg-amber-950/20 border-amber-500/20 text-amber-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{log.time}</span>
                    <span className="uppercase">{log.level}</span>
                  </div>
                  <div className="mt-0.5 text-slate-200">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
