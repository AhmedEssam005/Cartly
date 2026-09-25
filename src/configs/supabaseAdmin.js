require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const client = createClient(
	process.env.SUPABASE_API_LINK,
	process.env.SUPABASE_SECRET_KEY,
);

module.exports = client;
