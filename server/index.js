import "dotenv/config";
import cors from "cors";
import express from "express";
import { extractTopic } from "./topic.js";

const app = express();
const port = Number(process.env.PORT || 8787);
const MAX_EVENTS = 5;
const MIN_EVENTS = 4;
const LINKUP_URL = "https://api.linkup.so/v1/search";

app.use(cors());
app.use(express.json({ limit: "64kb" }));

const MONTHS = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
  oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

const timelineSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    dek: { type: "string", description: "One sentence framing the reverse chronology" },
    events: {
      type: "array",
      minItems: 3,
      maxItems: MAX_EVENTS,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: "string", description: "Exact or month-year date of this development" },
          title: { type: "string", description: "Short name of the impactful update" },
          description: { type: "string", description: "What happened, under 40 words" },
          causalLink: {
            type: "string",
            description: "A short because headline, under 16 words.",
          },
          becauseSummary: {
            type: "string",
            description: "2 to 4 sentences, about 40 to 90 words, explaining how this earlier development helped make the newer one possible. Careful causal language only.",
          },
          sourceName: { type: "string" },
          sourceUrl: { type: "string", description: "URL of a real article that supports this event" },
        },
        required: ["date", "title", "description", "causalLink", "becauseSummary", "sourceName", "sourceUrl"],
      },
    },
    narrationScript: {
      type: "string",
      description: "A 45–75 second documentary script walking newest to oldest",
    },
  },
  required: ["headline", "dek", "events", "narrationScript"],
};

function overviewQuery(topic) {
  return `Research this topic: "${topic}".

Return 3 to 5 current story options, ordered with the single most recent major development FIRST.

The first event MUST be the latest dated headline in this umbrella topic — the thing that happened most recently. Give it an exact date if possible.

Then add other DISTINCT current storylines, not older versions of that first event. For ChatGPT, after the latest model/release, other options could be Codex, voice, custom GPTs, or enterprise.

Rules:
- First card = most recent event in the whole topic. This is mandatory.
- Do not put an older story first even if it is interesting.
- Do not list ChatGPT-5, ChatGPT-4, and ChatGPT-3 as separate options. Previous versions belong in the history after the user clicks the latest event.
- Every option needs a real source URL.
- causalLink: short "why open this" line.
- becauseSummary: 2-4 sentences on why this storyline matters now.
- Keep descriptions under 40 words.`;
}

function lineageQuery(topic, focus) {
  const focusBlock = focus
    ? `The reader chose this development as the starting point:
Title: ${focus.title}
Date: ${focus.date || "unknown"}
Description: ${focus.description || ""}
Source: ${focus.sourceUrl || ""}`
    : `The reader chose this development as the starting point: "${topic}".`;

  return `${focusBlock}

Return 4 or 5 earlier developments that led to that chosen event, ordered newest to oldest.

These cards ARE the history. Do not repeat the chosen event as a card.

Rules:
- Do NOT include the chosen development itself.
- The first card is the immediate predecessor — the previous version, launch, or decision that most directly helped make the chosen event possible.
- Then keep walking backward along THIS same storyline only.
- If this is a ChatGPT model release, cover previous model versions and what changed from one to the next.
- If this is Codex, cover the Codex / Copilot / software-writing lineage, not consumer ChatGPT versions unless they directly caused this event.
- For every event, write becauseSummary as 2 to 4 sentences (40–90 words) explaining how it helped set the stage for the newer development above it. Use careful phrases such as "helped set the stage"; never invent direct causation.
- causalLink is a short label for that relationship, under 16 words.
- Every event needs a real source URL.
- Keep descriptions under 40 words.`;
}

async function linkupSearch(body) {
  const response = await fetch(LINKUP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LINKUP_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Linkup request failed (${response.status})`);
  }
  return data;
}

function canonicalUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return url;
  }
}

function sourceNameFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".")[0];
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return "Source";
  }
}

function eventTime(event) {
  const raw = String(event?.date || "");
  if (/today|this week/i.test(raw)) return Date.now();
  const iso = raw.match(/(20\d{2})-(\d{2})-(\d{2})/);
  if (iso) return Date.parse(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00Z`);
  const yearMatch = raw.match(/(20\d{2})/);
  if (!yearMatch) return 0;
  const monthMatch = raw.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i);
  const dayMatch = raw.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  const year = Number(yearMatch[1]);
  const month = monthMatch ? MONTHS[monthMatch[0].toLowerCase().slice(0, 3)] ?? 0 : 0;
  const day = dayMatch && Number(dayMatch[1]) >= 1 && Number(dayMatch[1]) <= 31 ? Number(dayMatch[1]) : 1;
  return Date.UTC(year, month, day);
}

function firstSentence(text, maxWords = 28) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentence = cleaned.split(/(?<=[.!?])\s+/)[0] || cleaned;
  const words = sentence.split(" ");
  if (words.length <= maxWords) return sentence;
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function uniqueByUrl(events) {
  const used = new Set();
  return events.filter((event) => {
    const url = String(event.sourceUrl || event.url || "").trim();
    if (!url || !/^https?:\/\//i.test(url)) return false;
    const key = canonicalUrl(url);
    if (used.has(key)) return false;
    used.add(key);
    return true;
  });
}

function newestFirst(events) {
  return [...events].sort((a, b) => eventTime(b) - eventTime(a) || 0);
}

function dropFocusEvent(events, focus) {
  if (!focus?.title) return events;
  const wanted = String(focus.title || "").toLowerCase();
  return events.filter((event) => {
    const title = String(event.title || "").toLowerCase();
    if (title && wanted && (title === wanted || title.includes(wanted) || wanted.includes(title))) return false;
    if (focus.sourceUrl && event.sourceUrl && canonicalUrl(event.sourceUrl) === canonicalUrl(focus.sourceUrl)) return false;
    return true;
  });
}

function unwrapStory(payload) {
  const story = payload?.output || payload;
  return story?.data || story;
}

function normalizeEvents(events, { sortNewest = true } = {}) {
  const mapped = uniqueByUrl(events).map((event) => ({
    date: String(event.date || "").toUpperCase(),
    title: event.title || event.name || "Untitled",
    description: event.description || firstSentence(event.content, 40),
    causalLink: event.causalLink || "This earlier development helped set the stage for what followed.",
    becauseSummary: event.becauseSummary || event.causalLink || firstSentence(event.content, 80),
    sourceName: event.sourceName || sourceNameFromUrl(event.sourceUrl || event.url),
    sourceUrl: event.sourceUrl || event.url,
  }));
  return (sortNewest ? newestFirst(mapped) : mapped).slice(0, MAX_EVENTS);
}

function buildStory(topic, events, extras = {}) {
  const kind = extras.kind || "lineage";
  return {
    headline: extras.headline || topic,
    dek:
      extras.dek ||
      (kind === "overview"
        ? `Pick a storyline inside ${topic}. Each one has a different history.`
        : `How ${topic} got here, newest to oldest.`),
    events,
    narrationScript:
      extras.narrationScript ||
      [
        kind === "overview" ? `${topic} is more than one story.` : `Today's story starts with ${events[0].title}.`,
        kind === "overview" ? "Pick a thread and walk it backward." : "That headline did not appear from nowhere.",
        ...events.slice(kind === "overview" ? 0 : 1).map((event) => `${event.date}: ${event.title}.`),
      ].join(" "),
    mode: "live",
    kind,
  };
}

async function structuredTimeline(topic, { mode, focus }) {
  const minEvents = 3;
  const payload = await linkupSearch({
    q: mode === "overview" ? overviewQuery(topic) : lineageQuery(topic, focus),
    depth: "standard",
    outputType: "structured",
    structuredOutputSchema: JSON.stringify(timelineSchema),
    includeSources: true,
  });
  const story = unwrapStory(payload);
  if (!Array.isArray(story?.events)) {
    throw new Error("Linkup returned an unexpected response shape");
  }
  const events = mode === "lineage"
    ? dropFocusEvent(normalizeEvents(story.events), focus)
    : normalizeEvents(story.events, { sortNewest: false });
  if (events.length < minEvents) {
    throw new Error("Linkup did not return enough sourced updates");
  }
  return buildStory(topic, events, { ...story, kind: mode });
}

async function fallbackTimeline(topic, { mode, focus }) {
  const minEvents = 3;
  const query =
    mode === "overview"
      ? `What is the most recent major news development about ${topic}? Then name a few other distinct current storylines. Put the most recent dated headline first.`
      : `What earlier developments led to ${focus?.title || topic}? Do not repeat that event. Stay on this same product lineage and include previous versions or earlier products that helped make it possible.`;
  const payload = await linkupSearch({
    q: query,
    depth: "standard",
    outputType: "searchResults",
    maxResults: 10,
  });
  const results = (payload?.results || []).filter((item) => item && item.type !== "image" && item.url);
  let events = normalizeEvents(
    results.map((item) => ({
      date: item.date || "",
      title: item.name,
      description: item.content,
      sourceUrl: item.url,
      sourceName: sourceNameFromUrl(item.url),
    })),
    { sortNewest: mode === "lineage" },
  );
  if (mode === "lineage") events = dropFocusEvent(events, focus);
  if (events.length < minEvents) {
    throw new Error(
      `Only found ${events.length} sourced update${events.length === 1 ? "" : "s"}. Try a more documented topic.`,
    );
  }
  return buildStory(topic, events, { kind: mode });
}

function audioFilename(mime) {
  if (String(mime).includes("mp4") || String(mime).includes("m4a")) return "speech.m4a";
  if (String(mime).includes("mpeg") || String(mime).includes("mp3")) return "speech.mp3";
  if (String(mime).includes("wav")) return "speech.wav";
  if (String(mime).includes("ogg")) return "speech.ogg";
  return "speech.webm";
}

async function transcribeSpeech(buffer, mime) {
  const models = ["scribe_v2", "scribe_v1"];
  let lastError = new Error("ElevenLabs transcription failed");
  for (const model of models) {
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mime || "audio/webm" }), audioFilename(mime));
    form.append("model_id", model);
    form.append("language_code", "eng");
    const api = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
      body: form,
    });
    const data = await api.json().catch(() => ({}));
    if (api.ok && data.text) return String(data.text).trim();
    lastError = new Error(data?.detail?.message || data?.message || `ElevenLabs transcription failed (${api.status})`);
  }
  throw lastError;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    linkup: Boolean(process.env.LINKUP_API_KEY),
    elevenLabs: Boolean(process.env.ELEVENLABS_API_KEY),
    voiceSearch: Boolean(process.env.ELEVENLABS_API_KEY),
  });
});

app.post("/api/research", async (req, res) => {
  const topic = String(req.body?.headline || req.body?.topic || "").trim();
  const mode = req.body?.mode === "lineage" ? "lineage" : "overview";
  const focus = req.body?.focus && typeof req.body.focus === "object" ? req.body.focus : null;
  if (!topic || topic.length > 240) {
    return res.status(400).json({ error: "Enter a headline under 240 characters." });
  }
  if (!process.env.LINKUP_API_KEY) {
    return res.status(503).json({ error: "Live research needs LINKUP_API_KEY in .env. The demo story is ready now." });
  }

  try {
    try {
      res.json(await structuredTimeline(topic, { mode, focus }));
    } catch (structuredError) {
      console.error("Structured impact search failed, using article fallback:", structuredError);
      res.json(await fallbackTimeline(topic, { mode, focus }));
    }
  } catch (error) {
    console.error("Linkup error:", error);
    res.status(502).json({ error: error instanceof Error ? error.message : "Unable to research this headline." });
  }
});

function maybeRawAudio(req, res, next) {
  if (String(req.headers["content-type"] || "").includes("application/json")) return next();
  return express.raw({ type: () => true, limit: "8mb" })(req, res, next);
}

app.post("/api/voice-search", maybeRawAudio, async (req, res) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(503).json({ error: "Voice search needs ELEVENLABS_API_KEY in .env." });
  }

  const jsonBody = req.body && !Buffer.isBuffer(req.body) ? req.body : null;
  if (jsonBody && typeof jsonBody.transcript === "string") {
    const transcript = jsonBody.transcript.trim();
    if (!transcript) return res.status(400).json({ error: "Nothing to search." });
    return res.json({ transcript, topic: extractTopic(transcript) });
  }

  const audio = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
  if (audio.length < 64) {
    return res.status(400).json({ error: "That recording was too short. Try again." });
  }

  try {
    const transcript = await transcribeSpeech(audio, req.headers["content-type"] || "audio/webm");
    const topic = extractTopic(transcript);
    if (!topic) return res.status(422).json({ error: "Couldn't find a topic in that. Try naming the subject.", transcript });
    res.json({ transcript, topic });
  } catch (error) {
    console.error("Voice search error:", error);
    res.status(502).json({ error: error instanceof Error ? error.message : "Unable to transcribe that." });
  }
});

app.post("/api/narrate", async (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text || text.length > 5000) {
    return res.status(400).json({ error: "Narration must be between 1 and 5,000 characters." });
  }
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(503).json({ error: "Narration needs ELEVENLABS_API_KEY in .env." });
  }
  const voice = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";

  try {
    const api = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_flash_v2_5",
          voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.25 },
        }),
      },
    );
    if (!api.ok) {
      const detail = await api.text();
      throw new Error(`ElevenLabs request failed (${api.status}): ${detail.slice(0, 160)}`);
    }
    res.type("audio/mpeg");
    res.send(Buffer.from(await api.arrayBuffer()));
  } catch (error) {
    console.error("ElevenLabs error:", error);
    res.status(502).json({ error: error instanceof Error ? error.message : "Unable to generate narration." });
  }
});

export default app;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Reverse News API listening on http://localhost:${port}`);
  });
}
