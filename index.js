const express = require('express');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const mainRouter = require('./routes/index');
// Set up Global configuration access
const dotenv = require('dotenv');
const flash = require('connect-flash');
const passport = require('passport');
var morgan = require('morgan')
// HTTP request logger middleware for node.js
app.use(morgan('tiny')); 
require("./utils/passportConfig.js");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger'); // Import file cấu hình Swagger
const { errorHandler } = require('./middlewares/errorHandler.js');



dotenv.config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware cho API docs
const swaggerEndpoint = '/api-docs';
app.use(
  swaggerEndpoint, 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpecs, { explorer: true })
);


// Use express - session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: true // khuyến khích dùng false để tuân thủ luật bảo mật (GDPR) và giảm thiểu rác session
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware to serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use cookie - parser middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(flash());


// Middleware để đưa flash messages vào locals (dùng được trong template)
app.use((req, res, next) => {
  res.locals.error_msg = req.flash('error'); // Lấy thông báo lỗi
  res.locals.success_msg = req.flash('success'); // Lấy thông báo thành công
  // Passport thường lưu lỗi vào key 'error'
  next();
});



// Thêm middleware để xử lý dữ liệu JSON
app.use(express.json());
// Parse form data
app.use(express.urlencoded({ extended: true }));



// Thêm middleware để ghi log mỗi khi có yêu cầu đến server
app.use((req, res, next) => {
  console.log('Middleware đang chạy');
  console.log('Middleware A: Đang kiểm tra URL:', req.originalUrl);
  next();
});

app.use('/', mainRouter);
app.use(errorHandler); // Đảm bảo middleware xử lý lỗi được đặt sau tất cả các route khác


let PORT = process.env.PORT || 3000;

const connectToMongoDB = async () => {
  console.log(process.env.MONGO_URL);
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to myDB");
}
connectToMongoDB().catch((err) => console.error(err))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Docs có sẵn tại: http://localhost:${PORT}${swaggerEndpoint}`);
});

