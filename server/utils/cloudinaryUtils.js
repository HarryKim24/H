const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "posts" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteImageFromCloudinary = (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) return resolve();

    try {
      const urlParts = imageUrl.split("/");
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const filenameWithoutExtension = filenameWithExtension.split(".")[0];

      const folderName = "posts";
      const publicId = `${folderName}/${filenameWithoutExtension}`;

      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    } catch (error) {
      console.error("Cloudinary publicId 추출 오류:", error);
      reject(error);
    }
  });
};

module.exports = { uploadImageToCloudinary, deleteImageFromCloudinary };
