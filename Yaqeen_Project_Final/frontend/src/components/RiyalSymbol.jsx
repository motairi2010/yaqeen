import React from "react";
import "../styles/riyal-system.css";

const RiyalSymbol = ({
  amount,
  showText = false,
  size = "normal",
  className = "",
  style = {}
}) => {
  const sizeClass = {
    small: "riyal-small",
    normal: "riyal-normal",
    large: "riyal-large"
  }[size];

  return (
    <span className={`riyal-container ${sizeClass} ${className}`} style={style}>
      <span className="riyal-symbol">﷼</span>
      {amount && <span className="riyal-amount">{amount}</span>}
      {showText && <span className="riyal-text">﷼</span>}
    </span>
  );
};

export default RiyalSymbol;

