# Evidence Studio

Evidence Studio is an ungated, browser-based decision-support tool for learning, talent,
research, and organizational leaders. It helps practitioners diagnose a performance problem,
compare learning strategies, inspect the evidence chain, plan a bounded experiment, and produce
an executive decision brief.

The Northstar Services worked example is fictional. Its organizations, observations, and figures
exist only to demonstrate the product. The Studio uses transparent deterministic rules; it does
not call a live AI service or send working data to a server.

## Run locally

You need a current version of Node.js and npm.

```sh
npm install
npm run dev
```

Open the local address printed by Vite. To create a production build:

```sh
npm run build
```

## Quality checks

```sh
npm run lint
npm run build
```

The interface is designed for keyboard use and responsive layouts. Motion is limited to short
state, progress, and inspector transitions and respects the reduced-motion preference.

## Technology

- TanStack Start
- React and TypeScript
- Tailwind CSS

## Lovable project

This repository is connected to the [Evidence Studio editor](https://lovable.dev/projects/1ee436a5-8b2b-4f44-99fd-c301aef8f9de) on the main branch. The [original product brief](docs/original-product-brief.md) remains available for reference. Publishing the Lovable site is a separate step.
