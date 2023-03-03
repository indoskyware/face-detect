const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const detectFaces = require("./face-detection");

app.use(express.json());
app.use(fileUpload());

app.post("/face-detection", async (req, res) => {
  try {
    const { image } = req.files;

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
    const fileName = uuidv4() + ".jpg";
    image.mv(pathUpload + fileName);

    // Face Detection Image
    const data = await detectFaces(pathUpload, fileName);

    if (data.length > 0) {
      if (data.length > 1) {
        image.mv(pathUpload + "errors/" + fileName);
      }
      res.json({
        success: true,
        message: "Face Detected",
        data: {
          face_count: data.length,
        },
      });
    } else {
      image.mv(pathUpload + "errors/" + fileName);
      res.status(404).json({
        success: false,
        message: "Face Undetected",
        data: null,
      });
    }
    fs.unlinkSync(pathUpload + fileName, { force: true });
  } catch (e) {
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
