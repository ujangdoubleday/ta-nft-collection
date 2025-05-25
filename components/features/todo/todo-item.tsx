"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Win98Window } from "@/components/ui/win98";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Trash2, CheckSquare, Edit, X } from "lucide-react";

interface TodoItemProps {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title: string; description?: string }) => void;
}

export function TodoItem({
  id,
  title,
  description,
  completed,
  onToggleComplete,
  onDelete,
  onUpdate,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onUpdate(id, {
        title: editedTitle,
        description: editedDescription || undefined,
      });
      setIsEditing(false);
    }
  };

  return (
    <Win98Window title="TODO" className="mb-4">
      {isEditing ? (
        <div className="p-4 space-y-4">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Task title"
            className="w-full"
          />
          <Input
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full"
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={completed}
                onChange={() => onToggleComplete(id)}
                className="w-4 h-4 cursor-pointer"
              />
              <span>Completed</span>
            </label>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <CheckSquare className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Toggle
                pressed={completed}
                onPressedChange={() => onToggleComplete(id)}
                aria-label="Toggle completed"
              />
              <div className="flex-1">
                <h3
                  className={`text-lg font-medium ${
                    completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {title}
                </h3>
                {description && (
                  <p
                    className={`text-sm text-gray-600 ${
                      completed ? "line-through" : ""
                    }`}
                  >
                    {description}
                  </p>
                )}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="p-3 bg-gray-100 border-t border-t-gray-300">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600">
                  Delete this task?
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Win98Window>
  );
}
