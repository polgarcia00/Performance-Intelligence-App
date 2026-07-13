INSERT INTO users (id, name, timezone, preferred_distance_unit)
VALUES ('00000000-0000-0000-0000-000000000001', 'Local Athlete', 'Europe/Madrid', 'km')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    timezone = EXCLUDED.timezone,
    preferred_distance_unit = EXCLUDED.preferred_distance_unit,
    updated_at = now();
