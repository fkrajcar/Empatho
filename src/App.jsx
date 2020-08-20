import React, { Component } from 'react';
import * as faceapi from 'face-api.js';
import Container from 'react-bootstrap/Container';
import { default as ReactImage } from 'react-bootstrap/Image';
import Webcam from 'react-webcam';
import Button from 'react-bootstrap/Button';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { EXPRESSION_DETECTION_INTERVAL_MS, MODEL_URL, WEBCAM_HEIGHT, WEBCAM_WIDTH, VIDEO_CONSTRAINTS } from './constants';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.fullFaceDescriptions = null;
    this.canvas = React.createRef();
    this.canvasPicWebCam = React.createRef();
    this.webcam = React.createRef();

    this.state = {
      isLoading: true,
      isDetected: false,
      detectedExpression: 'neutral',
    };
  }

  async componentDidMount() {
    this.loadModels().then(() => {
      this.setState({
        isLoading: false,
      });
    });
  }

    getFullFaceDescription = async (canvas) => {
      const detections = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      console.log(detections);
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
      // await this.getFullFaceDescription(this.canvasPicWebCam.current);

      const ctx = this.canvasPicWebCam.current.getContext('2d');
      const image = new Image();
      image.onload = async () => {
        ctx.drawImage(image, 0, 0);
      };
      image.src = picture;
      await this.getFullFaceDescription(this.canvasPicWebCam.current);
    };

    loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    startCapturing = () => {
      setInterval(() => {
        const imageSrc = this.webcam.current.getScreenshot();

        this.landmarkWebCamPicture(imageSrc);
      }, EXPRESSION_DETECTION_INTERVAL_MS);
    };

    render() {
      const { isDetected, detectedExpression, isLoading } = this.state;

      return (
        <Container>
          <div className="webcam-faces">
            <Webcam
              audio={false}
              width={WEBCAM_WIDTH}
              height={WEBCAM_HEIGHT}
              ref={this.webcam}
              screenshotFormat="image/jpeg"
              videoConstraints={VIDEO_CONSTRAINTS}
            />
            <div
              style={{ display: 'none' }}
            >
              <canvas ref={this.canvasPicWebCam} width={WEBCAM_WIDTH} height={WEBCAM_HEIGHT} />
            </div>
            <ReactImage className="emoji" src={`/img/${detectedExpression}.png`} fluid />
          </div>
          <div className="controls">
            <Button
              variant="primary"
              onClick={this.startCapturing}
            >
              Start
            </Button>
            <p>
              {detectedExpression}
            </p>
          </div>
        </Container>
      );
    }
}
