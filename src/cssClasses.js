import classNames from 'classnames';

module.exports = {
  carousel(isSlider) {
    return classNames({
      'carousel': true,
      'carousel-slider': isSlider,
    });
  },

  wrapper(isSlider, axis) {
    return classNames({
      'thumbs-wrapper': !isSlider,
      'slider-wrapper': isSlider,
      'axis-horizontal': axis === 'horizontal',
      'axis-vertical': axis !== 'horizontal',
    });
  },

  slider(isSlider, isSwiping) {
    return classNames({
      'thumbs': !isSlider,
      'slider': isSlider,
      'animated': !isSwiping,
    });
  },

  item(isSlider, selected) {
    return classNames({
      'thumb': !isSlider,
      'slide': isSlider,
      selected,
    });
  },

  arrow_prev(disabled) {
    return classNames({
      'control-arrow control-prev': true,
      'control-disabled': disabled,
    });
  },

  arrow_next(disabled) {
    return classNames({
      'control-arrow control-next': true,
      'control-disabled': disabled,
    });
  },

  dot(selected) {
    return classNames({
      'dot': true,
      selected,
    });
  },
};
