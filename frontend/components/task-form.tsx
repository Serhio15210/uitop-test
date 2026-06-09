"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/todo";

export type TaskFormValues = {
  text: string;
  categoryId: string;
};

type TaskFormProps = {
  categories: Category[];
  isSubmitting: boolean;
  onSubmit: (values: TaskFormValues) => Promise<boolean>;
};

export function TaskForm({
  categories,
  isSubmitting,
  onSubmit,
}: TaskFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: {
      text: "",
      categoryId: categories[0]?.id ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const created = await onSubmit(values);
    if (created) reset({ text: "", categoryId: values.categoryId });
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="task-text"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Task
        </label>
        <Input
          id="task-text"
          autoComplete="off"
          placeholder="What needs to be done?"
          aria-invalid={Boolean(errors.text)}
          className="h-12 rounded-xl bg-white px-4 text-[15px] shadow-sm focus-visible:border-violet-400 focus-visible:ring-violet-500/10"
          {...register("text", {
            required: "Please enter a task.",
            maxLength: {
              value: 200,
              message: "Keep the task under 200 characters.",
            },
            validate: (value) =>
              Boolean(value.trim()) || "Please enter a task.",
          })}
        />
        {errors.text && (
          <p className="mt-1.5 text-xs font-medium text-rose-500" role="alert">
            {errors.text.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="task-category"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Category
        </label>
        <Controller
          control={control}
          name="categoryId"
          rules={{ required: "Please select a category." }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} >
              <SelectTrigger
                id="task-category"
                aria-invalid={Boolean(errors.categoryId)}
                className="h-12 w-full rounded-xl bg-white px-4 text-[15px] shadow-sm focus-visible:border-violet-400 focus-visible:ring-violet-500/10"
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="mt-1.5 text-xs font-medium text-rose-500" role="alert">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <Button
        className="h-11 w-full rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(109,93,252,0.9)] hover:bg-violet-700"
        type="submit"
        disabled={isSubmitting || categories.length === 0}
      >
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        {isSubmitting ? "Adding task..." : "Add task"}
      </Button>
      <p className="text-center text-xs text-slate-400">
        Up to 5 active tasks per category
      </p>
    </form>
  );
}
