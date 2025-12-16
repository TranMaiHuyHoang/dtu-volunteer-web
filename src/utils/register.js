// Xử lý sự kiện submit form
document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Ngăn reload trang

  register();
});

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const message = document.getElementById("message");

  // Kiểm tra dữ liệu
  if (username === "" || password === "" || confirmPassword === "") {
    message.innerText = "Vui lòng nhập đầy đủ thông tin";
    message.style.color = "red";
    return;
  }

  if (password.length < 6) {
    message.innerText = "Mật khẩu phải có ít nhất 6 ký tự";
    message.style.color = "red";
    return;
  }

  if (password !== confirmPassword) {
    message.innerText = "Mật khẩu xác nhận không khớp";
    message.style.color = "red";
    return;
  }

  // Lưu user vào localStorage (demo)
  const user = {
    username: username,
    password: password
  };

  localStorage.setItem("user", JSON.stringify(user));

  message.innerText = "Đăng ký thành công!";
  message.style.color = "green";

  // Reset form
  document.getElementById("registerForm").reset();
}
