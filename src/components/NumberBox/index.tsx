import React from 'react';
import './numberbox.scss';

const NumberBox = ({ min, max, value, setValue }: any) => {
  const dec = () => {
    if (value <= min) return;
    setValue(Number(value) - 1);
  };

  const inc = () => {
    if (value >= max) return;
    setValue(Number(value) + 1);
  };

  const onChange = (e: number) => {
    if (e < min) return;
    if (e > max) return;
    setValue(e);
  };

  return (
    <div className="number-box">
      <div className="number-box-inner">
        <div className="number-box-control-btn" onClick={dec}>
          <span>-</span>
        </div>
        <input type="number" value={value} onChange={(e: any) => onChange(e.target.value)} />
        <div className="number-box-control-btn" onClick={inc}>
          <span>+</span>
        </div>
      </div>
    </div>
  );
};

export default NumberBox;
