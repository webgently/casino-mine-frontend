import React, { useEffect, useState } from 'react';
import uniqid from 'uniqid';
import { io } from 'socket.io-client';
import Card from '../../components/Card';
import MineBox from '../../components/MineBox';
import AmountBox from '../../components/AmountBox';
import BetButton from '../../components/BetButton';
import ToggleBox from '../../components/ToggleBox';
import ProfitBox from '../../components/ProfitBox';
import SettingBtn from '../../components/SettingBtn';
import Modal from '../../components/Modal';
import GridIcon from '../../assets/images/grid_icon.svg';
import CricketIcon from '../../assets/images/cricket_icon.svg';
import useStore from '../../useStore';
import { config } from '../../config/global.const';
import { postRequest } from '../../service';
import './gamemanager.scss';

const socket = io(config.wwsHost as string);
const GameManager = () => {
  /* redux variable and function */
  const { auth, update } = useStore();
  /* variables for game setting */
  const [totalValue, setTotalValue] = useState(auth?.balance);
  const [gridCount, setGridCount] = useState<number>(5);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [mineCount, setMineCount] = useState<number>(1);
  const [gridDataList, setGridDataList] = useState([]);
  const [gridSettingList, setGridSettingList] = useState([
    { label: '3X3', grid: 3, active: false },
    { label: '5X5', grid: 5, active: true },
    { label: '7X7', grid: 7, active: false },
    { label: '9X9', grid: 9, active: false }
  ]);
  /* variables for profit calculate list */
  const [profitCalcList, setProfitCalcList] = useState([]);
  const [profitCalcTextList, setProfitCalcTextList] = useState([]);
  const [currentProfitCalcTextList, setCurrentProfitCalcTextList] = useState([]);
  const [currentProfit, setCurrentProfit] = useState<number>(0);
  const [currentProfitInd, setCurrentProfitInd] = useState<number>(0);
  const [profitCalcPage, setProfitCalcPage] = useState<number>(0);
  /* variable for save the selected card index in turbo mode */
  const [turboList, setTurboList] = useState([]);
  /* variables for control the modal */
  const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
  const [settingModalOpen, setSettingModalOpen] = useState<boolean>(false);
  /* assistant variables for control the game */
  const [loading, setLoading] = useState<boolean>(false);
  const [playStatus, setPlayStatus] = useState<boolean>(false);
  const [cardLoading, setCardLoading] = useState<boolean>(false);
  const [currentTarget, setCurrentTarget] = useState<number>(-1);
  const [btnActionStatus, setBtnActionStatus] = useState<string>('start');

  /* function for make user */
  const makeNewUser = () => {
    let data = {
      name: uniqid(),
      img: uniqid(),
      balance: 1000
    };
    postRequest(`/register`, data).then((res: any) => {
      if (res.status) {
        update({ auth: { ...res.data } } as StoreObject);
        setTotalValue(1000);
      }
    });
  };
  /* function for create or join on room */
  useEffect(() => {
    if (!auth || !auth?.balance || Number(auth?.balance) <= 0) makeNewUser();
    socket.emit('join', auth);
    return () => {
      socket.off('join');
    };
  }, []);
  /* function for initialize cards */
  const initializeGridSystem = (count: number) => {
    let data: any = [];
    for (let e = 0; e < count * count; e++) {
      data.push({ card: '', active: false, turbo: false, mine: false });
    }
    setGridDataList(data);
  };
  /* function for set grid system */
  const setGridSystem = (count: number, ind: number) => {
    if (playStatus) return;
    if (auth) {
      let data = gridSettingList.map((item: any, index: number) => {
        if (index === ind) return { ...item, active: true, mine: null };
        else return { ...item, active: false, mine: null };
      });
      setGridSettingList(data);
      setGridCount(count);
    } else {
      alert('Undefined user');
    }
  };
  /* function for submit card */
  const checkMine = (order: number) => {
    if (auth) {
      if (turboMode) {
        let grids: any = [...gridDataList];
        let turbos: any = [...turboList];

        if (turbos.indexOf(order) >= 0) {
          grids[order].turbo = false;
          turbos.splice(turbos.indexOf(order), 1);
          if (profitCalcPage > 0) {
            if (currentProfitInd > 1) {
              setCurrentProfitInd((prevState) => prevState - 1);
            } else {
              setCurrentProfitInd(8);
              setProfitCalcPage((prevState) => prevState - 1);
            }
          } else {
            setCurrentProfitInd((prevState) => prevState - 1);
          }
        } else {
          if (turboList.length >= gridCount * gridCount - mineCount) return;
          grids[order].turbo = true;
          turbos.push(order);
          if (currentProfitInd < 8) {
            setCurrentProfitInd((prevState) => prevState + 1);
          } else {
            setCurrentProfitInd(1);
            setProfitCalcPage((prevState) => prevState + 1);
          }
        }

        setTurboList(turbos);
        setGridDataList(grids);
        setCurrentTarget(order);
      } else {
        if (!playStatus || cardLoading) return;
        setCardLoading(true);
        setCurrentTarget(order);
        socket.emit('checkMine', { userid: auth?.userid, order });
      }
    } else {
      alert('Undefined user');
    }
  };
  /* function for initialize when play bet */
  const initializeStartCase = (turboMode: boolean) => {
    if (turboMode && turboList.length === 0) {
      alert('Please select the card');
      return false;
    }
    if (!turboMode) setCurrentProfitInd(0);
    setLoading(true);
    initializeGridSystem(gridCount);
    setCardLoading(true);
    setCurrentTarget(-1);
    return true;
  };
  /* function for submit play bet, cancel and cashout */
  const handleBetButton = () => {
    if (loading || cardLoading) return;
    if (auth) {
      switch (btnActionStatus) {
        case 'start':
          const status = initializeStartCase(turboMode);
          if (status) {
            setTimeout(() => {
              socket.emit('playBet', {
                userid: auth?.userid,
                betAmount,
                gridCount,
                mineCount,
                turboMode,
                turboList,
                profitValue: currentProfit
              });
            }, 500);
          }
          break;
        case 'cancel':
          setLoading(true);
          setTimeout(() => {
            socket.emit('cancelBet', { userid: auth?.userid, betAmount });
          }, 500);
          break;
        case 'cashOut':
          setLoading(true);
          setTimeout(() => {
            socket.emit('cashOut', {
              userid: auth?.userid,
              profitValue:
                profitCalcList[
                  8 * profitCalcPage + profitCalcPage > 0
                    ? currentProfitInd > 0
                      ? 8 * profitCalcPage + currentProfitInd - 1
                      : 8 * profitCalcPage - 1
                    : currentProfitInd - 1
                ]
            });
          }, 500);
          break;
      }
    } else {
      alert('Undefined user');
    }
  };
  /* function for set mint count according to grid count */
  useEffect(() => {
    switch (gridCount) {
      case 3:
        setMineCount(2);
        break;
      case 5:
        setMineCount(3);
        break;
      case 7:
        setMineCount(5);
        break;
      case 9:
        setMineCount(10);
        break;
    }
  }, [gridCount]);
  /* function for set profit calculate list according to mine count, turboMode and grid count */
  useEffect(() => {
    setTurboList([]);
    setProfitCalcPage(0);
    setCurrentProfitInd(0);
    initializeGridSystem(gridCount);
    socket.emit('setProfitCalcList', { userid: auth?.userid, mineCount, gridCount });
    return () => {
      socket.off('setProfitCalcList');
    };
  }, [mineCount, turboMode, gridCount]);
  /* function for get profitCalcTextList according to profit page */
  useEffect(() => {
    setCurrentProfitCalcTextList(profitCalcTextList.slice(8 * profitCalcPage, 8 * (profitCalcPage + 1)));
  }, [profitCalcPage]);
  /* function for get currentProfit according to currentProfitInd */
  useEffect(() => {
    setCurrentProfit(
      profitCalcList[
        8 * profitCalcPage + profitCalcPage > 0
          ? currentProfitInd > 0
            ? 8 * profitCalcPage + currentProfitInd - 1
            : 8 * profitCalcPage - 1
          : currentProfitInd - 1
      ]
    );
  }, [currentProfitInd]);
  /* receive from backend side */
  useEffect(() => {
    socket.on(`playBet-${auth?.userid}`, async (e) => {
      if (e.turboMode) {
        let data: any = [...gridDataList];
        turboList.map((item: number, ind: number) => {
          if (profitCalcList[ind] >= 10) {
            data[item].card = '_win3';
          } else if (profitCalcList[ind] >= 2) {
            data[item].card = '_win2';
          } else {
            data[item].card = '_win1';
          }
          data[item].active = true;
        });
        if (e.mine) {
          e.gridSystem.map((item: number, ind: number) => {
            if (item) {
              data[ind].card = '_lose';
              data[ind].mine = true;
              data[ind].active = true;
            }
          });
        }
        setGridDataList(data);
        !e.mine && setResultModalOpen(true);
        setLoading(false);
        setCardLoading(false);
        setTimeout(() => {
          initializeGridSystem(gridCount);
          setResultModalOpen(false);
          setPlayStatus(false);
          setBtnActionStatus('start');
        }, 2500);
      } else {
        setLoading(false);
        setCardLoading(false);
        setPlayStatus(true);
        setBtnActionStatus('cancel');
      }
      update({ auth: { ...auth, balance: e.balance } } as StoreObject);
      setTotalValue(e.balance);
    });
    socket.on(`cancelBet-${auth?.userid}`, async (e) => {
      update({ auth: { ...auth, balance: e.balance } } as StoreObject);
      setTotalValue(e.balance);
      setLoading(false);
      setPlayStatus(false);
      setBtnActionStatus('start');
    });
    socket.on(`cashOut-${auth?.userid}`, async (e) => {
      update({ auth: { ...auth, balance: e.balance } } as StoreObject);
      setTotalValue(e.balance);
      setResultModalOpen(true);
      setLoading(false);
      setPlayStatus(false);
      setBtnActionStatus('start');
      setTimeout(() => {
        initializeGridSystem(gridCount);
        setCurrentProfitInd(0);
        setProfitCalcPage(0);
        setResultModalOpen(false);
      }, 2000);
    });
    socket.on(`checkMine-${auth?.userid}`, async (e) => {
      let data: any = [...gridDataList];
      if (e.mine) {
        e.minePlace.map((item: number) => {
          data[item].card = '_lose';
          data[item].mine = true;
          data[item].active = true;
        });
        setTimeout(() => {
          setCardLoading(false);
          setGridDataList(data);
          setPlayStatus(false);
          setBtnActionStatus('start');
        }, 500);
        setTimeout(() => {
          initializeGridSystem(gridCount);
          setProfitCalcPage(0);
          setCurrentProfitInd(0);
        }, 2000);
      } else {
        data[e.index].mine = e.mine;
        data[e.index].active = true;
        if (profitCalcList[8 * profitCalcPage + currentProfitInd] >= 10) {
          data[e.index].card = '_win3';
        } else if (profitCalcList[8 * profitCalcPage + currentProfitInd] >= 2) {
          data[e.index].card = '_win2';
        } else {
          data[e.index].card = '_win1';
        }
        setTimeout(() => {
          setGridDataList(data);
          setCardLoading(false);
          setBtnActionStatus('cashOut');
          if (currentProfitInd < 7) {
            setCurrentProfitInd((prevState) => prevState + 1);
          } else {
            setCurrentProfitInd(0);
            setProfitCalcPage((prevState) => prevState + 1);
          }
        }, 500);
      }
    });
    socket.on(`setProfitCalcList-${auth?.userid}`, async (e) => {
      setProfitCalcList(e.profitCalcList);
      let data = e.profitCalcList.map((item: number) => {
        let value: any = item;
        if (value >= 1000 && value < 1000000) {
          value = `${(item / 1000).toFixed(2)}K`;
        } else if (value >= 1000000 && value < 1000000000) {
          value = `${(item / 1000000).toFixed(2)}M`;
        } else if (value >= 1000000000) {
          value = `${(item / 1000000000).toFixed(2)}G`;
        } else {
          value = item;
        }
        return { value: value, active: false };
      });
      setProfitCalcTextList(data);
      setCurrentProfitCalcTextList(data.slice(8 * profitCalcPage, 8 * (profitCalcPage + 1)));
    });
    socket.on(`error-${auth?.userid}`, async (e) => {
      alert(e);
    });
    return () => {
      socket.off(`playBet-${auth?.userid}`);
      socket.off(`cancelBet-${auth?.userid}`);
      socket.off(`cashOut-${auth?.userid}`);
      socket.off(`checkMine-${auth?.userid}`);
      socket.off(`setProfitCalcList-${auth?.userid}`);
      socket.off(`error-${auth?.userid}`);
    };
  }, [gridDataList]);

  return (
    <>
      <div className="game-management-layout">
        <div className="game-landscape-top">
          <div className="logo-container" />
          <div className="profit-list-container">
            <div className="history">
              <div
                className="history-inner"
                style={{
                  gridTemplateColumns: `repeat(${currentProfitCalcTextList.length}, minmax(0, 1fr))`
                }}
              >
                {currentProfitCalcTextList.map((item: any, ind: number) => {
                  return (
                    <ProfitBox
                      key={ind}
                      self={ind}
                      value={item.value}
                      turboMode={turboMode}
                      playStatus={playStatus}
                      currentProfit={
                        turboMode
                          ? profitCalcList[
                              8 * profitCalcPage + profitCalcPage > 0
                                ? ind > 0
                                  ? 8 * profitCalcPage + ind
                                  : 8 * profitCalcPage - 1
                                : ind
                            ]
                          : profitCalcList[8 * profitCalcPage + ind]
                      }
                      currentProfitInd={currentProfitInd}
                      profitCalcPage={profitCalcPage}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className="balance-container">
            <label>Balance</label>
            <div className="balance">
              <span>${totalValue?.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="game-landscape-content">
          <div className="game-landscape-setting-info flex slg:hidden">
            <div className="game-landscape-setting-info-inner">
              <div className="setting-item">
                <div className="setting-icon">
                  <img src={GridIcon} alt="grid" />
                </div>
                <div className="setting-value">{`${gridCount}X${gridCount}`}</div>
              </div>
              <div className="setting-item">
                <div className="setting-icon">
                  <img src={CricketIcon} alt="cricket" />
                </div>
                <div className="setting-value">{mineCount}</div>
              </div>
            </div>
          </div>
          <div
            className="game-landscape-card-group"
            style={{ gridTemplateColumns: `repeat(${gridCount}, minmax(0, 1fr))` }}
          >
            {gridDataList.map((item: any, ind: number) => {
              return (
                <div key={ind} onClick={() => checkMine(ind)}>
                  <Card
                    card={item.card}
                    turboMode={turboMode}
                    turbo={item.turbo}
                    turboList={turboList}
                    loading={cardLoading}
                    playStatus={playStatus}
                    active={item.active}
                    mine={item.mine}
                    self={ind}
                    currentProfitAmount={betAmount * profitCalcList[8 * profitCalcPage + currentProfitInd]}
                    currentTarget={currentTarget}
                  />
                </div>
              );
            })}
          </div>
          <div className="game-landscape-size">
            <div className="game-landscape-size-list">
              {gridSettingList.map((item: any, ind: number) => {
                return (
                  <div
                    key={ind}
                    className={`game-landscape-size-item ${item.active ? '_active !cursor-default' : '_hover'} ${
                      playStatus && !item.active && '_disabled'
                    }`}
                    onClick={() => setGridSystem(item.grid, ind)}
                  >
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="game-landscape-size-title">Grid</div>
          </div>
          <div className="mobile-game-controller">
            <div className="profit-list-container">
              <div className="history">
                <div
                  className="history-inner"
                  style={{
                    gridTemplateColumns: `repeat(${currentProfitCalcTextList.length}, minmax(0, 1fr))`
                  }}
                >
                  {currentProfitCalcTextList.map((item: any, ind: number) => {
                    return (
                      <ProfitBox
                        key={ind}
                        self={ind}
                        value={item.value}
                        turboMode={turboMode}
                        playStatus={playStatus}
                        currentProfit={
                          turboMode
                            ? profitCalcList[
                                8 * profitCalcPage + profitCalcPage > 0
                                  ? ind > 0
                                    ? 8 * profitCalcPage + ind
                                    : 8 * profitCalcPage - 1
                                  : ind
                              ]
                            : profitCalcList[8 * profitCalcPage + ind]
                        }
                        currentProfitInd={currentProfitInd}
                        profitCalcPage={profitCalcPage}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="amount-controller">
              <AmountBox
                isMobile="mobile"
                minLimit={0.1}
                maxLimit={100}
                value={betAmount}
                setValue={(e: number) => !playStatus && setBetAmount(e)}
                playStatus={playStatus}
              />
            </div>
            <div className="btn-controller">
              <div>
                <ToggleBox
                  isMobile={true}
                  value={turboMode}
                  setValue={(e: boolean) => !playStatus && setTurboMode(e)}
                  playStatus={playStatus}
                />
              </div>
              <div className="grow" onClick={handleBetButton}>
                <BetButton
                  isMobile={true}
                  profitAmount={profitCalcList.length > 0 && (betAmount * currentProfit).toFixed(2)}
                  turboMode={turboMode}
                  cardLoading={cardLoading}
                  loading={loading}
                  type={btnActionStatus}
                />
              </div>
              <div onClick={() => setSettingModalOpen(true)}>
                <SettingBtn playStatus={playStatus} />
              </div>
            </div>
          </div>
        </div>
        <div className="game-landscape-left">
          <div className="wickets-control-group">
            <label>Wickets</label>
            <div className="mine-control-action">
              <MineBox
                isMobile={false}
                min={1}
                max={gridCount * gridCount - 1}
                value={mineCount}
                setValue={(e: number) => !playStatus && setMineCount(e)}
                playStatus={playStatus}
              />
            </div>
          </div>
          <div className="amount-control-group">
            <label>Bet Amount</label>
            <div className="amount-control-action">
              <AmountBox
                isMobile="desktop"
                minLimit={0.1}
                maxLimit={100}
                value={betAmount}
                setValue={(e: number) => !playStatus && setBetAmount(e)}
                playStatus={playStatus}
              />
            </div>
          </div>
        </div>
        <div className="game-landscape-right">
          <div className="turbo-control-group">
            <label>Turbo</label>
            <div className="turbo-control-action">
              <ToggleBox
                isMobile={false}
                value={turboMode}
                setValue={(e: boolean) => !playStatus && setTurboMode(e)}
                playStatus={playStatus}
              />
            </div>
          </div>
          <div className="btn-control-action" onClick={handleBetButton}>
            <BetButton
              isMobile={false}
              profitAmount={profitCalcList.length > 0 && (betAmount * currentProfit).toFixed(2)}
              turboMode={turboMode}
              cardLoading={cardLoading}
              loading={loading}
              type={btnActionStatus}
            />
          </div>
        </div>
      </div>
      <Modal open={resultModalOpen} setOpen={setResultModalOpen}>
        <div className="game-result-modal">
          <div className={`win_img ${currentProfit >= 10 ? '_win3' : currentProfit >= 2 ? '_win2' : '_win1'}`} />
          <div className="win-info-detail">
            <div className="win-amount">
              <p>${betAmount * currentProfit}</p>
              <span>${betAmount * currentProfit}</span>
            </div>
            <div className="win-amount-double">
              <p>X{currentProfit}</p>
              <span>X{currentProfit}</span>
            </div>
            <p className="win-text">Multiplier</p>
          </div>
        </div>
      </Modal>
      <Modal open={settingModalOpen} setOpen={setSettingModalOpen}>
        <div className="game-setting-modal">
          <div className="modal-close" onClick={() => setSettingModalOpen(false)}>
            &times;
          </div>
          <div className="game-setting-grid">
            <label>Grid</label>
            <div className="game-setting-grid-options">
              {gridSettingList.map((item: any, ind: number) => {
                return (
                  <div
                    key={ind}
                    className={`setting-grid-btn ${item.active && '_active'}`}
                    onClick={() => setGridSystem(item.grid, ind)}
                  >
                    <div className="setting-grid-btn-inner">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="game-setting-wickets">
            <label>Wickets</label>
            <MineBox
              isMobile={true}
              min={1}
              max={gridCount * gridCount - 1}
              value={mineCount}
              setValue={(e: number) => !playStatus && setMineCount(e)}
              playStatus={playStatus}
            />
          </div>
          <div className="game-setting-amount">
            <label>Bet Amount</label>
            <AmountBox
              isMobile="modal"
              minLimit={0.1}
              maxLimit={100}
              value={betAmount}
              setValue={(e: number) => !playStatus && setBetAmount(e)}
              playStatus={playStatus}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GameManager;
