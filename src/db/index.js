require("dotenv").config();
const { drizzle } = require("drizzle-orm/node-postgres");
module.exports = drizzle(process.env.DB_URL);