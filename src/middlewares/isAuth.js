const { jwtVerify, createRemoteJWKSet } = require("jose");
const logger = require("../configs/logger");
require("dotenv").config();

const SUPABASE_JWT_ISSUER = `${process.env.SUPABASE_API_LINK}/auth/v1`;

const SUPABASE_JWKS = createRemoteJWKSet(
	new URL(`${SUPABASE_JWT_ISSUER}/.well-known/jwks.json`),
);

module.exports = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			const error = new Error("Unauthorized: Missing Authorization header");
			error.statusCode = 401;
			throw error;
		}

		const [scheme, token] = authHeader.split(" ");

		if (scheme !== "Bearer" || !token) {
			const error = new Error("Unauthorized: Invalid Authorization header");
			error.statusCode = 401;
			throw error;
		}

		const { payload } = await jwtVerify(token, SUPABASE_JWKS, {
			issuer: SUPABASE_JWT_ISSUER,
			audience: "authenticated",
		});

		req.user = {
			id: payload.sub,
		};

		logger.info(`User authenticated with ID: ${req.user.id}`);
		next();
	} catch (err) {
		err.statusCode = err.statusCode || 401;
		next(err);
	}
};
