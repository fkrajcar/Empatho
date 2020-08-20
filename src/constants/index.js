module.exports.WEBCAM_HEIGHT = 450;
module.exports.WEBCAM_WIDTH = 600;
module.exports.EXPRESSION_DETECTION_INTERVAL_MS = 250;

module.exports.VIDEO_CONSTRAINTS = {
  width: this.WEBCAM_WIDTH,
  height: this.WEBCAM_HEIGHT,
  facingMode: 'user',
};

module.exports.MODEL_URL = '/models';
