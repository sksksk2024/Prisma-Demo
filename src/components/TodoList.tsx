// components/TodoList.jsx (Client Component)
'use client';

import Image from 'next/image';
import sun from './../images/icon-sun.svg';
import moon from './../images/icon-moon.svg';
import checked from './../images/icon-check.svg';
import cross from './../images/icon-cross.svg';
import * as actions from '@/actions';
import { useEffect, useState } from 'react';
import { todoSchema } from '@/schemas/todoSchema';
import { z } from 'zod';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [initialized, setInitialized] = useState(false); // Track if data has been fetched

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const todosFromBackend = await actions.getTodos(); // Fetch todos from backend
        setTodos(todosFromBackend);
      } catch (error) {
        console.error('Error fetching todos:', error);
        setError('Failed to fetch todos.');
      } finally {
        setInitialized(true); // Mark as initialized
      }
    };

    // Only fetch if it's not initialized already
    if (!initialized) {
      fetchTodos();
    }

    // Set up the interval for auto-reloading every 2 seconds
    const interval = setInterval(() => {
      fetchTodos();
    }, 2000); // Fetch every 2 seconds

    // Clear the interval when the component unmounts or if the data is initialized
    return () => clearInterval(interval);
  }, [initialized]); // Dependencies to ensure fetching is triggered initially

  // Create Todo handler with optimistic update
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('input') as HTMLInputElement;

    // Validate the input using Zod
    try {
      todoSchema.parse({ input: input.value }); // This will throw an error if validation fails

      // Clear any existing error message
      setError(null);

      const newTodo: Todo = {
        id: Date.now().toString(),
        input: input.value,
        done: false,
        createdAt: new Date(),
      };

      // Optimistically update the state by adding the new todo
      setTodos((prevTodos) => [...prevTodos, newTodo]);

      // Proceed with adding the todo after successful validation
      const formData = new FormData();
      formData.append('input', newTodo.input);
      await actions.createTodo(formData); // Send the request to backend

      input.value = '';
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set the validation error message
        setError(error.errors[0].message); // Use the first error message
      }
    }
  };

  // Check Todo handler
  const handleCheck = async (id: string) => {
    // Find the todo that was clicked
    const todoIndex = todos.findIndex((t) => t.id === id);
    if (todoIndex === -1) return;

    const updatedTodo = { ...todos[todoIndex], done: !todos[todoIndex].done };

    // Optimistic update - update state immediately
    setTodos((prevTodos) => {
      const updatedTodos = [...prevTodos];
      updatedTodos[todoIndex] = updatedTodo;
      return updatedTodos;
    });

    const formData = new FormData();
    formData.append('id', id);
    formData.append('done', updatedTodo.done.toString());

    try {
      // Try to update the todo in the backend
      const existingTodo = await actions.getTodoById(id);
      if (!existingTodo) {
        console.error('Todo not found, rolling back optimistic update');
        // If the todo is not found, rollback the update
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
        return;
      }

      // Proceed to update the todo in the backend
      await actions.updateTodo(formData);

      // Successfully updated, stop loading
    } catch (error) {
      console.error('Error updating todo:', error);

      // In case of error, rollback the optimistic update
      setTodos((prevTodos) => {
        const updatedTodos = [...prevTodos];
        updatedTodos[todoIndex] = { ...todos[todoIndex] }; // Rollback to the previous state
        return updatedTodos;
      });

      // Ensure loading is stopped even in case of error
    }
  };

  // Delete Todo handler with optimistic update
  // Delete Todo handler with optimistic update
  const handleDelete = async (id: string) => {
    // Find the todo that was clicked (optimistically remove it from the state)
    const todoToDelete = todos.find((todo) => todo.id === id);

    if (!todoToDelete) return; // If the todo doesn't exist in the state, exit early

    // Optimistically remove the todo from the state
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));

    const formData = new FormData();
    formData.append('id', id);

    try {
      // Send the delete request to the backend
      await actions.deleteTodo(formData);
    } catch (error) {
      console.error('Error deleting todo:', error);

      // If deletion fails, rollback the optimistic update by adding the todo back
      setTodos((prevTodos) => [...prevTodos, todoToDelete]);

      // Optionally, you could add some user-facing error state here to show an error message.
      setError('Failed to delete todo.');
    }
  };

  const [active, setActive] = useState(false);
  const [all, setAll] = useState(true);
  const [completed, setCompleted] = useState(false);

  let itemsLeft = todos.filter((todo) => !todo.done).length;

  const handleClearAll = async () => {
    const completedIds = todos
      .filter((todo) => todo.done)
      .map((todo) => todo.id);
    await actions.deleteMultipleTodos(completedIds); // Batch delete todos
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
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <>
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

              <button type="submit" className="cursor-pointer lg:hidden">
                Create
              </button>
            </label>
            {error && (
              <div className="uppercase tracking-widest absolute md:left-48I text-start text-red-500 text-sm">
                {error}
              </div>
            )}{' '}
          </form>
          {/* Render error message */}
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
                        className={`cursor-pointer min-w-[2rem] min-h-[2rem] border border-white rounded-full
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

                  <button
                    type="submit"
                    className="cursor-pointer"
                    onClick={() => handleDelete(todo.id)}
                  >
                    <Image id="delete" src={cross} alt="delete" />
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
                        className={`cursor-pointer min-w-[2rem] min-h-[2rem] border border-white rounded-full
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

                  <button
                    type="submit"
                    className="cursor-pointer"
                    onClick={() => handleDelete(todo.id)}
                  >
                    <Image id="delete" src={cross} alt="delete" />
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
                          className={`cursor-pointer min-w-[2rem] min-h-[2rem] border border-white rounded-full
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

                    <button
                      type="submit"
                      className="cursor-pointer"
                      onClick={() => handleDelete(todo.id)}
                    >
                      <Image id="delete" src={cross} alt="delete" />
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
              <button
                type="button"
                className="cursor-pointer"
                onClick={handleClearAll}
              >
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
        </>
      )}
    </main>
  );
}
