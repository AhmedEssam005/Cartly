require("dotenv").config();
const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
	schema: "./src/db/schema/*.js",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DB_URL,
	},
});
