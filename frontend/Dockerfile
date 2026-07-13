#bản Node.js 20 tối giản (alpine là 1 bản Linux cực nhẹ) -> image   chứa sẵn Node.js 20, npm, yarn, npx, v.v. để build frontend
FROM node:20-alpine AS build
WORKDIR /app
#là 1 pattern khớp cả package.json và package-lock.json cùng lúc
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
#dùng Nginx để phục vụ đúng những file tĩnh đó
#bắt đầu một image hoàn toàn mới -> không tự động mang theo bất cứ thứ gì từ giai đoạn build ở trên => không có Node, không có node_modules, không có mã nguồn .jsx
#Nó chỉ lấy đúng những gì bạn chủ động yêu cầu copy sang
FROM nginx:alpine
#lấy từ đúng giai đoạn tên build ở trên
#chỉ copy duy nhất thư mục dist/ (kết quả cuối cùng) sang image Nginx mới này, đặt vào /usr/share/nginx/html — thư mục mặc định Nginx tự tìm để phục vụ file tĩnh.
COPY --from=build /app/dist /usr/share/nginx/html
#Ghi đè file cấu hình mặc định của Nginx bằng file nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
#Khai báo container này lắng nghe cổng 80
EXPOSE 80
