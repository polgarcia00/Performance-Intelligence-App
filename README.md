# My Performance Journal

My Performance Journal is a personal workout journal that imports Zepp workouts and lets the athlete add sport-specific context for performance analysis.

Zepp owns health data and objective workout recording. Performance Journal owns workout import, enrichment, reflection, and performance analysis. The app does not store or display sleep, activity, generic heart-rate, recovery, readiness, or health-context dashboards.

Performance Intelligence is the analysis engine inside the app. The product itself should feel like a searchable training diary, not another fitness tracker.

## Core Workflow

1. Import Zepp workouts.
2. Review imported workouts.
3. Enrich workouts with sport-specific context.
4. Analyze performance from objective data plus journal meaning.
5. Reflect through weekly reviews.
6. Build a searchable history of athletic development.

Manual workout entry is a fallback/debug tool for workouts missing from Zepp, not the primary workflow.

## Development

```sh
cd App
npm install
npm run dev
npm run type-check
npm run test:unit
npm run test:e2e
npm run build
```

Backend PostgreSQL integration tests require a separate test database configured with `TEST_DATABASE_URL`; see `App/server/README.md`.

## Known Limitations

- PostgreSQL integration tests require a locally available PostgreSQL server and a separate `TEST_DATABASE_URL`.
- Fallback manual workout entry is intentionally secondary and temporary; durable workout history should come from imported Zepp workout data.
