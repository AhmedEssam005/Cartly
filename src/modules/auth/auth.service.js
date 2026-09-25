const db = require("../../db/index");
const supabaseAdmin = require("../../configs/supabaseAdmin");
const supabase = require("../../configs/supabase");
const { profile } = require("../../db/schema/schema");
const { eq } = require("drizzle-orm");
const logger = require("../../configs/logger");

// pure auth endpoint that require no db interaction will be handled in client side.
// This is because supabase auth client is already available in the client side and we can use it directly without going through the server.

exports.registerUser = async (userData) => {
	const { email, password, firstName, lastName } = userData;

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error || !data.user) {
		const error = new Error(
			"Failed to register your account. Please try again",
		);
		error.statusCode = 400;
		throw error;
	}

	if (data.user.identities?.length === 0) {
		const error = new Error("An account may already exist. Try logging in");
		error.statusCode = 400;
		throw error;
	}
	try {
		const [newProfile] = await db
			.insert(profile)
			.values({
				profileId: data.user.id,
				firstName,
				lastName,
				role: "buyer",
				isDeleted: false,
			})
			.returning();

		return {
			user: data.user,
			profile: newProfile,
		};
	} catch (err) {
		logger.error("Profile creation failed:", err);
		const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
			data.user.id,
		);

		if (deleteError) {
			logger.error("CRITICAL: Failed to rollback Auth user:", deleteError);
		}
		logger.info(
			"Rolled back Auth user creation due to profile creation failure.",
		);
		throw new Error("Failed to register your account. Please try again.");
	}
};

exports.me = async (userId) => {
	const [profileData] = await db
		.select({
			id: profile.profileId,
			firstName: profile.firstName,
			lastName: profile.lastName,
			role: profile.role,
		})
		.from(profile)
		.where(eq(profile.profileId, userId))
		.execute();
	if (!profileData) {
		const error = new Error("User not found");
		error.statusCode = 404;
		throw error;
	}
	return profileData;
};
