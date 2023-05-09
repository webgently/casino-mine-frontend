import React from 'react';
import CricketImg from '../../assets/images/cricket.png';
import CricketShadowImg from '../../assets/images/shadow.webp';
import './betbutton.scss';

const BetButton = ({ profitAmount, cardLoading, loading, type, turboMode }: any) => {
  return (
    <div className={`bet-button-${type} ${(loading || cardLoading) && 'pointer-events-none'}`}>
      <div className="bet-button-inner">
        <div className="bet-button-content">
          <div className="bet-button-text">
            {loading ? (
              <div className="loading-container">
                <img src={CricketShadowImg} alt="shadow" />
                <div className="btn-loading">
                  <img src={CricketImg} alt="loading..." />
                </div>
              </div>
            ) : type === 'cancel' ? (
              'Cancel'
            ) : type === 'cashOut' ? (
              'Cash Out'
            ) : (
              `${turboMode ? 'Place bet' : 'Start Game'}`
            )}
          </div>
          {type === 'cashOut' && (
            <div className="bet-button-sum">
              <div className="bet-button-sum-content">
                <span>${profitAmount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BetButton;
