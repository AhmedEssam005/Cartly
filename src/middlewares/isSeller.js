const db = require("../db/index");
const { profile } = require("../db/schema/schema");
const { eq } = require("drizzle-orm");
module.exports = async (req, res, next) => {
	try {
		const [userProfile] = await db
			.select({ role: profile.role })
			.from(profile)
			.where(eq(profile.profileId, req.user.id))
			.execute();
		if (!userProfile || userProfile.role !== "seller") {
			return res.status(403).json({ message: "Access denied" });
		}
		next();
	} catch (error) {
		next(error);
	}
};
