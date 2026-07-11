#đọc và parse thông tin kết nối database

import os
import re
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ENV_PATH = Path(__file__).resolve().parent.parent / "backend" / ".env" #đường dẫn tới chính file config.py đang chạy
                                                                            #.resolve(): chuyển thành đường dẫn tuyệt đối 
                                                                            #.parent.parent: đi lên 2 cấp thư mục — từ ml-service/config.py → ml-service/ (1 cấp) → thư mục gốc project (2 cấp)
                                                                            #nối thêm backend/.env vào sau → ra đường dẫn đầy đủ tới file .env mà Spring Boot đang dùng
load_dotenv(BACKEND_ENV_PATH) # đọc file đó, nạp DB_URL, DB_USERNAME, DB_PASSWORD... vào biến môi trường của tiến trình Python hiện tại

_JDBC_URL_PATTERN = re.compile(
    r"jdbc:postgresql://(?P<host>[^:/]+):(?P<port>\d+)/(?P<database>[^?]+)(?:\?(?P<params>.*))?"
) #


def get_db_connection_kwargs() -> dict:
    jdbc_url = os.environ.get("DB_URL") #Đọc DB_URL đã được nạp vào os.environ ở bước trên
    if not jdbc_url:
        raise RuntimeError(f"DB_URL không được cấu hình trong {BACKEND_ENV_PATH}")

    match = _JDBC_URL_PATTERN.match(jdbc_url) #Áp regex vào chuỗi DB_URL thật

    if not match:
        raise ValueError(f"Không parse được DB_URL (định dạng không như mong đợi): {jdbc_url}")

    query_params = dict( #Tách phần params (sslmode=require) thành dictionary: {"sslmode": "require"}
        pair.split("=", 1) for pair in (match.group("params") or "").split("&") if "=" in pair
    )

    return {
        "host": match.group("host"),
        "port": int(match.group("port")),
        "dbname": match.group("database"),
        "user": os.environ["DB_USERNAME"],
        "password": os.environ["DB_PASSWORD"],
        "sslmode": query_params.get("sslmode", "prefer"),
    }
