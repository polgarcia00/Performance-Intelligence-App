# My Performance Journal Backend

Small Node.js, TypeScript, PostgreSQL backend for My Performance Journal.

## Approved Tools

- `express`: REST API routing.
- `pg`: PostgreSQL driver.
- `dotenv`: local environment configuration.
- `csv-parse`: Zepp CSV parsing.
- `supertest`: API tests.

No Docker, ORM, validation library, migration framework, or development reload tool is used.

## Local Setup

1. Install dependencies:

```sh
npm install
```

2. Create a local PostgreSQL database:

```sh
createdb my_performance_journal
```

3. Configure environment:

```sh
cp .env.example .env
```

4. Build and migrate:

```sh
npm run build
npm run migrate
npm run seed
```

5. Start the backend:

```sh
npm start
```

The health endpoint is:

```text
GET /api/health
```

## Product Boundaries

- PostgreSQL is the durable source of truth.
- Objective Zepp data is stored in `workouts` and sport metric tables.
- Journal data is stored separately in journal tables.
- Journal updates never update objective workout columns.
- Imports are workout-only. Zepp activity, sleep, and generic heart-rate files are ignored with warnings and are not persisted.
- Zepp owns health and objective workout recording. Performance Journal owns workout import, enrichment, reflection, and performance analysis.
- Primary workflow: Import Zepp workouts -> review workout inbox -> enrich workouts -> analyze performance -> review weekly progress.

## Migration History

Migrations 001 and 002 include historical health-context tables from an earlier product direction. Migration 003 removes those tables and health-count columns from the final schema. The migration history is intentionally preserved to avoid surprising existing local databases, but the final migrated schema must not contain sleep, activity, generic heart-rate, recovery, readiness, or health-context tables.

## PostgreSQL Integration Tests

### Running PostgreSQL integration tests locally

PostgreSQL must be installed and running locally. Create a separate test database; do not reuse the development database.

```sh
createdb my_performance_journal_test
TEST_DATABASE_URL=postgres://localhost:5432/my_performance_journal_test npm run test:integration
```

You can also run migrations against the test database explicitly:

```sh
TEST_DATABASE_URL=postgres://localhost:5432/my_performance_journal_test npm run db:migrate:test
```

Safety checks enforce that `TEST_DATABASE_URL` exists, does not match `DATABASE_URL`, and points to a database name containing `test`, `testing`, or `_test`. The integration runner sets `NODE_ENV=test`, resets only the configured test schema, runs migrations, seeds the default local user, and closes the database connection after tests.

Unit tests do not require PostgreSQL:

```sh
npm run test:unit
```

No Docker setup is required.

## Known Limitations

- PostgreSQL integration tests are not part of the default unit test command because they require a real isolated PostgreSQL database.
- Historical health-context migrations are preserved for existing local databases, but migration 003 removes those objects from the final schema.
