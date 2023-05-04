import React, { useEffect } from 'react';
import './amountbox.scss';

const sub = (a: number, b: number, p = 8) => Math.round((a - b) * 10 ** p) / 10 ** p;
const add = (a: number, b: number, p = 8) => Math.round((a + b) * 10 ** p) / 10 ** p;

const AmountBox = ({ minLimit, maxLimit, value, setValue }: any) => {
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
    <div className="amount-box">
      <div className="amount-landscape">
        <div className="amount-landscape-inner">
          <div className="amount-landscape-center">
            <input type="text" name="amount" value={`$ ${value}`} readOnly />
          </div>
          <div className="amount-landscape-btn-group">
            <div className="amount-landscape-btn top-left" onClick={handleMax}>
              <span>max</span>
            </div>
            <div className="amount-landscape-btn top-right" onClick={handlePlus}>
              <span>+</span>
            </div>
            <div className="amount-landscape-btn bottom-left" onClick={handleMin}>
              <span>min</span>
            </div>
            <div className="amount-landscape-btn bottom-right" onClick={handleMinus}>
              <span>-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmountBox;
