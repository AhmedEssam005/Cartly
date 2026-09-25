const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morganMiddleware = require("./middlewares/morgan");
const authRoutes = require("./modules/auth/auth.routes");
const categoryRoutes = require("./modules/category/category.route");
const profileRoutes = require("./modules/profile/profile.route");
const logger = require("./configs/logger");
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morganMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/", (req, res) => {
	res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Something Went Wrong";
	logger.error("Request failed", {
		message: err.message,
		detail: err.details ? err.details : {},
		stack: err.stack,
		method: req.method,
		url: req.originalUrl,
		statusCode,
	});
	res.status(statusCode).json({
		message: statusCode >= 500 ? "Internal Server Error" : message,
		errors: err.details ? err.details : {},
	});
});

module.exports = app;
