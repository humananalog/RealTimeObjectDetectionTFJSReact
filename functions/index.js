const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
admin.initializeApp();

exports.uploadImage = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const imageBuffer = Buffer.from(req.body.image, "base64");
      // Specify the bucket name here
      const bucket = admin.storage().bucket("myapp-images-bucket");
      const fileName = `uploads/image-${Date.now()}.png`;
      const file = bucket.file(fileName);

      file.save(imageBuffer, {
        metadata: {contentType: "image/png"},
      }).then(() => {
        const responseMessage = "Image uploaded successfully";
        res.status(200).send({message: responseMessage, fileName});
      }).catch((error) => {
        console.error("Error uploading image:", error);
        res.status(500).send({error: "Internal server error"});
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({error: "Internal server error"});
    }
  });
});
