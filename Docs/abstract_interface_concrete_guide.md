# HƯỚNG DẪN CHI TIẾT: KHI NÀO DÙNG ABSTRACT CLASS, INTERFACE, HAY CONCRETE CLASS

## I. SO SÁNH TỔ

| Tiêu chí | Abstract Class | Interface | Concrete Class |
|----------|---------------|-----------|----------------|
| Constructor | Có | Không | Có |
| Fields | Có (cả static và instance) | Chỉ constants (public static final) | Có |
| Methods | Cả abstract và concrete | Chỉ abstract (Java 8+ có default) | Chỉ concrete |
| Multiple Inheritance | Không (Java), Không (C#) | Có | Không |
| Khi nào dùng | Có code chung cần share | Định nghĩa contract | Implement cụ thể |
| Access Modifiers | Tất cả | Chỉ public | Tất cả |

## II. QUY TẮC VÀNG

### 1. SỬ DỤNG INTERFACE KHI:

#### ✅ Định nghĩa contract/behavior mà nhiều class không liên quan có thể implement
```java
// VÍ DỤ: INotifiable - User và Group đều có thể nhận thông báo nhưng không liên quan nhau
interface INotifiable {
    void sendNotification(Notification notification);
    List<Notification> getNotifications();
}

// User và Group KHÔNG có quan hệ "is-a" nhưng cùng có thể "notifiable"
class User implements INotifiable { }
class Group implements INotifiable { }
```

#### ✅ Cần multiple inheritance
```java
// Account vừa có thể authenticate, vừa có thể export data
class Account implements IAuthenticatable, IExportable {
    // Implement cả 2 interfaces                                                                            
}
```

#### ✅ Áp dụng Interface Segregation Principle (ISP)
```java
// KHÔNG TỐT: Interface béo phì
interface IUser {
    void authenticate();
    void sendNotification();
    void generateReport();
    void exportData();
}

// TỐT: Tách thành các interface nhỏ
interface IAuthenticatable { void authenticate(); }
interface INotifiable { void sendNotification(); }
interface IReportable { void generateReport(); }
interface IExportable { void exportData(); }

// Class chỉ implement những gì cần
class User implements IAuthenticatable, INotifiable { }
class Admin implements IAuthenticatable, IReportable, IExportable { }
```

#### ✅ Dependency Inversion Principle (DIP)
```java
// Service phụ thuộc vào interface, không phụ thuộc vào implementation cụ thể
class TransactionService {
    private ITransactionRepository repository; // ← Interface
    
    // Có thể swap implementation (MySQL, PostgreSQL, MongoDB...)
    public TransactionService(ITransactionRepository repository) {
        this.repository = repository;
    }
}
```

### 2. SỬ DỤNG ABSTRACT CLASS KHI:

#### ✅ Có code implementation chung cần share giữa các subclasses
```java
abstract class AbstractWallet {
    protected double balance;
    
    // CONCRETE method - code chung cho tất cả wallet
    protected void updateBalance(double amount) {
        this.balance += amount;
    }
    
    // CONCRETE method - validation chung
    public boolean validateAmount(double amount) {
        return amount > 0 && amount <= 1000000000;
    }
    
    // ABSTRACT method - mỗi loại wallet có cách deposit khác nhau
    public abstract void deposit(double amount);
    public abstract void withdraw(double amount);
}

class PersonalWallet extends AbstractWallet {
    // Kế thừa updateBalance() và validateAmount()
    // Chỉ implement deposit() và withdraw() theo cách riêng
    @Override
    public void deposit(double amount) {
        if (validateAmount(amount)) {
            updateBalance(amount);
        }
    }
}

class GroupFund extends AbstractWallet {
    @Override
    public void deposit(double amount) {
        // Logic khác: cần check permission trước
        if (checkPermission() && validateAmount(amount)) {
            updateBalance(amount);
            notifyGroupMembers();
        }
    }
}
```

#### ✅ Có quan hệ "is-a" rõ ràng và có state/behavior chung
```java
// Transaction có nhiều loại nhưng cùng có cấu trúc cơ bản
abstract class AbstractTransaction {
    protected int id;
    protected double amount;
    protected String type;
    protected DateTime createdAt;
    
    // Code chung
    public double calculateBalance() {
        return type.equals("INCOME") ? amount : -amount;
    }
    
    // Mỗi loại transaction có validation riêng
    public abstract boolean validate();
    public abstract boolean execute();
}
```

#### ✅ Muốn control access modifiers của members
```java
abstract class AbstractWallet {
    // PROTECTED - chỉ subclass mới access được
    protected double balance;
    protected String status;
    
    // PRIVATE - chỉ abstract class này dùng
    private DateTime lastModified;
    
    // PUBLIC abstract method
    public abstract void deposit(double amount);
}

// Interface: TẤT CẢ members đều PUBLIC
```

### 3. SỬ DỤNG CONCRETE CLASS KHI:

#### ✅ Đại diện cho entity/object cụ thể, hoàn chỉnh
```java
// User là thực thể cụ thể, không cần abstraction
class User {
    private int id;
    private String email;
    private String userName;
    
    // Implementation đầy đủ, không cần override
    public void updateProfile(String userName) {
        this.userName = userName;
    }
}
```

#### ✅ Không có kế hoạch extend hay polymorphism
```java
// Category rất cụ thể, không có "loại" category khác
class Category {
    private int id;
    private String name;
    private String type;
    
    public void incrementUsage() {
        this.usageCount++;
    }
}
```

#### ✅ Final class - ngăn không cho extend (security, design)
```java
// Utility class không nên được extend
final class ValidationHelper {
    private ValidationHelper() { } // Ngăn instantiate
    
    public static boolean validateEmail(String email) {
        // Logic validation
    }
}
```

## III. CASE STUDIES TRONG DỰ ÁN CỦA BẠN

### Case 1: Wallet - ABSTRACT CLASS ✅

**Tại sao không dùng Interface?**
```java
// NẾU DÙNG INTERFACE - KHÔNG TỐT
interface IWallet {
    void deposit(double amount);
    void withdraw(double amount);
    double getBalance();
}

class PersonalWallet implements IWallet {
    private double balance; // ← Lặp code
    
    public void deposit(double amount) {
        if (amount > 0) { // ← Lặp code validation
            this.balance += amount; // ← Lặp code update
        }
    }
}

class GroupFund implements IWallet {
    private double balance; // ← Lặp code (giống PersonalWallet)
    
    public void deposit(double amount) {
        if (amount > 0) { // ← Lặp code validation
            this.balance += amount; // ← Lặp code update
            notifyMembers(); // Chỉ khác mỗi dòng này
        }
    }
}
```

**DÙNG ABSTRACT CLASS - TỐT HƠN**
```java
abstract class AbstractWallet {
    protected double balance; // ← Share state
    
    // Share behavior
    protected void updateBalance(double amount) {
        this.balance += amount;
    }
    
    public boolean validateAmount(double amount) {
        return amount > 0;
    }
    
    // Abstract - để subclass tự implement
    public abstract void deposit(double amount);
}

class PersonalWallet extends AbstractWallet {
    public void deposit(double amount) {
        if (validateAmount(amount)) {
            updateBalance(amount); // ← Reuse code
        }
    }
}

class GroupFund extends AbstractWallet {
    public void deposit(double amount) {
        if (validateAmount(amount)) {
            updateBalance(amount); // ← Reuse code
            notifyMembers(); // Logic riêng
        }
    }
}
```

### Case 2: IAuthenticatable - INTERFACE ✅

**Tại sao không dùng Abstract Class?**
```java
// Account và APIClient đều cần authenticate nhưng KHÔNG liên quan gì nhau
class Account implements IAuthenticatable { }
class APIClient implements IAuthenticatable { }

// Nếu dùng abstract class, sẽ force "is-a" relationship không đúng
// "APIClient is a Account"? ← Sai logic!
```

**Tại sao Interface là đúng?**
```java
interface IAuthenticatable {
    boolean authenticate(String credential);
    void logout();
}

// Account "can authenticate"
class Account implements IAuthenticatable {
    public boolean authenticate(String credential) {
        // Logic xác thực user
    }
}

// APIClient "can authenticate" (cách khác)
class APIClient implements IAuthenticatable {
    public boolean authenticate(String credential) {
        // Logic xác thực API key
    }
}
```

### Case 3: User - CONCRETE CLASS ✅

**Tại sao không cần Abstract?**
```java
// User là thực thể CỤ THỂ, hoàn chỉnh
// KHÔNG có "loại User" khác cần extend
class User {
    private int id;
    private String email;
    private String userName;
    
    // Implementation đầy đủ
    public void updateProfile(String userName) {
        this.userName = userName;
    }
}

// KHÔNG CẦN:
abstract class AbstractUser { } // ← Không cần vì không có subclass
class NormalUser extends AbstractUser { } // ← Over-engineering
class PremiumUser extends AbstractUser { } // ← Không cần trong thiết kế
```

**Nếu sau này cần phân loại User?**
```java
// Dùng COMPOSITION thay vì INHERITANCE
class User {
    private int id;
    private UserRole role; // ← Composition
    
    public boolean hasPermission(String action) {
        return role.checkPermission(action);
    }
}

enum UserRole {
    NORMAL, PREMIUM, ADMIN
}
```

### Case 4: Repository - INTERFACE ✅

**Tại sao dùng Interface?**
```java
// 1. Dependency Inversion Principle
interface IUserRepository {
    User findById(int id);
    User save(User user);
}

class UserService {
    private IUserRepository repository; // ← Depend on abstraction
    
    // Có thể swap implementation
}

// 2. Multiple implementations
class MySQLUserRepository implements IUserRepository { }
class PostgreSQLUserRepository implements IUserRepository { }
class MongoDBUserRepository implements IUserRepository { }
class InMemoryUserRepository implements IUserRepository { } // For testing

// 3. Easy testing với mock
class MockUserRepository implements IUserRepository {
    public User findById(int id) {
        return new User(1, "test@example.com");
    }
}
```

## IV. DECISION TREE

```
Bắt đầu thiết kế class mới
    │
    ├─ Có cần NHIỀU IMPLEMENTATION KHÁC NHAU?
    │   │
    │   ├─ Có → Có CODE CHUNG cần SHARE?
    │   │   │
    │   │   ├─ Có → ABSTRACT CLASS
    │   │   │       (VD: AbstractTransaction, AbstractWallet)
    │   │   │
    │   │   └─ Không → INTERFACE
    │           │       (VD: IAuthenticatable, IReportable)
    │           │
    │           └─ Cần MULTIPLE INHERITANCE? → Chắc chắn là INTERFACE
    │
    └─ Không → CONCRETE CLASS
                (VD: User, Category, Budget)
```

## V. ANTI-PATTERNS CẦN TRÁNH

### ❌ Anti-Pattern 1: Interface chỉ có 1 implementation

```java
// KHÔNG TỐT
interface IUserService {
    User createUser(UserData data);
}

class UserService implements IUserService {
    // Chỉ có 1 implementation
}

// TỐT HƠN - không cần interface
class UserService {
    public User createUser(UserData data) { }
}

// CHỈ DÙNG INTERFACE KHI:
// - Chuẩn bị có nhiều implementations
// - Cần dependency injection
// - Cần mock cho testing
```

### ❌ Anti-Pattern 2: Abstract class không có abstract methods

```java
// KHÔNG TỐT - không có lý do gì phải abstract
abstract class BaseEntity {
    protected int id;
    
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
}

// TỐT HƠN - dùng concrete class hoặc interface
class BaseEntity {
    protected int id;
    // ...
}
```

### ❌ Anti-Pattern 3: Interface béo phì (Fat Interface)

```java
// KHÔNG TỐT - Vi phạm Interface Segregation Principle
interface IUser {
    void authenticate();
    void sendNotification();
    void generateReport();
    void exportToExcel();
    void exportToPDF();
    void sendEmail();
    void logActivity();
}

// TỐT - Tách nhỏ
interface IAuthenticatable { void authenticate(); }
interface INotifiable { void sendNotification(); }
interface IReportable { void generateReport(); }
interface IExportable { 
    void exportToExcel();
    void exportToPDF();
}
```

### ❌ Anti-Pattern 4: Over-engineering với abstraction không cần thiết

```java
// KHÔNG TỐT - Category rất simple, không cần abstract
abstract class AbstractCategory {
    protected String name;
    public abstract void doSomething();
}

class Category extends AbstractCategory {
    // Chỉ có 1 implementation, không bao giờ có loại Category khác
}

// TỐT - Đơn giản
class Category {
    private String name;
    public void doSomething() { }
}
```

## VI. CHECKLIST KHI THIẾT KẾ

### Khi quyết định dùng INTERFACE:

- [ ] Có ít nhất 2 implementations khác nhau? (hoặc dự định có)
- [ ] Các implementations KHÔNG có code chung?
- [ ] Cần multiple inheritance?
- [ ] Chỉ định nghĩa "what" (contract), không quan tâm "how"?
- [ ] Tuân thủ ISP (interface nhỏ, tập trung)?

### Khi quyết định dùng ABSTRACT CLASS:

- [ ] Có code implementation chung cần share?
- [ ] Có state (fields) chung?
- [ ] Có quan hệ "is-a" rõ ràng?
- [ ] Cần control access modifiers?
- [ ] Có methods vừa abstract vừa concrete?

### Khi quyết định dùng CONCRETE CLASS:

- [ ] Đại diện cho thực thể/object cụ thể?
- [ ] Không cần polymorphism?
- [ ] Không có kế hoạch extend?
- [ ] Implementation hoàn chỉnh, rõ ràng?

## VII. KẾT LUẬN

### Abstract Class vs Interface - Công thức nhớ:

**ABSTRACT CLASS = "IS-A" + CODE SHARING**
- PersonalWallet **IS A** Wallet
- GroupFund **IS A** Wallet
- Share: balance, updateBalance(), validateAmount()

**INTERFACE = "CAN-DO" / "HAS-ABILITY"**
- Account **CAN** authenticate
- User **CAN** receive notifications
- Budget **CAN** be monitored

**CONCRETE CLASS = COMPLETE IMPLEMENTATION**
- User hoàn chỉnh, không cần extend
- Category cụ thể, không có biến thể

### Ưu tiên thiết kế:

1. **Mặc định**: Bắt đầu với CONCRETE CLASS
2. **Cần contract**: Dùng INTERFACE
3. **Cần code sharing**: Dùng ABSTRACT CLASS
4. **Nghi ngờ**: Chọn INTERFACE (dễ refactor hơn sau)

### Nguyên tắc SOLID nhắc nhở:

- **S**: Mỗi class một trách nhiệm → Concrete class
- **O**: Mở để mở rộng → Abstract class / Interface
- **L**: Thay thế được → Inheritance đúng cách
- **I**: Interface nhỏ gọn → Nhiều interfaces nhỏ
- **D**: Phụ thuộc abstraction → Service dùng Interface

Chúc bạn thiết kế thành công! 🚀
