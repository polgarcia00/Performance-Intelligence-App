# My Performance Journal Backend Functional Design

## Product Framing

My Performance Journal is the athlete-facing diary. Zepp records objective facts. Performance Intelligence is the backend analysis engine that combines those facts with journal context and produces meaning.

The backend should not turn the product into another fitness tracker. It should preserve the app's core workflow:

1. Import Zepp data.
2. Review imported workouts.
3. Enrich workouts with journal context.
4. Analyze performance.
5. Reflect weekly.
6. Build a searchable history of training development.

## Source Of Truth

PostgreSQL is the persistent source of truth.

PostgreSQL stores:

- Imported Zepp workout data
- Imported Zepp sleep, heart-rate, activity, calories, and step data
- Normalized objective workout records
- Performance journal enrichments
- Import history
- Import errors and duplicate decisions
- Weekly reviews
- Generated insights
- Personal records
- User preferences and app settings

Pinia remains in the frontend, but it is no longer responsible for durable persistence.

Pinia should manage:

- Currently loaded workouts
- Currently selected workout
- Active filters and selected tabs
- Import preview state
- Loading and error states
- Unsaved enrichment forms
- Dashboard summaries already fetched from the API
- Short-lived client-side caching

The default flow should be:

```text
PostgreSQL
-> Backend API
-> Frontend service
-> Pinia store
-> Vue components
```

## Architecture Principles

- PostgreSQL owns durable data.
- Backend services own persistence, validation, normalization, and analysis coordination.
- Frontend services own HTTP calls.
- Pinia owns client-side state and API request coordination.
- Vue components render UI and manage local interaction only.
- Objective Zepp data and subjective journal data stay separate.
- Imported values are never overwritten by enrichment edits.
- Manual entry remains a fallback, not the primary workflow.
- Fetch only what the current screen needs; do not duplicate the whole database in Pinia.

## Backend Responsibilities

The backend is responsible for:

- Receiving Zepp import files
- Parsing supported CSV or JSON exports
- Normalizing Zepp-specific fields into app-owned types
- Detecting duplicate imports and duplicate records
- Saving objective Zepp data
- Saving journal enrichments separately
- Returning workout inbox status
- Producing dashboard summaries
- Producing performance analysis
- Producing weekly review summaries
- Managing import history
- Exposing health context for workout reflection

The backend should not:

- Replace Zepp health features
- Generate medical interpretations
- Treat subjective ratings as objective sensor data
- Require manual workout creation as the normal path
- Store frontend-only UI state such as selected tabs or temporary form drafts

## Data Boundaries

### Objective Zepp Data

Objective data comes from Zepp imports and should be treated as read-only after import except for administrative correction flows.

Examples:

- Workout date
- Start time
- Duration
- Sport type
- Distance
- Pace
- Heart rate
- Calories
- Steps
- Sleep
- Daily activity

### Performance Journal Data

Journal data comes from the athlete and can be edited.

Examples:

- Running training purpose
- Perceived effort
- Perceived performance
- Route type
- Strength exercises
- Sets, reps, weight, RPE
- Basketball role
- Basketball energy, shooting, defense, explosiveness
- Notes
- Lessons learned

### Analysis Data

Analysis combines objective data and journal data.

Examples:

- Workout inbox status
- Running trend by training purpose
- Strength overload trend
- Basketball performance pattern
- Health-context correlations
- Weekly reflection summaries
- Personal records
- Insight cards

Analysis outputs can be either stored snapshots or generated on demand. For a personal app, start simple: generate on demand for most views and persist weekly reviews or saved insights when the user explicitly saves them.

## PostgreSQL Data Model

### users

For the personal MVP this can contain one user, but the schema should still model ownership cleanly.

- id
- name
- timezone
- preferred_distance_unit
- created_at
- updated_at

### import_batches

Represents one import action.

- id
- user_id
- source
- file_name
- imported_at
- status
- detected_workouts_count
- detected_sleep_count
- detected_heart_rate_count
- detected_activity_count
- saved_workouts_count
- duplicate_count
- error_count

### import_files

Represents individual files inside an import.

- id
- import_batch_id
- file_name
- file_category
- row_count
- status

### import_errors

Stores clear import feedback.

- id
- import_batch_id
- file_name
- row_number
- severity
- message
- raw_payload

### workouts

Normalized objective workout facts.

- id
- user_id
- import_batch_id
- source
- sport
- source_workout_id
- started_at
- date
- duration_seconds
- distance_meters
- calories
- average_heart_rate
- max_heart_rate
- training_load
- raw_summary
- created_at

### running_workout_metrics

Objective running metrics.

- workout_id
- distance_meters
- pace_seconds_per_km
- cadence
- vo2_max
- elevation_gain_meters
- zone_1_seconds
- zone_2_seconds
- zone_3_seconds
- zone_4_seconds
- zone_5_seconds

### basketball_workout_metrics

Objective basketball metrics where available.

- workout_id
- court_time_seconds
- high_intensity_seconds
- average_intensity
- explosive_effort_estimate

### strength_workout_metrics

Objective strength import facts where Zepp provides them. Detailed lifts usually come from the journal enrichment layer.

- workout_id
- detected_duration_seconds
- detected_calories
- detected_average_heart_rate

### running_journal_entries

Subjective running context.

- workout_id
- training_purpose
- perceived_effort
- perceived_performance
- route_type
- notes
- updated_at

### strength_journal_entries

Subjective strength context.

- workout_id
- session_type
- notes
- updated_at

### strength_exercises

Journaled exercise list.

- id
- workout_id
- name
- muscle_group
- sort_order

### strength_sets

Journaled set details.

- id
- exercise_id
- set_number
- reps
- weight_kg
- rpe
- estimated_one_rep_max_kg

### basketball_journal_entries

Subjective basketball context.

- workout_id
- session_type
- perceived_performance
- perceived_effort
- energy
- explosiveness
- shooting
- defense
- role
- notes
- updated_at

### sleep_records

Imported Zepp sleep context.

- id
- user_id
- import_batch_id
- date
- sleep_duration_seconds
- deep_sleep_seconds
- light_sleep_seconds
- rem_sleep_seconds
- awake_seconds
- sleep_score
- raw_payload

### heart_rate_records

Imported Zepp heart-rate context.

- id
- user_id
- import_batch_id
- recorded_at
- heart_rate

### daily_activity_records

Imported Zepp activity context.

- id
- user_id
- import_batch_id
- date
- steps
- distance_meters
- active_calories
- total_calories
- raw_payload

### weekly_reviews

Saved reflective weekly summaries.

- id
- user_id
- week_start
- week_end
- generated_summary
- running_reflection
- strength_reflection
- basketball_reflection
- consistency_reflection
- lessons_learned
- suggested_focus
- user_notes
- created_at
- updated_at

### insights

Generated or saved insight cards.

- id
- user_id
- category
- title
- message
- related_workout_id
- period_start
- period_end
- confidence
- suggested_action
- status
- created_at

### personal_records

Persisted meaningful records.

- id
- user_id
- sport
- metric_name
- value
- unit
- workout_id
- achieved_at
- notes

## Import Workflow

### Step 1: Upload Or Load Import Files

The frontend sends selected Zepp export files to the backend.

The backend returns an import preview before saving anything durable.

### Step 2: Parse And Detect

The backend detects:

- Running workouts
- Strength workouts
- Basketball sessions
- Sleep data
- Heart-rate data
- Activity data
- Unknown files
- Unknown sport codes
- Row-level errors

### Step 3: Normalize

Zepp-specific fields are converted into internal app types.

The frontend should never depend on Zepp field names.

### Step 4: Preview

The API returns:

- Detected data types
- Record counts
- Sample rows
- Unknown sport types
- Duplicate warnings
- Import errors
- Estimated saved records

### Step 5: Save

On confirmation, the backend writes:

- import_batches
- import_files
- import_errors
- workouts
- sport-specific objective metrics
- sleep records
- heart-rate records
- daily activity records

New workouts enter the Workout Inbox with status computed from missing journal context.

## Workout Inbox Logic

The backend should expose inbox status so every client sees the same interpretation.

Statuses:

- Needs enrichment
- Partially enriched
- Completed

Running is completed when it has enough context such as:

- Training purpose
- Perceived effort
- Perceived performance

Strength is completed when it has:

- At least one exercise
- Sets, reps, weight, and RPE

Basketball is completed when it has:

- Session type
- Perceived performance
- Perceived effort
- Energy
- Shooting
- Defense
- Role

The exact completion rules can evolve, but the important product behavior is stable: imported workouts are not fully useful until journal context exists.

## API Design

### Import

- `POST /api/imports/preview`
- `POST /api/imports/confirm`
- `GET /api/imports`
- `GET /api/imports/:id`

### Workout Inbox

- `GET /api/workouts/inbox`
- `GET /api/workouts?status=&sport=&from=&to=`
- `GET /api/workouts/:id`

### Journal Enrichment

- `PUT /api/workouts/:id/running-journal`
- `PUT /api/workouts/:id/strength-journal`
- `PUT /api/workouts/:id/basketball-journal`

Journal endpoints update only journal tables. They never overwrite objective workout rows.

### Health Context

- `GET /api/health-context?from=&to=`
- `GET /api/workouts/:id/health-context`

### Dashboard

- `GET /api/dashboard/summary`

Returns question-oriented dashboard data:

- What happened
- What needs attention
- What did I learn
- How am I progressing

### Performance

- `GET /api/performance/running`
- `GET /api/performance/strength`
- `GET /api/performance/basketball`
- `GET /api/performance/records`
- `GET /api/performance/trends`

### Weekly Review

- `GET /api/weekly-reviews/current`
- `GET /api/weekly-reviews/:weekStart`
- `POST /api/weekly-reviews/:weekStart`
- `PUT /api/weekly-reviews/:id`

### Insights

- `GET /api/insights`
- `POST /api/insights/:id/save`
- `POST /api/insights/:id/dismiss`

## Frontend State With Pinia

Keep Pinia, but simplify it.

Stores should coordinate API requests and cache screen-level data.

### workoutStore

Responsibilities:

- Fetch inbox workouts
- Fetch selected workout details
- Save workout enrichment
- Track loading and error states
- Cache currently loaded workouts

Example actions:

- `fetchInboxWorkouts(filters)`
- `fetchWorkoutById(id)`
- `saveRunningJournal(id, payload)`
- `saveStrengthJournal(id, payload)`
- `saveBasketballJournal(id, payload)`

### importStore

Responsibilities:

- Hold import preview
- Track selected files
- Confirm imports
- Track import errors and loading states

Example actions:

- `previewImport(files)`
- `confirmImport(previewId)`
- `fetchImportHistory()`

### dashboardStore

Responsibilities:

- Fetch dashboard summary
- Cache latest summary
- Track loading/error state

### performanceStore

Responsibilities:

- Fetch performance tab data
- Cache current tab data
- Track selected tab
- Track loading/error state

### healthContextStore

Responsibilities:

- Fetch imported Zepp health context
- Fetch context for a selected workout
- Track filters and loading state

### weeklyReviewStore

Responsibilities:

- Fetch generated weekly review
- Save user reflections
- Cache selected week

## Frontend Services

Frontend services should make HTTP requests and keep stores clean.

Suggested services:

- `importApiService`
- `workoutApiService`
- `journalApiService`
- `dashboardApiService`
- `performanceApiService`
- `healthContextApiService`
- `weeklyReviewApiService`

Components should never call `fetch()` directly.

## Backend Services

Suggested backend service boundaries:

- Import service
- Zepp parser
- Data normalizer
- Duplicate detector
- Workout service
- Journal service
- Health context service
- Dashboard summary service
- Performance analysis service
- Weekly review service
- Insight service

The backend can start as a modular monolith. Do not split into microservices.

## MVP Backend Scope

Build first:

- PostgreSQL schema
- Import preview
- Import confirmation
- Workout Inbox API
- Workout detail API
- Running journal save
- Strength journal save
- Basketball journal save
- Dashboard summary API
- Health Context API
- Weekly Review API

Delay:

- Authentication
- Multi-user collaboration
- Direct Zepp API integration
- AI chat
- Prediction engine
- Complex coaching automation
- Cloud sync complexity beyond the single app backend

## Migration From Current Frontend

The current frontend can migrate gradually.

### Phase 1: Add API Services

Create frontend API services that mirror current local services.

### Phase 2: Update Pinia Actions

Change store actions from local persistence to backend calls.

Before:

```text
store action -> localStorage service -> Pinia state
```

After:

```text
store action -> API service -> backend -> PostgreSQL -> Pinia state
```

### Phase 3: Remove Local Persistence As Source Of Truth

Keep local state only for temporary UI state and optional short-lived caching.

### Phase 4: Keep Existing Components

Most Vue components should not need major changes if stores keep similar action names and state shapes.

## Final Product Rule

When deciding whether to add backend functionality, ask:

Does this help tell the story of training, or is it just another graph?

If it only stores or returns another graph, Zepp probably already does that well. If it connects objective facts to journal meaning, it belongs in My Performance Journal.
