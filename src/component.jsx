import React, { Component } from 'react';
import { Carousel } from './Carousel';

export class HotReloadComponent extends Component {
  render() {
    return (
      <Carousel showArrows={true}>
        <img src="./assets/1.jpeg" />
        <img src="./assets/2.jpeg" />
        <img src="./assets/3.jpeg" />
        <img src="./assets/4.jpeg" />
        <img src="./assets/5.jpeg" />
        <img src="./assets/6.jpeg" />
      </Carousel>
    );
  }
}
