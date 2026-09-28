const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
	if (allowedMimeTypes.includes(file.mimetype)) {
		return cb(null, true);
	}
	cb(
		new Error("Invalid file type. Only JPEG, PNG, and WEBP are allowed."),
		false,
	);
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});

module.exports = upload;
