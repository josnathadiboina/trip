# ============================================================
# TRIPWITHUS — Frontend build & serve (NGINX)
# ============================================================
FROM nginx:1.27-alpine

# Copy all static frontend assets
COPY . /usr/share/nginx/html

# Replace default nginx config with our SPA + API-proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Background nginx (non-daemon) + drop privileges
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

