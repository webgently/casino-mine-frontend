import React, { useEffect } from 'react';
import './amountbox.scss';

const sub = (a: number, b: number, p = 8) => Math.round((a - b) * 10 ** p) / 10 ** p;
const add = (a: number, b: number, p = 8) => Math.round((a + b) * 10 ** p) / 10 ** p;

const AmountBox = ({ minLimit, maxLimit, value, setValue, playStatus }: any) => {
  const handleMax = () => {
    setValue(maxLimit);
  };
  const handleMin = () => {
    setValue(minLimit);
  };
  const handlePlus = () => {
    if (value < 1) return setValue(add(value, 0.1));
    else if (value >= 1 && value < 10) return setValue(add(value, 1));
    else if (value >= 10) return setValue(add(value, 10));
  };
  const handleMinus = () => {
    if (value <= 1) return setValue(sub(value, 0.1));
    else if (value >= 1 && value <= 10) return setValue(sub(value, 1));
    else if (value > 10) return setValue(sub(value, 10));
  };
  useEffect(() => {
    if (value < minLimit) setValue(minLimit);
    else if (value > maxLimit) setValue(maxLimit);
    // eslint-disable-next-line
  }, [value]);

  return (
    <div className={`amount-box ${playStatus && 'pointer-events-none'}`}>
      <div className="amount-landscape">
        <div className="amount-landscape-inner">
          <div className="amount-landscape-center">
            <input type="text" name="amount" value={`$ ${value}`} readOnly disabled={playStatus} />
          </div>
          <div className="amount-landscape-btn-group">
            <div className="amount-landscape-btn top-left" onClick={handleMax}>
              <span className={playStatus ? 'text-white/[0.5]' : ''}>max</span>
            </div>
            <div className="amount-landscape-btn top-right" onClick={handlePlus}>
              <span className={playStatus ? 'text-white/[0.5]' : ''}>+</span>
            </div>
            <div className="amount-landscape-btn bottom-left" onClick={handleMin}>
              <span className={playStatus ? 'text-white/[0.5]' : ''}>min</span>
            </div>
            <div className="amount-landscape-btn bottom-right" onClick={handleMinus}>
              <span className={playStatus ? 'text-white/[0.5]' : ''}>-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmountBox;
