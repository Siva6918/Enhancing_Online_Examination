import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import Webcam from 'react-webcam';
import { drawRect } from './utilities';
import { Box, Card } from '@mui/material';
import swal from 'sweetalert';

export default function Home({ cheatingLog, updateCheatingLog }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [lastDetectionTime, setLastDetectionTime] = useState({});

  const handleDetection = (type) => {
    const now = Date.now();
    const lastTime = lastDetectionTime[type] || 0;

    // Only update if 3 seconds have passed since last detection
    if (now - lastTime >= 3000) {
      setLastDetectionTime((prev) => ({
        ...prev,
        [type]: now,
      }));

      // Create an object with the updated count
      const updatedLog = {
        ...cheatingLog,
        [`${type}Count`]: (cheatingLog[`${type}Count`] || 0) + 1,
      };

      // Update the cheating log with the new count
      updateCheatingLog(updatedLog);

      // Show appropriate alert
      switch (type) {
        case 'noFace':
          swal('Face Not Visible', 'Warning Recorded', 'warning');
          break;
        case 'multipleFace':
          swal('Multiple Faces Detected', 'Warning Recorded', 'warning');
          break;
        case 'cellPhone':
          swal('Cell Phone Detected', 'Warning Recorded', 'warning');
          break;
        case 'prohibitedObject':
          swal('Prohibited Object Detected', 'Warning Recorded', 'warning');
          break;
        default:
          break;
      }
    }
  };

  const runCoco = async () => {
    try {
      const net = await cocossd.load();
      console.log('AI model loaded.');

      setInterval(() => {
        detect(net);
      }, 1000);
    } catch (error) {
      console.error('Error loading model:', error);
      swal('Error', 'Failed to load AI model. Please refresh the page.', 'error');
    }
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      try {
        const obj = await net.detect(video);
        const ctx = canvasRef.current.getContext('2d');

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawRect(obj, ctx);

        let person_count = 0;
        let faceDetected = false;

        obj.forEach((element) => {
          console.log('Detected class:', element.class);

          if (element.class === 'cell phone') {
            handleDetection('cellPhone');
          }

          if (element.class === 'book' || element.class === 'laptop') {
            handleDetection('prohibitedObject');
          }

          if (element.class === 'person') {
            faceDetected = true;
            person_count++;

            if (person_count > 1) {
              handleDetection('multipleFace');
            }
          }
        });

        if (!faceDetected) {
          handleDetection('noFace');
        }
      } catch (error) {
        console.error('Error during detection:', error);
      }
    }
  };

  useEffect(() => {
    runCoco();
  }, []);

  return (
    <Box>
      <Card variant="outlined">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 9,
            width: '100%',
            height: '100%',
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 8,
            width: 240,
            height: 240,
          }}
        />
      </Card>
    </Box>
  );
}
