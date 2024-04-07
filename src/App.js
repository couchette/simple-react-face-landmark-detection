import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import FfdCamera, { inputResolution } from "./components/FfdCamera";
import DataDisplayBoard from "./components/DataDisplayBoard";
import { getEulerAngle } from "./utils";

function App() {
  const [predictResult, setPredictResult] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const mouthValue = useRef(0.0);
  const lEyeValue = useRef(0.0);
  const rEyeValue = useRef(0.0);

  useEffect(() => {
    if (predictResult) {
      const keyPoints = predictResult.keypoints;
      // 右下眼 145 右上眼 159 左下眼 374 左上眼 386 下嘴唇14 上嘴唇13 鼻梁5 鼻头4
      // 面部上顶点 10 下顶点 152 左顶点 454 右顶点 234
      // 左嘴角 308 右嘴角 78
      // 左眼角 263 右眼角 33

      // 面部高度
      const faceHight = Math.pow(
        Math.pow(keyPoints[10].x - keyPoints[152].x, 2) +
          Math.pow(keyPoints[10].y - keyPoints[152].y, 2),
        0.5
      );
      // 面部宽度
      const faceWidth = Math.pow(
        Math.pow(keyPoints[454].x - keyPoints[234].x, 2) +
          Math.pow(keyPoints[454].y - keyPoints[234].y, 2),
        0.5
      );

      // 左眼开合距离
      lEyeValue.current = Math.pow(
        Math.pow(keyPoints[374].x - keyPoints[386].x, 2) +
          Math.pow(keyPoints[374].y - keyPoints[386].y, 2),
        0.5
      );
      // 右眼开合距离
      rEyeValue.current = Math.pow(
        Math.pow(keyPoints[145].x - keyPoints[159].x, 2) +
          Math.pow(keyPoints[145].y - keyPoints[159].y, 2),
        0.5
      );
      // 嘴巴开合距离
      mouthValue.current = Math.pow(
        Math.pow(keyPoints[14].x - keyPoints[13].x, 2) +
          Math.pow(keyPoints[14].y - keyPoints[13].y, 2),
        0.5
      );
      // 左眼位置
      const lEyeX = (keyPoints[374].x + keyPoints[386].x) / 2;
      const lEyeY = (keyPoints[374].y + keyPoints[386].y) / 2;

      // 右眼位置
      const rEyeX = (keyPoints[145].x - keyPoints[159].x) / 2;
      const rEyeY = (keyPoints[145].y - keyPoints[159].y) / 2;

      // 脸中心
      const faceCenterX = ((lEyeX + rEyeX) / 2 + keyPoints[4].x) / 2;
      const faceCenterY = ((lEyeY + rEyeY) / 2 + keyPoints[4].y) / 2;
      // -------------------------------------
      var modelPoints = window.cv.matFromArray(6, 3, window.cv.CV_32F, [
        0.0,
        0.0,
        0.0, // Nose tip
        0.0,
        -330.0,
        -65.0, // Chin
        -225.0,
        170.0,
        -135.0, // Left eye left corner
        225.0,
        170.0,
        -135.0, // Right eye right corne
        -150.0,
        -150.0,
        -125.0, // Left Mouth corner
        150.0,
        -150.0,
        -125.0, // Right mouth corner
      ]);

      var imagePoints = window.cv.matFromArray(6, 2, window.cv.CV_32F, [
        keyPoints[4].x,
        keyPoints[4].y, // Nose tip
        keyPoints[152].x,
        keyPoints[152].y, // Chin
        keyPoints[263].x,
        keyPoints[263].y, // Left eye left corner
        keyPoints[33].x,
        keyPoints[33].y, // Right eye right corne
        keyPoints[308].x,
        keyPoints[308].y, // Left Mouth corner
        keyPoints[78].x,
        keyPoints[78].y, // Right mouth corner
      ]);

      var focal_length = inputResolution.width;
      var center = [inputResolution.width / 2, inputResolution.height / 2];
      var cameraMatrix = window.cv.matFromArray(3, 3, window.cv.CV_64F, [
        focal_length,
        0,
        center[0],
        0,
        focal_length,
        center[1],
        0,
        0,
        1,
      ]);

      // console.log("Camera Matrix", cameraMatrix.data64F);

      var distCoeffs = window.cv.matFromArray(
        4,
        1,
        window.cv.CV_64F,
        [0, 0, 0, 0]
      ); // Assuming no lens distortion

      var rvec = new window.cv.Mat(3, 1, window.cv.CV_64F);
      var tvec = new window.cv.Mat(3, 1, window.cv.CV_64F);

      let ret_val = window.cv.solvePnP(
        modelPoints,
        imagePoints,
        cameraMatrix,
        distCoeffs,
        rvec,
        tvec,
        false,
        window.cv.SOLVEPNP_ITERATIVE // flags
      );

      // console.log("-------ret_val--------");
      // console.log(ret_val);
      // console.log("-------rvecs--------");
      // console.log("rvecs.data64F", rvec.data64F);
      // console.log("tvecs.data64F", tvec.data64F);

      var rtn = getEulerAngle(rvec);

      var pitch = rtn[0]; // 俯仰角
      var yaw = rtn[1]; // 水平角
      var roll = rtn[2]; // 翻滚角
      // console.log("pitch:", pitch, "yaw:", yaw, "roll:", roll);

      // console.log("左眼开合距离", lEyeValue.current);
      // console.log("右眼开合距离", rEyeValue.current);
      // console.log("嘴巴开合距离", mouthValue.current);
      setDisplayData({
        rollAngleInDegrees: roll,
        yawAngleInDegrees: yaw,
        pitchAngleInDegrees: pitch,
      });
    }
  }, [predictResult]);

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
          width: "100vw",
          justifyContent: "center",
        }}
      >
        <FfdCamera setPredictResult={setPredictResult} />
        <DataDisplayBoard props={displayData} />
      </div>
    </div>
  );
}

export default App;
