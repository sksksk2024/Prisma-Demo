'use server';

import { db } from '@/utils/db';

export async function getTodos() {
  try {
    const todos = await db.todo.findMany();
    return todos;
  } catch (error) {
    throw new Error(`Failed to fetch todos: ${error}`);
  }
}

export async function getTodoById(id: string) {
  try {
    const todo = await db.todo.findUnique({
      where: { id },
    });
    if (!todo) {
      throw new Error('Todo not found');
    }
    return todo;
  } catch (error) {
    throw new Error(`Failed to fetch todo: ${error}`);
  }
}

export async function createTodo(formData: FormData) {
  try {
    const input = formData.get('input') as string;
    if (!input) {
      throw new Error('Input is required');
    }

    await db.todo.create({
      data: { input, done: false } as { input: string; done: boolean },
    });
  } catch (error) {
    throw new Error(`Failed to create todo: ${error}`);
  }
}

export async function deleteTodo(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      throw new Error('ID is required');
    }

    await db.todo.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error(`Failed to delete todo: ${error}`);
  }
}

export async function deleteMultipleTodos(ids: string[]) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('No IDs provided');
    }

    await db.todo.deleteMany({
      where: { id: { in: ids } },
    });
  } catch (error) {
    throw new Error(`Failed to delete multiple todos: ${error}`);
  }
}

export async function updateTodo(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const done = formData.get('done') === 'true';

    if (!id) {
      throw new Error('ID is required');
    }

    await db.todo.update({
      where: { id },
      data: { done } as { done: boolean },
    });
  } catch (error) {
    throw new Error(`Failed to update todo: ${error}`);
  }
}
