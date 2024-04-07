export function getEulerAngle(rotationVector) {
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
