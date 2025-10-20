import React, { createContext, useContext } from 'react';
import RiyalSymbol from '../components/RiyalSymbol';

export const RiyalContext = createContext();

export const RiyalProvider = ({ children }) => {
  const riyalUtils = {
    format: (amount) => {
      return (
        <span className="riyal-container">
          <span className="riyal-amount">{amount}</span>
          RiyalSymbolToken
        </span>
      );
    },
    
    formatText: (amount) => `${amount} ر.س`,
    
    symbol: () => RiyalSymbolToken,
    
    amount: (amount, options) => <RiyalSymbol amount={amount} {...options} />
  };

  return (
    <RiyalContext.Provider value={riyalUtils}>
      {children}
    </RiyalContext.Provider>
  );
};

export const useRiyal = () => {
  const context = useContext(RiyalContext);
  if (!context) {
    throw new Error('useRiyal must be used within RiyalProvider');
  }
  return context;
};

