# Frontend-Adapted Functional Design

This document has been superseded.

The previous version described the product as a broad athletic performance dashboard with separate metric-driven pages for running, strength, basketball, recovery, training load, records, and insights. That model no longer matches the product direction.

The canonical product design is now:

[My Performance Journal Functional Design](functional-design.md)

The current product direction is My Performance Journal, an athletic diary that extends Zepp:

- Import Zepp workouts.
- Review imported workouts.
- Enrich workouts with sport-specific context.
- Analyze performance from objective data plus subjective meaning.
- Reflect through weekly reviews.
- Build a searchable history of athletic development.

Future frontend design work should start from the canonical functional design and preserve its workflow-first page model: Dashboard, Workout Inbox, Workout Details, Performance, Weekly Review, and Settings / Data Import.
