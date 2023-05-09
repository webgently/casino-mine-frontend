import React from 'react';
import './profitbox.scss';

const ProfitBox =({item, ind, profitCalcList, currentProfit}:any)=> {
    return (
        <div className={`history-item ${currentProfit === ind && 'history-item_active'}`}>
            <span
                className={
                    profitCalcList[ind] >= 10
                    ? 'text-yellow'
                    : profitCalcList[ind] >= 2
                    ? 'text-green'
                    : 'text-blue'
                }
            >{`X ${item.value}`}</span>
        </div>
    )
}

export default ProfitBox;