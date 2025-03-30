// page.tsx (Server Component)
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import TodoList, { Todo } from '@/components/TodoList';
import { db } from '@/utils/db';

const Home = async () => {
  const data = (await db.todo.findMany({
    select: {
      id: true,
      input: true,
      createdAt: true,
    },
    orderBy: {
      id: 'desc',
    },
  })) as Todo[];

  // Ensure all todos have 'done' explicitly set
  const todosWithDone: Todo[] = data.map((todo) => ({
    ...todo,
    done: todo.done ?? false, // Defaults to false if missing
  }));

  return (
    <>
      <Header />
      <TodoList initialTodos={todosWithDone} />
      <Footer />
    </>
  );
};

export default Home;
