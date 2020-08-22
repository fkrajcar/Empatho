import React, { Component } from 'react';
import * as faceapi from 'face-api.js';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Webcam from 'react-webcam';
import Button from 'react-bootstrap/Button';
import sample from 'lodash/sample';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {
  EXPRESSION_DETECTION_INTERVAL_MS,
  MODEL_URL,
  WEBCAM_HEIGHT,
  WEBCAM_WIDTH,
  VIDEO_CONSTRAINTS,
  TIMER_INTERVAL_MS,
  IMAGES_URL,
  EXPRESSIONS,
} from './constants';

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
      hasStarted: false,
      detectedExpression: 'neutral',
      randomExpression: sample(EXPRESSIONS),
      startingTimer: 3,
      intervalID: null,
      gameTimerIntervalID: null,
      correctEmotionTimerIntervalID: null,
      gameCorrectEmotionTimer: 5,
      gameTimer: 60,
      gameScore: 0,
    };
  }

  async componentDidMount() {
    this.loadModels().then(() => {
      this.startCapturing();
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { hasStarted, startingTimer } = this.state;
  }

    getFullFaceDescription = async (pictureSrc) => {
      const image = await faceapi.fetchImage(pictureSrc);

      const detections = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

      if (detections !== undefined) {
        console.log(detections.expressions);

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

    loadModels = async () => {
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
      await faceapi.loadFaceExpressionModel(MODEL_URL);
    };

    gameLogicStart = () => {
      let { gameTimerIntervalID,
        correctEmotionTimerIntervalID,
        gameCorrectEmotionTimer,
        gameScore,
        gameTimer,
      } = this.state;

      this.setState(
        { gameScore: 0 },
      );

      gameTimerIntervalID = setInterval(() => {
        gameTimer -= 1;
        console.log(gameTimer);
        this.setState(
          { gameTimer },
        );
      }, TIMER_INTERVAL_MS);

      this.setState(
        { gameTimerIntervalID },
      );
    }

  gameLogicStop = () => {
    const { gameTimerIntervalID,
      correctEmotionTimerIntervalID,
      gameCorrectEmotionTimer,
      gameScore,
      gameTimer,
    } = this.state;

    clearInterval(gameTimerIntervalID);
    this.setState(
      { gameTimer: 60 },
    );
  }

  startGame = () => {
    const { hasStarted } = this.state;
    let { startingTimer, intervalID } = this.state;

    if (hasStarted) {
      this.gameLogicStop();
      clearInterval(intervalID);
      this.setState({
        hasStarted: !hasStarted,
        startingTimer: 3,
      });
    } else {
      intervalID = setInterval(() => {
        if (startingTimer === 0) {
          this.gameLogicStart();
          clearInterval(intervalID);
        } else {
          startingTimer -= 1;
          this.setState({
            startingTimer,
          });
        }
      }, TIMER_INTERVAL_MS);
      this.setState({
        hasStarted: !hasStarted,
        intervalID,
      });
    }
  };

    startCapturing = () => {
      setInterval(() => {
        const imageSrc = this.webcam.current.getScreenshot();

        this.getFullFaceDescription(imageSrc);
      }, EXPRESSION_DETECTION_INTERVAL_MS);
    };

    render() {
      const { isDetected, detectedExpression, isLoading, hasStarted, startingTimer, randomExpression } = this.state;

      return (
        <Container>
          <div className={hasStarted ? 'webcam-faces hasStarted' : 'webcam-faces'}>
            <Webcam
              className="webcam"
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
            <div className={hasStarted ? 'emoji-timer-container hasStarted' : 'emoji-timer-container'}>
              {
                hasStarted && startingTimer !== 0
                  ? <p className="timer">{startingTimer}</p>
                  : <Image className={hasStarted ? 'emoji hasStarted' : 'emoji'} src={`${IMAGES_URL}${randomExpression}.png`} />
               }
            </div>
          </div>
          <div className="current_expression-container">
            <Image className="current_expression-emoji" src={`${IMAGES_URL}${detectedExpression}.png`} />
          </div>
          <div className="controls">
            <Button
              variant={hasStarted ? 'danger' : 'primary'}
              onClick={this.startGame}
            >
              {
                hasStarted
                  ? 'Stop game'
                  : 'Start game'
              }
            </Button>
          </div>
        </Container>
      );
    }
}
