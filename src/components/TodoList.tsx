// components/TodoList.jsx (Client Component)
'use client';

import Image from 'next/image';
import sun from './../images/icon-sun.svg';
import moon from './../images/icon-moon.svg';
import checked from './../images/icon-check.svg';
import cross from './../images/icon-cross.svg';
import * as actions from '@/actions';
import { useEffect, useState } from 'react';

// Define the Todo type
export type Todo = {
  id: string;
  input: string;
  done?: boolean;
  createdAt: Date;
};

// Define props type
export interface TodoListProps {
  initialTodos: Todo[];
}

export default function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  // Fetch todos on initial render
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const todosFromBackend = await actions.getTodos(); // Fetch the todos from backend
        setTodos(todosFromBackend); // Set todos in the state
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  // Create Todo handler
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('input') as HTMLInputElement;

    const newTodo: Todo = {
      id: Date.now().toString(),
      input: input.value,
      done: false,
      createdAt: new Date(),
    };

    const formData = new FormData();
    formData.append('input', newTodo.input);
    await actions.createTodo(formData);

    setTodos((prevTodos) => [...prevTodos, newTodo]);

    input.value = '';
  };

  // Check Todo handler
  const handleCheck = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('done', (!todo.done).toString());

      try {
        await actions.updateTodo(formData);

        // Refetch todos after update
        const updatedTodos = await actions.getTodos();
        setTodos(updatedTodos);
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  // Delete Todo handler
  const handleDelete = async (id: string) => {
    const formData = new FormData();
    formData.append('id', id);
    await actions.deleteTodo(formData);

    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  const [active, setActive] = useState(false);
  const [all, setAll] = useState(true);
  const [completed, setCompleted] = useState(false);

  let itemsLeft = todos.filter((todo) => !todo.done).length;

  const handleClearAll = async () => {
    const completedIds = todos
      .filter((todo) => todo.done)
      .map((todo) => todo.id);

    // Delete todos from the backend
    for (const id of completedIds) {
      const formData = new FormData();
      formData.append('id', id);
      await actions.deleteTodo(formData);
    }

    // Remove deleted todos from the local state
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.done));
  };

  const handleActivated = () => {
    setAll(false);
    setActive(true);
    setCompleted(false);
  };

  const handleAll = () => {
    setAll(true);
    setActive(false);
    setCompleted(false);
  };

  const handleCompleted = () => {
    setAll(false);
    setActive(false);
    setCompleted(true);
  };

  return (
    <main className="relative -top-128I md:-top-192I flex flex-col justify-center items-center gap-10 text-center w-full max-w-container-1000 p-16P mx-auto md:w-[70dvw] md:p-48P">
      {/* HEADER LIST */}
      <section className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold uppercase tracking-1.2 lg:text-3xl lg:tracking-1.5">
          Todo
        </h1>
        {/* Adding click events and state for themes */}
        <Image src={sun} alt="go to light theme" />
      </section>

      {/* INPUT */}
      {/* Enter button functionality, hint to enter and add (Press Enter) in the input placeholder, or button to create it(for mobile users) */}
      <form onSubmit={handleCreateTodo} className="w-full shadow-lg">
        <label
          className="flex justify-start items-center gap-4 p-8P px-32P bg-very-dark-desaturated-blue rounded-10BR"
          htmlFor="addTodo"
        >
          <button
            type="button"
            className="min-w-[2rem] min-h-[2rem] border border-light-grayish-blue-dark rounded-full"
          ></button>
          <input
            type="text"
            id="addTodo"
            name="input"
            placeholder="Create a new todo... (Press Enter)"
            className="text-lg text-light-grayish-blue-dark w-full py-16P bg-very-dark-desaturated-blue rounded-10BR outline-none ring-0 caret-blue-500"
          />
        </label>
      </form>

      {/* Todo List Main */}
      <ul className="text-lg text-light-grayish-blue-dark text-start w-full bg-very-dark-desaturated-blue rounded-10BR space-y-2 shadow-lg">
        {todos.map((todo) =>
          all ? (
            <div
              key={todo.id}
              className="flex justify-between items-center gap-6 border-b-white border-b-2 p-8P px-32P"
            >
              <div className="flex justify-center items-center gap-4">
                <form action={actions.updateTodo}>
                  <input type="hidden" name="done" />
                  <button
                    type="button"
                    className={`min-w-[2rem] min-h-[2rem] border border-white rounded-full
                      ${todo.done && 'bg-check-background'}
                      `}
                    onClick={() => handleCheck(todo.id)}
                  >
                    <Image
                      src={checked}
                      className={`w-1/2 mx-auto
                      ${!todo.done && 'hidden'}
                      `}
                      alt="check todo"
                    />
                  </button>
                </form>
                <li
                  className={`py-16P ${
                    todo.done
                      ? 'line-through text-very-dark-grayish-blue-light'
                      : ''
                  }`}
                >
                  {todo.input}
                </li>
              </div>

              <button type="submit" onClick={() => handleDelete(todo.id)}>
                <Image
                  id="delete"
                  src={cross}
                  className="cursor-pointer"
                  alt="delete"
                />
              </button>
            </div>
          ) : active && !todo.done ? (
            <div
              key={todo.id}
              className="flex justify-between items-center gap-6 border-b-white border-b-2 p-8P px-32P"
            >
              <div className="flex justify-center items-center gap-4">
                <form action={actions.updateTodo}>
                  <input type="hidden" name="done" />
                  <button
                    type="button"
                    className={`min-w-[2rem] min-h-[2rem] border border-white rounded-full
                      ${todo.done && 'bg-check-background'}
                      `}
                    onClick={() => handleCheck(todo.id)}
                  >
                    <Image
                      src={checked}
                      className={`w-1/2 mx-auto
                      ${!todo.done && 'hidden'}
                      `}
                      alt="check todo"
                    />
                  </button>
                </form>
                <li
                  className={`py-16P ${
                    todo.done
                      ? 'line-through text-very-dark-grayish-blue-light'
                      : ''
                  }`}
                >
                  {todo.input}
                </li>
              </div>

              <button type="submit" onClick={() => handleDelete(todo.id)}>
                <Image
                  id="delete"
                  src={cross}
                  className="cursor-pointer"
                  alt="delete"
                />
              </button>
            </div>
          ) : (
            completed &&
            todo.done && (
              <div
                key={todo.id}
                className="flex justify-between items-center gap-6 border-b-white border-b-2 p-8P px-32P"
              >
                <div className="flex justify-center items-center gap-4">
                  <form action={actions.updateTodo}>
                    <input type="hidden" name="done" />
                    <button
                      type="button"
                      className={`min-w-[2rem] min-h-[2rem] border border-white rounded-full
                      ${todo.done && 'bg-check-background'}
                      `}
                      onClick={() => handleCheck(todo.id)}
                    >
                      <Image
                        src={checked}
                        className={`w-1/2 mx-auto
                      ${!todo.done && 'hidden'}
                      `}
                        alt="check todo"
                      />
                    </button>
                  </form>
                  <li
                    className={`py-16P ${
                      todo.done
                        ? 'line-through text-very-dark-grayish-blue-light'
                        : ''
                    }`}
                  >
                    {todo.input}
                  </li>
                </div>

                <button type="submit" onClick={() => handleDelete(todo.id)}>
                  <Image
                    id="delete"
                    src={cross}
                    className="cursor-pointer"
                    alt="delete"
                  />
                </button>
              </div>
            )
          )
        )}

        {/* Stats */}
        <div className="flex justify-between items-center gap-4 text-md text-dark-grayish-blue-light p-24P">
          <div className="">{itemsLeft} items left</div>
          <button
            type="button"
            className={`hidden cursor-pointer lg:block
                  ${all && 'text-bright-blue'}
                  `}
            onClick={handleAll}
          >
            All
          </button>
          <button
            type="button"
            className={`hidden cursor-pointer lg:block
                  ${active && 'text-bright-blue'}
                  `}
            onClick={handleActivated}
          >
            Active
          </button>
          <button
            type="button"
            className={`hidden cursor-pointer lg:block
                  ${completed && 'text-bright-blue'}
                  `}
            onClick={handleCompleted}
          >
            Completed
          </button>
          <button type="button" className="" onClick={handleClearAll}>
            Clear Completed
          </button>
        </div>
      </ul>

      {/* Mobile More Stats */}

      <div className="flex justify-around items-center gap-4 text-dark-grayish-blue-light text-lg w-full p-24P bg-very-dark-desaturated-blue rounded-10BR shadow-lg xs:gap-10 md:justify-center lg:hidden">
        <button
          type="button"
          className={`cursor-pointer 
                ${all && 'text-bright-blue'}
                `}
          onClick={handleAll}
        >
          All
        </button>
        <button
          type="button"
          className={`cursor-pointer active:text-bright-blue
                ${active && 'text-bright-blue'}
                `}
          onClick={handleActivated}
        >
          Active
        </button>
        <button
          type="button"
          className={`cursor-pointer active:text-bright-blue
                ${completed && 'text-bright-blue'}
                `}
          onClick={handleCompleted}
        >
          Completed
        </button>
      </div>
    </main>
  );
}
