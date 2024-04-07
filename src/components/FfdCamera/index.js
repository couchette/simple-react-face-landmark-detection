import React, { useState, useRef } from "react";
import { Button, Select, Layout } from "antd";
import "@tensorflow/tfjs";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/face_mesh";
import Webcam from "react-webcam";
import { runDetector } from "./utils/detector";

const { Option } = Select;
const { Content } = Layout;

export const inputResolution = {
  width: 640,
  height: 480,
};

const FfdCamera = ({ setPredictResult }) => {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const handleVideoLoad = (videoNode) => {
    const video = videoNode.target;
    videoRef.current = videoNode.target;
    if (video.readyState !== 4) return;
    if (loaded) return;
    // runDetector(video, canvasRef.current);
    setLoaded(true);
  };

  // 获取可用的视频设备列表
  const getVideoDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    setDevices(videoDevices);
  };

  // 切换相机设备
  const handleDeviceChange = (deviceId) => {
    setSelectedDevice(deviceId);
  };

  // 开启摄像头
  const startCamera = async () => {
    const constraints = {
      video: {
        deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    setStream(stream);
  };

  // 停止摄像头
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setSelectedDevice(null); // 重置选中的设备
    }
  };

  // 获取视频设备列表
  React.useEffect(() => {
    getVideoDevices();
  }, []);

  return (
    <Content
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Select
        placeholder="选择相机"
        style={{ width: "150px", marginBottom: 16 }}
        onChange={handleDeviceChange}
      >
        {devices.map((device) => (
          <Option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${device.deviceId}`}
          </Option>
        ))}
      </Select>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
        }}
      >
        <Button onClick={startCamera}>启动摄像头</Button>
        <Button onClick={stopCamera} style={{ marginLeft: 8 }}>
          停止摄像头
        </Button>
        <Button
          onClick={() => {
            runDetector(videoRef.current, canvasRef.current, setPredictResult);
          }}
          style={{ marginLeft: 8 }}
        >
          人脸特征点识别
        </Button>
      </div>
      <div
        style={{
          height: String(inputResolution.height) + "px",
          width: String(inputResolution.width) + "px",
          margin: "10px",
          position: "relative",
        }}
      >
        {stream && (
          <Webcam
            style={{
              visibility: "hidden",
              position: "absolute",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
            }}
            // style={{
            //   position: "absolute",
            //   top: "0",
            //   bottom: "0",
            //   left: "0",
            //   right: "0",
            // }}
            width={Math.floor(inputResolution.width)}
            height={Math.floor(inputResolution.height)}
            videoConstraints={{
              deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
            }}
            onLoadedData={handleVideoLoad}
          />
        )}
        <canvas
          style={{
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "0",
            right: "0",
            border: "1px solid black",
          }}
          ref={canvasRef}
          width={inputResolution.width}
          height={inputResolution.height}
        />
      </div>
    </Content>
  );
};

export default FfdCamera;
