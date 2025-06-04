import React from "react";
import { DriverProvider } from "../components/Driver/DriverContext";
import DriverList from "../components/Driver/DriverList";

const Drivers = () => (
  <div className="max-w-5xl mx-auto py-10 px-6">
    <h2 className="text-2xl font-bold mb-8 text-gray-900">운전자 관리</h2>
    <DriverProvider>
      <DriverList />
    </DriverProvider>
  </div>
);

export default Drivers;