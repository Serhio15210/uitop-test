"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UndoToast } from "@/components/undo-toast";
import {
  todoApi,
  type CreateTodoPayload,
  type UpdateTodoPayload,
} from "@/services/todo-api";
import type { Todo } from "@/types/todo";

type Timer = ReturnType<typeof setTimeout>;

export const UNDO_DELAY = 5_000;

const TODO_OVERVIEW_QUERY_KEY = ["todo-overview"] as const;

export function useTodos() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hiddenTodoIds, setHiddenTodoIds] = useState<Set<string>>(new Set());
  const [updatingTodoIds, setUpdatingTodoIds] = useState<Set<string>>(
    new Set(),
  );
  const deleteTimers = useRef(new Map<string, Timer>());
  const completeTimers = useRef(new Map<string, Timer>());

  const overviewQuery = useQuery({
    queryKey: TODO_OVERVIEW_QUERY_KEY,
    queryFn: todoApi.getOverview,
  });

  function setHidden(id: string, hidden: boolean) {
    setHiddenTodoIds((current) => {
      const next = new Set(current);
      if (hidden) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function setUpdating(id: string, updating: boolean) {
    setUpdatingTodoIds((current) => {
      const next = new Set(current);
      if (updating) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateTodoPayload) =>
      todoApi.createTodo({ ...payload, text: payload.text.trim() }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODO_OVERVIEW_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTodoPayload;
    }) =>
      todoApi.updateTodo(id, {
        ...payload,
        text: payload.text.trim(),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODO_OVERVIEW_QUERY_KEY }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => todoApi.updateStatus(id, true),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODO_OVERVIEW_QUERY_KEY }),
  });

  const undoCompleteMutation = useMutation({
    mutationFn: (id: string) => todoApi.updateStatus(id, false),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODO_OVERVIEW_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TODO_OVERVIEW_QUERY_KEY }),
  });

  useEffect(() => {
    const activeDeleteTimers = deleteTimers.current;
    const activeCompleteTimers = completeTimers.current;

    return () => {
      activeDeleteTimers.forEach(clearTimeout);
      activeCompleteTimers.forEach(clearTimeout);
    };
  }, []);

  async function createTodo(payload: CreateTodoPayload) {
    try {
      await createMutation.mutateAsync(payload);
      toast.success("Task added");
      return true;
    } catch (createError) {
      toast.error(todoApi.getErrorMessage(createError));
      return false;
    }
  }

  async function completeTodo(todo: Todo) {
    setUpdating(todo.id, true);

    try {
      await completeMutation.mutateAsync(todo.id);
      scheduleCompleteUndo(todo.id);
    } catch (completeError) {
      toast.error(todoApi.getErrorMessage(completeError));
    } finally {
      setUpdating(todo.id, false);
    }
  }

  async function updateTodo(id: string, payload: UpdateTodoPayload) {
    setUpdating(id, true);

    try {
      await updateMutation.mutateAsync({ id, payload });
      toast.success("Task updated");
      return true;
    } catch (updateError) {
      toast.error(todoApi.getErrorMessage(updateError));
      return false;
    } finally {
      setUpdating(id, false);
    }
  }

  function scheduleCompleteUndo(todoId: string) {
    const actionId = `complete-${todoId}`;
    const existingTimer = completeTimers.current.get(actionId);
    if (existingTimer) clearTimeout(existingTimer);

    toast(
      <UndoToast
        message="Task completed"
        onUndo={() => undoComplete(actionId, todoId)}
      />,
      {
        toastId: actionId,
        autoClose: UNDO_DELAY,
        closeButton: false,
        icon: false,
      },
    );

    completeTimers.current.set(
      actionId,
      setTimeout(async () => {
        await confirmComplete(actionId, todoId);
      }, UNDO_DELAY),
    );
  }

  async function undoComplete(actionId: string, todoId: string) {
    cancelComplete(actionId);
    setUpdating(todoId, true);

    try {
      await undoCompleteMutation.mutateAsync(todoId);
    } catch (error) {
      toast.error(todoApi.getErrorMessage(error));
    } finally {
      setUpdating(todoId, false);
    }
  }

  async function confirmComplete(actionId: string, todoId: string) {
    completeTimers.current.delete(actionId);
    setUpdating(todoId, true);

    try {
      await deleteMutation.mutateAsync(todoId);
    } catch (error) {
      if (todoApi.isNotFound(error)) {
        await queryClient.invalidateQueries({
          queryKey: TODO_OVERVIEW_QUERY_KEY,
        });
      } else {
        await restoreCompletedTodo(todoId, error);
      }
    } finally {
      setUpdating(todoId, false);
    }
  }

  async function restoreCompletedTodo(todoId: string, error: unknown) {
    try {
      await undoCompleteMutation.mutateAsync(todoId);
    } catch {
      await queryClient.invalidateQueries({
        queryKey: TODO_OVERVIEW_QUERY_KEY,
      });
    }

    toast.error(todoApi.getErrorMessage(error));
  }

  function cancelComplete(actionId: string) {
    const timer = completeTimers.current.get(actionId);
    if (timer) clearTimeout(timer);
    completeTimers.current.delete(actionId);
    toast.dismiss(actionId);
  }

  function deleteTodo(todo: Todo) {
    const actionId = `delete-${todo.id}`;
    setHidden(todo.id, true);

    toast(
      <UndoToast
        message="Task deleted"
        onUndo={() => undoDelete(actionId, todo.id)}
      />,
      {
        toastId: actionId,
        autoClose: UNDO_DELAY,
        closeButton: false,
        icon: false,
      },
    );

    deleteTimers.current.set(
      actionId,
      setTimeout(async () => {
        await confirmDelete(actionId, todo.id);
      }, UNDO_DELAY),
    );
  }

  function undoDelete(actionId: string, todoId: string) {
    cancelDelete(actionId);
    setHidden(todoId, false);
  }

  async function confirmDelete(actionId: string, todoId: string) {
    deleteTimers.current.delete(actionId);

    try {
      await deleteMutation.mutateAsync(todoId);
      setHidden(todoId, false);
    } catch (error) {
      if (todoApi.isNotFound(error)) {
        setHidden(todoId, false);
        await queryClient.invalidateQueries({
          queryKey: TODO_OVERVIEW_QUERY_KEY,
        });
        return;
      }

      undoDelete(actionId, todoId);
      toast.error("Could not delete the task.");
    }
  }

  function cancelDelete(actionId: string) {
    const timer = deleteTimers.current.get(actionId);
    if (timer) clearTimeout(timer);
    deleteTimers.current.delete(actionId);
    toast.dismiss(actionId);
  }

  const todos = overviewQuery.data?.todos ?? [];
  const categories = overviewQuery.data?.categories ?? [];
  const visibleTodos = todos.filter(
    (todo) =>
      !hiddenTodoIds.has(todo.id) &&
      (selectedCategory === "all" || todo.category.id === selectedCategory),
  );
  const completedCount = todos.filter((todo) => todo.completed).length;

  return {
    activeCount: todos.length - completedCount,
    categories,
    completedCount,
    completeTodo,
    createTodo,
    deleteTodo,
    error: overviewQuery.error
      ? todoApi.getErrorMessage(overviewQuery.error)
      : null,
    isLoading: overviewQuery.isLoading,
    isSubmitting: createMutation.isPending,
    loadTodos: overviewQuery.refetch,
    selectedCategory,
    setSelectedCategory,
    todos,
    updateTodo,
    updatingTodoIds,
    visibleTodos,
  };
}
