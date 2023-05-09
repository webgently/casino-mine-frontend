import React from 'react';
import './togglebox.scss';

const ToggleBox = ({ value, setValue, playStatus }: any) => {
  return (
    <div
      className={`toggle-box ${value && 'toggle-box_active'} ${
        playStatus ? 'pointer-events-none' : 'toggle-box_hover'
      }`}
      onClick={() => setValue((prev: boolean) => !prev)}
    >
      <div className="toggle-box-inner">
        <div className="toggle-box-btn" />
      </div>
    </div>
  );
};

export default ToggleBox;
