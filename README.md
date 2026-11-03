# Stylemyth

Stylemyth is an AI fashion atelier and discovery platform for independent labels. Upload a clothing reference, describe a campaign direction, and create an editorial image around the garment.

## Getting started

Requirements: Node.js 18.18 or newer and npm.

```sh
npm install
cp .env.example .env
# Add your server-side OpenAI API key to .env
npm run dev
```

The Vite development server includes the image-generation API route. Without an API key, the rest of the site still works and the atelier explains how to enable generation.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run start:api` | Run the standalone image API on port 3001 |

## Project structure

```text
src/
  components/       Shared navigation, marketplace, and atelier components
  data/              Marketplace and form data
  App.jsx            Landing page sections and application-level state
  main.jsx           React application entry point
  styles.css         Global styles and responsive layout
server/
  imageGeneration.js Image edit API, upload validation, and request limits
  index.js           Standalone API server for production hosting
public/assets/       Local hero artwork
index.html          Document metadata and Vite mount point
vite.config.js      Vite and React plugin configuration
```

## Image generation

The atelier accepts up to two PNG, JPG, or WebP garment photos (5 MB per image) and a creative brief. The server sends the images to OpenAI’s image edits endpoint; API keys stay on the server and generated images are returned to the browser without being saved. Configure `OPENAI_API_KEY` in `.env` before using generation. Image requests use a paid API and include basic in-memory request limits.

For a deployed build, host the frontend and API separately or configure the web host to route `/api/*` to `npm run start:api`. Add durable rate limits, authentication, monitoring, and a storage policy before opening image generation to public traffic.

## Current business prototype boundaries

- Marketplace inventory in `src/data/marketplace.js` is sample data.
- Retailer applications validate in the browser but are not submitted or stored.
- Product links and account features need business destinations and backend support.

The AI atelier hero image is local in `public/assets/hero-ai-atelier.png`. Marketplace imagery and fonts are loaded from Unsplash and Google Fonts; replace them with licensed project assets before production use.
