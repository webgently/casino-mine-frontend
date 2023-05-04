import React from 'react';
import CricketImg from '../../assets/images/cricket.png';
import './betbutton.scss';

const BetButton = ({ type }: any) => {
  return (
    <div className={`bet-button-${type}`}>
      <div className="bet-button-inner">
        <div className="bet-button-content">
          <div className="bet-button-text">
            {type === 'cancel' ? 'Cancel' : type === 'cashout' ? 'Cash Out' : 'Start Game'}
          </div>
          {type === 'cashout' && (
            <div className="bet-button-sum">
              <div className="bet-button-sum-content">
                <span>$10</span>
              </div>
            </div>
          )}
          <div className="btn-loading">
            <img src={CricketImg} alt="loading..." />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetButton;
