module.exports.WEBCAM_HEIGHT = 480;
module.exports.WEBCAM_WIDTH = 480;
module.exports.EXPRESSION_DETECTION_INTERVAL_MS = 250;
module.exports.TIMER_INTERVAL_MS = 1000;
module.exports.EXPRESSIONS_ANGRY = 'angry';
module.exports.EXPRESSIONS_HAPPY = 'happy';
module.exports.EXPRESSIONS_NEUTRAL = 'neutral';
module.exports.EXPRESSIONS_SAD = 'sad';
module.exports.EXPRESSIONS_SURPRISED = 'surprised';
module.exports.EXPRESSIONS = [this.EXPRESSIONS_ANGRY, this.EXPRESSIONS_HAPPY, this.EXPRESSIONS_NEUTRAL, this.EXPRESSIONS_SAD, this.EXPRESSIONS_SURPRISED];

module.exports.VIDEO_CONSTRAINTS = {
  width: this.WEBCAM_WIDTH,
  height: this.WEBCAM_HEIGHT,
  facingMode: 'user',
};

module.exports.MODEL_URL = `${process.env.PUBLIC_URL}/models`;
module.exports.IMAGES_URL = `${process.env.PUBLIC_URL}/img/`;

module.exports.CUSTOM_MODAL_STYLE = {
  content: {
    top: '200px',
    left: '350px',
    right: '350px',
    bottom: '200px',
    display: 'flex',
    'flex-direction': 'column',
    'justify-content': 'space-between',
    'text-align': 'center',
  },
};
