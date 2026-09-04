import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { demoFor, demoStory } from "./demoStory";
import type { Story, StoryKind, TimelineEvent } from "./types";

const prompts = [
  "OpenAI announces a new consumer device",
  "Nvidia becomes the world's most valuable company",
  "Apple kills the headphone jack",
];
const sections = ["Politics", "Economy", "Technology", "Science", "Culture", "Archive"];
const loadingCopy = [
  "Composing today’s edition",
  "Finding the latest thread",
  "Tracing the story to its origin",
  "Checking the sources",
];

type TrailItem = { query: string; story: Story };

async function fetchStory(query: string, mode: StoryKind, focus?: TimelineEvent): Promise<Story> {
  try {
    const response = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline: query, mode, focus }),
    });
    const data = await response.json();
    if (response.ok) return { ...data, kind: data.kind || mode };
    const fallback = demoFor(query, mode) || (focus ? demoFor(focus.title, mode) : null);
    if (fallback) return fallback;
    throw new Error(data.error || "Research failed");
  } catch (error) {
    const fallback = demoFor(query, mode) || (focus ? demoFor(focus.title, mode) : null);
    if (fallback) return fallback;
    throw error;
  }
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <rect x="9" y="4" width="6" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 11a5 5 0 0 0 10 0M12 16v3.5M9 19.5h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

export default function App() {
  const [headline, setHeadline] = useState("");
  const [story, setStory] = useState<Story | null>(null);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [heard, setHeard] = useState("");
  const timelineRef = useRef<HTMLElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const mastheadDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).toUpperCase(),
    [],
  );

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 1250);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  useEffect(() => () => {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function showStory(next: Story, query: string) {
    setHeadline(query);
    setStory(next);
    setAudioUrl("");
    setTimeout(() => timelineRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function investigate(e?: FormEvent, selected = headline) {
    e?.preventDefault();
    const query = selected.trim();
    if (!query) return;
    setHeadline(query);
    setLoading(true);
    setStep(0);
    setError("");
    setStory(null);
    setTrail([]);
    setAudioUrl("");
    try {
      showStory(await fetchStory(query, "overview"), query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function drill(event: TimelineEvent) {
    if (!story || loading) return;
    const previous = { query: headline, story };
    setLoading(true);
    setStep(0);
    setError("");
    setAudioUrl("");
    try {
      const next = await fetchStory(event.title, "lineage", event);
      setTrail((current) => [...current, previous]);
      showStory(next, event.title);
    } catch (err) {
      setStory(previous.story);
      setError(err instanceof Error ? err.message : "Could not trace this event.");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    const previous = trail[trail.length - 1];
    if (!previous) return;
    setTrail((current) => current.slice(0, -1));
    setError("");
    showStory(previous.story, previous.query);
  }

  function loadDemo() {
    setTrail([]);
    setError("");
    showStory(demoStory, demoStory.headline);
  }

  async function narrate() {
    if (!story) return;
    setAudioLoading(true);
    setError("");
    try {
      const response = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: story.narrationScript }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Narration failed");
      }
      const blob = await response.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Narration failed.");
    } finally {
      setAudioLoading(false);
    }
  }

  function pickMime() {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    return types.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) || "";
  }

  function stopVoice() {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function finishVoice(mimeType: string) {
    setVoiceState("transcribing");
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
      if (blob.size < 800) throw new Error("Didn't catch that. Try speaking a little longer.");
      const response = await fetch("/api/voice-search", {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/webm" },
        body: blob,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Voice search failed");
      const topic = String(data.topic || "").trim();
      const transcript = String(data.transcript || "").trim();
      setHeard(
        transcript && topic && transcript.toLowerCase() !== topic.toLowerCase()
          ? `Heard “${transcript}” → ${topic}`
          : `Searching ${topic || transcript}`,
      );
      if (!topic) throw new Error("Couldn't find a topic in that. Try “ChatGPT 6”.");
      setVoiceState("idle");
      await investigate(undefined, topic);
    } catch (err) {
      setVoiceState("idle");
      setError(err instanceof Error ? err.message : "Voice search failed.");
    }
  }

  async function startVoice() {
    setError("");
    setHeard("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mime = pickMime();
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      void finishVoice(recorder.mimeType);
    };
    recorderRef.current = recorder;
    recorder.start();
    setVoiceState("recording");
    stopTimerRef.current = window.setTimeout(() => stopVoice(), 8000);
  }

  function toggleVoice() {
    if (loading || voiceState === "transcribing") return;
    if (voiceState === "recording") {
      stopVoice();
      return;
    }
    startVoice().catch((err) => {
      const denied = err instanceof Error && /notallowed|permission|denied/i.test(`${err.name} ${err.message}`);
      setError(
        denied
          ? "Microphone permission is needed for voice search."
          : err instanceof Error
            ? err.message
            : "Could not start the microphone.",
      );
    });
  }

  const kind = story?.kind || "lineage";

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-top">
          <div>
            <span>{mastheadDate}</span>
            <span className="dot">·</span>
            <span>TODAY’S PAPER</span>
          </div>
          <div className="editions">
            <span className="on">U.S.</span>
            <span>INTERNATIONAL</span>
            <span>CANADA</span>
            <span>ESPAÑOL</span>
          </div>
          <div className="live"><i /> LIVE</div>
        </div>
        <a className="brand" href="#top">REVERSE NEWS</a>
        <p className="motto">EVERY HEADLINE HAS A BEFORE</p>
        <nav className="sections" aria-label="Sections">
          {sections.map((section) => (
            <span key={section} className={section === "Technology" ? "on" : undefined}>{section}</span>
          ))}
        </nav>
      </header>

      <section className="hero" id="top">
        <h1>Understand the full <em>timeline here.</em></h1>
        <form className="search" onSubmit={(event) => investigate(event)}>
          <div className="search-box">
            <SearchIcon />
            <button
              type="button"
              className={`mic${voiceState === "recording" ? " recording" : ""}`}
              onClick={toggleVoice}
              disabled={loading || voiceState === "transcribing"}
              aria-label="Search by voice"
            >
              <MicIcon />
              <span>{voiceState === "recording" ? "STOP" : voiceState === "transcribing" ? "…" : "MIC"}</span>
            </button>
            <input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter a headline, topic, or article URL..."
              autoComplete="off"
            />
            <button className="go" disabled={loading || !headline.trim() || voiceState !== "idle"}>
              {loading ? "TRACING" : "TRACE"}
            </button>
          </div>
          {heard && <p className="heard">{heard}</p>}
        </form>
        <div className="threads">
          <span>TRY A THREAD</span>
          <div>
            {prompts.map((prompt) => (
              <button key={prompt} onClick={(e) => investigate(e, prompt)}>{prompt}</button>
            ))}
          </div>
        </div>
        <button className="demo-link" onClick={loadDemo}>Open the guaranteed demo story</button>
      </section>

      {loading && (
        <section className="loading">
          <p>{loadingCopy[step]}…</p>
          <div className="track"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        </section>
      )}
      {error && (
        <div className="error">
          {error} <button onClick={loadDemo}>Open demo instead</button>
        </div>
      )}
      {story && !loading && (
        <section className="story" ref={timelineRef}>
          {trail.length > 0 && (
            <button className="trail" onClick={goBack}>← Back to {trail[trail.length - 1].story.headline}</button>
          )}
          <header>
            <div>
              <span className="kicker">{kind === "overview" ? "Latest first" : "How this happened"}</span>
              <h2>{story.headline}</h2>
              <p>{story.dek}</p>
            </div>
            <aside>
              <span className={`mode ${story.mode}`}>{story.mode === "live" ? "Live research" : "Demo story"}</span>
              {kind === "lineage" && !audioUrl && (
                <button className="narrate" onClick={narrate} disabled={audioLoading}>
                  {audioLoading ? "Generating…" : "Play the story"}
                </button>
              )}
              {audioUrl && <audio src={audioUrl} controls autoPlay />}
            </aside>
          </header>
          <div className="timeline">
            {story.events.map((item, index) => (
              <article className="event" key={item.date + item.title}>
                <div className="number">{String(index + 1).padStart(2, "0")}</div>
                <div className="rule"><span /></div>
                <div className="card">
                  <time>{kind === "overview" && index === 0 ? "Latest · " : ""}{item.date}</time>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {kind === "lineage" && (
                    <div className="because because-lg">
                      <b>Because</b>
                      <p>{item.becauseSummary || item.causalLink}</p>
                    </div>
                  )}
                  {kind === "overview" && (
                    <div className="because">
                      <b>{index === 0 ? "Most recent" : "This thread"}</b> {item.causalLink}
                    </div>
                  )}
                  <div className="card-actions">
                    <a className="evidence" href={item.sourceUrl} target="_blank" rel="noreferrer">
                      Read the article · {item.sourceName}
                    </a>
                    {kind === "overview" && (
                      <button className="trace" onClick={() => drill(item)}>
                        See how we got here
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="origin">
            <span>{kind === "overview" ? "Open a story" : "The origin"}</span>
            <p>{kind === "overview" ? "The latest event first. Other histories underneath." : "History doesn’t repeat. It accumulates."}</p>
          </div>
        </section>
      )}

      <footer className="colophon">
        <span>EVERY HEADLINE HAS A BEFORE</span>
        <span>REVERSE NEWS · MMXXVI</span>
      </footer>
    </div>
  );
}
