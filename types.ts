export type CalculationMode = 'investment' | 'quantity';

export interface TradeState {
  buyPrice: number;
  sellPrice: number;
  stopLossPrice: number;
  mode: CalculationMode;
  amount: number; // Represents either investment amount ($) or quantity (shares) depending on mode
}

export interface ChartDataPoint {
  price: number;
  profit: number;
  isCurrent: boolean;
  isBreakEven: boolean;
}

export interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  active?: boolean;
}