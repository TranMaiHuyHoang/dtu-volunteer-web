require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectSQL } = require('./config/sql');
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
//Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));
// kết nỗi sql 
connectSQL();

//Import Routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const registrationRoutes = require('./routes/registration.routes');
const notificationRoutes = require('./routes/notification.routes');

//Sử dụng routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/notifications', notificationRoutes);
// Routes
const mbRoutes = require('./routes/mb.routes');
app.use('/api/mb', mbRoutes);
app.get('/', (req, res) => res.send('Volunteer System API is running...'));

//Import Models (dành cho test hoặc khởi tạo)
const User = require('./models/user.model');
const Project = require('./models/project.model');
//Test APIs
//Tạo user mới (test)
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: ' User created successfully!', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Lấy danh sách dự án (test)
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route test chính
app.get('/', (req, res) => {
  res.send(' Volunteer System API is running...');
// Route tài chính
const financeRoutes = require('./routes/finance.routes');
app.use('/api/finance', financeRoutes);
const mbRoutes = require('./routes/mb.routes');
app.use('/api/mb', mbRoutes);
.
});
//Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
