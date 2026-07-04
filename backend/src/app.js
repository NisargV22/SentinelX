const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");

const authRoutes = require("./modules/auth/auth.routes");
const eventRoutes = require("./modules/events/events.routes");
const blockchainRoutes = require("./modules/blockchain/blockchain.routes");
const complianceRoutes = require("./modules/compliance/compliance.routes");
const auditRoutes = require("./modules/audit/audit.routes");
const siemRoutes = require("./modules/events/siem.routes");
const externalRoutes = require("./routes/external.routes");

const app = express();

// 1. HTTP Security Headers
app.use(helmet());

// 2. Restrict CORS Origins to prevent Cross-Site Scripting (XSS) and CSRF leakages
const whitelist = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4000",
  "http://127.0.0.1:4000"
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new ApiError(403, "CORS policy violation: Unauthorized origin access."));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const siemAuditor = require("./middleware/siemAuditor");
app.use(siemAuditor);

// 3. Custom recursive NoSQL Injection Sanitization Middleware (Prevent Mongo Operator Injections)
const sanitizeNoSql = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`[Security Alert] Deleted suspicious NoSQL key payload: ${key}`);
        delete obj[key];
      } else {
        sanitizeNoSql(obj[key]);
      }
    }
  }
};

app.use((req, res, next) => {
  sanitizeNoSql(req.body);
  sanitizeNoSql(req.query);
  sanitizeNoSql(req.params);
  next();
});

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api", siemRoutes);
app.use("/api/external", externalRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, "Not Found"));
});

app.use(errorHandler);

module.exports = app;
