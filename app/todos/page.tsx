import { TodoList } from "@/components/ui/todo-list";
import { Container } from "@/components/ui/container";
import { Win98Window } from "@/components/ui/win98";

export default function TodoPage() {
  return (
    <main className="py-4">
      <Container>
        <Win98Window
          title="Todo Manager"
          icon="/assets/icons/todo.png"
          className="mb-4"
        >
          <h1 className="text-lg font-bold mb-4 text-center">My Todo List</h1>
          <TodoList />
        </Win98Window>
      </Container>
    </main>
  );
}
