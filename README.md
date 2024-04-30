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

Open http://localhost:3000/ with your browser to see the result.

## Dapr

    dapr run --app-id elysia1 -- bun run dev

    dapr run --app-id elysia1 --dapr-http-port 3500 -- bun run dev