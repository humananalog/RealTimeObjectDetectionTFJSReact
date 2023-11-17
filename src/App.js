// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [videoConstraints, setVideoConstraints] = useState({
    width: 640,
    height: 480,
    facingMode: "user"
  });

  // Main function to run COCO-SSD
  const runCoco = async () => {
    const net = await cocossd.load();
    console.log("COCO-SSD model loaded.");
    // Loop and detect objects
    setInterval(() => {
      detect(net);
    }, 10);
  };

  // Detection function
  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width and height
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const obj = await net.detect(video);

      // Draw detections
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx, videoWidth, videoHeight); // Pass webcam dimensions to drawRect
    }
  };

// Function to handle saving the picture
const savePicture = async () => {
  if (webcamRef.current) {
    // Switch to full resolution
    setVideoConstraints({
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      facingMode: "user"
    });

    // Wait for the webcam to adjust
    await new Promise(resolve => setTimeout(resolve, 900));

    // Capture the image
    const canvas = document.createElement('canvas');
    const video = webcamRef.current.video;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL('image/png');

    // Create download link and click it
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = 'captured-image.png';
    link.click();

    // Set save message and reset after 3 seconds
    setSaveMessage('Picture saved');
    setTimeout(() => setSaveMessage(''), 3000);

    // Switch back to reduced resolution
    setVideoConstraints({
      width: 640,
      height: 480,
      facingMode: "user"
    });
  }
};


  // Run COCO-SSD model when component mounts
  useEffect(() => {
    runCoco();
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={videoConstraints}
          className="videoCanvas" // Apply the class here
          style={{
            position: "absolute",
            marginLeft:0,
            marginRight: 0,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 8, // Lower zIndex for Webcam
          }} // Removed width and height
        />
  
        <canvas
          ref={canvasRef}
          className="videoCanvas" // Apply the class here
          style={{
            position: "absolute",
            marginLeft: 0,
            marginRight:0,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9, // Higher zIndex for Canvas
          }} // Removed width and height
        />

        {/* Position the button below the webcam and canvas */}
        <div style={{ marginTop: "500px" }}>
          <button onClick={savePicture}>Save Picture</button>
          {saveMessage && <p>{saveMessage}</p>}
        </div>
      </header>
    </div>
  );
}

export default App;