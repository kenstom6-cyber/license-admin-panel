// ===============================
// AUTH.JS – FIX HOÀN CHỈNH
// Tương thích 100% với server API
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  checkServerHealth();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

/* ===============================
   CHECK SERVER STATUS
================================ */
function checkServerHealth() {
  fetch('/api/health')
    .then(res => {
      if (!res.ok) throw new Error('Server down');
      return res.json();
    })
    .then(() => {
      hideError();
    })
    .catch(() => {
      showError('Lỗi kết nối server');
    });
}

/* ===============================
   HANDLE LOGIN
================================ */
function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showError('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    })
    .then(data => {
      if (data.success === true) {
        window.location.href = '/dashboard.html';
      } else {
        showError('Sai tài khoản hoặc mật khẩu');
      }
    })
    .catch(() => {
      showError('Lỗi kết nối server');
    });
}

/* ===============================
   UI HELPERS
================================ */
function showError(message) {
  const errorBox = document.getElementById('errorBox');
  if (errorBox) {
    errorBox.innerText = message;
    errorBox.style.display = 'block';
  }
}

function hideError() {
  const errorBox = document.getElementById('errorBox');
  if (errorBox) {
    errorBox.style.display = 'none';
  }
}
