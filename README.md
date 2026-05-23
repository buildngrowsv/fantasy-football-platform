# Gridiron Dynasty

**Fantasy Football platform** — draft smarter, manage leagues, win your season.

Gridiron Dynasty is a modern fantasy football command center for commissioners and competitive managers. Run live drafts, configure scoring, manage waivers, and track standings in one polished web app.

## Features

- **Live Draft Rooms** — Snake and auction drafts with pick timers and roster slots
- **Scoring Presets** — Standard, Half-PPR, and Full PPR with industry-standard point values
- **League Management** — Create leagues, invite managers, configure roster rules
- **Manager Dashboard** — Weekly matchups, lineups, and league activity (coming soon)
- **Mobile-First UI** — Large tap targets and responsive layouts for gameday lineup changes

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)

## Getting Started

### Prerequisites

- Node.js 20+ (22 LTS recommended)
- npm 10+

### Install

```bash
git clone https://github.com/buildngrowsv/fantasy-football-platform.git
cd fantasy-football-platform
npm install
```

### Development

The dev server runs on port **4782** (non-default to avoid local conflicts):

```bash
npm run dev
```

Open [http://localhost:4782](http://localhost:4782).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Marketing landing page
│   ├── dashboard/          # Manager dashboard
│   ├── leagues/            # League list & creation
│   └── draft/              # Live draft room preview
├── components/             # UI components (one concern per file)
├── domain/                 # Types, enums, scoring rules
└── lib/constants/          # App-wide constants
```

## Roadmap

- [ ] User authentication (email + OAuth)
- [ ] League CRUD with database persistence
- [ ] Real-time draft via WebSockets
- [ ] NFL player data integration (Sleeper / ESPN APIs)
- [ ] Waiver wire and trade workflows
- [ ] Weekly scoring and standings
- [ ] Playoff bracket generation

## Scoring

Default scoring follows widely used non-PPR baselines:

| Stat | Points |
|------|--------|
| Passing TD | 4 |
| Passing yards | 1 per 25 |
| Interception | -2 |
| Rushing/Receiving TD | 6 |
| Rushing/Receiving yards | 1 per 10 |
| Reception (PPR) | 1 |
| Reception (Half-PPR) | 0.5 |
| Fumble lost | -2 |

See `src/domain/scoring/` for the full rule definitions.

## License

MIT

## Contributing

Contributions welcome! Please open an issue before large changes so we can align on architecture.
