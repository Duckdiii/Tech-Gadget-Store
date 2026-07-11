#lớp trung gian (abstraction layer) giữa "nơi biết cách lấy thông tin kết nối" (config.py) và "nơi cần dùng kết nối" (check_connection.py, và sau này là các script trích xuất dữ liệu/train model).
import psycopg2 #Thư viện Python để giao tiếp với PostgreSQL 

from config import get_db_connection_kwargs


def get_connection():
    return psycopg2.connect(**get_db_connection_kwargs())
