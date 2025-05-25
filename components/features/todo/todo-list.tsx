"use client";

import { useState } from "react";
import { useAddress } from "@/lib/hooks/use-address";
import { TodoItem } from "@/components/features/todo/todo-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Win98Window } from "@/components/ui/win98";
import { Card } from "@/components/ui/card";
import { useTrpc } from "@/lib/hooks/use-trpc";
import { Plus, X, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export function TodoList() {
  const { data: _address } = useAddress();
  const trpc = useTrpc();
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [authorName, setAuthorName] = useState("Anonymous");
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });

  // Use a simple test query that doesn't depend on the Todo model
  const {
    data: testData,
    isLoading: _testLoading,
    error: _testError,
  } = trpc.todo.test.useQuery();

  // Fetch all todos, no longer filtering by wallet address
  const {
    data: todos,
    isLoading: todosLoading,
    error: todosError,
    refetch: refetchTodos,
  } = trpc.todo.getAll.useQuery({ authorName });

  const createTodoMutation = trpc.todo.create.useMutation({
    onSuccess: () => {
      refetchTodos();
      showNotification("success", "Todo added successfully!");
    },
    onError: (error) => {
      showNotification("error", `Failed to add todo: ${error.message}`);
    },
  });

  const updateTodoMutation = trpc.todo.update.useMutation({
    onSuccess: () => {
      refetchTodos();
      showNotification("success", "Todo updated successfully!");
    },
    onError: (error) => {
      showNotification("error", `Failed to update todo: ${error.message}`);
    },
  });

  const deleteTodoMutation = trpc.todo.delete.useMutation({
    onSuccess: () => {
      refetchTodos();
      showNotification("success", "Todo deleted successfully!");
    },
    onError: (error) => {
      showNotification("error", `Failed to delete todo: ${error.message}`);
    },
  });

  const toggleCompletedMutation = trpc.todo.toggleCompleted.useMutation({
    onSuccess: (data) => {
      refetchTodos();
      showNotification(
        "success",
        data.completed ? "Todo marked complete!" : "Todo marked incomplete!"
      );
    },
    onError: (error) => {
      showNotification(
        "error",
        `Failed to update todo status: ${error.message}`
      );
    },
  });

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: "" });
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      createTodoMutation.mutate({
        title: newTitle,
        description: newDescription || undefined,
        authorName,
      });
      setNewTitle("");
      setNewDescription("");
    }
  };

  return (
    <div className="space-y-6">
      {notification.type && (
        <div
          className={`rounded border-2 p-3 flex items-center ${
            notification.type === "success"
              ? "bg-green-100 border-t-white border-l-white border-r-[#008000] border-b-[#008000]"
              : notification.type === "error"
              ? "bg-red-100 border-t-white border-l-white border-r-[#ff0000] border-b-[#ff0000]"
              : "bg-blue-100 border-t-white border-l-white border-r-[#0000ff] border-b-[#0000ff]"
          }`}
        >
          {notification.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
          )}
          {notification.type === "error" && (
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          )}
          {notification.type === "info" && (
            <Info className="w-5 h-5 text-blue-600 mr-2" />
          )}
          <span className="flex-1">{notification.message}</span>
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0 ml-2"
            onClick={() => setNotification({ type: null, message: "" })}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Win98Window title="Add New Task" className="mb-4">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter todo title"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description (optional)
              </label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium mb-1"
              >
                Author Name
              </label>
              <Input
                id="author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <Button
              type="submit"
              disabled={createTodoMutation.isPending}
              className="w-full"
            >
              {createTodoMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Todo
                </>
              )}
            </Button>
          </form>
        </div>
      </Win98Window>

      {testData && (
        <Win98Window title="System Status" className="mb-4">
          <div className="p-4 bg-[#c0c0c0] text-sm">
            <p className="mb-1">tRPC Status: {testData.message}</p>
            <p className="mb-1">
              Todo Model Available: {testData.hasTodoModel ? "Yes ✓" : "No ✗"}
            </p>
            <p>Available models: {testData.prismaModels.join(", ")}</p>
          </div>
        </Win98Window>
      )}

      {todosError && (
        <Win98Window title="ERROR" className="mb-4">
          <div className="p-4 bg-red-50">
            <div className="flex items-start">
              <AlertTriangle className="text-red-600 w-5 h-5 mr-2 flex-shrink-0" />
              <p className="text-red-700">
                Error loading todos: {todosError.message}
              </p>
            </div>
            <Button onClick={() => refetchTodos()} size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        </Win98Window>
      )}

      <Win98Window title="My Tasks" className="mb-4">
        <div className="p-4">
          {todosLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="w-6 h-6 border-4 border-t-transparent border-[#000080] rounded-full animate-spin"></div>
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : todos && todos.length > 0 ? (
            <div className="space-y-4">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  id={todo.id}
                  title={todo.title}
                  description={todo.description}
                  completed={todo.completed}
                  onToggleComplete={(id) =>
                    toggleCompletedMutation.mutate({ id })
                  }
                  onDelete={(id) => deleteTodoMutation.mutate({ id })}
                  onUpdate={(id, data) =>
                    updateTodoMutation.mutate({ id, ...data })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-2">No tasks yet</p>
              <p className="text-sm text-gray-400">
                Create a new task to get started
              </p>
            </div>
          )}
        </div>
      </Win98Window>
    </div>
  );
}
