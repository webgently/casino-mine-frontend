import React from 'react';
import './togglebox.scss';

const ToggleBox = ({ value, setValue }: any) => {
  return (
    <div className={`toggle-box ${value && 'toggle-box-active'}`} onClick={() => setValue((prev: boolean) => !prev)}>
      <div className="toggle-box-inner">
        <div className="toggle-box-btn"></div>
      </div>
    </div>
  );
};

export default ToggleBox;
