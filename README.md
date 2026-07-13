# My Performance Journal

My Performance Journal is an athletic diary that extends Zepp.

Zepp remains the source of objective workout and health data. This app adds the context Zepp cannot know: why the workout happened, what was trained, how it felt, what the athlete learned, and how those lessons show up in long-term performance.

Performance Intelligence is the engine that powers analysis inside the app. The app itself should feel like a searchable training diary, not another fitness tracker.

The product direction is documented in:

[../docs/functional-design.md](../docs/functional-design.md)

## Core Workflow

1. Import Zepp workouts.
2. Review imported workouts.
3. Enrich workouts with sport-specific context.
4. Analyze performance from objective data plus journal meaning.
5. Reflect through weekly reviews.
6. Build a searchable history of athletic development.

Manual workout entry is a fallback/debug tool for workouts missing from Zepp, not the primary workflow.

## Product Boundary

Zepp owns health and objective workout recording. Performance Journal owns workout import, enrichment, reflection, and performance analysis. The app does not store or display sleep, activity, generic heart-rate, recovery, readiness, or health-context dashboards.

## Development

```sh
npm install
npm run dev
npm run type-check
npm run test:unit
npm run test:e2e
npm run build
```

Backend PostgreSQL integration tests require a separate test database configured with `TEST_DATABASE_URL`; see `server/README.md`.

## Known Limitations

- PostgreSQL integration tests require a locally available PostgreSQL server and a separate `TEST_DATABASE_URL`.
- Fallback manual workout entry is intentionally secondary and temporary; durable workout history should come from imported Zepp workout data.
=======
# App

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
