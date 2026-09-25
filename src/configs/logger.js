const winston = require("winston");
const path = require("path");

const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.printf(
		(info) =>
			`[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`,
	),
);

const transports = [
	new winston.transports.Console({
		format: winston.format.combine(
			format,
			winston.format.colorize({ all: true }),
		),
	}),
	new winston.transports.File({
		filename: path.join(__dirname, "..", "..", "logs", "error.log"),
		level: "error",
		format,
	}),
	new winston.transports.File({
		filename: path.join(__dirname, "..", "..", "logs", "combined.log"),
		format,
	}),
];

const logger = winston.createLogger({
	transports,
	level: process.env.NODE_ENV === "development" ? "debug" : "info",
});

module.exports = logger;
