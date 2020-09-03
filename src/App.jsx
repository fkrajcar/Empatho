import React, { Component } from 'react';
import * as faceapi from 'face-api.js';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Webcam from 'react-webcam';
import Button from 'react-bootstrap/Button';
import sample from 'lodash/sample';
import { faClock, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'react-modal';

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
  CUSTOM_MODAL_STYLE,
} from './constants';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.fullFaceDescriptions = null;
    this.canvas = React.createRef();
    this.canvasPicWebCam = React.createRef();
    this.webcam = React.createRef();

    this.state = {
      hasStarted: false,
      isCorrect: false,
      hasFinished: false,
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

    getFullFaceDescription = async (pictureSrc) => {
      const image = await faceapi.fetchImage(pictureSrc);

      const detections = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

      if (detections !== undefined) {
        const detectedExpression = Object.keys(detections.expressions).reduce((a, b) => (detections.expressions[a] > detections.expressions[b] ? a : b));

        this.setState({
          detectedExpression,
        });
      }
    };

  checkCorrect = () => {
    const { detectedExpression } = this.state;
    let { gameScore, randomExpression } = this.state;

    if (detectedExpression === randomExpression) {
      gameScore += 1;

      let generateRandomExpression = sample(EXPRESSIONS);

      while (randomExpression === generateRandomExpression && randomExpression === detectedExpression) {
        generateRandomExpression = sample(EXPRESSIONS);
      }

      randomExpression = generateRandomExpression;

      this.setState({ isCorrect: true, gameScore, randomExpression });

      setTimeout(() => {
        this.setState({ isCorrect: false });
      }, 1500);
    }
  }

    loadModels = async () => {
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
      await faceapi.loadFaceExpressionModel(MODEL_URL);
    };

    gameLogicStart = () => {
      let {
        gameTimerIntervalID,
        correctEmotionTimerIntervalID,
        gameCorrectEmotionTimer,
        gameTimer,
        randomExpression,
      } = this.state;
      const { detectedExpression } = this.state;
      this.setState(
        { gameScore: 0 },
      );

      correctEmotionTimerIntervalID = setInterval(() => {
        if (gameCorrectEmotionTimer === 0) {
          this.setState({
            gameCorrectEmotionTimer: 5,
            correctEmotionTimerIntervalID,
          });
        } else {
          gameCorrectEmotionTimer -= 1;

          this.setState(
            { gameCorrectEmotionTimer },
          );
        }
      }, TIMER_INTERVAL_MS);

      gameTimerIntervalID = setInterval(() => {
        if (gameTimer === 0) {
          this.setState({ hasFinished: true });
          this.gameLogicStop();
        } else {
          gameTimer -= 1;
          this.checkCorrect();
          if (gameTimer % 10 === 0) {
            let generateRandomExpression = sample(EXPRESSIONS);

            while (randomExpression === generateRandomExpression && randomExpression === detectedExpression) {
              generateRandomExpression = sample(EXPRESSIONS);
            }

            randomExpression = generateRandomExpression;

            this.setState(
              { randomExpression },
            );
          }

          this.setState(
            { gameTimer },
          );
        }
      }, TIMER_INTERVAL_MS);

      this.setState(
        { gameTimerIntervalID, correctEmotionTimerIntervalID },
      );
    }

  gameLogicStop = () => {
    const {
      gameTimerIntervalID,
      correctEmotionTimerIntervalID,
      intervalID,
    } = this.state;

    clearInterval(intervalID);
    clearInterval(gameTimerIntervalID);
    clearInterval(correctEmotionTimerIntervalID);
    this.setState(
      {
        hasStarted: false,
        startingTimer: 3,
      },
    );
  }

  startGame = () => {
    const { hasStarted } = this.state;
    let { startingTimer, intervalID } = this.state;

    if (hasStarted) {
      this.gameLogicStop();
    } else {
      this.setState({
        gameTimer: 60,
        gameScore: 0,
      });
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

   closeModal = () => {
     this.setState({ hasFinished: false });
   }

    startCapturing = () => {
      setInterval(() => {
        const imageSrc = this.webcam.current.getScreenshot();

        this.getFullFaceDescription(imageSrc);
      }, EXPRESSION_DETECTION_INTERVAL_MS);
    };

    render() {
      const { hasFinished, detectedExpression, hasStarted, startingTimer, randomExpression, gameTimer, gameScore, isCorrect } = this.state;

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
                  : (
                    <Image
                      className={hasStarted ? 'emoji hasStarted' : 'emoji'}
                      src={
                      isCorrect
                        ? `${IMAGES_URL}check-circle-regular.svg`
                        : `${IMAGES_URL}${randomExpression}.png`
                  }
                    />
                  )
               }
            </div>
          </div>
          <div className="current_expression-container">
            <div className="spacer" />
            <Image className="current_expression-emoji" src={`${IMAGES_URL}${detectedExpression}.png`} />
            <div className={hasStarted ? 'game-info' : 'game-info is-hidden'}>
              <div className="timer">
                <FontAwesomeIcon icon={faClock} /> <span className="timer-text">{`Vrijeme: ${gameTimer}`}</span>
              </div>
              <div className="timer">
                <FontAwesomeIcon icon={faCheck} /> <span className="timer-text">{`Rezultat: ${gameScore}`}</span>
              </div>
            </div>
          </div>
          <div className="controls">
            <Button
              variant={hasStarted ? 'danger' : 'primary'}
              onClick={this.startGame}
            >
              {
                hasStarted
                  ? 'Zaustavi igru'
                  : 'Pokreni igru'
              }
            </Button>
          </div>
          <Modal
            isOpen={hasFinished}
            onRequestClose={this.closeModal}
            style={CUSTOM_MODAL_STYLE}
          >
            <Image
              className="emoji emoji-modal"
              src={`${IMAGES_URL}happy.png`}
            />
            <h3>Bravo.</h3>
            <h4>Ukupno ostvareni broj bodova:</h4>
            <h3>{gameScore}</h3>
            <Button onClick={this.closeModal}>ZATVORITI</Button>
          </Modal>
        </Container>
      );
    }
}
