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

The primary workflow is:

```text
Import Zepp workouts -> Review -> Enrich -> Analyze
```

Manual workout entry is a durable fallback for workouts Zepp missed, not the primary workflow:

```text
Add Missing Workout -> Saved to PostgreSQL as source = manual -> Enrich like any other workout
```

## Running with Docker Compose

### Prerequisites

- Docker Desktop or another Docker installation with Docker Compose v2.
- Ports `5173`, `4000`, and `5432` available, unless you change them in the environment file.

### First-time startup

Create the local Docker environment file from the committed example:

```sh
cp .env.docker.example .env
```

The values in this file are local-development defaults, not production credentials. If PostgreSQL credentials are changed, update `DATABASE_URL` to match them.

Validate the resolved Compose configuration:

```sh
docker compose config
```

Build and start PostgreSQL, the migration job, the backend, and the frontend:

```sh
docker compose up --build
```

Later starts can use:

```sh
docker compose up
```

Open the frontend at [http://localhost:5173](http://localhost:5173). The backend API is available at [http://localhost:4000/api](http://localhost:4000/api), and its health endpoint is [http://localhost:4000/api/health](http://localhost:4000/api/health).

### Migrations

The one-off `migrate` service waits for PostgreSQL to become healthy, runs all backend migrations, and applies the existing default local-athlete seed. The backend starts only after that service exits successfully. Migration and seed commands are idempotent, so they can also be run manually:

```sh
docker compose run --rm migrate
```

Inspect migration failures with:

```sh
docker compose logs migrate
```

### Logs and container lifecycle

```sh
docker compose logs backend
docker compose logs postgres
docker compose down
```

`docker compose down` stops and removes the containers while preserving workout data in the `postgres_data` volume. To remove all local PostgreSQL data and start with an empty database:

```sh
docker compose down -v
docker compose up --build
```

The second command recreates the volume and reapplies migrations and the local seed.

### PostgreSQL integration tests

Integration tests are intentionally separate from normal startup. Create a dedicated test database, then pass a test-only URL whose database name clearly contains `test`:

```sh
docker compose exec postgres createdb -U performance_user performance_journal_test
docker compose run --rm \
  -e TEST_DATABASE_URL=postgresql://performance_user:performance_password@postgres:5432/performance_journal_test \
  backend npm run test:integration
```

Never point `TEST_DATABASE_URL` at `performance_journal`; the test safety checks reject the development database.

### Troubleshooting

- **Database not ready:** wait for the PostgreSQL healthcheck, then inspect `docker compose logs postgres`.
- **Migrations failed:** inspect `docker compose logs migrate`, correct the database configuration, and rerun `docker compose run --rm migrate`.
- **Frontend cannot reach the backend:** verify `/api/health`, then ensure `VITE_API_BASE_URL` uses the browser-accessible backend URL, normally `http://localhost:4000/api`.
- **CORS error:** `FRONTEND_ORIGIN` must exactly match the URL in the browser, normally `http://localhost:5173`.
- **Port already in use:** change the relevant port in `.env`. When changing `BACKEND_PORT`, also update `VITE_API_BASE_URL`; when changing `FRONTEND_PORT`, also update `FRONTEND_ORIGIN`.
- **Stale database state:** use `docker compose down -v` only when intentionally resetting all local journal data.

The frontend source is mounted into its container for Vite hot reload. Backend source changes require rebuilding the backend image with `docker compose up --build` because the existing backend has no development reload dependency.

## Running without Docker

The existing local workflow remains supported. Set up and start PostgreSQL and the backend first:

```sh
cd App/server
npm install
cp .env.example .env
npm run build
npm run setup:database
npm start
```

Then start the frontend in another terminal:

```sh
cd App
npm install
npm run dev
```

Project checks can still be run directly:

```sh
npm run type-check
npm run test:unit
npm run test:e2e
npm run build
```

Backend PostgreSQL integration tests require a separate test database configured with `TEST_DATABASE_URL`; see `App/server/README.md`.

## Backing up the local database

From the repository root, create a local PostgreSQL backup while Docker is running:

```sh
npm run db:backup
```

The timestamped SQL file is written to `backups/`. That directory is ignored by Git. Create a backup before `docker compose down -v` or any other intentionally destructive database operation.

To restore a backup:

```bash
docker compose exec -T postgres psql -U performance_user performance_journal < backups/YOUR_BACKUP_FILE.sql
```

`docker compose down` preserves PostgreSQL data. `docker compose down -v` deletes the local database volume, so restore a backup after the containers and migrations have been recreated.

## Known Limitations

- PostgreSQL integration tests require a locally available PostgreSQL server and a separate `TEST_DATABASE_URL`.
- Manual workout entry remains secondary to Zepp import, but missing workouts are saved durably in PostgreSQL and can be enriched like imported workouts.
