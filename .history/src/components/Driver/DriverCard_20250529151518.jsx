import React,{useContext} from 'react';
import DriverContext from './DriverContext';

s
const DriverCard = ({ driver }) => {

  return(
    <div>
      <span>{driver.name}</span>
      <span>{driver.state}</span>
    </div>
  )
};
export default DriverCard;