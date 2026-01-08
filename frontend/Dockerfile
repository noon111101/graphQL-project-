# --- STAGE 1: BUILD (Dùng Node.js để build React) ---
FROM node:18-alpine AS builder

WORKDIR /app

# [BƯỚC 1] Copy file định nghĩa thư viện trước (Tối ưu Cache layer này)
COPY package.json ./

# Cài đặt thư viện
RUN npm install

# [BƯỚC 2 - QUAN TRỌNG] Copy các file cấu hình và source code
COPY tsconfig.json ./
COPY public ./public
COPY src ./src

RUN npm run build

# --- STAGE 2: SERVE (Dùng Nginx để chạy web tĩnh) ---
FROM nginx:alpine

# Xóa config default
RUN rm /etc/nginx/conf.d/default.conf

# Copy config Nginx của bạn
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy kết quả build từ Stage 1
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]