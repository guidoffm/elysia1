# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:8080/ with your browser to see the result.

## Run

    dapr run --app-id elysia1 -- env ISSUER='https://dex.edvmueller.de' bun run dev

    dapr run --app-id elysia1 --app-port 8080 --dapr-http-port 3500 -- env ISSUER="https://dex.edvmueller.de" bun run dev

## Test

    dapr run --app-id elysia1 -- bun test