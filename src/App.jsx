import React, { Component } from 'react';
import * as faceapi from 'face-api.js';

import './App.css';
import WebCamPicture from './components/WebCamPicture';

import { MODEL_URL, WEBCAM_HEIGHT, WEBCAM_WIDTH } from './constants';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.fullFaceDescriptions = null;
    this.canvas = React.createRef();
    this.canvasPicWebCam = React.createRef();

    this.state = {
      isDetected: false,
      detectedExpression: '',
    };
  }

  async componentDidMount() {
    await this.loadModels();
  }

    getFullFaceDescription = async (canvas) => {
      const detections = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

      if (detections !== undefined) {
        const detectedExpression = Object.keys(detections.expressions).reduce((a, b) => (detections.expressions[a] > detections.expressions[b] ? a : b));

        this.setState({
          isDetected: true,
          detectedExpression,
        });
      } else {
        this.setState({
          isDetected: false,
        });
      }
    };

    landmarkWebCamPicture = async (picture) => {
      const ctx = this.canvasPicWebCam.current.getContext('2d');
      const image = new Image();
      image.onload = async () => {
        ctx.drawImage(image, 0, 0);
        await this.getFullFaceDescription(this.canvasPicWebCam.current);
      };
      image.src = picture;
    };

    loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    render() {
      const { isDetected, detectedExpression } = this.state;

      return (
        <div className="App">
          <WebCamPicture landmarkPicture={this.landmarkWebCamPicture} />

          <div
            style={{ display: 'none' }}
          >
            <canvas ref={this.canvasPicWebCam} width={WEBCAM_WIDTH} height={WEBCAM_HEIGHT} />
          </div>
          <p>
            {detectedExpression}
          </p>
        </div>
      );
    }
}
