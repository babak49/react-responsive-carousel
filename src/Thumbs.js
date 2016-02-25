import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as klass from './cssClasses';
import Swipe from 'react-easy-swipe';
import { cssTranslate } from './cssTranslate';

function outerWidth(el) {
  let width = el.offsetWidth;
  const style = getComputedStyle(el);

  width += parseInt(style.marginLeft) + parseInt(style.marginRight);
  return width;
}

export class Thumbs extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    selectedItem: PropTypes.number,
    onSelectItem: PropTypes.func,
    axis: PropTypes.string,
  };

  static defaultProps = {
    selectedItem: 0,
    axis: 'horizontal',
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedItem: this.props.selectedItem,
      hasMount: false,
      firstItem: this.getFirstItem(this.props.selectedItem),
    };
    this.onSwipeStart = this.onSwipeStart.bind(this);
    this.onSwipeEnd = this.onSwipeEnd.bind(this);
    this.onSwipeMove = this.onSwipeMove.bind(this);
    this.getFirstItem = this.getFirstItem.bind(this);
    this.setMountState = this.setMountState.bind(this);
    this.slideRight = this.slideRight.bind(this);
    this.slideLeft = this.slideLeft.bind(this);
    this.moveTo = this.moveTo.bind(this);
    this.handleClickItem = this.handleClickItem.bind(this);
    this.updateStatics = this.updateStatics.bind(this);
    this.renderItems = this.renderItems.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.updateStatics);
    window.addEventListener('DOMContentLoaded', this.updateStatics);
  }

  componentDidMount() {
    this.updateStatics();

    const defaultImg = ReactDOM.findDOMNode(this.thumb0).getElementsByTagName('img')[0];
    defaultImg.addEventListener('load', this.setMountState);
  }

  componentWillReceiveProps(props) {
    if (props.selectedItem !== this.state.selectedItem) {
      this.setState({
        selectedItem: props.selectedItem,
        firstItem: this.getFirstItem(props.selectedItem),
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateStatics);
    window.removeEventListener('DOMContentLoaded', this.updateStatics);
  }

  onSwipeStart() {
    this.setState({
      swiping: true,
    });
  }

  onSwipeEnd() {
    this.setState({
      swiping: false,
    });
  }

  onSwipeMove(deltaX) {
    const leftBoundry = 0;
    const list = ReactDOM.findDOMNode(this.itemList);
    const wrapperSize = list.clientWidth;
    let delta = deltaX;
    // const visibleItems = Math.floor(wrapperSize / this.itemSize);

    const currentPosition = - this.state.firstItem * this.itemSize;
    const lastLeftBoundry = - this.visibleItems * this.itemSize;

    // prevent user from swiping right out of boundaries
    if ((currentPosition === lastLeftBoundry || currentPosition === leftBoundry) && deltaX < 0) {
      delta = 0;
    }

    const position = currentPosition + (100 / (wrapperSize / delta)) + '%';

    // if 3d isn't available we will use left to move
    [
      'WebkitTransform',
      'MozTransform',
      'MsTransform',
      'OTransform',
      'transform',
      'msTransform',
    ].forEach((prop) => {
      list.style[prop] = cssTranslate(position, this.props.axis);
    });
  }

  getFirstItem(selectedItem) {
    if (!this.showArrows) {
      return 0;
    }

    let firstItem = selectedItem;

    if (selectedItem >= this.lastPosition) {
      firstItem = this.lastPosition;
    }

    if (selectedItem < (this.state.firstItem + this.visibleItems)) {
      firstItem = this.state.firstItem;
    }

    if (selectedItem < this.state.firstItem) {
      firstItem = selectedItem;
    }

    return firstItem;
  }

  setMountState() {
    this.setState({ hasMount: true });
  }

  slideRight(positions) {
    this.moveTo(this.state.firstItem - (typeof positions === Number ? positions : 1));
  }

  slideLeft(positions) {
    this.moveTo(this.state.firstItem + (typeof positions === Number ? positions : 1));
  }

  moveTo(position) {
    // position can't be lower than 0
    let _position = position < 0 ? 0 : position;
    // position can't be higher than last postion
    _position = _position >= this.lastPosition ? this.lastPosition : _position;

    this.setState({
      firstItem: _position,
      // if it's not a slider, we don't need to set position here
      selectedItem: this.state.selectedItem,
    });
  }

  handleClickItem(index, item) {
    const handler = this.props.onSelectItem;

    if (typeof handler === 'function') {
      handler(index, item);
    }
  }

  updateStatics() {
    const total = this.props.children.length;
    this.wrapperSize = this.itemsWrapper.clientWidth;
    this.itemSize = outerWidth(this.thumb0);
    this.visibleItems = Math.floor(this.wrapperSize / this.itemSize);
    this.lastPosition = total - this.visibleItems;
    this.showArrows = this.visibleItems < total;
  }

  renderItems() {
    return React.Children.map(this.props.children, (item, index) => {
      const itemClass = klass.item(false, index === this.state.selectedItem && this.state.hasMount);

      let img = item;

      if (item.type !== 'img') {
        img = item.props.children.filter((children) => children.type === 'img')[0];
      }

      if (img.length) {
        console.log(img, img.length, "No images found! Can't build the thumb list");
      }

      return (
        <li
          key={index}
          ref={node => this['thumb' + index] = node} className={itemClass}
          onClick={ this.handleClickItem.bind(this, index, item) }
        >
          { img }
        </li>
      );
    });
  }

  render() {
    if (this.props.children.length === 0) {
      return null;
    }

    // show left arrow?
    const hasPrev = this.showArrows && this.state.firstItem > 0;
    // show right arrow
    const hasNext = this.showArrows && this.state.firstItem < this.lastPosition;
    const currentPosition = - this.state.firstItem * this.itemSize + 'px';
    const transformProp = cssTranslate(currentPosition, this.props.axis);

    // obj to hold the transformations and styles
    const itemListStyles = {
      'WebkitTransform': transformProp,
      'MozTransform': transformProp,
      'MsTransform': transformProp,
      'OTransform': transformProp,
      'transform': transformProp,
      'msTransform': transformProp,
    };

    return (
      <div className={klass.carousel(false)}>
        <div className={klass.wrapper(false)} ref={node => this.itemsWrapper = node}>
          <button className={klass.arrow_prev(!hasPrev)} onClick={this.slideRight} />
          <Swipe
            tagName="ul"
            selectedItem={this.state.selectedItem}
            className={klass.slider(false, this.state.swiping)}
            onSwipeLeft={this.slideLeft}
            onSwipeRight={this.slideRight}
            onSwipeMove={this.onSwipeMove}
            onSwipeStart={this.onSwipeStart}
            onSwipeEnd={this.onSwipeEnd}
            style={itemListStyles}
            ref={node => this.itemList = node}
          >
            { this.renderItems() }
          </Swipe>
          <button className={klass.arrow_next(!hasNext)} onClick={this.slideLeft} />
        </div>
      </div>
    );
  }
}
