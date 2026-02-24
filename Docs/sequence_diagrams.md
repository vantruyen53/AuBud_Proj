# SEQUENCE DIAGRAMS - USE CASES QUAN TRỌNG

## 1. USER AUTHENTICATION (Đăng nhập)

```plantuml
@startuml Login_Sequence
actor User
participant "UI/Controller" as UI
participant AuthenticationService
participant IAccountRepository
participant EncryptionHelper
participant TokenService
database Database

User -> UI: Nhập email & password
UI -> AuthenticationService: login(email, password)
activate AuthenticationService

AuthenticationService -> IAccountRepository: findByEmail(email)
activate IAccountRepository
IAccountRepository -> Database: SELECT * FROM account WHERE email = ?
Database --> IAccountRepository: Account data
IAccountRepository --> AuthenticationService: Account
deactivate IAccountRepository

AuthenticationService -> EncryptionHelper: verifyPassword(password, account.passwordHash)
activate EncryptionHelper
EncryptionHelper --> AuthenticationService: boolean (true/false)
deactivate EncryptionHelper

alt Password đúng
    AuthenticationService -> TokenService: generateToken(account)
    activate TokenService
    TokenService -> Database: INSERT INTO token (hash, user_id, expires_at)
    TokenService --> AuthenticationService: Token
    deactivate TokenService
    
    AuthenticationService -> IAccountRepository: updateLastLogin(accountId)
    IAccountRepository -> Database: UPDATE account SET last_login = NOW()
    
    AuthenticationService -> NotificationService: sendLoginAlert(userId, deviceInfo)
    
    AuthenticationService --> UI: AuthResult(success, token, user)
    UI --> User: Đăng nhập thành công
else Password sai
    AuthenticationService -> LogService: logFailedLogin(email, ipAddress)
    AuthenticationService --> UI: AuthResult(failed, error)
    UI --> User: Sai email hoặc mật khẩu
end

deactivate AuthenticationService
@enduml
```

## 2. CREATE TRANSACTION (Tạo giao dịch)

```plantuml
@startuml CreateTransaction_Sequence
actor User
participant "UI/Controller" as UI
participant TransactionService
participant TransactionFactory
participant ITransactionRepository
participant IWalletRepository
participant BudgetService
participant NotificationService
database Database

User -> UI: Nhập thông tin giao dịch
UI -> TransactionService: createTransaction(transactionData)
activate TransactionService

TransactionService -> TransactionFactory: createTransaction(type)
activate TransactionFactory
TransactionFactory --> TransactionService: PersonalTransaction instance
deactivate TransactionFactory

TransactionService -> PersonalTransaction: validate()
activate PersonalTransaction
PersonalTransaction --> TransactionService: boolean (valid)
deactivate PersonalTransaction

alt Transaction hợp lệ
    TransactionService -> IWalletRepository: findById(walletId)
    activate IWalletRepository
    IWalletRepository -> Database: SELECT * FROM wallet WHERE id = ?
    Database --> IWalletRepository: Wallet data
    IWalletRepository --> TransactionService: PersonalWallet
    deactivate IWalletRepository
    
    alt Đủ số dư (nếu là chi tiêu)
        TransactionService -> PersonalTransaction: execute()
        activate PersonalTransaction
        PersonalTransaction -> PersonalWallet: withdraw(amount)
        activate PersonalWallet
        PersonalWallet -> PersonalWallet: updateBalance(-amount)
        PersonalWallet -> Database: UPDATE wallet SET balance = ?
        PersonalWallet --> PersonalTransaction: Success
        deactivate PersonalWallet
        deactivate PersonalTransaction
        
        TransactionService -> ITransactionRepository: save(transaction)
        activate ITransactionRepository
        ITransactionRepository -> Database: INSERT INTO transaction (...)
        Database --> ITransactionRepository: Transaction ID
        ITransactionRepository --> TransactionService: PersonalTransaction (saved)
        deactivate ITransactionRepository
        
        TransactionService -> BudgetService: updateBudget(userId, categoryId, amount)
        activate BudgetService
        BudgetService -> Budget: updateRemaining(amount)
        Budget -> Budget: checkThreshold()
        
        alt Vượt ngưỡng cảnh báo
            Budget -> NotificationService: sendBudgetAlert(userId, budgetId)
        end
        
        BudgetService --> TransactionService: Updated Budget
        deactivate BudgetService
        
        TransactionService --> UI: Transaction (success)
        UI --> User: Giao dịch thành công
    else Không đủ số dư
        TransactionService --> UI: Error (insufficient balance)
        UI --> User: Số dư không đủ
    end
else Transaction không hợp lệ
    TransactionService --> UI: Validation Error
    UI --> User: Dữ liệu không hợp lệ
end

deactivate TransactionService
@enduml
```

## 3. GENERATE REPORT (Tạo báo cáo)

```plantuml
@startuml GenerateReport_Sequence
actor User
participant "UI/Controller" as UI
participant ReportService
participant ITransactionRepository
participant IWalletRepository
participant IBudgetRepository
participant "ReportStrategy" as Strategy
database Database

User -> UI: Chọn loại báo cáo & thời gian
UI -> ReportService: generateReport(type, filters)
activate ReportService

ReportService -> ReportService: setReportStrategy(type)

alt Monthly Report
    ReportService -> Strategy: MonthlyReportStrategy
else Daily Report
    ReportService -> Strategy: DailyReportStrategy
else Category Report
    ReportService -> Strategy: CategoryReportStrategy
end

activate Strategy

ReportService -> ITransactionRepository: findByDateRange(filters.dateRange)
activate ITransactionRepository
ITransactionRepository -> Database: SELECT * FROM transaction WHERE create_at BETWEEN ? AND ?
Database --> ITransactionRepository: Transaction list
ITransactionRepository --> ReportService: List<Transaction>
deactivate ITransactionRepository

ReportService -> IWalletRepository: findByUserId(userId)
activate IWalletRepository
IWalletRepository -> Database: SELECT * FROM wallet WHERE user_id = ?
Database --> IWalletRepository: Wallet list
IWalletRepository --> ReportService: List<Wallet>
deactivate IWalletRepository

ReportService -> IBudgetRepository: findByMonth(userId, filters.month)
activate IBudgetRepository
IBudgetRepository -> Database: SELECT * FROM budget WHERE user_id = ? AND year_month = ?
Database --> IBudgetRepository: Budget list
IBudgetRepository --> ReportService: List<Budget>
deactivate IBudgetRepository

ReportService -> Strategy: generate(data, filters)
Strategy -> Strategy: analyzeData()
Strategy -> Strategy: calculateStatistics()
Strategy -> Strategy: formatReport()
Strategy --> ReportService: Report

deactivate Strategy

ReportService --> UI: Report (with charts, statistics)
UI --> User: Hiển thị báo cáo

User -> UI: Click "Export to Excel"
UI -> ExportService: exportToExcel(report)
activate ExportService
ExportService -> ExcelExportStrategy: export(report)
activate ExcelExportStrategy
ExcelExportStrategy -> ExcelExportStrategy: createWorkbook()
ExcelExportStrategy -> ExcelExportStrategy: formatData()
ExcelExportStrategy --> ExportService: byte[] (Excel file)
deactivate ExcelExportStrategy
ExportService --> UI: Excel file
deactivate ExportService
UI --> User: Download Excel file

deactivate ReportService
@enduml
```

## 4. BUDGET MONITORING (Giám sát ngân sách - Background Job)

```plantuml
@startuml BudgetMonitoring_Sequence
participant NotificationScheduler
participant BudgetService
participant IBudgetRepository
participant NotificationService
participant IUserRepository
database Database

activate NotificationScheduler
NotificationScheduler -> NotificationScheduler: Scheduled job runs (every hour)

NotificationScheduler -> BudgetService: monitorBudgets()
activate BudgetService

BudgetService -> IBudgetRepository: findAll()
activate IBudgetRepository
IBudgetRepository -> Database: SELECT * FROM budget WHERE status = 'ACTIVE'
Database --> IBudgetRepository: Budget list
IBudgetRepository --> BudgetService: List<Budget>
deactivate IBudgetRepository

loop For each Budget
    BudgetService -> Budget: checkThreshold()
    activate Budget
    
    alt Remaining < 20% of balance
        Budget -> Budget: triggerAlert()
        Budget -> NotificationService: sendBudgetAlert(userId, budgetId, "LOW")
        activate NotificationService
        NotificationService -> Database: INSERT INTO notification (...)
        NotificationService --> Budget: Notification sent
        deactivate NotificationService
    else Remaining < 0 (exceeded)
        Budget -> NotificationService: sendBudgetAlert(userId, budgetId, "EXCEEDED")
        activate NotificationService
        NotificationService -> Database: INSERT INTO notification (...)
        NotificationService --> Budget: Notification sent
        deactivate NotificationService
    end
    
    Budget --> BudgetService: Status
    deactivate Budget
end

BudgetService --> NotificationScheduler: Monitoring complete
deactivate BudgetService

NotificationScheduler -> IUserRepository: findInactiveUsers(days = 1)
activate IUserRepository
IUserRepository -> Database: SELECT * FROM user WHERE last_login < DATE_SUB(NOW(), INTERVAL 1 DAY)
Database --> IUserRepository: Inactive user list
IUserRepository --> NotificationScheduler: List<User>
deactivate IUserRepository

loop For each inactive User
    NotificationScheduler -> WalletService: requestBalanceUpdate(userId)
    activate WalletService
    WalletService -> NotificationService: sendBalanceUpdateRequest(userId)
    NotificationService -> Database: INSERT INTO notification (...)
    WalletService --> NotificationScheduler: Request sent
    deactivate WalletService
end

deactivate NotificationScheduler
@enduml
```

## 5. AI CHATBOT QUERY (Truy vấn AI)

```plantuml
@startuml AIChatbot_Sequence
actor User
participant "UI/Chatbot" as UI
participant AIAssistantService
participant ITransactionRepository
participant IWalletRepository
participant IBudgetRepository
participant AIClient
database Database

User -> UI: "Tôi đã chi bao nhiêu cho ăn uống tháng này?"

UI -> AIAssistantService: queryFinancialData(userId, query)
activate AIAssistantService

AIAssistantService -> AIAssistantService: parseQuery(query)
note right: Xác định intent: "spending_by_category"\nExtract: category="ăn uống", period="tháng này"

AIAssistantService -> ITransactionRepository: findByUserAndCategoryAndMonth(userId, categoryId, month)
activate ITransactionRepository
ITransactionRepository -> Database: SELECT * FROM transaction WHERE user_id = ? AND category_id = ? AND MONTH(create_at) = ?
Database --> ITransactionRepository: Transaction list
ITransactionRepository --> AIAssistantService: List<Transaction>
deactivate ITransactionRepository

AIAssistantService -> AIAssistantService: aggregateData(transactions)

AIAssistantService -> IBudgetRepository: findByCategoryAndMonth(userId, categoryId, month)
activate IBudgetRepository
IBudgetRepository -> Database: SELECT * FROM budget WHERE user_id = ? AND category_id = ? AND year_month = ?
Database --> IBudgetRepository: Budget
IBudgetRepository --> AIAssistantService: Budget
deactivate IBudgetRepository

AIAssistantService -> AIClient: generateResponse(query, data, context)
activate AIClient
AIClient -> AIClient: formatContext(data)
AIClient -> AIClient: callLLM(prompt)
AIClient --> AIAssistantService: AI Response
deactivate AIClient

AIAssistantService --> UI: "Tháng này bạn đã chi 5,500,000 VNĐ cho ăn uống. Ngân sách của bạn là 6,000,000 VNĐ, còn lại 500,000 VNĐ (8.3%). Bạn nên tiết kiệm hơn trong 5 ngày còn lại của tháng."

UI --> User: Hiển thị câu trả lời AI

deactivate AIAssistantService

User -> UI: "Gợi ý cho tôi cách tiết kiệm?"

UI -> AIAssistantService: getSuggestions(userId)
activate AIAssistantService

AIAssistantService -> AIAssistantService: analyzeBehavior(userId)

AIAssistantService -> ITransactionRepository: findRecentTransactions(userId, days=30)
ITransactionRepository -> Database: Query
Database --> ITransactionRepository: Transactions
ITransactionRepository --> AIAssistantService: Data

AIAssistantService -> IWalletRepository: findByUserId(userId)
IWalletRepository -> Database: Query
Database --> IWalletRepository: Wallets
IWalletRepository --> AIAssistantService: Wallet data

AIAssistantService -> AIClient: analyzeBehaviorAndSuggest(userData)
activate AIClient
AIClient --> AIAssistantService: List<Suggestion>
deactivate AIClient

AIAssistantService --> UI: Suggestions
UI --> User: Hiển thị các gợi ý tiết kiệm

deactivate AIAssistantService
@enduml
```

## 6. GROUP TRANSACTION (Giao dịch nhóm)

```plantuml
@startuml GroupTransaction_Sequence
actor Member
participant "UI/Controller" as UI
participant GroupService
participant TransactionService
participant IGroupRepository
participant IGroupFundRepository
participant NotificationService
database Database

Member -> UI: Tạo giao dịch nhóm (chi 500,000 cho tiệc tùng)

UI -> GroupService: checkPermission(groupId, userId, "CREATE_TRANSACTION")
activate GroupService

GroupService -> IGroupRepository: findById(groupId)
activate IGroupRepository
IGroupRepository -> Database: SELECT * FROM `group` WHERE id = ?
Database --> IGroupRepository: Group
IGroupRepository --> GroupService: Group
deactivate IGroupRepository

GroupService -> Group: checkPermission(userId, "CREATE_TRANSACTION")
activate Group

alt User là member của group
    Group --> GroupService: true
    deactivate Group
    
    GroupService --> UI: Permission granted
    deactivate GroupService
    
    UI -> TransactionService: createGroupTransaction(data)
    activate TransactionService
    
    TransactionService -> IGroupFundRepository: findById(groupFundId)
    activate IGroupFundRepository
    IGroupFundRepository -> Database: SELECT * FROM group_fund WHERE id = ?
    Database --> IGroupFundRepository: GroupFund
    IGroupFundRepository --> TransactionService: GroupFund
    deactivate IGroupFundRepository
    
    alt GroupFund có đủ số dư
        TransactionService -> GroupTransaction: execute()
        activate GroupTransaction
        
        GroupTransaction -> GroupFund: withdraw(amount)
        activate GroupFund
        GroupFund -> GroupFund: updateBalance(-amount)
        GroupFund -> Database: UPDATE group_fund SET balance = ?
        GroupFund --> GroupTransaction: Success
        deactivate GroupFund
        
        GroupTransaction -> Database: INSERT INTO group_transaction (...)
        Database --> GroupTransaction: Transaction ID
        GroupTransaction --> TransactionService: GroupTransaction (saved)
        deactivate GroupTransaction
        
        TransactionService -> GroupService: getGroupMembers(groupId)
        activate GroupService
        GroupService -> Database: SELECT user_id FROM member_group WHERE group_id = ?
        Database --> GroupService: Member list
        GroupService --> TransactionService: List<UserId>
        deactivate GroupService
        
        TransactionService -> NotificationService: notifyGroupMembers(memberIds, transaction)
        activate NotificationService
        
        loop For each member
            NotificationService -> Database: INSERT INTO notification (for_user_id, contents, ...)
        end
        
        NotificationService --> TransactionService: Notifications sent
        deactivate NotificationService
        
        TransactionService --> UI: GroupTransaction (success)
        UI --> Member: Giao dịch nhóm thành công
    else Không đủ số dư
        TransactionService --> UI: Error (insufficient fund)
        UI --> Member: Quỹ nhóm không đủ
    end
    
    deactivate TransactionService
else User không phải member
    Group --> GroupService: false
    deactivate Group
    GroupService --> UI: Permission denied
    deactivate GroupService
    UI --> Member: Bạn không có quyền thực hiện thao tác này
end
@enduml
```

## 7. BANK SYNC (Đồng bộ giao dịch ngân hàng - Background Job)

```plantuml
@startuml BankSync_Sequence
participant DataSyncScheduler
participant TransactionService
participant BankAPIClient
participant IWalletRepository
participant ITransactionRepository
participant NotificationService
database Database

activate DataSyncScheduler
DataSyncScheduler -> DataSyncScheduler: Scheduled job runs (every 30 minutes)

DataSyncScheduler -> TransactionService: syncBankTransactions()
activate TransactionService

TransactionService -> IWalletRepository: findWalletsWithBankLink()
activate IWalletRepository
IWalletRepository -> Database: SELECT * FROM wallet WHERE bank_account_id IS NOT NULL
Database --> IWalletRepository: Wallet list
IWalletRepository --> TransactionService: List<Wallet>
deactivate IWalletRepository

loop For each Wallet with bank link
    TransactionService -> BankAPIClient: getTransactions(bankAccountId, fromDate)
    activate BankAPIClient
    BankAPIClient -> BankAPIClient: callBankAPI()
    BankAPIClient --> TransactionService: List<BankTransaction>
    deactivate BankAPIClient
    
    loop For each BankTransaction
        TransactionService -> ITransactionRepository: findByBankTransactionId(bankTxId)
        activate ITransactionRepository
        ITransactionRepository -> Database: SELECT * FROM transaction WHERE bank_transaction_id = ?
        Database --> ITransactionRepository: Transaction or null
        ITransactionRepository --> TransactionService: Existing transaction?
        deactivate ITransactionRepository
        
        alt Transaction chưa tồn tại
            TransactionService -> TransactionService: createFromBankData(bankTransaction)
            TransactionService -> PersonalWallet: deposit/withdraw(amount)
            activate PersonalWallet
            PersonalWallet -> Database: UPDATE wallet SET balance = ?
            PersonalWallet --> TransactionService: Updated
            deactivate PersonalWallet
            
            TransactionService -> ITransactionRepository: save(newTransaction)
            ITransactionRepository -> Database: INSERT INTO transaction (...)
            
            TransactionService -> NotificationService: sendAutoSyncNotification(userId, transaction)
            activate NotificationService
            NotificationService -> Database: INSERT INTO notification (...)
            NotificationService --> TransactionService: Sent
            deactivate NotificationService
        else Transaction đã tồn tại
            TransactionService -> TransactionService: skip (duplicate)
        end
    end
end

TransactionService --> DataSyncScheduler: Sync complete
deactivate TransactionService
deactivate DataSyncScheduler
@enduml
```

## LƯU Ý KHI VẼ SEQUENCE DIAGRAM

### 1. Các thành phần cơ bản:
- **Actor**: Người dùng, hệ thống bên ngoài
- **Participant**: Class, Service, Repository
- **Activate/Deactivate**: Lifecycle của object
- **Alt/Else**: Điều kiện rẽ nhánh
- **Loop**: Vòng lặp

### 2. Best practices:
- Bắt đầu từ Actor (User)
- Flow từ trái sang phải, trên xuống dưới
- Hiển thị rõ validation và error handling
- Đánh dấu async operations nếu có
- Nhóm các operations liên quan

### 3. Mức độ chi tiết:
- **High-level**: Chỉ main flow, bỏ qua details
- **Medium-level**: Include validation, main branches
- **Detailed**: Bao gồm cả error handling, logging, notifications

Các sequence diagrams trên đã cover các use case chính của hệ thống. Bạn có thể dùng PlantUML để render ra hình ảnh!
