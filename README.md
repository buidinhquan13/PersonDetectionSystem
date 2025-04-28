# Person Detection System
Đếm số lượng người trong ảnh 
## Cấu trúc project
project/  
├── backend/              # FastAPI  
├── frontend/             # Nextjs  
├── uploads/              # Thư mục chứa ảnh  
└── docker-compose.yml    # Cấu hình docker  

## Cài đặt
**1. Clone the repository**
```bash
git clone https://github.com/buidinhquan13/PersonDetectionSystem.git
cd PersonDetectionSystem
```

**2. Chạy và khởi động docker**
```bash
# Build docker service
docker-compose build --no-cache

# Chạy các containers đã build
docker-compose up
```

**3. Truy cập ứng dụng**
- Frontend:   http://localhost:3001/
- API Documentation: http://localhost:8000/docs

## Demo
[![Demo Video](https://img.youtube.com/vi/ECsc58hS0TE/0.jpg)](https://www.youtube.com/watch?v=ECsc58hS0TE)
