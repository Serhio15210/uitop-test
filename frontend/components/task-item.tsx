"use client";

import { Clock3, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Todo } from "@/types/todo";

type TaskItemProps = {
  todo: Todo;
  isUpdating: boolean;
  onComplete: (todo: Todo) => unknown;
  onDelete: (todo: Todo) => unknown;
  onEdit: (todo: Todo) => unknown;
};

export function TaskItem({
  todo,
  isUpdating,
  onComplete,
  onDelete,
  onEdit,
}: TaskItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_30px_-22px_rgba(45,35,90,0.4)] transition-all duration-300 hover:border-violet-100 hover:shadow-[0_16px_34px_-24px_rgba(75,55,170,0.55)] sm:px-5",
        todo.completed && "border-violet-100 bg-violet-50/60",
      )}
    >
      <Checkbox
        checked={todo.completed}
        disabled={isUpdating || todo.completed}
        aria-label={`Mark "${todo.text}" as completed`}
        className="size-6 rounded-full border-2 border-slate-300 bg-white data-checked:border-violet-600 data-checked:bg-violet-600"
        onCheckedChange={(checked) => {
          if (checked) onComplete(todo);
        }}
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[15px] font-semibold text-slate-800 transition",
            todo.completed && "text-slate-400 line-through",
          )}
          title={todo.text}
        >
          {todo.text}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: todo.category.color }}
            />
            {todo.category.name}
          </span>
          {todo.completed && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600">
              <Clock3 className="size-3" />
              Removing soon
            </span>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={isUpdating || todo.completed}
        aria-label={`Edit "${todo.text}"`}
        onClick={() => onEdit(todo)}
        className="size-10 rounded-xl opacity-70 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <Pencil className="size-4" />
      </Button>

      <Button
        type="button"
        variant="destructive"
        size="icon"
        disabled={isUpdating || todo.completed}
        aria-label={`Delete "${todo.text}"`}
        onClick={() => onDelete(todo)}
        className="size-10 rounded-xl opacity-70 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
