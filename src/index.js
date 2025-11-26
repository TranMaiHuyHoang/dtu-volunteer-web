import express, { json, urlencoded, static as expressStatic } from 'express';
import { connect } from 'mongoose';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { join } from 'path';

// === SỬA LỖI __dirname ===
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// =========================

import cors from 'cors';
import mainRouter from './routes/index.routes.js';
// Set up Global configuration access
import { config } from 'dotenv';
import flash from 'connect-flash';
import passport from 'passport';
// SỬA LỖI: Bỏ giải cấu trúc (destructuring) vì passport là CommonJS module được nhập vào ES Module.
// const { initialize, session: _session } = passport; // DÒNG CŨ ĐÃ GÂY LỖI
// HTTP request logger middleware for node.js
import "./utils/passportConfig.js";
import { serve, setup } from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js'; // Import file cấu hình Swagger


import errorHandler from './middlewares/errorHandler.middleware.js';
import logger from './config/logger.js';
const { info, error: _error, http } = logger;
import { postLogoutLog } from './middlewares/logout.middleware.js';
import httpLogger from './middlewares/httpLogger.middleware.js';
import path from 'path';
import ViteExpress from 'vite-express';

//env config
import urlConfig  from './config/urlConfig.js';
//
config();
const app = express();
// Định nghĩa lại __filename và __dirname cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Kết nối MySQL (tự động kết nối khi require)
//require('./config/mysql');

// CORS middleware
app.use(cors());
//var morgan = require('morgan')
// app.use(morgan('tiny'));
app.use(express.json());
app.set('views', join(__dirname, 'views')); // SỬ DỤNG __dirname
app.set('view engine', 'ejs');


// Thêm middleware để xử lý dữ liệu JSON
app.use(json());
// Parse form data
app.use(urlencoded({ extended: true }));


// Middleware cho API docs
const swaggerEndpoint = '/api-docs';
app.use(
    swaggerEndpoint, 
    serve, 
    setup(swaggerSpecs, { explorer: true })
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
//     app.use((req, res, next) => {
//         if (req.sessionID) {
//             logger.debug(`🌐 REQUEST: Session ID: ${req.sessionID} | URL: ${req.originalUrl}`);
//         }
//         next();
//     });
// }


// SỬA LỖI: Gọi trực tiếp hàm initialize và session từ passport (đối tượng default import)
app.use(passport.initialize());
app.use(passport.session());


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



const staticMiddleware = expressStatic(join(__dirname, 'public')); // SỬ DỤNG __dirname

app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    return next();  // Bỏ qua, để ViteExpress xử lý
  }
  staticMiddleware(req, res, next);
});

// Serve Vite in dev, static in prod
ViteExpress.config({
  mode: process.env.NODE_ENV || 'development'
});



app.use(httpLogger);
app.use('/', mainRouter);


app.use(postLogoutLog); // Middleware xử lý lỗi logout
app.use(errorHandler); // Đảm bảo middleware xử lý lỗi được đặt sau tất cả các route khác


let PORT = process.env.PORT || 3000;

const connectToMongoDB = async () => {
    // 1. Log khi bắt đầu kết nối
    info(`Attempting to connect to MongoDB at: ${process.env.MONGO_URL}`); 

    try {
        await connect(process.env.MONGO_URL);
        // 2. Log thành công
        info("✅ Connected to myDB successfully!"); 
    } catch (error) {
        // 3. Log chi tiết lỗi khi kết nối thất bại
        _error("❌ Failed to connect to MongoDB!");
        _error(`Error details: ${error.message}`);
        // Có thể log cả stack trace nếu cần debug sâu
        // logger.error(error); 
        
        // **Quan trọng:** Ném lỗi ra ngoài để hàm gọi (.catch) hoặc process (nếu không có .catch) biết và xử lý tiếp (ví dụ: thoát ứng dụng, thử lại,...)
        throw error; 
    }
};
connectToMongoDB().catch((err) => {
    _error("Application cannot start without database connection.");
    // Có thể thêm: process.exit(1); nếu lỗi DB là lỗi nghiêm trọng cần dừng ứng dụng.
});

ViteExpress.config({
  mode: process.env.NODE_ENV || 'development',
  printViteDevServerHost: true  // ✅ In ra thông tin Vite server
});

ViteExpress.listen( app,PORT, () => {
    info(`Server running on ${urlConfig.baseUrl}`);
    info(`Docs có sẵn tại: ${urlConfig.baseUrl}${swaggerEndpoint}`);
});


