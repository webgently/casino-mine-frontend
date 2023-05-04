import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import NumberBox from '../../components/NumberBox';
import AmountBox from '../../components/AmountBox';
import BetButton from '../../components/BetButton';
import ToggleBox from '../../components/ToggleBox';
import './gamemanager.scss';

const GameManager = () => {
  const [gridSettingList, setGridSettingList] = useState([
    { label: '3X3', grid: 3, active: false },
    { label: '5X5', grid: 5, active: true },
    { label: '7X7', grid: 7, active: false },
    { label: '9X9', grid: 9, active: false }
  ]);
  const [historyList] = useState([
    { value: 1.08, active: false },
    { value: 1.23, active: false },
    { value: 1.42, active: false },
    { value: 1.64, active: false },
    { value: 1.92, active: false },
    { value: 2.25, active: false },
    { value: 2.68, active: false },
    { value: 3.21, active: false },
    { value: 3.9, active: false }
  ]);

  const [totalValue] = useState(1000);
  const [gridDataList, setGridDataList] = useState([]);
  const [gridCount, setGridCount] = useState(5);
  const [wicketCount, setWicketCount] = useState(1);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [status, setStatus] = useState('start');
  const [turbo, setTurbo] = useState(false);

  const handleBetButton = () => {
    switch (status) {
      case 'start':
        setStatus('cancel');
        break;
      case 'cancel':
        setStatus('cashout');
        break;
      case 'cashout':
        setStatus('start');
        break;
    }
  };

  const setGridSystem = (count: number, ind: number) => {
    let data = gridSettingList.map((item: any, index: number) => {
      if (index === ind) return { ...item, active: true };
      else return { ...item, active: false };
    });
    setGridSettingList(data);
    setGridCount(count);
  };

  useEffect(() => {
    let data: any = [];
    for (let e = 0; e < gridCount * gridCount; e++) {
      data.push({ price: 10, active: false });
    }
    setGridDataList(data);
  }, [gridCount]);

  return (
    <div className="game-management-layout">
      <div className="game-landscape-top">
        <div className="logo-container" />
        <div className="profit-list-container">
          <div className="history">
            <div className="history-inner">
              {historyList.map((item: any, ind: number) => {
                return (
                  <div key={ind} className="history-item">
                    <span>{`X${item.value}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="balance-container">
          <label>Balance</label>
          <div className="balance">
            <span>${totalValue}</span>
          </div>
        </div>
      </div>
      <div className="game-landscape-content">
        <div
          className="game-landscape-card-group"
          style={{ gridTemplateColumns: `repeat(${gridCount}, minmax(0, 1fr))` }}
        >
          {gridDataList.map((item: any, ind: number) => {
            return <Card key={ind} />;
          })}
        </div>
      </div>
      <div className="game-landscape-left">
        <div className="wickets-action">
          <label>Wickets</label>
          <NumberBox min={1} max={80} value={wicketCount} setValue={setWicketCount} />
        </div>
        <AmountBox minLimit={0.1} maxLimit={100} value={betAmount} setValue={setBetAmount} />
      </div>
      <div className="game-landscape-center">
        <div className="game-landscape-size">
          <div className="game-landscape-size-list">
            {gridSettingList.map((item: any, ind: number) => {
              return (
                <div
                  key={ind}
                  className={`game-landscape-size-item ${item.active && '_active'}`}
                  onClick={() => setGridSystem(item.grid, ind)}
                >
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="game-landscape-size-title">Grid</div>
        </div>
      </div>
      <div className="game-landscape-right">
        <div className="turbo-action">
          <label>Turbo</label>
          <ToggleBox value={turbo} setValue={setTurbo} />
        </div>
        <BetButton type={status} onClick={handleBetButton} />
      </div>
    </div>
  );
};

export default GameManager;
