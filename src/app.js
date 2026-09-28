const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morganMiddleware = require("./middlewares/morgan");
const authRoutes = require("./modules/auth/auth.routes");
const categoryRoutes = require("./modules/category/category.route");
const profileRoutes = require("./modules/profile/profile.route");
const catalogRoutes = require("./modules/catalog/catalog.route");
const submissionRoutes = require("./modules/catalogSubmission/catalogSubmission.route");
const sellerListingRoutes = require("./modules/sellerListing/sellerListing.route");
const logger = require("./configs/logger");
const app = express();

app.use(cors());
app.use(helmet());
app.use(morganMiddleware);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/catalog-submissions", submissionRoutes);
app.use("/api/seller-listings", sellerListingRoutes);

app.use("/", (req, res) => {
	res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
	const pgErr = err.cause ?? err;
	let statusCode = err.statusCode || 500;
	let message = err.message || "Something Went Wrong";
	let clientErrors = err.statusCode === 422 && err.detail ? err.detail : {};

	switch (pgErr.code) {
		case "23505":
			statusCode = 409;
			message = "A record with this value already exists";
			break;
		case "23503":
			statusCode = 400;
			message = "Referenced resource does not exist";
			break;
		case "23502":
			statusCode = 400;
			message = "A required field is missing";
			break;
		case "22P02":
			statusCode = 400;
			message = "Invalid parameter format";
			break;
	}

	logger.error("Request failed", {
		message: err.message,
		dbCode: pgErr.code,
		dbDetail: pgErr.detail,
		validation: err.statusCode === 422 ? err.detail : undefined,
		stack: err.stack,
		method: req.method,
		url: req.originalUrl,
		statusCode,
	});

	res.status(statusCode).json({
		message: statusCode >= 500 ? "Internal Server Error" : message,
		errors: clientErrors,
	});
});

module.exports = app;
