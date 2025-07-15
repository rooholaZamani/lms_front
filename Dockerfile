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

    location /api/ { \
        proxy_pass http://lms-backend:8080; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_read_timeout 300; \
        proxy_connect_timeout 300; \
        proxy_send_timeout 300; \
    } \

}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]