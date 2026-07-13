#FROM là dòng bắt buộc đầu tiên của mọi Dockerfile -> bắt đầu xây dựng dựa trên image có sẵn này
#python:3.12-slim là image chính thức chứa sẵn Python 3.12 đã cài đặt
FROM python:3.12-slim
#Đặt "thư mục làm việc hiện tại" bên trong image thành /app
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
#Copy toàn bộ phần còn lại của thư mục ml-service
COPY . .
