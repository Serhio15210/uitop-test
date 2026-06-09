import { Layers3 } from "lucide-react";
import { TaskForm, type TaskFormValues } from "@/components/task-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/types/todo";

type CreateTaskCardProps = {
  categories: Category[];
  isSubmitting: boolean;
  onSubmit: (values: TaskFormValues) => Promise<boolean>;
};

export function CreateTaskCard(props: CreateTaskCardProps) {
  return (
    <Card className="gap-0 rounded-3xl border-white/80 bg-white/90 py-0 shadow-[0_24px_80px_-34px_rgba(36,30,68,0.28)] backdrop-blur lg:sticky lg:top-8">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Layers3 className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Add a new task</h2>
            <p className="text-xs text-slate-400">Plan your next move</p>
          </div>
        </div>
        <TaskForm
          key={props.categories.map((category) => category.id).join("-")}
          {...props}
        />
      </CardContent>
    </Card>
  );
}
