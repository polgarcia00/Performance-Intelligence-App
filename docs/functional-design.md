# My Performance Journal Functional Design

My Performance Journal is a personal workout journal that imports Zepp workouts and lets the athlete add sport-specific context for performance analysis.

It is not a Zepp replacement and not a health dashboard. Zepp owns sleep, activity, heart rate, calories, workout recording, recovery, readiness, and BioCharge-style signals. Performance Journal owns imported workouts, journal enrichment, performance analysis, weekly reflection, and personal records.

## Primary Workflow

1. Import Zepp workouts.
2. Review imported workouts in the Workout Inbox.
3. Enrich workouts with sport-specific journal details.
4. Analyze running, strength, and basketball performance.
5. Review weekly progress.
6. Build a searchable history of athletic development.

## Main Screens

- Dashboard: answers what happened, what needs attention, what was learned, and how progress is trending.
- Workout Inbox: lists imported workouts that need enrichment.
- Workout Details: keeps read-only Zepp objective data separate from editable journal context.
- Performance: explores running, strength, basketball, records, and trends from backend analysis.
- Weekly Review: presents coaching-style reflections from imported workouts and journal context.
- Settings / Data Import: imports SPORT.csv or Zepp ZIPs containing SPORT.csv, shows preview/history, and exposes fallback tools.

## Data Boundaries

Objective Zepp data is read-only in the journal flow. Journal edits never overwrite imported duration, distance, calories, pace, heart-rate fields, source sport code, source fingerprint, or import batch references.

Manual workout entry remains only as a fallback/debug tool for workouts missing from Zepp. It is secondary to the import workflow.

## Product Principles

- Zepp records what happened.
- Performance Journal records what it meant.
- Objective data and journal data remain separate.
- The athlete should spend more time reflecting than entering data.
- Every feature should explain performance, not duplicate Zepp health tracking.
