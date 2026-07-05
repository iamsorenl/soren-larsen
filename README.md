# Soren Larsen Portfolio

Welcome to my portfolio repository! This is a modern, responsive personal website built to showcase my skills, projects, and professional experiences as an AI & Full-Stack Engineer. The portfolio features a typographic, palette-driven design with dark/light theme support and data-driven content management.

## 🚀 Live Demo

- **Primary URL**: [https://soren-larsen.web.app](https://soren-larsen.web.app)
- **Custom Domain**: [https://www.larsensoren.com](https://www.larsensoren.com)

## 🛠️ Technologies Used

- **React.js**: Modern JavaScript library for building user interfaces
- **Material-UI (MUI)**: Comprehensive React component library with theming support
- **Firebase Hosting**: Static site hosting and deployment
- **Cloudflare Workers**: Edge-deployed serverless backend for the chat widget
- **Groq (Llama 3.3 70B)**: Free-tier open-source LLM powering "Soren's Assistant"
- **Cloudflare KV**: Per-IP and global rate limiting for the chat endpoint
- **React Context API**: State management for theme switching
- **CSS3**: Advanced styling with gradients, animations, and responsive design

## ✨ Key Features

### 🎨 **Modern Design & UX**

- **Dark/Light Theme Toggle**: Seamless theme switching with persistent user preference
- **Responsive Design**: Optimized for all screen sizes (mobile, tablet, desktop)
- **Editorial Typography**: Fraunces serif for display headlines (hero name, section h2s), Inter for body, JetBrains Mono for eyebrow labels
- **Unified Accent Palette**: A single 5-color palette (indigo, cyan, coral, gold, sage) is resolved per-mode into the MUI theme as `theme.palette.accents` / `theme.palette.sectionAccents` (raw values in `src/themeAccents.js`), so every section accent and per-entry color reads from one source and components never branch on light/dark themselves
- **Frosted-Glass Navigation**: Theme-aware translucent AppBar with backdrop-blur, primary-color underline on the active section
- **Smooth Animations**: Smooth scroll-to-section nav, hero photo carousel cross-fade, chat-FAB section-transition wiggle

### 📱 **Components**

- **Hero**: Two-column typographic intro — name in Fraunces, role line, tagline, CTA row (Resume / Contact / GitHub), photo carousel on the right (stacks on mobile)
- **Shared `SectionHeader`**: Every content card uses the same `<SectionHeader eyebrow title icon accent />` pattern for visual coherence
- **Hybrid card treatment**: Each section sits on `background.paper` with a divider border; per-entry color rotation through the unified palette
- **Interactive Cards**: Expandable Experience / Projects rows, Education accordions with diploma links, collapsible Skills categories
- **Photo Carousel**: 11-image cross-fade in the Hero with clickable dot indicators (focus-visible keyboard support)
- **Contact Form**: Mailto-backed form alongside a direct-contact panel
- **Skill Visualization**: Per-category chips sorted by proficiency level; Expert chips render bolder with a soft accent ring; hover any chip for the proficiency label
- **Footer**: Centered byline + GitHub / LinkedIn / Email icon links on a quiet divider-bordered band

### 📊 **Data-Driven Architecture**

- **JSON-Based Content**: All content managed through structured JSON files
- **Centralized Data Management**: Easy content updates without code changes
- **Scalable Structure**: Modular design for easy expansion and maintenance

### 🤖 **Soren's Assistant Chat Widget**

- **Floating chat bubble** bottom-right on every page; mobile-friendly bottom sheet with scrim; FAB hides when the panel is open
- **Grounded in the JSON content** — entry-level retrieval picks only the relevant `experience`, `projects`, `skills`, etc. for each question
- **GitHub README tool** — when a visitor asks for deeper detail about a project than the JSON summary covers, the model invokes a `fetch_repo_readme` tool that pulls the repo's README from GitHub, section-scores it against the question, and answers from the real source. The tool is allowlisted to the repos linked in `projects.json`; successful reads are cached in Cloudflare KV for 24h and failures get a short negative-cache marker.
- **Streaming responses** from Groq's Llama 3.3 70B with auto-summarization once chat history grows past a token budget; animated dots placeholder bridges the wait before the first token arrives
- **Recruiter-focused guardrails** — facts only, redirects opinions/logistics to the contact section, never invents experience; resume links are shared directly (autolinkified to a downloadable PDF)
- **Distinct rate-limit messages** — visitors hitting their own per-IP cap, the Groq per-minute cap, or the daily-token cap each see a specific inline explanation rather than a generic upstream error
- **Ephemeral sessions** — conversations are mirrored to `sessionStorage` (survives accidental refresh) and cleared on tab close; a trash-icon "clear chat" button in the panel header wipes state on demand

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── chat/             # "Soren's Assistant" chat widget (ChatWidget, ChatPanel, etc.)
│   ├── Hero.js           # Two-column hero: name + role + tagline + CTAs + photo carousel
│   ├── AboutCard.js      # Slim editorial pull-quote (the bio paragraphs the hero doesn't cover)
│   ├── ExperienceCard.js
│   ├── ProjectCard.js
│   ├── SkillCard.js
│   ├── EducationCard.js
│   ├── ContactCard.js
│   ├── SectionHeader.js  # Shared eyebrow + Fraunces h2 + accent-tinted icon
│   ├── Copyright.js      # Bottom-of-page footer with social icon links
│   ├── Navigation.js
│   ├── CardLayout.js     # Lazy-loads section cards in order
│   ├── Body.js           # Page-level grid (Hero → About → CardLayout → Footer)
│   ├── ErrorBoundary.js  # Also wraps each lazy section so one bad chunk can't blank the page
│   └── GlowMark.js       # HDR brand marks
├── contexts/             # React Context providers
│   └── ThemeContext.js
├── data/                 # JSON data files (PDFs live in public/, not here)
│   ├── about.json
│   ├── contact.json
│   ├── education.json
│   ├── experience.json   # Each entry carries its own highlightColor
│   ├── highlights.json
│   ├── projects.json
│   └── skills.json       # Each skill has { name, level, proficiency }
├── images/               # Static assets (hero carousel photos, optimized to ≤~250KB each)
├── utils/
│   └── dates.js          # Shared month-parsing used by Project + Experience cards
├── themeAccents.js       # Raw accent palette + per-section colors (folded into the theme)
└── theme.js              # MUI theme (palette + accents, typography, MuiCard/MuiButton overrides)

worker/                   # Cloudflare Worker backend for the chat widget
├── src/
│   ├── index.js          # Router for /api/chat and /api/summarize
│   ├── chat.js           # Chat handler: validation + single streaming Groq call w/ tool-use
│   ├── summarize.js      # JSON summarize handler (same message validation)
│   ├── groq.js           # Groq streaming client (tool support, timeouts, stream-error surfacing)
│   ├── systemPrompt.js   # Entry-level RAG + token estimation
│   ├── tools.js          # Tool specs + dispatcher (fetch_repo_readme, allowlisted to own repos)
│   ├── github.js         # GitHub README fetch (403 → auth vs rate-limit)
│   ├── readmeExtract.js  # Markdown section-scored extraction
│   ├── readmeCache.js    # 24h KV cache (+ short-TTL negative cache for failures)
│   ├── rateLimit.js      # KV-backed per-IP + global rate limits
│   ├── cors.js           # CORS helpers
│   └── constants.js      # Token/cache/validation limits
├── test/                 # Vitest unit + scenario tests (143 tests)
├── scripts/sync-data.mjs # Copies src/data/*.json → worker/src/data/
├── wrangler.jsonc        # Worker config + KV bindings (RATE_LIMIT, README_CACHE)
└── README.md             # Worker setup + deploy guide
```

## 🎯 Portfolio Sections

### **Hero**

- Name in Fraunces serif, role line ("AI & Full-Stack Engineer • Founding Engineer @ Levangie Laboratories"), tagline pulled from `about.json`
- Three CTAs: Resume (anchor download), Contact (smooth-scroll to contact section), GitHub
- 11-image cross-fading photo carousel on the right at desktop widths, stacked below the text on mobile, with clickable + focus-visible dot indicators
- Subtle indigo-tinted gradient background that's the page's single colored block

### **About**

- Two-paragraph editorial pull-quote with a left accent bar (the prose that the hero tagline doesn't cover)
- Closing sentence italicized in `text.secondary` for a sign-off feel
- Sourced from `about.json`; paragraph 1 is intentionally skipped because it duplicates the hero tagline

### **Experience**

- JetBrains Mono "EXPERIENCE" eyebrow + Fraunces "Where I've worked" h2 with cyan accent
- Per-employer left-border accent colors pulled from the unified palette (`theme.palette.accents`)
- Expandable detailed descriptions with location, skills chips, external company link

### **Projects**

- "Projects" eyebrow + "What I've built" h2 with coral accent
- Per-entry palette-rotated left-border accents
- Compact row with title + dates + top tools, expand for full description + GitHub link

### **Skills**

- "Technical Skills" eyebrow + "What I work with" h2 with gold accent
- Six categories: Languages, AI / LLM Systems, Frameworks, Data & Infra, ML / NLP Research, Developer Workflows
- Each category gets its own palette accent; collapsible card with a colored left border
- Chips sorted by `level` descending; Expert chips render bolder with a soft accent ring; hover for the proficiency label

### **Education**

- "Education" eyebrow + "Where I studied" h2 with sage accent
- Per-entry palette colors (indigo / coral / gold rotation)
- Expandable accordions for description + relevant coursework
- Diploma PDF buttons when available

### **Contact**

- "Contact" eyebrow + "Get in touch" h2 with indigo accent
- Direct panel: Phone / Email / GitHub / LinkedIn, each as a real anchor with its own palette accent
- Send-a-Message panel: form with mailto submission

### **Footer**

- Centered byline + GitHub / LinkedIn / Email icon links
- Divider-top border, no colored band (sits flush against the page background)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your username>/soren-larsen.git
   cd soren-larsen
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the portfolio

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run lint`: Runs ESLint on `src/`
- `npm run format`: Runs Prettier on `src/`
- `npm run storybook`: Opens the component playground at `http://localhost:6006`
- `npm run build-storybook`: Builds a static Storybook to `storybook-static/`
- `npm run predeploy`: Runs lint and build (used by `deploy`)
- `npm run deploy`: Deploys to Firebase Hosting

## 🧪 Component Playground (Storybook)

Storybook is used to develop and iterate on components in isolation with demo data. Ideal for designing new components without reloading the whole app.

### Running locally

```bash
npm run storybook
```

This opens `http://localhost:6006` with a sidebar of all stories. The toolbar has a sun/moon toggle to preview components in light and dark themes.

### Project conventions

- **Stories live in** `src/stories/` and follow the naming pattern `ComponentName.stories.jsx`.
- **Shared demo data** lives in `src/stories/mockData.js` — import from here rather than inlining mock objects.
- **Every story file** should use a named default export (`const meta = {...}; export default meta;`) to satisfy the `import/no-anonymous-default-export` ESLint rule.
- **Theme wiring** is global — stories automatically render inside the MUI `ThemeProvider`.

### Adding a new story

1. Create `src/stories/MyComponent.stories.jsx`:

   ```jsx
   import React from 'react';
   import MyComponent from '../components/MyComponent';
   import { mockProject } from './mockData';

   const meta = {
       title: 'MyComponent',
       component: MyComponent
   };

   export default meta;

   export const Default = { args: { project: mockProject } };
   ```

2. Run `npm run storybook` — your story appears in the sidebar.

3. If your component imports data directly from `src/data/`, refactor it to accept props (with a default fall-through to the imported data so the live site still works) so stories can pass mock fixtures.

## 📝 Content Management

### Updating Content

All portfolio content is managed through JSON files in the `src/data/` directory:

- **Personal Info**: Edit `about.json` and `highlights.json`
- **Work Experience**: Update `experience.json` (includes per-employer `highlightColor`)
- **Projects**: Modify `projects.json`
- **Skills**: Update `skills.json` — each skill has `name`, `level` (0–100), and `proficiency` ("Expert" / "Advanced" / "Intermediate" / "Familiar"). The card sorts chips by `level` descending and surfaces Expert with bolder weight + accent ring.
- **Education**: Edit `education.json`
- **Contact Info**: Modify `contact.json`

### Adding New Experience

When adding new work experience, include the `highlightColor` property:

```json
{
  "company": "Company Name",
  "title": "Job Title",
  "highlightColor": {
    "light": "#colorcode",
    "dark": "#colorcode"
  }
}
```

## 🎨 Theming

The portfolio supports comprehensive theming with:

- **Light Mode**: Near-white surfaces, indigo accents, the hero on a soft indigo wash
- **Dark Mode**: `#0a0e27` page background with darker indigo surfaces; same palette adjusted for contrast
- **Unified accent palette** (`src/themeAccents.js`, resolved into `theme.palette.accents` / `theme.palette.sectionAccents`): indigo / cyan / coral / gold / sage, each with light and dark variants. Each section maps to a signature color; entry rotations pull from the same palette. Components read the already-resolved color from the theme rather than branching on the current mode.
- **Persistent Theme**: User preference saved in localStorage; respects system preference on first visit
- **Smooth Transitions**: Animated theme switching

## 🚀 Deployment

### Firebase Hosting

The portfolio is deployed using Firebase Hosting:

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Firebase Console

- **Project Console**: [Firebase Console](https://console.firebase.google.com/u/0/project/soren-larsen/hosting/sites)

### Chat Widget Backend (Cloudflare Worker)

The chat widget on the site is powered by a separate Cloudflare Worker that proxies Groq completions, holds the Groq API key (and an optional GitHub PAT) as secrets, and rate-limits per-IP and globally via Cloudflare KV. See `worker/README.md` for full setup. Quick reference:

```bash
cd worker
npx wrangler login                              # one-time
npx wrangler kv namespace create RATE_LIMIT     # one-time; paste id into wrangler.jsonc
npx wrangler kv namespace create README_CACHE   # one-time; paste id into wrangler.jsonc
npx wrangler secret put GROQ_API_KEY            # paste key from console.groq.com
npx wrangler secret put GITHUB_TOKEN            # fine-grained PAT, ≤366d lifetime,
                                                # "Public Repositories (read-only)"
npm run deploy                                   # deploys to *.workers.dev
```

The `GITHUB_TOKEN` secret enables the `fetch_repo_readme` tool the chat uses for deeper project answers; lifetime must be ≤366 days to satisfy the strictest org policies among the linked repos.

The React build reads the Worker URL from `REACT_APP_CHAT_WORKER_URL`. Locally, leave it unset to use the `http://localhost:8787` dev fallback; for production set it via `.env.production.local` or the `CHAT_WORKER_URL` GitHub Actions secret (consumed by `.github/workflows/deploy.yml`).

### CI & Content-Security-Policy

- **CI** — `.github/workflows/ci.yml` runs frontend lint/test/build **and** the worker's Vitest suite on every PR; `deploy.yml` gates the Firebase deploy on the worker tests passing. (The worker itself is still deployed manually via `cd worker && npm run deploy` — no Cloudflare token is stored in CI.)
- **CSP** — `firebase.json` serves a Content-Security-Policy. Because it uses `script-src 'self'`, the committed root `.env` sets `INLINE_RUNTIME_CHUNK=false` so CRA emits the webpack runtime as an external file instead of an inline `<script>`. If you add a third-party origin (analytics, fonts, an image host), widen the matching CSP directive in `firebase.json` or the resource will be blocked.

> The hero/carousel photos in `src/images/` are optimized (longest edge ≤1200px, ≤~250KB each) — keep new additions in that range so the bundle stays light.

## 🔧 Technical Highlights

- **Performance Optimized**: Lazy loading and code splitting
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Cross-Browser Compatible**: Tested across major browsers
- **Mobile-First Design**: Progressive enhancement approach

## 📞 Contact

Feel free to reach out for collaborations or inquiries:

- **Email**: [iamsorenl@gmail.com](mailto:iamsorenl@gmail.com)
- **LinkedIn**: [Soren Larsen](https://www.linkedin.com/in/soren-larsen)
- **GitHub**: [iamsorenl](https://github.com/iamsorenl)

---

_Built by Soren Larsen_
