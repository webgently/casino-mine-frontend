import React from 'react';
import './minebox.scss';

const NumberBox = ({ min, max, value, setValue, playStatus }: any) => {
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
    <div className={`number-box ${playStatus && 'pointer-events-none'}`}>
      <div className="number-box-inner">
        <div className={`number-box-control-btn ${!playStatus && '_active'}`} onClick={dec}>
          <span>-</span>
        </div>
        <input
          type="number"
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          disabled={playStatus}
          className={playStatus ? '!text-white/[0.5]' : 'text-white'}
        />
        <div className={`number-box-control-btn ${!playStatus && '_active'}`} onClick={inc}>
          <span>+</span>
        </div>
      </div>
    </div>
  );
};

export default NumberBox;
