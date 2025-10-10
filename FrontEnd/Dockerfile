FROM node:22 AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files with proper permissions
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions explicitly
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]