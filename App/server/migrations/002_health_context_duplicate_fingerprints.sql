-- Historical migration from an earlier product direction.
--
-- My Performance Journal no longer stores sleep, activity, generic heart-rate,
-- recovery, readiness, or health-context records. Zepp owns that data.
-- Migration 003 removes these legacy tables and columns from the final schema.
-- This file remains only so databases that already applied migration 001/002 can
-- move forward through the same migration history safely.

ALTER TABLE daily_activity_records
  ADD COLUMN IF NOT EXISTS source_fingerprint text;

ALTER TABLE sleep_records
  ADD COLUMN IF NOT EXISTS source_fingerprint text;

ALTER TABLE heart_rate_records
  ADD COLUMN IF NOT EXISTS source_fingerprint text;

CREATE UNIQUE INDEX IF NOT EXISTS daily_activity_records_unique_source_fingerprint
  ON daily_activity_records(user_id, source_fingerprint);

CREATE UNIQUE INDEX IF NOT EXISTS sleep_records_unique_source_fingerprint
  ON sleep_records(user_id, source_fingerprint);

CREATE UNIQUE INDEX IF NOT EXISTS heart_rate_records_unique_source_fingerprint
  ON heart_rate_records(user_id, source_fingerprint);
