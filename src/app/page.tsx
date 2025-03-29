import { db } from '@/utils/db';
import * as actions from '@/actions/index';
import React from 'react';
import SaveButton from '@/components/SaveButton';

const Home = async () => {
  // 2. Get The Todo
  const data = await db.todo.findMany({
    select: {
      input: true,
      id: true,
    },

    // orderBy: {
    //   id: 'desc',
    // },
  });

  return (
    <div>
      <div>
        <form action={actions.createTodo}>
          <input type="text" name="input" placeholder="Add a new todo..." />
          <button type="submit">Add Todo</button>
        </form>

        <div>
          {data.map((todo) => (
            <form key={todo.id} action={actions.editTodo}>
              <input type="hidden" name="inputId" value={todo.id} />

              <input type="text" name="input" defaultValue={todo.input} />

              <div>
                <SaveButton />
                <button formAction={actions.deleteTodo}>Delete</button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
