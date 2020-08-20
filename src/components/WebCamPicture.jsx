import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';
import Button from 'react-bootstrap/Button';

import 'bootstrap/dist/css/bootstrap.min.css';

import { WEBCAM_HEIGHT, WEBCAM_WIDTH, EXPRESSION_DETECTION_INTERVAL_MS, VIDEO_CONSTRAINTS } from '../constants';

export default class WebCamPicture extends Component {
  constructor(props) {
    super(props);

    this.webcam = React.createRef();
  }

    startCapturing = () => {
      const { landmarkPicture } = this.props;

      setInterval(() => {
        const imageSrc = this.webcam.current.getScreenshot();

        landmarkPicture(imageSrc);
      }, EXPRESSION_DETECTION_INTERVAL_MS);
    };

    render() {
      return (
        <>
          <Webcam
            audio={false}
            width={WEBCAM_WIDTH}
            height={WEBCAM_HEIGHT}
            videoConstraints={VIDEO_CONSTRAINTS}
            ref={this.webcam}
            screenshotFormat="image/jpeg"
          />
          <Button
            variant="primary"
            onClick={this.startCapturing}
          >
            Start
          </Button>
        </>
      );
    }
}

WebCamPicture.propTypes = {
  landmarkPicture: PropTypes.func.isRequired,
};

