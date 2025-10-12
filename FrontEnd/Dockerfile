FROM node:22 AS build

WORKDIR /app

# Build arguments
ARG VITE_API_URL
ARG VITE_API_URL_BASIC
ARG VITE_API_GOOGLE_AUTH_API

# Environment variables for Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_URL_BASIC=$VITE_API_URL_BASIC
ENV VITE_API_GOOGLE_AUTH_API=$VITE_API_GOOGLE_AUTH_API

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy SSL certificates
COPY ./HttpsKey/server.crt /etc/nginx/ssl/server.crt
COPY ./HttpsKey/server.key /etc/nginx/ssl/server.key

# Copy built files with proper permissions
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod 644 /etc/nginx/ssl/server.crt && \
    chmod 600 /etc/nginx/ssl/server.key

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]