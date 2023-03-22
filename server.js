const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const detectFaces = require("./face-detection");
const logger = require("./logger");

app.use(express.json());
app.use(fileUpload());

app.post("/face-detection", async (req, res) => {
  try {
    const { id } = req.body;
    const { image } = req.files;
    const minConfidence = parseFloat(req.body.minConfidence ?? 0.3);

    // If no image submitted, exit
    if (!image) {
      return res.status(400).json({
        status: false,
        message: "Please insert a file!",
        data: null,
      });
    }

    // If does not have image mime type prevent from uploading
    // if (!/^image/.test(image.mimetype)) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Image Required!",
    //     data: null,
    //   });
    // }

    // If directory uploads not available
    // fs.existsSync("upload") || fs.mkdirSync("upload");

    // Uploading image
    const pathUpload = __dirname + "/upload/";

    let fileName;
    if (id === undefined) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");

      fileName = `${year}${month}${day}_${hour}${minute}_${uuidv4()}.jpg`;
    } else {
      fileName = `${id}_${uuidv4()}.jpg`;
    }
    image.mv(pathUpload + fileName);

    // Face Detection Image
    const data = await detectFaces(pathUpload, fileName, minConfidence);
    fs.unlinkSync(`${pathUpload}${fileName}`, { force: true });

    if (data.length > 0) {
      if (data.length > 1) {
        image.mv(`${pathUpload}errors/MULTI_${fileName}`);
      }
      res.json({
        success: true,
        message: "Face Detected",
        data: {
          face_count: data.length,
        },
      });
    } else {
      image.mv(`${pathUpload}errors/NOFACE_${fileName}`);
      res.status(404).json({
        success: false,
        message: "Face Undetected",
        data: null,
      });
    }
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${e}`,
      data: null,
    });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`App is listening on port ${listener.address().port}`);
});
