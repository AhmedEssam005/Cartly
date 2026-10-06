const sharp = require("sharp");
const crypto = require("crypto");
const { deleteImage, uploadImage, getPublicUrl } = require("./supabaseStorage");
const processImage = async (buffer, width, height) => {
	const processedImage = await sharp(buffer)
		.resize({
			width,
			height,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality: 80 })
		.toBuffer();

	return processedImage;
};

module.exports = async (files, bucket, folder) => {
	const uploadedImages = [];
	try {
		for (const file of files) {
			const processedImage = await processImage(file.buffer, 1200, 1200);
			const path = `${folder}/${crypto.randomUUID()}.webp`;
			await uploadImage({
				bucketName: bucket,
				filePath: path,
				fileBuffer: processedImage,
				contentType: "image/webp",
			});
			const publicUrl = getPublicUrl(bucket, path);
			uploadedImages.push({
				path,
				publicUrl,
			});
		}
		return uploadedImages;
	} catch (error) {
		await Promise.all(
			uploadedImages.map((img) => deleteImage(bucket, img.path)),
		);
		throw error;
	}
};
