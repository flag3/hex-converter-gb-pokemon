import type { ChangeEvent } from "react";

interface TextareaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export const Textarea = ({ value, onChange }: TextareaProps) => {
  return <textarea value={value} onChange={onChange} rows={20} cols={44} />;
};
