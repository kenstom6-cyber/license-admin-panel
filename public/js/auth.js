async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            showError('Sai tài khoản hoặc mật khẩu');
            return;
        }

        const data = await res.json();

        if (data.success) {
            window.location.href = '/dashboard.html';
        } else {
            showError('Đăng nhập thất bại');
        }
    } catch (e) {
        showError('Lỗi kết nối server');
    }
}
