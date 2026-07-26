# ALJ UI

A minimal Next.js (App Router) chat app that talks to Claude with the ALJ
Connect MCP server attached. News, people, project, and event results are
**always** rendered as visual cards — never as plain text.

## How it works

- `app/page.js` — single-page chat UI: a text input, a submit button, and a
  scrollable message list.
- `app/api/chat/route.js` — server route that calls the Claude Messages API
  (via the `@anthropic-ai/sdk`) with the ALJ Connect MCP server attached, and
  returns the raw response as JSON.
- `lib/parseResponse.js` — deterministically parses the Claude response:
  `mcp_tool_result` blocks are JSON-parsed and normalized into an array of
  results, and any result with a `display` field is guaranteed to render as
  a card. `text` blocks are collected separately and shown only as narration
  alongside the cards, never as a replacement for them.
- `components/ArticleCard.js` — the card component (and grid/skeleton
  variants) used to render every card-eligible result.

## Setup

### 1. Set your Anthropic API key

Add your key to `.env.local` in the project root (already gitignored):

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Install dependencies and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try asking:

> What are the latest news articles on ALJ?

You should see a short text reply from Claude followed by a grid of article
cards — never a wall of plain text.

## Deploying to Vercel

1. Push this repository to GitHub (or another Git provider Vercel supports).
2. In the [Vercel dashboard](https://vercel.com/new), import the repository.
3. Vercel auto-detects the Next.js framework — no build settings need to
   change.
4. Add an environment variable in the Vercel project settings:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key
5. Deploy. Every subsequent push to the connected branch redeploys
   automatically.

You can also deploy from the CLI:

```bash
npm install -g vercel
vercel
```

Follow the prompts, then set `ANTHROPIC_API_KEY` with:

```bash
vercel env add ANTHROPIC_API_KEY
```
