# Rollcall

**AI-Powered Photo → Song & Caption Recommender**

Upload a photo (or carousel of photos / a video) and Rollcall analyzes its visual vibe, then returns ranked, currently-relevant song recommendations from Spotify and LLM-generated captions scored by predicted engagement.

---

## ✨ What it does

1. **Vision Extraction** — GPT-4o reads the scene, lighting, dominant colors, activity, and time of day
2. **Vibe Classification** — Classifies into a mood category (chill / energetic / dark / aesthetic…) with an energy score 1–5
3. **Spotify Matching** — Maps the vibe to Spotify audio features (valence, energy, danceability) and fetches real tracks using Euclidean distance scoring
4. **Caption Generation** — GPT-4o-mini generates 6–8 caption candidates for the scene
5. **Caption Ranking** — Ranks captions by predicted engagement, filters clichés
6. **Feedback Loop** — Thumbs-up / thumbs-down is saved per anonymous session to enable future personalization
7. **Trending Now** — Live Spotify Top 50 and Viral 50 playlist views

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Vanilla CSS |
| Animation | Framer Motion |
| Database | PostgreSQL via Prisma ORM |
| AI | OpenAI GPT-4o (vision), GPT-4o-mini (captions) |
| Music API | Spotify Web API |
| Auth | Anonymous sessions via HTTP-only cookies |

---

## 🚀 Local Setup

### 1. Clone & install
```bash
git clone https://github.com/sakshar2303/Rollcall.git
cd Rollcall
npm install
```

### 2. Create `.env`
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/rollcall"
OPENAI_API_KEY="sk-..."
SPOTIFY_CLIENT_ID="your_spotify_client_id"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
```

> **Database options:** [Neon](https://neon.tech) (free), [Supabase](https://supabase.com) (free), [Prisma Postgres](https://pris.ly/postgres), or local Docker.

### 3. Push schema & generate client
```bash
npx prisma db push
npx prisma generate
```

### 4. Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
app/
  api/
    upload/       ← Main AI pipeline endpoint
    feedback/     ← Thumbs-up/down persistence
  trending/       ← Spotify Top 50 / Viral 50 page
  page.tsx        ← Hero + upload zone
components/
  UploadZone.tsx  ← Drag-and-drop, multi-photo, video frame extraction
  NavHeader.tsx   ← Sticky glassmorphism navigation
  CopyButton.tsx  ← Clipboard copy with optimistic state
lib/
  vision.ts       ← OpenAI GPT-4o vision wrapper
  jevai.ts        ← Vibe classification + caption ranking
  matching.ts     ← Spotify audio feature distance scoring
  captions.ts     ← Caption generation + ranking pipeline
  session.ts      ← Anonymous session persistence (cookies)
  prisma.ts       ← Prisma client singleton
prisma/
  schema.prisma   ← Database schema
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `OPENAI_API_KEY` | ✅ | For vision extraction and caption generation |
| `SPOTIFY_CLIENT_ID` | ✅ | Spotify app Client ID |
| `SPOTIFY_CLIENT_SECRET` | ✅ | Spotify app Client Secret |

---

## 📄 License

MIT
