CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Madrid',
  preferred_distance_unit text NOT NULL DEFAULT 'km',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  source text NOT NULL DEFAULT 'zepp',
  file_name text NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'confirmed',
  detected_workouts_count integer NOT NULL DEFAULT 0,
  detected_sleep_count integer NOT NULL DEFAULT 0,
  detected_heart_rate_count integer NOT NULL DEFAULT 0,
  detected_activity_count integer NOT NULL DEFAULT 0,
  saved_workouts_count integer NOT NULL DEFAULT 0,
  duplicate_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id uuid NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_category text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'parsed',
  fingerprint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id uuid NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
  file_name text,
  row_number integer,
  severity text NOT NULL DEFAULT 'warning',
  message text NOT NULL,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  import_batch_id uuid REFERENCES import_batches(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'zepp',
  sport text NOT NULL CHECK (sport IN ('running', 'strength', 'basketball', 'unknown')),
  source_workout_id text,
  source_sport_code text,
  source_row_fingerprint text,
  started_at timestamptz,
  date date NOT NULL,
  duration_seconds numeric NOT NULL CHECK (duration_seconds > 0),
  distance_meters numeric,
  calories numeric,
  average_heart_rate numeric,
  max_heart_rate numeric,
  training_load numeric,
  raw_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS workouts_unique_import_fingerprint
  ON workouts(user_id, source, source_row_fingerprint)
  WHERE source_row_fingerprint IS NOT NULL;

CREATE TABLE IF NOT EXISTS running_workout_metrics (
  workout_id uuid PRIMARY KEY REFERENCES workouts(id) ON DELETE CASCADE,
  distance_meters numeric,
  pace_seconds_per_km numeric,
  average_speed_mps numeric,
  minimum_speed_mps numeric,
  maximum_speed_mps numeric,
  cadence numeric,
  vo2_max numeric,
  elevation_gain_meters numeric,
  zone_1_seconds numeric,
  zone_2_seconds numeric,
  zone_3_seconds numeric,
  zone_4_seconds numeric,
  zone_5_seconds numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strength_workout_metrics (
  workout_id uuid PRIMARY KEY REFERENCES workouts(id) ON DELETE CASCADE,
  detected_duration_seconds numeric,
  detected_calories numeric,
  detected_average_heart_rate numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS basketball_workout_metrics (
  workout_id uuid PRIMARY KEY REFERENCES workouts(id) ON DELETE CASCADE,
  court_time_seconds numeric,
  high_intensity_seconds numeric,
  average_intensity numeric,
  explosive_effort_estimate numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS running_journal_entries (
  workout_id uuid PRIMARY KEY REFERENCES workouts(id) ON DELETE CASCADE,
  training_purpose text CHECK (training_purpose IN ('zone2', 'longRun', 'tempo', 'threshold', 'intervals', 'maxEffort', 'recoveryRun', 'casualJog', 'race', 'other')),
  perceived_effort numeric CHECK (perceived_effort >= 1 AND perceived_effort <= 10),
  perceived_performance numeric CHECK (perceived_performance >= 1 AND perceived_performance <= 10),
  route_type text,
  felt_strong boolean,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strength_journal_entries (
  workout_id uuid PRIMARY KEY REFERENCES workouts(id) ON DELETE CASCADE,
  session_type text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strength_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES strength_journal_entries(workout_id) ON DELETE CASCADE,
  name text NOT NULL,
  muscle_group text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strength_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES strength_exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  reps integer NOT NULL CHECK (reps > 0),
  weight_kg numeric NOT NULL CHECK (weight_kg >= 0),
  rpe numeric CHECK (rpe >= 1 AND rpe <= 10),
  estimated_one_rep_max_kg numeric,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS basketball_journal_entries (
  workout_id uuid PRIMARY KEY REFERENCES workouts(id) ON DELETE CASCADE,
  session_type text,
  perceived_performance numeric CHECK (perceived_performance >= 1 AND perceived_performance <= 10),
  perceived_effort numeric CHECK (perceived_effort >= 1 AND perceived_effort <= 10),
  energy numeric CHECK (energy >= 1 AND energy <= 10),
  explosiveness numeric CHECK (explosiveness >= 1 AND explosiveness <= 10),
  shooting numeric CHECK (shooting >= 1 AND shooting <= 10),
  defense numeric CHECK (defense >= 1 AND defense <= 10),
  role text,
  outcome text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_activity_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  import_batch_id uuid REFERENCES import_batches(id) ON DELETE SET NULL,
  date date NOT NULL,
  activity_time_seconds numeric,
  steps integer,
  distance_meters numeric,
  running_distance_meters numeric,
  active_calories numeric,
  total_calories numeric,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date, import_batch_id)
);

CREATE TABLE IF NOT EXISTS sleep_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  import_batch_id uuid REFERENCES import_batches(id) ON DELETE SET NULL,
  date date NOT NULL,
  sleep_started_at timestamptz,
  sleep_ended_at timestamptz,
  sleep_duration_seconds numeric,
  deep_sleep_seconds numeric,
  light_sleep_seconds numeric,
  rem_sleep_seconds numeric,
  awake_seconds numeric,
  nap_data jsonb,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS heart_rate_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  import_batch_id uuid REFERENCES import_batches(id) ON DELETE SET NULL,
  recorded_at timestamptz NOT NULL,
  heart_rate integer NOT NULL CHECK (heart_rate > 0 AND heart_rate < 240),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_heart_rate_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  date date NOT NULL,
  minimum_heart_rate integer,
  maximum_heart_rate integer,
  average_heart_rate numeric,
  sample_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  week_start date NOT NULL,
  week_end date NOT NULL,
  generated_summary text,
  running_reflection text,
  strength_reflection text,
  basketball_reflection text,
  consistency_reflection text,
  lessons_learned jsonb,
  suggested_focus text,
  user_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  category text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  period_start date,
  period_end date,
  confidence numeric,
  suggested_action text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  sport text NOT NULL,
  metric_name text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  achieved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
