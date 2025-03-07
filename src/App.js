// App.js

import React, { useRef, useState, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [saveMessage, setSaveMessage] = useState('');
  const mobileDevice = isMobileDevice();
  const [videoConstraints, setVideoConstraints] = useState({
    width: 640,
    height: 480,
    facingMode: mobileDevice ? "environment" : "user"
  });

  const runCoco = useCallback(async () => {
    const net = await cocossd.load();
    console.log("COCO-SSD model loaded.");
    setInterval(() => {
      detect(net);
    }, 100);
  }, []);

  const detect = useCallback(async (net) => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const obj = await net.detect(video);
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  }, []);

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
  
      const imageSrc = canvas.toDataURL('image/png').split(',')[1]; // Get Base64 data
  
      try {
        // Send this imageSrc to your Cloud Function
        const response = await fetch('https://us-central1-splendid-sonar-403213.cloudfunctions.net/uploadImage', {
          method: 'POST',
          body: JSON.stringify({ image: imageSrc }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (response.ok) {
          console.log('Image uploaded successfully');
          setSaveMessage('Picture saved to cloud');
        } else {
          console.error('Error uploading image');
          setSaveMessage('Error saving image to cloud');
        }
      } catch (error) {
        console.error('Error:', error);
        setSaveMessage('Error saving image to cloud');
      }
  
      // Switch back to reduced resolution
      setVideoConstraints({
        width: 640,
        height: 480,
        facingMode: "user"
      });
    }
  };
  
  

  useEffect(() => {
    runCoco();
  }, [runCoco]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam ref={webcamRef} audio={false} videoConstraints={videoConstraints} className="videoCanvas" />
        <canvas ref={canvasRef} className="videoCanvas" />
        <div style={{ marginTop: "500px" }}>
          <button onClick={savePicture}>Save Picture</button>
          {saveMessage && <p>{saveMessage}</p>}
        </div>
      </header>
    </div>
  );
}

export default App;
