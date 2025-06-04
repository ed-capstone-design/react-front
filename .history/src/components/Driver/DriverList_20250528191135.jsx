import React from "react";
import { DriverProvider } from "./DriverContext";
import DriverListPanel from "./DriverListPanel";

const DriverList = () => (
  <DriverProvider>
    <DriverListPanel />
  </DriverProvider>
);

export default DriverList;
