import { Icon } from "@iconify/react";
import { memo } from "react";

export const ResetButton = memo(({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick}>
      <Icon icon="material-symbols:delete-outline" width={24} height={24} />
    </button>
  );
});
