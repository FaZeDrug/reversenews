import { FormEvent, useEffect, useRef, useState } from "react";
import { demoFor, demoStory } from "./demoStory";
import type { Story, StoryKind, TimelineEvent } from "./types";

const prompts = ["ChatGPT", "OpenAI Codex", "Apple Vision Pro"];
const loadingCopy = [
  "Investigating today’s headline",
  "Finding distinct storylines",
  "Tracing the story to its origin",
  "Verifying every source",
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

export default function App() {
  const [headline, setHeadline] = useState("");
  const [story, setStory] = useState<Story | null>(null);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const timelineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 1250);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function showStory(next: Story, query: string) {
    setHeadline(query);
    setStory(next);
    setAudioUrl("");
    setTimeout(() => timelineRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function investigate(e: FormEvent, selected = headline) {
    e.preventDefault();
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

  const kind = story?.kind || "lineage";

  return (
    <main>
      <nav className="nav">
        <a className="wordmark" href="#top"><span>R</span> REVERSE NEWS</a>
        <small>EVIDENCE-BACKED CONTEXT</small>
      </nav>
      <section className="hero" id="top">
        <div className="eyebrow"><i /> THE STORY BEFORE THE STORY</div>
        <h1>Every headline<br />has a <em>history.</em></h1>
        <p>Enter a topic like ChatGPT. The latest event comes first. Open it to see the articles that led there.</p>
        <form className="search" onSubmit={investigate}>
          <label htmlFor="headline">TODAY’S HEADLINE OR TOPIC</label>
          <div>
            <input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. ChatGPT" autoComplete="off" />
            <button disabled={loading || !headline.trim()}>{loading ? "TRACING…" : "TRACE IT BACK"} <b>↘</b></button>
          </div>
        </form>
        <div className="examples">
          <span>TRY A TOPIC</span>
          {prompts.map((prompt) => (
            <button key={prompt} onClick={(e) => investigate(e, prompt)}>{prompt}</button>
          ))}
        </div>
        <button className="demo-link" onClick={loadDemo}>Or open the guaranteed demo story →</button>
      </section>
      {loading && (
        <section className="loading">
          <div className="radar"><span /></div>
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
              <span className="kicker">{kind === "overview" ? "LATEST FIRST" : "HOW THIS HAPPENED"}</span>
              <h2>{story.headline}</h2>
              <p>{story.dek}</p>
            </div>
            <aside>
              <span className={`mode ${story.mode}`}>{story.mode === "live" ? "● LIVE RESEARCH" : "DEMO STORY"}</span>
              {kind === "lineage" && !audioUrl && (
                <button className="narrate" onClick={narrate} disabled={audioLoading}>
                  {audioLoading ? "GENERATING…" : "▶  PLAY THE STORY"}
                </button>
              )}
              {audioUrl && <audio src={audioUrl} controls autoPlay />}
            </aside>
          </header>
          <div className="timeline">
            {story.events.map((item, index) => (
              <article className="event" key={item.date + item.title}>
                <div className="number">{String(index + 1).padStart(2, "0")}</div>
                <div className="dot"><span /></div>
                <div className="card">
                  <time>{kind === "overview" && index === 0 ? "LATEST · " : ""}{item.date}</time>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {kind === "lineage" && (
                    <div className="because because-lg">
                      <b>BECAUSE</b>
                      <p>{item.becauseSummary || item.causalLink}</p>
                    </div>
                  )}
                  {kind === "overview" && (
                    <div className="because">
                      <b>{index === 0 ? "MOST RECENT" : "THIS THREAD"}</b> {item.causalLink}
                    </div>
                  )}
                  <div className="card-actions">
                    <a className="evidence" href={item.sourceUrl} target="_blank" rel="noreferrer">
                      Read the article · {item.sourceName} ↗
                    </a>
                    {kind === "overview" && (
                      <button className="trace" onClick={() => drill(item)}>
                        See how we got here ↘
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <footer>
            <span>{kind === "overview" ? "OPEN A STORY" : "THE ORIGIN"}</span>
            <p>{kind === "overview" ? "The latest event first. Other histories underneath." : "History doesn’t repeat. It accumulates."}</p>
          </footer>
        </section>
      )}
    </main>
  );
}
