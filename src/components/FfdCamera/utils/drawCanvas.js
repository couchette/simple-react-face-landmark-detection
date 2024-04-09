import { TRIANGULATION } from "./triangulation";

export const drawCanvas = (prediction, canvas) => {
  if (!prediction) return;
  const keyPoints = prediction.keypoints;
  if (!keyPoints) return;
  const canvasMat = new window.cv.Mat.zeros(
    canvas.height,
    canvas.width,
    window.cv.CV_8UC4
  );
  for (let i = 0; i < TRIANGULATION.length / 3; i++) {
    const points = [
      TRIANGULATION[i * 3],
      TRIANGULATION[i * 3 + 1],
      TRIANGULATION[i * 3 + 2],
    ].map(
      (index) =>
        new window.cv.Point(
          Math.round(keyPoints[index].x),
          Math.round(keyPoints[index].y)
        )
    );
    drawTriangle(canvasMat, points);
  }

  const circleColor = new window.cv.Scalar(0, 0, 255, 255);
  for (let i = 0; i < keyPoints.length; i++) {
    let center = new window.cv.Point(
      Math.round(keyPoints[i].x),
      Math.round(keyPoints[i].y)
    );
    window.cv.circle(canvasMat, center, 2, circleColor);
  }

  drawPoseLine(canvasMat, keyPoints);
  window.cv.imshow(canvas.id, canvasMat);
  canvasMat.delete();
};

const drawTriangle = (canvasMat, points) => {
  window.cv.line(
    canvasMat,
    points[0],
    points[1],
    new window.cv.Scalar(0, 0, 0, 255),
    1
  );
  window.cv.line(
    canvasMat,
    points[1],
    points[2],
    new window.cv.Scalar(0, 0, 0, 255),
    1
  );
  window.cv.line(
    canvasMat,
    points[2],
    points[0],
    new window.cv.Scalar(0, 0, 0, 255),
    1
  );
};

function drawPoseLine(canvasMat, keyPoints) {
  // 右下眼 145 右上眼 159 左下眼 374 左上眼 386 下嘴唇14 上嘴唇13 鼻梁5 鼻头4
  // 面部上顶点 10 下顶点 152 左顶点 454 右顶点 234
  // 左嘴角 308 右嘴角 78
  // 左眼角 263 右眼角 33

  // 左眼开合距离
  const lEyeValue = Math.pow(
    Math.pow(keyPoints[374].x - keyPoints[386].x, 2) +
      Math.pow(keyPoints[374].y - keyPoints[386].y, 2),
    0.5
  );
  // 右眼开合距离
  const rEyeValue = Math.pow(
    Math.pow(keyPoints[145].x - keyPoints[159].x, 2) +
      Math.pow(keyPoints[145].y - keyPoints[159].y, 2),
    0.5
  );
  // 嘴巴开合距离
  const mouthValue = Math.pow(
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
  //
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

  var focal_length = canvasMat.cols;
  var center = [canvasMat.cols / 2, canvasMat.rows / 2];
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

  var distCoeffs = window.cv.matFromArray(4, 1, window.cv.CV_64F, [0, 0, 0, 0]); // Assuming no lens distortion

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

  if (!ret_val) return false;

  var rtn = getEulerAngle(rvec);

  var pitch = rtn[0]; // 俯仰角
  var yaw = rtn[1]; // 水平角
  var roll = rtn[2]; // 翻滚角
  // console.log("pitch:", pitch, "yaw:", yaw, "roll:", roll);

  var noseEndPoint2D = new window.cv.Mat(1, 2, window.cv.CV_64F);
  var jacobian = new window.cv.Mat(imagePoints.rows * 2, 13, window.cv.CV_64F);
  window.cv.projectPoints(
    window.cv.matFromArray(1, 3, window.cv.CV_64F, [0.0, 0.0, 700.0]),
    rvec,
    tvec,
    cameraMatrix,
    distCoeffs,
    noseEndPoint2D,
    jacobian
  );

  // 绘制线段，连接鼻尖和其它点
  var p1 = new window.cv.Point(
    Math.round(imagePoints.data32F[0]),
    Math.round(imagePoints.data32F[1])
  );
  var p2 = new window.cv.Point(
    Math.round(noseEndPoint2D.data64F[0]),
    Math.round(noseEndPoint2D.data64F[1])
  );

  window.cv.line(canvasMat, p1, p2, new window.cv.Scalar(255, 0, 0, 255), 2);
  modelPoints.delete();
  imagePoints.delete();
  cameraMatrix.delete();
  distCoeffs.delete();
  rvec.delete();
  tvec.delete();
  noseEndPoint2D.delete();
  jacobian.delete();
  return true;
}

function getEulerAngle(rotationVector) {
  // calculate rotation angles
  let theta = window.cv.norm(rotationVector, window.cv.NORM_L2);

  // transformed to quaternion
  let w = Math.cos(theta / 2);
  let x = (Math.sin(theta / 2) * rotationVector.data64F[0]) / theta;
  let y = (Math.sin(theta / 2) * rotationVector.data64F[1]) / theta;
  let z = (Math.sin(theta / 2) * rotationVector.data64F[2]) / theta;

  let ysqr = y * y;
  // pitch (x-axis rotation)
  let t0 = 2.0 * (w * x + y * z);
  let t1 = 1.0 - 2.0 * (x * x + ysqr);
  // console.log("t0:", t0, "t1:", t1);
  let pitch = Math.atan2(t0, t1);

  // yaw (y-axis rotation)
  let t2 = 2.0 * (w * y - z * x);
  if (t2 > 1.0) {
    t2 = 1.0;
  }
  if (t2 < -1.0) {
    t2 = -1.0;
  }
  let yaw = Math.asin(t2);

  // roll (z-axis rotation)
  let t3 = 2.0 * (w * z + x * y);
  let t4 = 1.0 - 2.0 * (ysqr + z * z);
  let roll = Math.atan2(t3, t4);

  // console.log("pitch:", pitch, "yaw:", yaw, "roll:", roll);

  // 单位转换：将弧度转换为度
  let Y = parseInt((pitch / Math.PI) * 180);
  let X = parseInt((yaw / Math.PI) * 180);
  let Z = parseInt((roll / Math.PI) * 180);

  return [Y, X, Z];
}
