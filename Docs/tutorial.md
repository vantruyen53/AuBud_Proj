# ĐỒ ÁN TỐT NGHIỆP - ỨNG DỤNG QUẢN LÝ NGÂN SÁCH CÁ NHÂN
## Tài liệu thiết kế Class Diagram & Implementation Guide

---

## 📚 DANH SÁCH TÀI LIỆU

### 1. **class_diagram_design.md** 
📖 Tài liệu thiết kế Class Diagram chi tiết

**Nội dung:**
- Giải thích nguyên tắc SOLID đã áp dụng
- Kiến trúc tổng quan (Layered Architecture)
- Chi tiết từng layer:
  - Domain Models (Entities)
  - Interfaces
  - Repository Layer
  - Service Layer
  - Utility Classes
  - Background Jobs
- Quan hệ giữa các class
- Lưu ý khi implement

**Khi nào đọc:** ĐỌC ĐẦU TIÊN để hiểu tổng quan thiết kế

---

### 2. **class_diagram.puml**
🎨 File PlantUML để render Class Diagram

**Cách sử dụng:**
1. Copy nội dung file
2. Paste vào http://www.plantuml.com/plantuml/uml
3. Hoặc dùng PlantUML plugin trong IDE (VS Code, IntelliJ)
4. Export ra PNG/SVG để đưa vào báo cáo

**Chứa:**
- Tất cả classes, interfaces, abstract classes
- Relationships (inheritance, composition, dependency)
- Có thể chia nhỏ thành nhiều diagrams nếu quá lớn

---

### 3. **abstract_interface_concrete_guide.md**
🎓 Hướng dẫn chi tiết: Khi nào dùng Abstract Class, Interface, Concrete Class

**Nội dung:**
- So sánh 3 loại class
- Quy tắc vàng khi chọn
- Case studies từ dự án của bạn
- Decision tree để ra quyết định
- Anti-patterns cần tránh
- Checklist khi thiết kế

**Khi nào đọc:** Khi bạn vẫn chưa rõ khi nào dùng loại class nào

---

### 4. **sequence_diagrams.md**
⏱️ Sequence Diagrams cho các use case quan trọng

**Nội dung:**
- User Authentication (Đăng nhập)
- Create Transaction (Tạo giao dịch)
- Generate Report (Tạo báo cáo)
- Budget Monitoring (Background job)
- AI Chatbot Query
- Group Transaction
- Bank Sync (Background job)

**Cách sử dụng:**
- Copy code PlantUML vào http://www.plantuml.com/plantuml/uml
- Render thành hình ảnh
- Đưa vào phần sequence diagram trong báo cáo

---

### 5. **implementation_guide.md**
💻 Hướng dẫn implementation chi tiết

**Nội dung:**
- Tech stack gợi ý cho từng layer
- Database design improvements
- Code examples cho từng layer:
  - Domain Models (Entity với JPA annotations)
  - Abstract Class implementation
  - Concrete Class implementation
  - Repository với Spring Data JPA
  - Service Layer với business logic
- Security implementation (Password encryption, JWT)
- Error handling (Global Exception Handler)
- Testing (Unit test examples)
- Configuration files
- Deployment checklist

**Khi nào đọc:** Khi bắt đầu coding

---

## 🚀 LỘ TRÌNH SỬ DỤNG TÀI LIỆU

### Giai đoạn 1: HIỂU THIẾT KẾ (1-2 ngày)
1. Đọc **class_diagram_design.md** để hiểu tổng quan
2. Đọc **abstract_interface_concrete_guide.md** để hiểu sâu về OOP
3. Render **class_diagram.puml** để visualize
4. Đọc **sequence_diagrams.md** để hiểu flow

### Giai đoạn 2: CHUẨN BỊ IMPLEMENTATION (1 ngày)
1. Đọc **implementation_guide.md** phần Tech Stack
2. Quyết định công nghệ sử dụng (Java/C#/Node.js)
3. Đọc phần Database Design Improvements
4. Setup project structure

### Giai đoạn 3: CODING (2-4 tuần)
1. Implement Domain Models (theo example trong implementation_guide.md)
2. Implement Repositories
3. Implement Services
4. Implement Controllers/API
5. Implement Security
6. Implement Background Jobs
7. Testing

### Giai đoạn 4: HOÀN THIỆN BÁO CÁO
1. Export class diagram từ PlantUML
2. Export sequence diagrams
3. Tham khảo giải thích trong các file .md
4. Viết phần mô tả thiết kế

---

## 📐 CẤU TRÚC DỰ ÁN GỢI Ý

```
personal-budget-app/
│
├── docs/                           # Documentation
│   ├── class_diagram.png
│   ├── sequence_diagrams/
│   └── api_documentation.md
│
├── src/
│   ├── main/
│   │   ├── java/com/yourname/budgetapp/
│   │   │   │
│   │   │   ├── domain/            # Domain Models (Entities)
│   │   │   │   ├── User.java
│   │   │   │   ├── Account.java
│   │   │   │   ├── AbstractWallet.java
│   │   │   │   ├── PersonalWallet.java
│   │   │   │   ├── AbstractTransaction.java
│   │   │   │   ├── PersonalTransaction.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── repository/        # Data Access Layer
│   │   │   │   ├── IUserRepository.java
│   │   │   │   ├── ITransactionRepository.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── service/           # Business Logic Layer
│   │   │   │   ├── AuthenticationService.java
│   │   │   │   ├── TransactionService.java
│   │   │   │   ├── WalletService.java
│   │   │   │   ├── BudgetService.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── controller/        # API Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── TransactionController.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   │   ├── TransactionDTO.java
│   │   │   │   ├── UserDTO.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── security/          # Security Config
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── scheduler/         # Background Jobs
│   │   │   │   ├── NotificationScheduler.java
│   │   │   │   ├── DataSyncScheduler.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── util/              # Utilities
│   │   │   │   ├── ValidationHelper.java
│   │   │   │   ├── EncryptionHelper.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── factory/           # Factory Classes
│   │   │   │   ├── TransactionFactory.java
│   │   │   │   └── NotificationFactory.java
│   │   │   │
│   │   │   ├── strategy/          # Strategy Pattern
│   │   │   │   ├── IReportStrategy.java
│   │   │   │   ├── MonthlyReportStrategy.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── exception/         # Custom Exceptions
│   │   │       ├── ResourceNotFoundException.java
│   │   │       ├── InsufficientBalanceException.java
│   │   │       └── ...
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/      # Database scripts
│   │
│   └── test/                      # Unit & Integration Tests
│       └── java/com/yourname/budgetapp/
│           ├── service/
│           ├── repository/
│           └── ...
│
├── pom.xml / build.gradle         # Dependencies
└── README.md
```

---

## 🛠️ CÔNG NGHỆ GỢI Ý

### Backend:
- **Java Spring Boot** (Recommended)
  - Spring Data JPA
  - Spring Security
  - Spring Scheduler
  
- Hoặc **.NET Core**
  - Entity Framework Core
  - ASP.NET Core Identity
  
- Hoặc **Node.js + TypeScript**
  - NestJS framework
  - TypeORM
  - Passport.js

### Database:
- MySQL 8.0+
- Connection pooling: HikariCP

### Others:
- JWT for authentication
- Apache POI / EPPlus for Excel export
- iText / PDFKit for PDF export
- OpenAI API / Claude API for AI chatbot
- Firebase Cloud Messaging for notifications

---

## ✅ CHECKLIST HOÀN THÀNH

### Thiết kế:
- [x] ERD (đã có)
- [x] Use Case Diagram (đã có)
- [x] Class Diagram (đã thiết kế)
- [ ] Sequence Diagrams (đã có template, cần render)
- [ ] State Diagram (cần tự vẽ theo từng entity)

### Implementation:
- [ ] Setup project
- [ ] Implement Domain Models
- [ ] Implement Repositories
- [ ] Implement Services
- [ ] Implement Controllers
- [ ] Implement Security
- [ ] Implement Background Jobs
- [ ] Implement AI Integration
- [ ] Implement Bank Sync
- [ ] Unit Testing
- [ ] Integration Testing

### Documentation:
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] User Manual
- [ ] Technical Documentation
- [ ] Deployment Guide

---

## 💡 MẸO VÀ LƯU Ý

### 1. Về Class Diagram:
- Diagram có thể rất lớn, hãy chia thành nhiều sub-diagrams:
  - Core Domain Models
  - Service Layer
  - Repository Layer
  - Utility & Helper classes

### 2. Về SOLID:
- Đừng over-engineering
- Bắt đầu simple, refactor sau
- Chỉ áp dụng pattern khi thực sự cần

### 3. Về Implementation:
- Implement theo thứ tự: Domain → Repository → Service → Controller
- Test từng layer trước khi chuyển sang layer tiếp theo
- Sử dụng Lombok để giảm boilerplate code

### 4. Về Testing:
- Viết test cho business logic (Service layer)
- Mock dependencies
- Coverage ít nhất 70%

### 5. Về Báo cáo:
- Giải thích TẠI SAO chọn abstract class/interface
- Giải thích SOLID principles đã áp dụng
- Đưa ví dụ code minh họa

---

## 📞 HỖ TRỢ

Nếu bạn cần hỗ trợ thêm về:
- Thiết kế state diagram
- Chi tiết implementation cho một phần cụ thể
- Review code
- Tối ưu hóa performance
- ...

Hãy hỏi thêm! Chúc bạn thành công với đồ án! 🎓🚀

---

**Tác giả:** Claude Assistant  
**Ngày tạo:** 04/02/2026  
**Version:** 1.0
