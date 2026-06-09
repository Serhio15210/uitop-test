"use client";

import { X } from "lucide-react";
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
import type { Category, Todo } from "@/types/todo";

export type EditTaskValues = {
  text: string;
  categoryId: string;
};

type EditTaskDialogProps = {
  categories: Category[];
  isSubmitting: boolean;
  onClose: () => unknown;
  onSubmit: (values: EditTaskValues) => Promise<boolean>;
  todo: Todo | null;
};

export function EditTaskDialog({
  categories,
  isSubmitting,
  onClose,
  onSubmit,
  todo,
}: EditTaskDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTaskValues>({
    defaultValues: {
      text: todo?.text || "",
      categoryId: todo?.category.id || "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const updated = await onSubmit(values);
    if (updated) {
      reset(values);
      onClose();
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.55)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
        onSubmit={submit}
        noValidate
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="edit-task-title"
              className="text-xl font-bold text-slate-900"
            >
              Edit task
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Update the task text or move it to another category.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close edit dialog"
            className="size-9 rounded-xl"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-task-text"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Task
            </label>
            <Input
              id="edit-task-text"
              autoComplete="off"
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
              <p
                className="mt-1.5 text-xs font-medium text-rose-500"
                role="alert"
              >
                {errors.text.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-task-category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Category
            </label>
            <Controller
              control={control}
              name="categoryId"
              rules={{ required: "Please select a category." }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="edit-task-category"
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
              <p
                className="mt-1.5 text-xs font-medium text-rose-500"
                role="alert"
              >
                {errors.categoryId.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl px-4"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 rounded-xl bg-violet-600 px-4 text-white hover:bg-violet-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
