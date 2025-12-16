// Biến lưu trữ message
let message = "Hello, World!";

// Lấy message
function getMessage() {
  return message;
}

// Gán message mới
function setMessage(newMessage) {
  if (typeof newMessage !== "string" || newMessage.trim() === "") {
    console.error("Message không hợp lệ");
    return;
  }
  message = newMessage;
  console.log("Message set to:", message);
}

// Xóa message
function clearMessage() {
  message = "";
  console.log("Message cleared");
}

// Lấy độ dài message
function getMessageLength() {
  return message.length;
}

// In message ra console
function printMessage() {
  console.log("Current message:", message);
}

// Kiểm tra message có rỗng không
function isMessageEmpty() {
  return message.length === 0;
}

// Chuyển message thành chữ hoa
function toUpperCaseMessage() {
  message = message.toUpperCase();
  return message;
}

// Chuyển message thành chữ thường
function toLowerCaseMessage() {
  message = message.toLowerCase();
  return message;
}

// Nối thêm nội dung vào message
function appendMessage(text) {
  if (typeof text !== "string") return;
  message += text;
  return message;
}
