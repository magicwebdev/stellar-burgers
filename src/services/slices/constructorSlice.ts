import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorIngredient } from '../../utils/types';

type TConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: []
};

const cnstructorSlice = createSlice({
  name: 'cnstructorSlice',
  initialState,
  reducers: {
  },
  selectors: {
    
  }
});
