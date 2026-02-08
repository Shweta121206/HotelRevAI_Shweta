import { createContext, useContext, useState, ReactNode } from "react";

export type CurrencyCode = "USD" | "INR" | "EUR" | "JPY";

interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD
}

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.85 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 110 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (code: CurrencyCode) => void;
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(currencies[0]);

  const setCurrency = (code: CurrencyCode) => {
    const found = currencies.find((c) => c.code === code);
    if (found) setCurrencyState(found);
  };

  const convertAmount = (amount: number) => {
    // Convert from USD to current currency
    return amount * currency.rate;
  };

  const formatAmount = (amount: number) => {
    const converted = convertAmount(amount);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
