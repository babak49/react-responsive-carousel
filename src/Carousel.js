import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import * as klass from './cssClasses';
import Swipe from 'react-easy-swipe';
import { Thumbs } from './Thumbs';
import { cssTranslate } from './cssTranslate';
import './carousel.scss';

export class Carousel extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    showArrows: PropTypes.bool,
    showStatus: PropTypes.bool,
    showIndicators: PropTypes.bool,
    showThumbs: PropTypes.bool,
    selectedItem: PropTypes.number,
    onClickItem: PropTypes.func,
    onClickThumb: PropTypes.func,
    onChange: PropTypes.func,
    axis: PropTypes.string,
    className: PropTypes.string,
  };

  static defaultProps = {
    showIndicators: true,
    showArrows: true,
    showStatus: true,
    showThumbs: true,
    selectedItem: 0,
    axis: 'horizontal',
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedItem: this.props.selectedItem,
      hasMount: false,
    };
    this.onSwipeStart = this.onSwipeStart.bind(this);
    this.onSwipeEnd = this.onSwipeEnd.bind(this);
    this.onSwipeMove = this.onSwipeMove.bind(this);
    this.setMountState = this.setMountState.bind(this);
    this.updateSizes = this.updateSizes.bind(this);
    this.handleClickItem = this.handleClickItem.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleClickThumb = this.handleClickThumb.bind(this);
    this.decrement = this.decrement.bind(this);
    this.increment = this.increment.bind(this);
    this.moveTo = this.moveTo.bind(this);
    this.changeItem = this.changeItem.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.renderControls = this.renderControls.bind(this);
    this.renderStatus = this.renderStatus.bind(this);
    this.renderThumbs = this.renderThumbs.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this.updateSizes);
    window.addEventListener('DOMContentLoaded', this.updateSizes);
  }

  componentDidMount() {
    this.updateSizes();

    this.isHorizontal = this.props.axis === 'horizontal';

    const defaultImg = ReactDOM.findDOMNode(this.item0).getElementsByTagName('img')[0];
    defaultImg.addEventListener('load', this.setMountState);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedItem !== this.state.selectedItem) {
      this.updateSizes();
      this.setState({
        selectedItem: nextProps.selectedItem,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSizes);
    window.removeEventListener('DOMContentLoaded', this.updateSizes);
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

  onSwipeMove(delta) {
    const list = ReactDOM.findDOMNode(this.itemList);
    const isHorizontal = this.props.axis === 'horizontal';

    const initialBoundry = 0;

    const currentPosition = - this.state.selectedItem * 100;
    const finalBoundry = - (this.props.children.length - 1) * 100;

    let axisDelta = isHorizontal ? delta.x : delta.y;

    // prevent user from swiping left out of boundaries
    if (currentPosition === initialBoundry && axisDelta > 0) {
      axisDelta = 0;
    }

    // prevent user from swiping right out of boundaries
    if (currentPosition === finalBoundry && axisDelta < 0) {
      axisDelta = 0;
    }

    const position = currentPosition + (100 / (this.wrapperSize / axisDelta)) + '%';

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

  setMountState() {
    this.setState({ hasMount: true });
    this.updateSizes();
    this.forceUpdate();
  }

  updateSizes() {
    const firstItem = ReactDOM.findDOMNode(this.item0);
    this.itemSize = this.isHorizontal ? firstItem.clientWidth : firstItem.clientHeight;
    this.wrapperSize = this.isHorizontal ? this.itemSize * this.props.children.length : this.itemSize;
  }

  handleClickItem(index, item) {
    const handler = this.props.onClickItem;

    if (typeof handler === 'function') {
      handler(index, item);
    }

    if (index !== this.state.selectedItem) {
      this.setState({
        selectedItem: index,
      });
    }
  }

  handleOnChange(index, item) {
    const handler = this.props.onChange;

    if (typeof handler === 'function') {
      handler(index, item);
    }
  }

  handleClickThumb(index, item) {
    const handler = this.props.onClickThumb;

    if (typeof handler === 'function') {
      handler(index, item);
    }

    this.selectItem({
      selectedItem: index,
    });
  }

  decrement(positions) {
    this.moveTo(this.state.selectedItem - (typeof positions === Number ? positions : 1));
  }

  increment(positions) {
    this.moveTo(this.state.selectedItem + (typeof positions === Number ? positions : 1));
  }

  moveTo(position) {
    // position can't be lower than 0
    let _position = position < 0 ? 0 : position;
    // position can't be higher than last postion
    _position = _position >= this.props.children.length - 1 ? this.props.children.length - 1 : _position;

    this.selectItem({
      // if it's not a slider, we don't need to set position here
      selectedItem: _position,
    });
  }

  changeItem(e) {
    const newIndex = e.target.value;

    this.selectItem({
      selectedItem: newIndex,
    });
  }

  selectItem(state) {
    this.setState(state);
    this.handleOnChange(state.selectedItem, this.props.children[state.selectedItem]);
  }

  renderItems() {
    return React.Children.map(this.props.children, (item, index) => {
      const itemClass = klass.item(true, index === this.state.selectedItem);

      return (
        <li
          ref={node => this['item' + index] = node}
          key={'itemKey' + index} className={itemClass}
          onClick={ this.handleClickItem.bind(this, index, item) }
        >
          { item }
        </li>
      );
    });
  }

  renderControls() {
    if (!this.props.showIndicators) {
      return null;
    }

    return (
      <ul className="control-dots">
        {React.Children.map(this.props.children, (item, index) => {
          return <li className={klass.dot(index === this.state.selectedItem)} onClick={this.changeItem} value={index} key={index} />;
        })}
      </ul>
    );
  }

  renderStatus() {
    if (!this.props.showStatus) {
      return null;
    }

    return <p className="carousel-status">{this.state.selectedItem + 1} of {this.props.children.length}</p>;
  }

  renderThumbs() {
    if (!this.props.showThumbs) {
      return null;
    }

    return (
      <Thumbs onSelectItem={this.handleClickThumb} selectedItem={this.state.selectedItem}>
        {this.props.children}
      </Thumbs>
    );
  }

  render() {
    const itemsLength = this.props.children.length;

    if (itemsLength === 0) {
      return null;
    }

    const canShowArrows = this.props.showArrows && itemsLength > 1;

    // show left arrow?
    const hasPrev = canShowArrows && this.state.selectedItem > 0;
    // show right arrow
    const hasNext = canShowArrows && this.state.selectedItem < itemsLength - 1;
    // obj to hold the transformations and styles
    let itemListStyles = {};

    const currentPosition = - this.state.selectedItem * 100 + '%';

    // if 3d is available, let's take advantage of the performance of transform
    const transformProp = cssTranslate(currentPosition, this.props.axis);

    itemListStyles = {
      'WebkitTransform': transformProp,
      'MozTransform': transformProp,
      'MsTransform': transformProp,
      'OTransform': transformProp,
      'transform': transformProp,
      'msTransform': transformProp,
    };

    let swiperProps = {
      selectedItem: this.state.selectedItem,
      className: klass.slider(true, this.state.swiping),
      onSwipeMove: this.onSwipeMove,
      onSwipeStart: this.onSwipeStart,
      onSwipeEnd: this.onSwipeEnd,
      style: itemListStyles,
      ref: node => this.itemList = node,
    };

    const containerStyles = {};

    if (this.isHorizontal) {
      swiperProps = Object.assign({}, swiperProps, {
        onSwipeLeft: this.increment,
        onSwipeRight: this.decrement,
      });
    } else {
      swiperProps = Object.assign({}, swiperProps, {
        onSwipeUp: this.decrement,
        onSwipeDown: this.increment,
      });

      swiperProps.style.height = this.itemSize;
      containerStyles.height = this.itemSize;
    }

    return (
      <div className={this.props.className}>
        <div className={klass.carousel(true)}>
          <button className={klass.arrow_prev(!hasPrev)} onClick={this.decrement} />
          <div className={klass.wrapper(true, this.props.axis)} style={containerStyles} ref={node => this.itemsWrapper = node}>
            <Swipe tagName="ul" {...swiperProps}>
              { this.renderItems() }
            </Swipe>
          </div>
          <button className={klass.arrow_next(!hasNext)} onClick={this.increment} />

          { this.renderControls() }
          { this.renderStatus() }
        </div>
        { this.renderThumbs() }
      </div>
    );
  }
}
