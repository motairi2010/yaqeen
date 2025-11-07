import React from "react";
import "../styles/riyal-system.css";

const RiyalSymbol = ({ 
  amount, 
  showText = false, 
  size = "normal",
  className = "" 
}) => {
  const sizeClass = {
    small: "riyal-small",
    normal: "riyal-normal", 
    large: "riyal-large"
  }[size];

  return (
    <span className={`riyal-container ${sizeClass} ${className}`}>
      <span className="riyal-symbol">ر.س</span>
      {amount && <span className="riyal-amount">{amount}</span>}
      {showText && <span className="riyal-text">﷼ سعودي</span>}
    </span>
  );
};

export default RiyalSymbol;

