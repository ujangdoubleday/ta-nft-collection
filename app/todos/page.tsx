import { TodoList } from "@/components/ui/todo-list";

export default function TodoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Todo List</h1>
      <TodoList />
    </div>
  );
}
