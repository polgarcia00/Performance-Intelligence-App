# My Performance Journal

My Performance Journal is an athletic diary that extends Zepp.

Zepp remains the source of objective workout and health data. This app adds the context Zepp cannot know: why the workout happened, what was trained, how it felt, what the athlete learned, and how those lessons show up in long-term performance.

Performance Intelligence is the engine that powers analysis inside the app. The app itself should feel like a searchable training diary, not another fitness tracker.

The product direction is documented in:

[../docs/functional-design.md](../docs/functional-design.md)

## Core Workflow

1. Import Zepp workouts.
2. Review imported workouts.
3. Enrich workouts with sport-specific context.
4. Analyze performance from objective data plus journal meaning.
5. Reflect through weekly reviews.
6. Build a searchable history of athletic development.

Manual workout entry is a fallback/debug tool for workouts missing from Zepp, not the primary workflow.

## Product Boundary

Zepp owns health and objective workout recording. Performance Journal owns workout import, enrichment, reflection, and performance analysis. The app does not store or display sleep, activity, generic heart-rate, recovery, readiness, or health-context dashboards.

## Development

```sh
npm install
npm run dev
npm run type-check
npm run test:unit
npm run test:e2e
npm run build
```

Backend PostgreSQL integration tests require a separate test database configured with `TEST_DATABASE_URL`; see `server/README.md`.

## Known Limitations

- PostgreSQL integration tests require a locally available PostgreSQL server and a separate `TEST_DATABASE_URL`.
- Fallback manual workout entry is intentionally secondary and temporary; durable workout history should come from imported Zepp workout data.
