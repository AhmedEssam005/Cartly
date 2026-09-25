const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morganMiddleware = require("./middlewares/morgan");
const authRoutes = require("./modules/auth/auth.routes");
const logger = require("./configs/logger");
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morganMiddleware);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Something Went Wrong";
	logger.error(
		`${req.method} ${req.originalUrl} ${statusCode}: ${message}`,
	);
	res.status(statusCode).json({
		message: statusCode >= 500 ? "Internal Server Error" : message,
		errors: err.details ? err.details : {},
	});
});

module.exports = app;
