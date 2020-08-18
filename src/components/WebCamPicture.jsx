import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';
import Button from '@material-ui/core/Button';

import { WEBCAM_HEIGHT, WEBCAM_WIDTH } from '../constants';

const videoConstraints = {
  width: WEBCAM_WIDTH,
  height: WEBCAM_HEIGHT,
  facingMode: 'user',
};

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
      }, 125);
    };

    render() {
      return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Webcam
            audio={false}
            width={WEBCAM_WIDTH}
            height={WEBCAM_HEIGHT}
            ref={this.webcam}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={this.startCapturing}
          >
            Start
          </Button>
        </div>
      );
    }
}

WebCamPicture.propTypes = {
  landmarkPicture: PropTypes.func.isRequired,
};

