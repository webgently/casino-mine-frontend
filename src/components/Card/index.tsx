import React from 'react';
import './card.scss';

const Card = () => {
  return (
    <div className="play-target-item">
      <div className="target-item-inner">
        <div className="target-item-sum">$0.10</div>
      </div>
      <div className="target-item-shadow" />
    </div>
  );
};

export default Card;
