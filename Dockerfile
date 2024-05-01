FROM oven/bun:alpine
LABEL org.opencontainers.image.source=https://github.com/guidoffm/elysia1
LABEL org.opencontainers.image.description="Elysia1"
LABEL org.opencontainers.image.licenses=MIT

# Run the application as a non-root user.
USER bun

WORKDIR /app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a bind mounts to package.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=bun.lockb,target=bun.lockb \
    bun install --omit=dev

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application.
CMD bun run dev
