const Notification = require('../models/notification.model');

const createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!message) return res.status(400).json({ message: 'Thiếu message' });
    const note = new Notification({ userId, message });
    await note.save();
    res.status(201).json({ message: 'Đã gửi thông báo', note });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Notification.findById(id);
    if (!note) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    
    // Kiểm tra quyền truy cập
    if (String(note.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xem thông báo này' });
    }
    
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Notification.findById(id);
    if (!note) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    
    if (String(note.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền' });
    }
    
    note.isRead = true;
    await note.save();
    res.json({ message: 'Đã đánh dấu là đã đọc', note });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    
    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Notification.findById(id);
    
    if (!note) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    // Kiểm tra quyền xóa
    if (String(note.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa thông báo này' });
    }
    
    await Notification.findByIdAndDelete(id);
    res.json({ message: 'Đã xóa thông báo' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ userId });
    res.json({ message: 'Đã xóa tất cả thông báo' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createNotification,
  listNotificationsForUser,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
