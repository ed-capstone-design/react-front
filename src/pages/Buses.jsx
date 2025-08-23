import React from "react";
import { BusProvider } from "../components/Bus/BusContext";
import BusListPanel from "../components/Bus/BusListPanel";

const Buses = () => {
  return (
    <BusProvider>
      <BusListPanel />
    </BusProvider>
  );
};

export default Buses;
