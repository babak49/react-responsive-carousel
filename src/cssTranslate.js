function has3D() {
  if (typeof window === 'undefined' || !window.getComputedStyle) {
    return false;
  }

  const el = document.createElement('p'),
    transforms = {
      'webkitTransform': '-webkit-transform',
      'OTransform': '-o-transform',
      'msTransform': '-ms-transform',
      'MozTransform': '-moz-transform',
      'transform': 'transform',
    };
  let has3d;
  // Add it to the body to get the computed style.
  document.body.insertBefore(el, null);

  for (const t in transforms) {
    if (el.style[t] !== undefined) {
      el.style[t] = 'translate3d(1px,1px,1px)';
      has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
    }
  }

  document.body.removeChild(el);

  return (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
}

export function cssTranslate(position, axis) {
  const _has3d = has3D();
  const positionCss = (axis === 'horizontal') ? [position, 0] : [0, position];
  const transitionProp = _has3d ? 'translate3d' : 'translate';

  if (_has3d) {
    // adds z position
    positionCss.push(0);
  }

  const translatedPosition = '(' + positionCss.join(',') + ')';

  return transitionProp + translatedPosition;
}
