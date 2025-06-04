import React, { useContext } from "react";
import { DriverContext } from "./DriverContext";

const DriverList = () => {
  const { drivers } = useContext(DriverContext);
  return drivers;
};

export default DriverList;
