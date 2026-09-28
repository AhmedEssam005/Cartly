const supabase = require("../configs/supabase");

exports.uploadImage = async ({
	bucketName,
	filePath,
	fileBuffer,
	contentType,
}) => {
	const { data, error } = await supabase.storage
		.from(bucketName)
		.upload(filePath, fileBuffer, {
			contentType: contentType,
			upsert: false,
		});
	if (error) {
		const err = new Error("Failed to upload image to Supabase Storage");
		err.statusCode = 500;
		throw err;
	}
	return data;
};

exports.getPublicUrl = (bucketName, filePath) => {
	const { data, error } = supabase.storage
		.from(bucketName)
		.getPublicUrl(filePath);
	if (error) {
		const err = new Error("Failed to get public URL from Supabase Storage");
		err.statusCode = 500;
		throw err;
	}
	return data.publicUrl;
};

exports.deleteImage = async (bucketName, filePath) => {
	const { data, error } = await supabase.storage
		.from(bucketName)
		.remove([filePath]);
	if (error) {
		const err = new Error("Failed to delete image from Supabase Storage");
		err.statusCode = 500;
		throw err;
	}
	return data;
};
