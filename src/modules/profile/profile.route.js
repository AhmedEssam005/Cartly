const router = require("express").Router();
const profileController = require("./profile.controller");
const profileValidator = require("./profile.validator");
const commonValidator = require("../../middlewares/commonValidator");
const isAuth = require("../../middlewares/isAuth");

router.use(isAuth);

router.get("/", profileController.getProfile);
router.patch(
	"/",
	profileValidator.updateProfileValidator,
	commonValidator,
	profileController.updateProfile,
);

router.post(
	"/seller-kyc",
	profileValidator.sellerKycValidator,
	commonValidator,
	profileController.submitSellerKyc,
);

router
	.route("/addresses")
	.get(profileController.getAllAddresses)
	.post(
		profileValidator.createAddressValidator,
		commonValidator,
		profileController.addAddress,
	);

router
	.route("/addresses/:addressId")
	.get(
		profileValidator.addressIdValidator,
		commonValidator,
		profileController.getAddress,
	)
	.patch(
		profileValidator.updateAddressValidator,
		commonValidator,
		profileController.updateAddress,
	)
	.delete(
		profileValidator.addressIdValidator,
		commonValidator,
		profileController.deleteAddress,
	);

router.patch(
	"/addresses/:addressId/default",
	profileValidator.addressIdValidator,
	commonValidator,
	profileController.setDefaultAddress,
);

module.exports = router;
