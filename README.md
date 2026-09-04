# Reverse News

**Every headline has a history.**

Reverse News turns a current headline into an interactive journey backward through causality. Instead of another summary, it asks **“How did we get here?”** and builds a concise, evidence-backed timeline from today’s event to the developments that helped make it possible.

- **Linkup** finds and structures the supporting evidence.
- **Lovable-compatible React UI** presents it as a cinematic reverse timeline.
- **ElevenLabs** narrates it like a short documentary.

This is intentionally scoped as a four-hour hackathon MVP: one headline input, four or five sourced events, and one narration control. A guaranteed demo story works before API keys are configured.

## Start the app

You need Node.js 18 or newer.

```bash
git clone <repository-url>
cd reversenews
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The web app and local API server start together.

The demo story works immediately. For live features, open `.env` and add:

```dotenv
LINKUP_API_KEY=your_linkup_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

Restart `npm run dev` after changing `.env`. Never commit that file or put either key in frontend code.

## Useful commands

```bash
npm run dev       # Start frontend and API in watch mode
npm run build     # Type-check and build the frontend
npm run preview   # Preview the production frontend build
npm run dev:web   # Start only Vite
npm run dev:api   # Start only the API server
```

Check API configuration at [http://localhost:8787/api/health](http://localhost:8787/api/health).

## Project structure

```text
src/                 React interface and guaranteed demo story
server/index.js       Server-side Linkup and ElevenLabs API proxy
.env.example          Environment variable template
REVERSE_NEWS_PRD.txt  Product requirements and team plan
```

## API behavior

- `POST /api/research` accepts `{ "headline": "..." }` and returns a newest-to-oldest Linkup timeline.
- `POST /api/narrate` accepts `{ "text": "..." }` and returns ElevenLabs MP3 audio.
- `GET /api/health` shows which integrations are configured without revealing secrets.

## Hackathon principle

The output is an **evidence-backed interpretation**, not a claim that historical causality can always be proven. Weak links should be omitted rather than invented.
