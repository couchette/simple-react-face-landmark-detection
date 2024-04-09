import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { drawCanvas } from "./drawCanvas";

export const runDetector = async (
  video,
  canvas,
  eachDetectCallback = (result) => {}
) => {
  console.log("runDetector");
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: "tfjs",
    detectorModelUrl: "models/face-detect-short/model.json",
    landmarkModelUrl: "models/face-mesh/model.json",
  };
  const detector = await faceLandmarksDetection.createDetector(
    model,
    detectorConfig
  );

  const detect = async (net) => {
    const estimationConfig = { flipHorizontal: false };
    const faces = await net.estimateFaces(video, estimationConfig);
    requestAnimationFrame(() => drawCanvas(faces[0], canvas));
    eachDetectCallback(faces[0]);
    detect(detector);
  };
  detect(detector);
};
