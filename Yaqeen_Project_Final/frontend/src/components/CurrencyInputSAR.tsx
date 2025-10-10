import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  /** استخدم "sar-svg" لو رغبت بعرض الأيقونة من svg بدلاً من الحرف */
  wrapperClassName?: string;
};

export default function CurrencyInputSAR({ wrapperClassName = "", ...props }: Props) {
  return (
    <span className={`currency-wrap ${wrapperClassName}`}>
      <input {...props} className={`currency-input ${props.className ?? ""}`} />
    </span>
  );
}
