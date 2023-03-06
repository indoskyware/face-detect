const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const detectFaces = require("./face-detection");

app.use(express.json());
app.use(fileUpload());

app.get("/tools-check", async (req, res) => {
  let arrCheck = [];

  fs.readdir("./upload/errors", (err, files) => {
    files.forEach(async (file) => {
      const pathUpload = __dirname + "/upload/errors/";
      const moveUpload = __dirname + "/upload/result/";
      const fileName = file;

      if (file.split(".")[1] == "jpg" || file.split(".")[1] == 'jpeg') {
        var result = await detectFaces(pathUpload, fileName);

        if (result.length == 0) {
          fs.rename(pathUpload + file, moveUpload + "NF-" + fileName, (err) => {
            if (err) throw err;
            console.log("Success Moved");
          });
        } else if (result.length == 1) {
          fs.rename(
            pathUpload + file,
            moveUpload +
              "SUCCESS-" +
              result[0]._score.toFixed(3) +
              "-" +
              fileName,
            (err) => {
              if (err) throw err;

              console.log("Success Moved");
            }
          );
        } else {
          fs.rename(
            pathUpload + file,
            moveUpload +
              "MULTIPLE-" +
              result[0]._score.toFixed(3) +
              "-" +
              result[1]._score.toFixed(3) +
              "-" +
              fileName,
            (err) => {
              if (err) throw err;

              console.log("Success Moved");
            }
          );
        }
      }
    });
  });

  res.json(arrCheck);
});

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
          data,
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
