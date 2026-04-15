# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy toan bo nhung gi Docker dang co tiep can
COPY . .

# Tim xem package.json dang o dau
RUN find . -maxdepth 2 -name "package.json"

# Neu Railway dang dua vao context la ca repo, package.json se o ./backend/package.json
# Chung ta se dua no ra thu muc goc cua WORKDIR
RUN if [ -f "./backend/package.json" ]; then \
    echo "Found at ./backend/package.json, moving files..." && \
    cp -r ./backend/* . ; \
    fi

RUN npm install
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001
ENV PORT=3001
CMD ["npm", "run", "start"]
