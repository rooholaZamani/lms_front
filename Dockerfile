FROM nginx:alpine

# کپی فایل‌های build شده
COPY dist/ /usr/share/nginx/html/

# تنظیمات ساده nginx برای SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]