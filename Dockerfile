FROM nginx:alpine

COPY dist/ /usr/share/nginx/html/

RUN echo 'server { \
    listen 80; \
    client_max_body_size 1000M;\
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
        proxy_request_buffering off; \
    } \

}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]