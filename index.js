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
// HTTP request logger middleware for node.js
 require("./utils/passportConfig.js");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger.js'); // Import file cấu hình Swagger
const { errorHandler } = require('./middlewares/errorHandler.middleware.js');
const logger = require('./config/logger');
const { postLogoutLog } = require('./middlewares/logout.middleware.js');
dotenv.config();
//var morgan = require('morgan')
// app.use(morgan('tiny'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Thêm middleware để xử lý dữ liệu JSON
app.use(express.json());
// Parse form data
app.use(express.urlencoded({ extended: true }));


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
  cookie: { maxAge: 60000,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
   },
  resave: false,
  saveUninitialized: true // khuyến khích dùng false để tuân thủ luật bảo mật (GDPR) và giảm thiểu rác session
}));


// if (process.env.NODE_ENV !== 'production') {
//     app.use((req, res, next) => {
//         if (req.sessionID) {
//             logger.debug(`🌐 REQUEST: Session ID: ${req.sessionID} | URL: ${req.originalUrl}`);
//         }
//         next();
//     });
// }


app.use(passport.initialize());
app.use(passport.session());

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





// Thêm middleware để ghi log mỗi khi có yêu cầu đến server
app.use((req, res, next) => {
  logger.http(`[${req.method}] ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

app.use('/', mainRouter);


app.use(postLogoutLog); // Middleware xử lý lỗi logout
app.use(errorHandler); // Đảm bảo middleware xử lý lỗi được đặt sau tất cả các route khác


let PORT = process.env.PORT || 3000;

const connectToMongoDB = async () => {
    // 1. Log khi bắt đầu kết nối
    logger.info(`Attempting to connect to MongoDB at: ${process.env.MONGO_URL}`); 

    try {
        await mongoose.connect(process.env.MONGO_URL);
        // 2. Log thành công
        logger.info("✅ Connected to myDB successfully!"); 
    } catch (error) {
        // 3. Log chi tiết lỗi khi kết nối thất bại
        logger.error("❌ Failed to connect to MongoDB!");
        logger.error(`Error details: ${error.message}`);
        // Có thể log cả stack trace nếu cần debug sâu
        // logger.error(error); 
        
        // **Quan trọng:** Ném lỗi ra ngoài để hàm gọi (.catch) hoặc process (nếu không có .catch) biết và xử lý tiếp (ví dụ: thoát ứng dụng, thử lại,...)
        throw error; 
    }
}
connectToMongoDB().catch((err) => {
    logger.error("Application cannot start without database connection.");
    // Có thể thêm: process.exit(1); nếu lỗi DB là lỗi nghiêm trọng cần dừng ứng dụng.
});
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Docs có sẵn tại: http://localhost:${PORT}${swaggerEndpoint}`);
});

