import { memo } from "react";
import type { ChangeEvent } from "react";
import type { SelectorOption } from "../../types";

type SelectProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: SelectorOption[];
};

export const Select = memo(({ value, onChange, options }: SelectProps) => {
  return (
    <select value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});
