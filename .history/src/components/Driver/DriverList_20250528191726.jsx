import React, { useContext } from "react";
import { DriverContext } from "./DriverContext";
import Driver from "";

const DriverList = () => {
  const { drivers } = useContext(DriverContext);
  return (
    <>
      {drivers.map((driver) => (
        <Driver key={driver.id} driver={driver} />
      ))}
    </>
  );
};

export default DriverList;
