const fs = require("fs");
const faceapi = require("@vladmandic/face-api"); // use this when face-api is installed as module (majority of use cases)

async function detectFaces(path, filename) {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk("model"); // load models from a specific patch
  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.3,
    maxResults: 2,
  }); // set model options
  const buffer = fs.readFileSync(path + filename); // load jpg image as binary
  const decodeT = faceapi.tf.node.decodeImage(buffer, 3); // decode binary buffer to rgb tensor
  const expandT = faceapi.tf.expandDims(decodeT, 0); // add batch dimension to tensor
  const result = await faceapi.detectAllFaces(expandT, options); // run detection
  faceapi.tf.dispose([decodeT, expandT]); // dispose tensors to avoid memory leaks

  return result;
}

module.exports = detectFaces;
