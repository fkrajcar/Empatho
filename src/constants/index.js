module.exports.WEBCAM_HEIGHT = 480;
module.exports.WEBCAM_WIDTH = 480;
module.exports.EXPRESSION_DETECTION_INTERVAL_MS = 250;
module.exports.TIMER_INTERVAL_MS = 1000;

module.exports.VIDEO_CONSTRAINTS = {
  width: this.WEBCAM_WIDTH,
  height: this.WEBCAM_HEIGHT,
  facingMode: 'user',
};

module.exports.MODEL_URL = '/models';
