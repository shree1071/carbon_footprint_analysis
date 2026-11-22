import React, { createContext, useContext, useState, useEffect } from 'react';

const DataModeContext = createContext();

export const DATA_MODES = {
  BMSIT_ACTUAL: 'BMSIT_ACTUAL',
  VESIT_ACTUAL: 'BMSIT_ACTUAL',
  TEST_DEMO: 'TEST_DEMO',
};

export const DataModeProvider = ({ children }) => {
  const [dataMode, setDataModeState] = useState(() => {
    return localStorage.getItem('bmsit_carbon_data_mode') || localStorage.getItem('vesit_carbon_data_mode') || DATA_MODES.BMSIT_ACTUAL;
  });

  const setDataMode = (mode) => {
    localStorage.setItem('bmsit_carbon_data_mode', mode);
    setDataModeState(mode);
  };

  const isVesit = dataMode === DATA_MODES.BMSIT_ACTUAL || dataMode === 'VESIT_ACTUAL';
  const isBmsit = isVesit;

  return (
    <DataModeContext.Provider value={{ dataMode, setDataMode, isVesit, isBmsit }}>
      {children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = () => {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
};
