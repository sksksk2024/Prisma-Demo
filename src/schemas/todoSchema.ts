// src/schemas/todoSchema.ts
import { z } from 'zod';

// Define the Zod schema for the Todo
export const todoSchema = z.object({
  input: z.string().min(1, { message: "Todo can't be empty!" }), // Ensure input is not empty
  done: z.boolean().optional(), // done is optional
});

// Type inference based on the schema
export type TodoInput = z.infer<typeof todoSchema>;
