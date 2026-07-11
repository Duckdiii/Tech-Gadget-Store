#script kiểm tra xem ml-service có kết nối được tới đúng database mà backend đang dùng hay không
import sys

from db import get_connection #hàm này mở kết nối psycopg2 tới Postgres dựa trên thông tin đọc được từ backend/.env

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8") #ép console in ra bằng UTF-8.
    with get_connection() as conn: #mở kết nối tới Postgres
        with conn.cursor() as cur: #đảm bảo connection tự động đóng lại sau khi dùng xong, kể cả khi có lỗi xảy ra giữa chừng (tránh rò rỉ connection, giữ kết nối treo lại DB)
            cur.execute( #tạo một "con trỏ" để gửi câu lệnh SQL và đọc kết quả trả về — giống Statement/ResultSet trong JDBC bên Java
                "SELECT (SELECT COUNT(*) FROM customers) AS customers, "
                "(SELECT COUNT(*) FROM orders) AS orders, "
                "(SELECT COUNT(*) FROM order_items) AS order_items"
            ) #Chạy 1 câu SQL đếm số dòng ở 3 bảng: customers, orders, order_items
            customers, orders, order_items = cur.fetchone() #lấy kết quả trả về từ câu SQL, là 1 tuple gồm 3 số đếm
            print(f"Kết nối OK — customers={customers}, orders={orders}, order_items={order_items}")
