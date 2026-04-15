# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy toan bo repo
COPY . .

# Neu dang o thu muc goc (co thu muc backend), chung ta se di chuyen vao trong backend
# va xoa bo thu muc frontend de tranh xung dot build
RUN if [ -d "./backend" ]; then \
    echo "Transitioning to backend context..." && \
    cp -r ./backend/* . && \
    rm -rf ./backend ./frontend ; \
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
