import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default model('Notification', notificationSchema);
// controllers/notification.controller.js
import Notification from '../models/notification.model.js';

// Tạo thông báo mới
export const createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;

    const notification = await Notification.create({
      userId,
      message
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy tất cả thông báo của user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Đánh dấu 1 thông báo đã đọc
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

