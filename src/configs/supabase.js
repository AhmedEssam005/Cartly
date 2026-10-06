require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const client = createClient(
	process.env.SUPABASE_API_LINK,
	process.env.SUPABASE_PUBLISHABLE_KEY,
);

module.exports = client;
