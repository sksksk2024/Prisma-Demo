'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';

const SaveButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="font-bold text-black" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
};

export default SaveButton;
