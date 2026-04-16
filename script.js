//會員登入專區
const GOOGLE_CLIENT_ID = "104786143630-ujde9mmftukk4skbc775js6h3o3k5tmg.apps.googleusercontent.com";
const memberLink = document.getElementById('member-link'); // 或 querySelector('a[data-login]')

// 統一在頂部聲明所有元素
const overlay = document.getElementById('overlay');
const modal = document.querySelector('.login-modal');
const closeBtn = document.querySelector('.close-modal');
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //先定義正規表達式
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// 開啟彈窗
memberLink?.addEventListener('click', (e) => {
    // e.preventDefault();
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
});

// 點擊 overlay(背景) 關閉
overlay.addEventListener('click', () => {
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
});

// 點擊關閉按鈕
closeBtn?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
});

//驗證格式 
function validateLogin(emailRaw,passwordRaw) { 
    const email = emailRaw.trim(); 
    const password = passwordRaw.trim();
    
    const errors = []; 
    
    if (!email) {
        // 如果輸入是空的，就顯示此訊息，然後跳過下面的 else if
        errors.push("請輸入電子郵件!");
    } else if (!emailPattern.test(email)) { 
        // else if=只有在「有輸入內容」但「正規表達式沒過」的情況下，才顯示第二個訊息，避免重複兩個訊息
        errors.push("電子郵件格式不正確!");
    }
    if (!password) {
        errors.push('請輸入密碼!');
    } else if (!strongPasswordPattern.test(password)) { 
        errors.push('密碼至少需包含大小寫英文和數字');
    }
        if (errors.length > 0) { 
        return {
            ok: false,
            errors: errors
        };
    }

    return { 
        ok: true
    };
};
//底部表單驗證
function validateEmail(userEmailRaw) { 
    const userEmail = userEmailRaw.trim();
    
    const errors = []; 
   
    if (!userEmail ) {
        errors.push("請輸入電子郵件!");
    } else if (!emailPattern.test(userEmail )) { 
        errors.push("電子郵件格式不正確!");
    }

        if (errors.length > 0) { 
        return {
            ok: false,
            errors: errors
        };
    }

    return { 
        ok: true
    };
};


//會員專區帳號密碼驗證
const loginBtn = document.getElementById('login-submit') 

loginBtn.addEventListener('click', function() {
    
    const emailInput = document.querySelector('.em');
    const passwordInput = document.querySelector('.pw');

    const emailInputValue = emailInput.value;
    const passwordInputValue = passwordInput.value;

    const correctEmail = 'karta853621@gmail.com'; 
    const correctPassword = 'Aaaa123456';

    const result = validateLogin(emailInputValue, passwordInputValue);
    
    if (result.ok) {
        if(emailInputValue === correctEmail && passwordInputValue === correctPassword) {
            alert('登入成功');
        } else {
            alert('帳號或密碼錯誤!');
        }
    } else {
            alert(result.errors.join("\n"));
    }
});

//底部電子郵件驗證
const sentButton = document.getElementById('sent'); //抓按鈕

sentButton.addEventListener('click', function() {
    
    const userEmailInput = document.getElementById('useremail'); //抓Input元素

    const userEmailValue = userEmailInput.value; //取Input內的值


    const result = validateEmail(userEmailValue); //開始跑驗證

    if (result.ok) {
        alert("訂閱成功");
    } else {
        alert(result.errors.join("\n"));  //顯示錯誤訊息
    }
    
});

//超連結警示
document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-coming-soon]"); //從點到的元素（event.target）往上找，最近符合 a[data-coming-soon] 的 <a>
    if (!link) return;  //如果點擊不是在「有 data-coming-soon 的連結」上，就結束
    event.preventDefault(); 
    alert("此頁面建置中,敬請期待!");
});

// ========== 當 DOM 加載完成時，初始化 Google 登入 ==========
document.addEventListener('DOMContentLoaded', () => {
  initializeGoogleSignIn();
});

// ========== Google 登入初始化 ==========
function initializeGoogleSignIn() {
    // 初始化 Google 登入 SDK
    // 告訴 Google：「這是我的 Client ID，當登入成功時呼叫 handleGoogleResponse」
    window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse // 成功登入後會執行這個函數
    });

    // // 監聽自定義按鈕的點擊事件
    // document.getElementById('google-login-btn').addEventListener('click', () => {
    //     // 當使用者點擊你的圖標時，觸發 Google 官方的登入提示視窗
    //     window.google.accounts.id.prompt();
    // });
    
    // 使用 Google 官方提供的按鈕樣式
    // renderButton 會自動管理按鈕，包括登入邏輯
    const googleBtn = document.getElementById("google-login-btn");
    window.google.accounts.id.renderButton(googleBtn, {
        type: "standard", 
        theme: "outline",      // 按鈕主題：「outline」是白底黑邊框
        size: "medium",        // 按鈕大小
        text: "signin"         // 按鈕文字內容
    });
}


// ========== JWT 解碼函數 ==========
// 用途：把 Google 回傳的 JWT Token 解碼，取出裡面的使用者資訊
function parseJwt(token) {
    // JWT 格式：header.payload.signature（三段，用 . 分隔）
    // 我們只需要第二段（payload），也就是實際的使用者資訊
    const base64Url = token.split('.')[1];
    
    // JWT 的 payload 用 Base64URL 編碼，需要轉成標準 Base64 格式
    // 因為 Base64URL 用 - 代替 +，用 _ 代替 /
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // atob() 把 Base64 解碼成原始字符串
    // 但 atob() 只支援 Latin-1 編碼，不支援 UTF-8（中文等特殊字符）
    // 所以需要轉換成 URL 編碼格式，再用 decodeURIComponent 解析
    const jsonPayload = decodeURIComponent(
        atob(base64)                    // 先用 atob 解碼
        .split('')                      // 把字符串拆成陣列，每個字符一個
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        // 把每個字符轉成 Unicode 值，再轉成十六進制，前面加 % 組成 URL 編碼
        // 例如：'中' → charCodeAt(0) = 20013 → toString(16) = '4e2d' → '%4e%2d'
        .join('')                       // 把陣列再併回字符串
    );
    
    // 最後把 JSON 字符串解析成 JavaScript 物件
    return JSON.parse(jsonPayload);
    // 解析結果會像這樣：
    // {
    //   iss: "https://accounts.google.com",
    //   email: "user@gmail.com",
    //   name: "使用者名字",
    //   picture: "https://...",
    //   ... 其他資訊
    // }
}

// ========== 回調函數：當使用者成功選擇 Google 帳號後執行 ==========
function handleGoogleResponse(response) { 
    console.log("Google 登入成功!");
    console.log(response); // 印出完整的 response 物件方便調試
    
    // response.credential 就是 Google 簽署的 JWT Token
    // 用 parseJwt 解碼它，拿出使用者的 email、name 等資訊
    const user = parseJwt(response.credential);
    memberLink.textContent = user.email;
    // 暫時用 alert 顯示登入成功
    // 實際應用中，這裡應該：
    // 1. 驗證 JWT 簽名（由後端做）
    // 2. 把 JWT 傳給後端
    // 3. 後端建立登入 Session，存到資料庫
    // 4. 關閉登入彈窗，更新會員狀態
    alert('登入成功，信箱: ' + user.email);
}

