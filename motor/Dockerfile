FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

# Install system dependencies
RUN apk add --no-cache git chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser


COPY . .

# Default to Main port
EXPOSE 4000

CMD ["node", "index.js"]
