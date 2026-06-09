"use client";

import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { CreateTaskCard } from "@/components/create-task-card";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  EditTaskDialog,
  type EditTaskValues,
} from "@/components/edit-task-dialog";
import { TaskListCard } from "@/components/task-list-card";
import { UNDO_DELAY, useTodos } from "@/hooks/use-todos";

export function TodoDashboard() {
  const todos = useTodos();
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const editingTodo =
    todos.todos.find((todo) => todo.id === editingTodoId) ?? null;

  function updateEditingTodo(values: EditTaskValues) {
    if (!editingTodoId) return Promise.resolve(false);
    return todos.updateTodo(editingTodoId, values);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f6fb] text-slate-900">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <DashboardHeader
          activeCount={todos.activeCount}
          completedCount={todos.completedCount}
        />

        <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <CreateTaskCard
            categories={todos.categories}
            isSubmitting={todos.isSubmitting}
            onSubmit={todos.createTodo}
          />
          <TaskListCard
            categories={todos.categories}
            error={todos.error}
            isLoading={todos.isLoading}
            onComplete={todos.completeTodo}
            onDelete={todos.deleteTodo}
            onEdit={(todo) => setEditingTodoId(todo.id)}
            onRetry={todos.loadTodos}
            onSelectCategory={todos.setSelectedCategory}
            selectedCategory={todos.selectedCategory}
            todos={todos.visibleTodos}
            updatingTodoIds={todos.updatingTodoIds}
          />
        </div>
      </div>

      {editingTodo && (
        <EditTaskDialog
          categories={todos.categories}
          isSubmitting={
            editingTodoId ? todos.updatingTodoIds.has(editingTodoId) : false
          }
          onClose={() => setEditingTodoId(null)}
          onSubmit={updateEditingTodo}
          todo={editingTodo}
        />
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={UNDO_DELAY}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        theme="dark"
        toastClassName="taskflow-toast"
        progressClassName="taskflow-toast-progress"
      />
    </main>
  );
}
