  # ĐỒ ÁN TỐT NGHIỆP - ỨNG DỤNG QUẢN LÝ NGÂN SÁCH CÁ NHÂN

---

## 📚 DANH SÁCH TÀI LIỆU

### 1. **OVerview** 

## 1.1 Chủ đề:
  -  Ứng dụng quản lí ngân sách cá nhân có tích hợp chat box AI để thực hiện 1 số các tác vụ cơ bản. 

## 1.2 Công nghệ: 
  - FE: react native
  - BE: Nodejs
  - Language: typescrip
  - SQL: Mysql

## 1.3 Cấu trúc dự án chia làm 4 phần chính:
  - Docs/ -> Chứa các tài liệu hướng dẫn và giới thiệu về dự án
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

## 1.5 Cấu trúc dự án:
**Root Path:** `d:\10.Dev\1.Projects\AuBud_App`
├── 📁 .github
│   └── 📁 appmod
│       └── 📁 appcat
├── 📁 Admin
│   ├── 📁 public
│   │   └── 🖼️ vite.svg
│   ├── 📁 src
│   │   ├── 📁 Context
│   │   ├── 📁 assets
│   │   │   └── 🖼️ react.svg
│   │   ├── 📁 components
│   │   │   ├── 📁 common
│   │   │   └── 📁 transaction
│   │   ├── 📁 constants
│   │   ├── 📁 hooks
│   │   ├── 📁 model
│   │   ├── 📁 pages
│   │   │   ├── 📁 auth
│   │   │   ├── 📁 budget
│   │   │   ├── 📁 dashboard
│   │   │   ├── 📁 group
│   │   │   ├── 📁 transaction
│   │   │   └── 📁 wallet
│   │   ├── 📁 router
│   │   ├── 📁 services
│   │   │   ├── 📁 api
│   │   │   └── 📁 store
│   │   ├── 📁 styles
│   │   │   ├── 🎨 App.css
│   │   │   └── 🎨 index.css
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
|  
├── 📁 Client
│   ├── 📁 .expo
│   │   ├── 📝 README.md
│   │   └── ⚙️ devices.json
│   ├── 📁 src
│   │   ├── 📁 app
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 forgotPassworsScreen.tsx
│   │   │   │   ├── 📄 login.tsx
│   │   │   │   ├── 📄 resetPasswordScreen.tsx
│   │   │   │   ├── 📄 signUpPage.tsx
│   │   │   │   └── 📄 verifyOTPScreen.tsx
│   │   │   ├── 📁 tabs
│   │   │   │   ├── 📁 detailStack
│   │   │   │   │   ├── 📄 HistoryScreen.tsx
│   │   │   │   │   ├── 📄 addTransaction.tsx
│   │   │   │   │   ├── 📄 allCategory.tsx
│   │   │   │   │   └── 📄 groupScreen.tsx
│   │   │   │   ├── 📄 AnalysisScreen.tsx
│   │   │   │   ├── 📄 BudgetScreen.tsx
│   │   │   │   ├── 📄 HomeScreen.tsx
│   │   │   │   ├── 📄 MoreScreen.tsx
│   │   │   │   ├── 📄 WalletScreen.tsx
│   │   │   │   └── 📄 chatAI.tsx
│   │   │   └── 📄 CustomSplashScreen.tsx
│   │   ├── 📁 assets
│   │   │   ├── 📁 images
│   │   │   │   ├── 🖼️ _ seriousLogo.png
│   │   │   │   ├── 🖼️ _happyLogo.png
│   │   │   │   ├── 🖼️ _logo.png
│   │   │   │   ├── 🖼️ _sabLogo.png
│   │   │   │   └── 🖼️ welcome.png
│   │   │   └── 📁 styles
│   │   │       ├── 📄 addTransactionStyle.ts
│   │   │       ├── 📄 analysisStyle.ts
│   │   │       ├── 📄 authStyle.tsx
│   │   │       ├── 📄 calenderStyle.ts
│   │   │       ├── 📄 historyStyle.ts
│   │   │       ├── 📄 homeStyle.tsx
│   │   │       ├── 📄 modalStyle.tsx
│   │   │       ├── 📄 monthGridStyle.ts
│   │   │       ├── 📄 splashStyle.tsx
│   │   │       ├── 📄 typeDebts.ts
│   │   │       ├── 📄 walletStyle.ts
│   │   │       └── 📄 yearListStyle.ts
│   │   ├── 📁 components
│   │   │   ├── 📄 barChartTransaction.tsx
│   │   │   ├── 📄 calendar.tsx
│   │   │   ├── 📄 customModal.tsx
│   │   │   ├── 📄 floatAddBtn.tsx
│   │   │   ├── 📄 horizontalBarChart.tsx
│   │   │   ├── 📄 monthGrid.tsx
│   │   │   ├── 📄 pieChart.tsx
│   │   │   ├── 📄 transaction.tsx
│   │   │   ├── 📄 typeDebts.tsx
│   │   │   └── 📄 yearList.tsx
│   │   ├── 📁 constants
│   │   │   └── 📄 theme.ts
│   │   ├── 📁 hooks
│   │   │   └── 📄 useProvider.tsx
│   │   ├── 📁 models
│   │   │   ├── 📁 types
│   │   │   │   ├── 📄 RootStackParamList.ts
│   │   │   │   └── 📄 appContext.ts
│   │   │   └── 📄 IApp.ts
│   │   ├── 📁 navigation
│   │   │   ├── 📄 _layout.tsx
│   │   │   ├── 📄 _layoutAuth.tsx
│   │   │   ├── 📄 _layoutDetailStack.tsx
│   │   │   └── 📄 _layoutTabs.tsx
│   │   ├── 📁 services
│   │   ├── 📁 store
│   │   │   ├── 📁 context
│   │   │   ├── 📁 local
│   │   │   └── 📁 seed
│   │   │       ├── 📄 budget.ts
│   │   │       ├── 📄 category.ts
│   │   │       ├── 📄 debt.ts
│   │   │       ├── 📄 groupFunds.ts
│   │   │       ├── 📄 saving.ts
│   │   │       ├── 📄 statistics.ts
│   │   │       ├── 📄 transaction.ts
│   │   │       └── 📄 wallets.ts
│   │   └── 📁 utils
│   │       ├── 📄 format.ts
│   │       ├── 📄 generateSectionList .ts
│   │       └── 📄 helper.ts
│   ├── ⚙️ .gitignore
│   ├── 📄 App.tsx
│   ├── ⚙️ app.json
│   ├── 📄 index.ts
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   └── ⚙️ tsconfig.json
|
├── 📁 Docs
│   ├── 📝 README.md
│   ├── 📝 abstract_interface_concrete_guide.md
│   ├── 📄 class_diagram.puml
│   ├── 📝 class_diagram_design.md
│   ├── 📝 sequence_diagrams.md
│   └── 📝 tutorial.md
|
└── 📁 Server
    ├── 📁 src
    │   ├── 📁 config
    │   ├── 📁 data
    │   │   ├── 📁 datasources
    │   │   │   ├── 📁 local
    │   │   │   └── 📁 remote
    │   │   ├── 📁 models
    │   │   └── 📁 repositories
    │   ├── 📁 domain
    │   │   ├── 📁 abstracts
    │   │   ├── 📁 entities
    │   │   ├── 📁 enums
    │   │   └── 📁 interfaces
    │   ├── 📁 middlewares
    │   ├── 📁 routes
    │   ├── 📁 services
    │   └── 📁 utils
    │       ├── 📁 factories
    │       ├── 📁 helpers
    │       └── 📁 strategies
    │           ├── 📁 export
    │           └── 📁 report
    ├── ⚙️ .gitignore
    ├── ⚙️ package-lock.json
    ├── ⚙️ package.json
    ├── 📄 server.ts
    └── ⚙️ tsconfig.json
---


**Tác giả:** Van Truyen
**Ngày tạo:** 02/024/2026  
**Version:** 1.0
