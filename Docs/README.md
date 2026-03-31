  # ĐỒ ÁN TỐT NGHIỆP - ỨNG DỤNG QUẢN LÝ NGÂN SÁCH CÁ NHÂN

---

## 📚 DANH SÁCH TÀI LIỆU

### 1. **OVerview** 

## 1.1 Chủ đề:
  -  Ứng dụng quản lí ngân sách cá nhân có tích hợp chat box AI để thực hiện 1 số các tác vụ cơ bản. 

## 1.2 Công nghệ: 
  - FE: react native, reactjs
  - BE: Nodejs express
  - Language: typescrip
  - SQL: Mysql

## 1.3 Cấu trúc dự án chia làm 4 phần chính:
  - Client/ -> Cấu trúc code giao diện ứng dụng người dùng
  - Server/ -> Logic backend sử lý yêu cầu người dùng và kết nối db
  - Admin/ -> Cấu trúc cdoe giao diện admin dashboard của người quản lí hệ thống thống

## 1.4 Các chức năng của ứng dụng:
  ### Client:
  - Ứng dụng quản lý tài chính cá nhân cho phép người dùng đăng ký, đăng nhập tài khoản bằng email và mật khẩu, đồng thời hỗ trợ chức năng quên mật khẩu để người dùng khôi phục tài khoản khi cần thiết. Hệ thống áp dụng cơ chế xác thực và phân quyền người dùng, đảm bảo mỗi người chỉ có thể truy cập vào dữ liệu cá nhân hoặc dữ liệu nhóm được cấp quyền.
  - Người dùng có thể tạo và quản lý nhiều ví tài chính khác nhau như tiền mặt, tài khoản ngân hàng hoặc ví điện tử. Mỗi ví có số dư và lịch sử giao dịch riêng, giúp người dùng theo dõi tài chính một cách rõ ràng.
  - Ứng dụng cho phép người dùng nhập và theo dõi các khoản thu nhập và chi tiêu theo từng danh mục. Người dùng có thể xem lịch sử giao dịch, lọc theo thời gian và nhận cảnh báo khi số dư gần chạm hoặc vượt hạn mức đã thiết lập.
  - Hệ thống cung cấp biểu đồ và báo cáo thống kê chi tiêu theo các mốc thời gian như ngày, tuần, tháng và năm, thống kêu theo category, thống kê chi tiêu của từng vi
  - Ngoài ra, ứng dụng hỗ trợ quản lý các khoản nợ, vay và mục tiêu tiết kiệm theo tháng. Người dùng có thể thiết lập kế hoạch chi tiêu, bao gồm mức chi-thu dự kiến và số tiền cần tiết kiệm mỗi tháng, và theo dõi tiến độ thực hiện theo thời gian.
  - Ứng dụng tích hợp chatbox AI hỗ trợ tài chính, cho phép người dùng truy vấn thông tin chi tiêu và nhận gợi ý kế hoạch tài chính dựa trên số dư và lịch sử giao dịch. 
  - Hệ thống có tính năng tạo nhóm tài chính cho gia đình hoặc bạn bè. Người dùng có thể tạo quỹ chung, lập kế hoạch và chi tiêu chung trong nhóm. Hệ thống phân quyền rõ ràng giữa chủ nhóm và thành viên để đảm bảo minh bạch và an toàn dữ liệu.
  - xuất Dữ liệu thành file excel
  -cung cấp tóm tắt các xu hướng đầu tư theo thời gian thực, như giá nhà đất, tiền điện tử, trao đổi ngoại tệ
  - liên kết với các ngân hàng để tự động nhập các giao dịch vào app khi giao dịch trên ngân hàng
  - tự động gởi thông báo cho người dùng nếu người dùng đăng nhập trên thiết bị khác, hôm nay chưa nhập giao dịch nào, nhắc nhở người dùng chi tiêu vượt quá ngân sách, đã nhiều ngày chưa truy cập vào app để nhập, lập ngân sách cho tháng mới, lên kế hoạch chi tiêu. 
  - nếu người dùng không đăng nhập trong vòng hơn 1 ngày, app sẽ yêu cầu người dùng nhập lại số dư mới để đảm bảo số dư trong app luôn bằng với số dư thực tế (vì người dùng có thể đã thu-chi mà không nhập vào app)
  ### Admin:
  - Hệ thống được tích hợp cơ chế ghi log  để theo dõi và lưu lại các hoạt động quan trọng của người dùng như đăng nhập, đăng nhập thất bại, khôi phục mật khẩu .
  - Hiển thị lưu lượng truy cập trong ngày, những ngày trong tháng, hàng tháng, 
  - Quản lí tài khoản người dùng.
  - Xem đánh giá người dùng
  - Gởi thông báo cho người dùng thông qua email, in-app push.

## 1.5 Cấu trúc dự án:
```
├── 📁 .github
│   └── 📁 appmod
│       └── 📁 appcat
├── 📁 Admin
│   ├── 📁 public
│   ├── 📁 src
│   │   ├── 📁 Context
│   │   ├── 📁 application
│   │   ├── 📁 assets
│   │   │   ├── 📁 image
│   │   │   ├── 📁 styles
│   │   │   └── 🖼️ react.svg
│   │   ├── 📁 components
│   │   ├── 📁 constants
│   │   ├── 📁 hooks
│   │   ├── 📁 model
│   │   │   ├── 📁 DTO
│   │   │   └── 📁 type
│   │   ├── 📁 pages
│   │   │   ├── 📁 auth
│   │   ├── 📁 router
│   │   ├── 📁 services
│   │   │   ├── 📁 auth
│   │   │   ├── 📁 mock
│   │   │   └── 📁 serviceImplement
│   │   ├── 📁 utils
│   │   │   ├── 📁 configs
│   │   │   └── 📁 helpers
│   │   ├── 📄 App.tsx
│   │   └── 📄 main.tsx
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 eslint.config.js
│   ├── 🌐 index.html
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── ⚙️ tsconfig.app.json
│   ├── ⚙️ tsconfig.json
│   ├── ⚙️ tsconfig.node.json
│   └── 📄 vite.config.ts
├── 📁 Client
│   ├── 📁 .expo
│   │   ├── 📝 README.md
│   │   └── ⚙️ devices.json
│   ├── 📁 src
│   │   ├── 📁 app
│   │   │   ├── 📁 auth
│   │   │   ├── 📁 tabs
│   │   │   │   ├── 📁 detailStack
│   │   │   └── 📄 CustomSplashScreen.tsx
│   │   ├── 📁 assets
│   │   │   ├── 📁 images
│   │   │   └── 📁 styles
│   │   ├── 📁 components
│   │   ├── 📁 constants
│   │   ├── 📁 hooks
│   │   ├── 📁 models
│   │   │   ├── 📁 interface
│   │   │   ├── 📁 types
│   │   │   └── 📄 IApp.ts
│   │   ├── 📁 navigation
│   │   ├── 📁 services
│   │   │   ├── 📁 ServiceImplement
│   │   │   ├── 📁 auth
│   │   ├── 📁 store
│   │   │   ├── 📁 application
│   │   │   └── 📁 seed
│   │   └── 📁 utils
│   ├── ⚙️ .gitignore
│   ├── 📄 App.tsx
│   ├── ⚙️ app.json
│   ├── 📄 index.ts
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   └── ⚙️ tsconfig.json
└── 📁 Server
    ├── 📁 .expo
    │   ├── 📝 README.md
    │   └── ⚙️ settings.json
    ├── 📁 src
    │   ├── 📁 chat
    │   ├── 📁 config
    │   ├── 📁 controllers
    │   │   ├── 📁 admin
    │   │   └── 📁 user
    │   ├── 📁 data
    │   │   ├── 📁 DTO
    │   │   ├── 📁 local
    │   │   └── 📁 repositories
    │   │       ├── 📁 Wallet
    │   │       ├── 📁 admin
    │   │       ├── 📁 auth
    │   ├── 📁 domain
    │   │   ├── 📁 abstracts
    │   │   ├── 📁 entities
    │   │   ├── 📁 enums
    │   │   └── 📁 models
    │   │       ├── 📁 application
    │   │       │   ├── 📁 interface
    │   │       │   └── 📁 repository
    │   │       └── 📁 auth
    │   ├── 📁 middlewares
    │   ├── 📁 routes
    │   ├── 📁 services
    │   │   ├── 📁 adminService
    │   │   ├── 📁 applicationService
    │   │   ├── 📁 chatService
    │   └── 📁 utils
    │       ├── 📁 factories
    │       ├── 📁 helpers
    │       └── 📁 strategies
    ├── ⚙️ .gitignore
    ├── ⚙️ package-lock.json
    ├── ⚙️ package.json
    ├── 📄 server.ts
    └── ⚙️ tsconfig.json
```

## 1.6 Run project
  ### Dowload project:
    ```git clone https://github.com/truyennv123/AuBud_Proj.git```
  ### Run mobile app
    - Dowload "Expo Go" app on CHplay or AppStore
    - Navigate to Client folder
    ``` cd Client ```
    - Dowload dependences:
    ```npm i```
    - Run
    ```npx expo start```
    -Open camera on your phone and scan Qr
  ### Run Server
    - Back to root folder
    ``` cd ..``
    - Navigate to Server folder
    ``` cd Server ```
    - Dowload dependences:
    ```npm i```

    # Config redis
    - Dowload docker
    - Create file redis-docker.yml
    - Paste content:
    ```
    version: '3.8'
    services:
      redis:
        image: redis:latest
        container_name: redis-server
        restart: always
        ports:
          - "6379:6379"
        volumes:
          - redis_data:/data
        command: ["redis-server", "--appendonly", "yes", "--requirepass", "root"]

    volumes:
    redis_data:
    ```
    - Open terminal in folder contain redis-docker.yml file
    - Run
    ``` docker compose -f redis-docker.yml -p redis-aubud-proj up -d```
    - Open docker destop
    - Run redis-aubud-proj container

    # Config database
      ## Run with docker destop
        - Create file init.sql
        - Paste sql code in file sql.md to create db
        - Create aubud.yml
        - Paste:
        ```
        version: '3.8'  

        services:
          db-mysql:
            image: mysql:8.4.8
            container_name: aubud-mysql
            restart: always
            environment:
              MYSQL_DATABASE: aubud_proj  # Không dùng dấu gạch ngang
              MYSQL_ROOT_PASSWORD: root
            ports:
              - "3307:3306"
            volumes:
              - mysql_data:/var/lib/mysql  # Lưu data persistent
              - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Tự động chạy SQL khi khởi tạo

        volumes:
          mysql_data:
        ```
        - Run
        ```docker compose -f aubud.yml -p aubud-sql up -d```
        - Open docker destop
        - Run aubud-sql container
        
      ## Run without docker destop
        - Paste sql code in file sql.md
        - Open mysql workbench
        - Paste sql code in file sql.md to create db
        - In ./Server/.env, update DB_PORT from 3307 to 3306
      
      ##Final
        - Open 2 bash terminal, run 
        ```npm run dev and ngrok http 8080 ```
  ### Run Admin dashboard web
    - Back to root folder
    ``` cd ..```
    - Navigate to Admin folder
    ``` cd Admin ```
    - Dowload dependences:
    ```npm i```
    - Run
    ```npm run dev```

  


**Tác giả:** Van Truyen
**Ngày tạo:** 02/02/2026  
**Version:** 1.0
