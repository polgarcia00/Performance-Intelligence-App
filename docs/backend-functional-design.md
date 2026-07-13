# My Performance Journal Backend Functional Design

The backend is the PostgreSQL-backed source of truth for the workout journal.

## Product Boundary

The backend stores imported Zepp workout data, sport objective metrics, journal enrichments, import history, weekly reviews, personal records, and performance summaries.

It does not store or expose sleep, activity, generic heart-rate records, recovery, readiness, BioCharge-style data, or health-context dashboards.

## Data Flow

```text
PostgreSQL -> Backend API -> Frontend service -> Pinia UI cache -> Vue component
```

Pinia should cache only screen state and fetched API responses. PostgreSQL remains durable.

## Current Endpoint Groups

- Workouts: `GET /api/workouts`, `GET /api/workouts/inbox`, `GET /api/workouts/:id`
- Journals: `PUT /api/workouts/:id/running-journal`, `PUT /api/workouts/:id/strength-journal`, `PUT /api/workouts/:id/basketball-journal`
- Imports: `POST /api/imports/preview`, `POST /api/imports/confirm`, `GET /api/imports`, `GET /api/imports/:id`
- Dashboard: `GET /api/dashboard/summary`
- Performance: `GET /api/performance/running`, `GET /api/performance/strength`, `GET /api/performance/basketball`, `GET /api/performance/records`, `GET /api/performance/trends`
- Weekly Reviews: `GET /api/weekly-reviews/current`, `GET /api/weekly-reviews/:weekStart`, `POST /api/weekly-reviews/:weekStart`, `PUT /api/weekly-reviews/:id`

## Import Rules

Production import is workout-only. SPORT.csv and Zepp ZIP files containing SPORT.csv are supported. Non-workout Zepp files are ignored with warnings and are not persisted.

## Analysis Ownership

The backend owns filtering, aggregation, comparisons, workout completion status, weekly review generation, personal records, running purpose grouping, strength volume/e1RM calculations, and basketball rating summaries.

The frontend owns formatting, chart datasets, tab state, loading/error presentation, and local UI interaction.
