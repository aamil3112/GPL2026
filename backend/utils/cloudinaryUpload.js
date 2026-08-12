const cloudinary = require("../config/cloudinary");

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `gpl-2026/${folder}`,
        resource_type: "image",
        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

module.exports = { uploadBufferToCloudinary };
