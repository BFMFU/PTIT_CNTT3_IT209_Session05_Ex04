# Báo Cáo Bài 4: Mô Phỏng Quy Trình Hotfix & Gitflow Thực Tế

##  Thông Tin Bài Tập
- **Môn học**: IT209 - Quản lý phiên bản mã nguồn với Git
- **Đường dẫn bài nộp**: `homework/session_05/ex4/`
- **Mục tiêu**:
  - Áp dụng mô hình phân nhánh Gitflow chuẩn trong quản lý vòng đời phần mềm.
  - Thực hành tạo, kiểm thử và tích hợp nhánh **Hotfix** trực tiếp vào hệ thống đang chạy (`main`).
  - Đồng bộ hóa bản vá nóng về nhánh phát triển (`develop`) để tránh hiện tượng trôi lỗi (Regression Bug).

---

##  1. Mô Hình Quy Trình Hotfix Trong Gitflow

Trong mô hình Gitflow chuẩn:
1. **`main`**: Luôn đại diện cho mã nguồn ổn định đang chạy trên môi trường Production. Mỗi commit trên `main` tương ứng với một phiên bản chính thức và được đánh Tag (e.g., `v1.0.0`, `v1.0.1`).
2. **`develop`**: Nơi tích hợp và phát triển các tính năng cho phiên bản tương lai. Nhánh này có thể đang dở dang và **không thể deploy ngay**.
3. **`hotfix/*`**: Nhánh sửa lỗi khẩn cấp được tách trực tiếp từ `main`. Sau khi sửa xong:
   - Gộp vào `main` + Đánh Tag phát hành bản vá nóng mới (`v1.0.1`).
   - Gộp ngược lại vào `develop` để đảm bảo code phát triển tương lai kế thừa bản sửa lỗi này.

###  Sơ đồ luồng xử lý (ASCII Diagram)

```text
(v1.0.0) 
  main ----*-----------------------*------------------* [tag: v1.0.1]
            \                     /                  /
             \        hotfix/v1.0.1                 /
              \--------* (fix bug)                 /
               \                                  /
  develop ------*------------*------------*------* [develop updated]
             (init)     (feat 1)     (feat 2)  (merged hotfix)
```

---

##  2. Các Bước Thực Hiện Chi Tiết (Step-by-Step)

###  Bước 1: Khởi tạo hệ thống Production v1.0.0 trên nhánh `main`

1. Khởi tạo Git repository và cấu hình nhánh `main`:
   ```bash
   git init
   git branch -M main
   ```
2. Khởi tạo mã nguồn `app.js` chứa lỗi bảo mật nghiêm trọng (rò rỉ dữ liệu token qua log):
   ```javascript
   // Version 1.0.0 - Production Code
   function getUserData(userId, token) {
       // SECURITY BUG: Logging sensitive user data & auth token in plain text
       console.log(`[DEBUG] Fetching profile for user: ${userId}, token: ${token}`);
       
       return {
           id: userId,
           name: "Nguyen Van A",
           email: "user@example.com"
       };
   }

   module.exports = { getUserData };
   ```
3. Commit và đánh tag bản phát hành `v1.0.0`:
   ```bash
   git add app.js
   git commit -m "feat: initial release v1.0.0 with user authentication"
   git tag -a v1.0.0 -m "Release version 1.0.0"
   ```

---

###  Bước 2: Khởi tạo nhánh `develop` và phát triển tính năng dở dang (v1.1.0)
1. Tách nhánh `develop` từ `main`:
   ```bash
   git checkout -b develop
   ```
2. Thêm các tính năng mới chưa hoàn thiện cho bản tương lai:
   - **Tính năng 1 (Dashboard UI)**: Tạo `dashboard.js`
     ```bash
     git add dashboard.js
     git commit -m "feat: add user dashboard module for v1.1.0"
     ```
   - **Tính năng 2 (Payment Gateway)**: Tạo `payment.js`
     ```bash
     git add payment.js
     git commit -m "feat: add payment gateway integration for v1.1.0"
     ```

---

### Bước 3: Phát hiện sự cố khẩn cấp & Tách nhánh `hotfix/v1.0.1`

**Bối cảnh**: Hệ thống Production (`main` v1.0.0) phát hiện rò rỉ token người dùng trong file log. Nhánh `develop` đang phát triển dở dang 2 tính năng mới nên không thể triển khai (deploy) ngay lên Production được.

**Hành động**: Tách nhánh sửa lỗi khẩn cấp `hotfix/v1.0.1` trực tiếp từ `main`:
```bash
git checkout main
git checkout -b hotfix/v1.0.1
```

---

###  Bước 4: Sửa lỗi khẩn cấp trên nhánh Hotfix

Cập nhật tệp `app.js` trên nhánh `hotfix/v1.0.1` để loại bỏ log token nhạy cảm:
```javascript
// Version 1.0.1 - Production Code (Hotfixed)
function getUserData(userId, token) {
    // FIX: Removed token logging to prevent sensitive data leak in log output
    console.log(`[INFO] Fetching profile for user: ${userId}`);
    
    return {
        id: userId,
        name: "Nguyen Van A",
        email: "user@example.com"
    };
}

module.exports = { getUserData };
```

Thực hiện commit sửa lỗi:
```bash
git add app.js
git commit -m "fix(security): sanitize log data to prevent credential leak"
```

---

###  Bước 5: Gộp Hotfix vào `main` & Đánh Tag Release `v1.0.1`

Chuyển về `main`, gộp nhánh `hotfix/v1.0.1` và tạo Tag phát hành mới:
```bash
git checkout main
git merge --no-ff hotfix/v1.0.1 -m "merge: hotfix/v1.0.1 into main"
git tag -a v1.0.1 -m "Release Hotfix 1.0.1"
```

---

###  Bước 6: Gộp ngược Hotfix vào nhánh `develop` (Đồng bộ bản vá)

Để tránh tình trạng trôi lỗi (phiên bản v1.1.0 ra mắt tương lai lại bị tái diễn lỗi rò rỉ token này), bắt buộc phải gộp nhánh hotfix vào `develop`:
```bash
git checkout develop
git merge --no-ff hotfix/v1.0.1 -m "merge: hotfix/v1.0.1 into develop"
```

---

### Bước 7: Dọn dẹp nhánh Hotfix cục bộ

Sau khi đã hoàn tất gộp vào cả `main` và `develop`, xóa nhánh `hotfix/v1.0.1`:
```bash
git branch -d hotfix/v1.0.1
```

---

##  3. Kiểm Tra & Kết Quả Thực Tế

### 1️ Danh sách nhánh hiện có (`git branch -a`)
```text
* develop
  main
```
*(Nhánh `hotfix/v1.0.1` đã được xóa sạch sẽ)*

### 2️ Danh sách Tags (`git tag -l -n`)
```text
v1.0.0          Release version 1.0.0
v1.0.1          Release Hotfix 1.0.1
```
*(Tag `v1.0.1` trỏ đúng vào commit merge hotfix trên nhánh `main`)*

### 3️ Sơ đồ lịch sử commit (`git log --graph --oneline --all`)

```text
*   400ce06 (HEAD -> develop) merge: hotfix/v1.0.1 into develop
|\  
* | 9d2741b feat: add payment gateway integration for v1.1.0
* | b0036cd feat: add user dashboard module for v1.1.0
| | * 611d07a (tag: v1.0.1, main) merge: hotfix/v1.0.1 into main
| |/| 
|/|/  
| * 18fad24 fix(security): sanitize log data to prevent credential leak
|/  
* 43c794b (tag: v1.0.0) feat: initial release v1.0.0 with user authentication
```

---

##  4. Tổng Kết & Bài Học Rút Ra

1. **Tại sao Hotfix phải tách ra từ `main` thay vì `develop`?**
   - Nhánh `main` chứa mã nguồn ổn định đang chạy trên Production (v1.0.0). Nhánh `develop` chứa các tính năng dở dang chưa qua kiểm thử đầy đủ. Nếu tách từ `develop`, bản sửa lỗi sẽ bị dính kèm các tính năng dở dang này, không thể deploy ngay được.

2. **Tại sao phải gộp ngược lại vào `develop`?**
   - Nếu chỉ gộp vào `main`, bản sửa lỗi sẽ bị bỏ quên trên `develop`. Khi `develop` được release ở phiên bản v1.1.0 sau này, lỗi bảo mật cũ sẽ lại xuất hiện (Regression Bug).

3. **Ý nghĩa của cờ `--no-ff` (No Fast-Forward) khi merge**:
   - Tạo ra một Commit Merge riêng biệt giúp giữ lại hình ảnh đồ thị phân nhánh của Hotfix, dễ dàng truy vết nguồn gốc bản vá trong lịch sử Git.
