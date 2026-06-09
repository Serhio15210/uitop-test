import {
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { TaskItem } from "@/components/task-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Todo } from "@/types/todo";

type TaskListCardProps = {
  categories: Category[];
  error: string | null;
  isLoading: boolean;
  onComplete: (todo: Todo) => unknown;
  onDelete: (todo: Todo) => unknown;
  onEdit: (todo: Todo) => unknown;
  onRetry: () => unknown;
  onSelectCategory: (categoryId: string) => unknown;
  selectedCategory: string;
  todos: Todo[];
  updatingTodoIds: Set<string>;
};

export function TaskListCard(props: TaskListCardProps) {
  return (
    <Card className="min-h-[500px] gap-0 rounded-3xl border-white/80 bg-white/90 py-0 shadow-[0_24px_80px_-34px_rgba(36,30,68,0.28)] backdrop-blur">
      <CardContent className="p-5 sm:p-7">
        <TaskListHeader {...props} />
        <TaskListContent {...props} />
      </CardContent>
    </Card>
  );
}

function TaskListHeader({
  categories,
  onSelectCategory,
  selectedCategory,
  todos,
}: TaskListCardProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          My tasks
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {todos.length} {todos.length === 1 ? "task" : "tasks"} in this view
        </p>
      </div>


        <Select value={selectedCategory} onValueChange={onSelectCategory}>
          <SelectTrigger
            aria-label="Filter tasks by category"
            className="h-10 min-w-40 bg-white px-3.5 text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

    </div>
  );
}

function TaskListContent({
  error,
  isLoading,
  onComplete,
  onDelete,
  onEdit,
  onRetry,
  selectedCategory,
  todos,
  updatingTodoIds,
}: TaskListCardProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-slate-400">
        <LoaderCircle className="size-8 animate-spin text-violet-500" />
        <p className="text-sm font-medium">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center text-center">
        <h3 className="font-bold text-slate-900">Couldn&apos;t load tasks</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {error}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-5 h-9 px-3"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (!todos.length) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center text-center">
        <h3 className="text-lg font-bold text-slate-900">No tasks here</h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
          {selectedCategory === "all"
            ? "Add your first task and start building momentum."
            : "This category is clear. Pick another one or add a task."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TaskItem
          key={todo.id}
          todo={todo}
          isUpdating={updatingTodoIds.has(todo.id)}
          onComplete={onComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
