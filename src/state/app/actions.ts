import { createAction } from '@reduxjs/toolkit';

export const setAlmanacView = createAction<boolean>(
  'app/setAlmanacView'
);