# THIẾT KẾ CLASS DIAGRAM - ỨNG DỤNG QUẢN LÝ NGÂN SÁCH CÁ NHÂN

## I. NGUYÊN TẮC THIẾT KẾ

### 1. SOLID Principles đã áp dụng:

#### S - Single Responsibility Principle (SRP)
- Mỗi class chỉ có một trách nhiệm duy nhất
- Ví dụ: `TransactionService` chỉ xử lý logic giao dịch, `NotificationService` chỉ xử lý thông báo

#### O - Open/Closed Principle (OCP)
- Sử dụng abstract class và interface để mở rộng mà không sửa đổi code hiện có
- Ví dụ: `AbstractTransaction` cho phép mở rộng các loại giao dịch khác nhau

#### L - Liskov Substitution Principle (LSP)
- Các class con có thể thay thế class cha mà không làm hỏng chương trình
- Ví dụ: `PersonalTransaction` và `GroupTransaction` đều có thể thay thế `AbstractTransaction`

#### I - Interface Segregation Principle (ISP)
- Tách interface thành các interface nhỏ, chuyên biệt
- Ví dụ: `IAuthenticatable`, `INotifiable`, `IReportable`

#### D - Dependency Inversion Principle (DIP)
- Phụ thuộc vào abstraction, không phụ thuộc vào implementation cụ thể
- Ví dụ: Service layer phụ thuộc vào Repository interface, không phụ thuộc vào implementation cụ thể

### 2. Design Patterns áp dụng:

- **Repository Pattern**: Tách logic truy cập dữ liệu
- **Service Layer Pattern**: Tách business logic
- **Factory Pattern**: Tạo objects (TransactionFactory, NotificationFactory)
- **Strategy Pattern**: Xử lý các chiến lược khác nhau (ReportStrategy, ExportStrategy)
- **Observer Pattern**: Notification system
- **Singleton Pattern**: DatabaseConnection, ConfigManager

## II. KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────┐
│     PRESENTATION LAYER              │
│  (Controllers/API Endpoints)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     SERVICE LAYER                   │
│  (Business Logic)                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     REPOSITORY LAYER                │
│  (Data Access)                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     DOMAIN MODELS                   │
│  (Entities)                         │
└─────────────────────────────────────┘
```

## III. CHI TIẾT CÁC LAYER

### A. DOMAIN MODELS (Entities)

#### 1. **User** (Concrete Class)
```
- Lý do là concrete class: Đại diện cho thực thể người dùng cụ thể
- Thuộc tính: id, email, phone, userName, createdAt
- Methods: getters, setters, validate()
```

#### 2. **Account** (Concrete Class)
```
- Implements: IAuthenticatable
- Thuộc tính: id, email, phone, password, role, status, verified, lastLogin, accessedToday
- Methods: authenticate(), changePassword(), verifyAccount()
```

#### 3. **AbstractWallet** (Abstract Class)
```
- Lý do là abstract: Có thể có nhiều loại ví khác nhau (PersonalWallet, GroupFund)
- Abstract methods: deposit(), withdraw(), getBalance()
- Concrete methods: validateAmount(), updateBalance()
```

#### 4. **PersonalWallet extends AbstractWallet**
```
- Thuộc tính: id, name, balance, userId, status, createdAt
- Implements abstract methods
```

#### 5. **GroupFund extends AbstractWallet**
```
- Thuộc tính: id, name, balance, groupId, createdBy
- Implements abstract methods với logic phù hợp cho nhóm
```

#### 6. **AbstractTransaction** (Abstract Class)
```
- Lý do là abstract: Có nhiều loại giao dịch (cá nhân, nhóm)
- Abstract methods: execute(), validate()
- Concrete methods: calculateBalance(), addNote()
```

#### 7. **PersonalTransaction extends AbstractTransaction**
```
- Thuộc tính: id, amount, type, userId, walletId, categoryDetailId, createdAt, note
```

#### 8. **GroupTransaction extends AbstractTransaction**
```
- Thuộc tính: id, amount, type, userId, groupFundId, categoryDetailId, groupId, note
```

#### 9. **Category** (Concrete Class)
```
- Thuộc tính: id, name, type, userId, usageCount, lastUsedAt
- Methods: incrementUsage(), updateLastUsed()
```

#### 10. **CategoryDetail** (Concrete Class)
```
- Thuộc tính: id, name, categoryId, userCount
```

#### 11. **Budget** (Concrete Class)
```
- Implements: IMonitorable
- Thuộc tính: id, userId, categoryId, balance, remaining, yearMonth, status
- Methods: checkThreshold(), updateRemaining(), alert()
```

#### 12. **LoanDebt** (Concrete Class)
```
- Thuộc tính: id, userId, amount, type, toOther, remaining, createdAt, note
- Methods: makePayment(), calculateRemaining()
```

#### 13. **SavingsBook** (Concrete Class)
```
- Thuộc tính: id, userId, balance, name, createdAt, lastAccess
- Methods: addSavings(), withdrawSavings()
```

#### 14. **SavingsHistory** (Concrete Class)
```
- Thuộc tính: id, userId, walletId, amount, type, savingsBookId, createdAt, note
```

#### 15. **Group** (Concrete Class)
```
- Thuộc tính: id, name, createdAt, status
- Methods: addMember(), removeMember(), checkPermission()
```

### B. INTERFACES

#### 1. **IAuthenticatable**
```java
interface IAuthenticatable {
    boolean authenticate(String credential);
    void logout();
    boolean isAuthenticated();
}
```
- Lý do: Tách riêng chức năng authentication, có thể áp dụng cho nhiều đối tượng khác nhau

#### 2. **INotifiable**
```java
interface INotifiable {
    void sendNotification(Notification notification);
    List<Notification> getNotifications();
    void markAsRead(int notificationId);
}
```
- Lý do: User và Group đều có thể nhận thông báo

#### 3. **IReportable**
```java
interface IReportable {
    Report generateReport(DateRange dateRange);
    Chart generateChart(ChartType type, DateRange dateRange);
}
```
- Lý do: Nhiều entities cần tạo báo cáo (Transaction, Budget, Wallet)

#### 4. **IExportable**
```java
interface IExportable {
    byte[] exportToExcel();
    byte[] exportToPDF();
}
```
- Lý do: Nhiều dữ liệu cần export (Transaction, Report, Budget)

#### 5. **IRepository<T>** (Generic Interface)
```java
interface IRepository<T> {
    T findById(int id);
    List<T> findAll();
    T save(T entity);
    void delete(int id);
    T update(T entity);
}
```
- Lý do: Pattern chuẩn cho data access layer

#### 6. **IMonitorable**
```java
interface IMonitorable {
    boolean checkThreshold();
    void triggerAlert();
    MonitorStatus getStatus();
}
```
- Lý do: Budget, Wallet cần được monitor để cảnh báo

### C. REPOSITORY LAYER

Mỗi entity sẽ có một Repository interface kế thừa từ IRepository:

```java
interface IUserRepository extends IRepository<User> {
    User findByEmail(String email);
    User findByPhone(String phone);
}

interface ITransactionRepository extends IRepository<AbstractTransaction> {
    List<AbstractTransaction> findByUserId(int userId);
    List<AbstractTransaction> findByDateRange(DateRange range);
    List<AbstractTransaction> findByWalletId(int walletId);
}

interface IWalletRepository extends IRepository<AbstractWallet> {
    List<AbstractWallet> findByUserId(int userId);
    AbstractWallet findByUserIdAndName(int userId, String name);
}

// Tương tự cho các entities khác...
```

### D. SERVICE LAYER

#### 1. **AuthenticationService**
```java
class AuthenticationService {
    - IUserRepository userRepository
    - IAccountRepository accountRepository
    - TokenService tokenService
    
    + login(email, password): AuthResult
    + register(userInfo): User
    + forgotPassword(email): void
    + resetPassword(token, newPassword): void
    + logout(token): void
}
```

#### 2. **TransactionService**
```java
class TransactionService {
    - ITransactionRepository transactionRepository
    - IWalletRepository walletRepository
    - BudgetService budgetService
    - NotificationService notificationService
    
    + createTransaction(transactionData): AbstractTransaction
    + updateTransaction(id, data): AbstractTransaction
    + deleteTransaction(id): void
    + getTransactionHistory(userId, filters): List<AbstractTransaction>
    + syncBankTransaction(bankData): void
}
```

#### 3. **WalletService**
```java
class WalletService {
    - IWalletRepository walletRepository
    - NotificationService notificationService
    
    + createWallet(walletData): AbstractWallet
    + updateWallet(id, data): AbstractWallet
    + deleteWallet(id): void
    + getWalletsByUser(userId): List<AbstractWallet>
    + transferBetweenWallets(fromId, toId, amount): void
    + requestBalanceUpdate(userId): void
}
```

#### 4. **BudgetService**
```java
class BudgetService {
    - IBudgetRepository budgetRepository
    - ITransactionRepository transactionRepository
    - NotificationService notificationService
    
    + createBudget(budgetData): Budget
    + updateBudget(id, data): Budget
    + checkBudgetStatus(budgetId): BudgetStatus
    + monitorBudgets(): void  // Background job
    + getBudgetReport(userId, month): Report
}
```

#### 5. **ReportService**
```java
class ReportService {
    - ITransactionRepository transactionRepository
    - IWalletRepository walletRepository
    - IBudgetRepository budgetRepository
    - IReportStrategy reportStrategy
    
    + generateReport(type, filters): Report
    + generateChart(chartType, filters): Chart
    + setReportStrategy(strategy): void
}
```

#### 6. **NotificationService**
```java
class NotificationService implements IObserver {
    - INotificationRepository notificationRepository
    - NotificationFactory notificationFactory
    - List<INotifiable> subscribers
    
    + sendNotification(userId, content): void
    + sendBulkNotification(userIds, content): void
    + scheduleNotification(userId, content, time): void
    + update(event): void  // Observer pattern
}
```

#### 7. **GroupService**
```java
class GroupService {
    - IGroupRepository groupRepository
    - IMemberGroupRepository memberRepository
    - IGroupFundRepository fundRepository
    
    + createGroup(groupData): Group
    + addMember(groupId, userId, role): void
    + removeMember(groupId, userId): void
    + createGroupFund(fundData): GroupFund
    + checkPermission(groupId, userId, action): boolean
}
```

#### 8. **AIAssistantService**
```java
class AIAssistantService {
    - ITransactionRepository transactionRepository
    - IWalletRepository walletRepository
    - IBudgetRepository budgetRepository
    - AIClient aiClient
    
    + queryFinancialData(userId, query): String
    + getSuggestions(userId): List<Suggestion>
    + analyzeBehavior(userId): AnalysisResult
}
```

#### 9. **ExportService**
```java
class ExportService {
    - IExportStrategy exportStrategy
    
    + exportToExcel(data): byte[]
    + exportToPDF(data): byte[]
    + setExportStrategy(strategy): void
}
```

#### 10. **MarketDataService**
```java
class MarketDataService {
    - IGoalPriceRepository goalPriceRepository
    - IForeignCurrencyRepository currencyRepository
    - ExternalAPIClient apiClient
    
    + getRealEstatePrice(): List<GoalPrice>
    + getCryptoPrice(): List<GoalPrice>
    + getExchangeRate(currency): ForeignCurrency
    + updateMarketData(): void  // Background job
}
```

#### 11. **AdminService**
```java
class AdminService {
    - IUserRepository userRepository
    - ILogRepository logRepository
    - ITrafficRepository trafficRepository
    
    + getUserList(filters): List<User>
    + getUserDetail(userId): UserDetail
    + manageUser(userId, action): void
    + getTrafficStatistics(dateRange): TrafficStats
    + getLogs(filters): List<Log>
}
```

### E. UTILITY CLASSES

#### 1. **TransactionFactory** (Factory Pattern)
```java
class TransactionFactory {
    + static createTransaction(type): AbstractTransaction
}
```

#### 2. **NotificationFactory**
```java
class NotificationFactory {
    + static createNotification(type, data): Notification
}
```

#### 3. **ReportStrategy** (Strategy Pattern)
```java
interface IReportStrategy {
    Report generate(data, filters);
}

class DailyReportStrategy implements IReportStrategy
class WeeklyReportStrategy implements IReportStrategy
class MonthlyReportStrategy implements IReportStrategy
class YearlyReportStrategy implements IReportStrategy
class CategoryReportStrategy implements IReportStrategy
```

#### 4. **ExportStrategy** (Strategy Pattern)
```java
interface IExportStrategy {
    byte[] export(data);
}

class ExcelExportStrategy implements IExportStrategy
class PDFExportStrategy implements IExportStrategy
```

#### 5. **ValidationHelper**
```java
class ValidationHelper {
    + static validateEmail(email): boolean
    + static validatePhone(phone): boolean
    + static validateAmount(amount): boolean
    + static validateDate(date): boolean
}
```

#### 6. **EncryptionHelper**
```java
class EncryptionHelper {
    + static hashPassword(password): String
    + static verifyPassword(password, hash): boolean
    + static generateToken(): String
}
```

#### 7. **DateTimeHelper**
```java
class DateTimeHelper {
    + static getCurrentDateTime(): DateTime
    + static formatDate(date, format): String
    + static calculateDateRange(type): DateRange
}
```

### F. BACKGROUND JOBS / SCHEDULERS

#### 1. **NotificationScheduler**
```java
class NotificationScheduler {
    - NotificationService notificationService
    - IUserRepository userRepository
    
    + checkInactiveUsers(): void
    + checkBudgetThresholds(): void
    + sendDailyReminders(): void
    + sendMonthlyPlanningReminder(): void
}
```

#### 2. **DataSyncScheduler**
```java
class DataSyncScheduler {
    - TransactionService transactionService
    - MarketDataService marketDataService
    
    + syncBankTransactions(): void
    + updateMarketData(): void
}
```

## IV. QUAN HỆ GIỮA CÁC CLASS

### Inheritance (Kế thừa):
- `PersonalWallet` extends `AbstractWallet`
- `GroupFund` extends `AbstractWallet`
- `PersonalTransaction` extends `AbstractTransaction`
- `GroupTransaction` extends `AbstractTransaction`

### Implementation (Thực thi interface):
- `Account` implements `IAuthenticatable`
- `User` implements `INotifiable`
- `Budget` implements `IMonitorable`
- Các Repository classes implement `IRepository<T>`
- Các Strategy classes implement tương ứng `IReportStrategy`, `IExportStrategy`

### Composition (Has-a):
- `User` has many `Wallet`
- `User` has many `Transaction`
- `User` has many `Budget`
- `Group` has many `Member`
- `Group` has many `GroupFund`
- Service classes có Repository dependencies

### Dependency:
- Services phụ thuộc vào Repositories (DIP)
- Services phụ thuộc vào các Services khác
- Controllers phụ thuộc vào Services

## V. LƯU Ý KHI IMPLEMENT

### 1. Khi nào dùng Abstract Class:
- Khi có implementation chung cần chia sẻ giữa các subclass
- Khi có quan hệ "is-a" rõ ràng
- VD: `AbstractTransaction`, `AbstractWallet`

### 2. Khi nào dùng Interface:
- Khi chỉ định nghĩa contract mà không có implementation
- Khi cần multiple implementation khác nhau
- Khi áp dụng ISP (Interface Segregation)
- VD: `IAuthenticatable`, `INotifiable`, `IReportable`

### 3. Khi nào dùng Concrete Class:
- Khi class đại diện cho thực thể cụ thể
- Không cần extend hay polymorphism
- VD: `User`, `Category`, `Budget`

### 4. Best Practices:
- Luôn program to interface, not implementation
- Sử dụng Dependency Injection
- Mỗi class có single responsibility
- Tách biệt concerns (presentation, business, data)
- Validate dữ liệu ở nhiều layer

## VI. TECH STACK GỢI Ý

- **Backend**: Java Spring Boot / .NET Core / Node.js (TypeScript)
- **Database**: MySQL (như đã thiết kế)
- **ORM**: Hibernate / Entity Framework / TypeORM
- **AI Integration**: OpenAI API / Anthropic Claude API
- **Bank Integration**: OpenBanking API
- **Notification**: Firebase Cloud Messaging
- **Background Jobs**: Quartz / Hangfire / Bull
- **Export**: Apache POI (Excel) / iText (PDF)

## VII. DIAGRAM CODE (PlantUML)

Tôi sẽ tạo file PlantUML riêng để bạn có thể visualize class diagram.
