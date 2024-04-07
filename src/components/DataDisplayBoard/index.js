import React, { useEffect } from "react";

function DataDisplayBoard({ props }) {
  // console.log(props);
  var rollAngleInDegrees = 0;
  var yawAngleInDegrees = 0;
  var pitchAngleInDegrees = 0;
  if (props) {
    rollAngleInDegrees = props.rollAngleInDegrees;
    yawAngleInDegrees = props.yawAngleInDegrees;
    pitchAngleInDegrees = props.pitchAngleInDegrees;
  }

  useEffect(() => {
    // console.log(window.cv.solvePnP());
    // 使用OpenCV.js对象
    
  }, []);
  return (
    <div style={{ margin: "20px" }}>
      <p>{"翻滚角: " + String(rollAngleInDegrees.toFixed(4))}</p>
      <p>{"水平角: " + String(yawAngleInDegrees.toFixed(4))}</p>
      <p>{"俯仰角: " + String(pitchAngleInDegrees.toFixed(4))}</p>
    </div>
  );
}
export default DataDisplayBoard;
