'use server';

import { db } from '@/utils/db';

export async function getTodos() {
  const todos = await db.todo.findMany(); // Fetch all todos from the database
  return todos;
}

export async function createTodo(formData: FormData) {
  const input = formData.get('input') as string;
  await db.todo.create({
    data: { input, done: false } as { input: string; done: boolean },
  });
}

export async function deleteTodo(formData: FormData) {
  const id = formData.get('id') as string; // Use "id" instead of "inputId"
  await db.todo.delete({
    where: { id },
  });
}

export async function updateTodo(formData: FormData) {
  const id = formData.get('id') as string;
  const done = formData.get('done') === 'true'; // Ensure it's a boolean

  // Explicitly define the data object to match the TodoUpdateInput type
  await db.todo.update({
    where: { id },
    data: { done } as { done: boolean }, // Type assertion to ensure 'done' is valid
  });
}
