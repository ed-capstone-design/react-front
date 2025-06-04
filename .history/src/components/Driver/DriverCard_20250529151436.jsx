import React,{useContext} from 'react';
import DriverContext from './DriverContext';


const DriverCard = ({ driver }) => {

  return(
    <div>
      <span>{driver.name}</span>
      <span>{}</span>
    </div>
  )
};
export default DriverCard;