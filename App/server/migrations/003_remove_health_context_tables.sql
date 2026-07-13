-- Health-context tables were removed because the product direction changed.
--
-- Zepp remains responsible for sleep, activity, heart rate, recovery, and
-- readiness. My Performance Journal stores workout imports, objective workout
-- metrics, sport-specific journal enrichment, performance analysis, and weekly
-- reflection only.

DROP TABLE IF EXISTS daily_heart_rate_summaries;
DROP TABLE IF EXISTS heart_rate_records;
DROP TABLE IF EXISTS sleep_records;
DROP TABLE IF EXISTS daily_activity_records;

ALTER TABLE import_batches
  DROP COLUMN IF EXISTS detected_sleep_count,
  DROP COLUMN IF EXISTS detected_heart_rate_count,
  DROP COLUMN IF EXISTS detected_activity_count;
