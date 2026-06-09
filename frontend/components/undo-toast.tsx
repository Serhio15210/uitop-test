import { RotateCcw } from "lucide-react";

type UndoToastProps = {
  message: string;
  onUndo: () => unknown;
};

export function UndoToast({ message, onUndo }: UndoToastProps) {
  return (
    <div className="flex w-full items-center gap-4">
      <span className="flex-1 text-sm font-semibold text-white">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/12 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
      >
        <RotateCcw className="size-3.5" />
        Undo
      </button>
    </div>
  );
}
