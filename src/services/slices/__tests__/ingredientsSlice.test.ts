import { ingredientsReducer, getIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

const testBun: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
};

const testMain: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
};

const initialState = {
  ingredients: [],
  isLoading: false,
  error: null
};

describe('редьюсер списка ингредиентов (ingredientsSlice)', () => {
  test('должен вернуть начальное состояние для неизвестного экшена', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual(
      initialState
    );
  });

  test('getIngredients.pending должен включать индикатор загрузки и сбрасывать ошибку', () => {
    const stateBeforeRequest = { ...initialState, error: 'старая ошибка' };

    const state = ingredientsReducer(
      stateBeforeRequest,
      getIngredients.pending('test-request-id', undefined)
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: true,
      error: null
    });
  });

  test('getIngredients.fulfilled должен выключать загрузку и записывать список ингредиентов', () => {
    const stateDuringRequest = { ...initialState, isLoading: true };
    const ingredients = [testBun, testMain];

    const state = ingredientsReducer(
      stateDuringRequest,
      getIngredients.fulfilled(ingredients, 'test-request-id', undefined)
    );

    expect(state).toEqual({
      ingredients,
      isLoading: false,
      error: null
    });
  });

  test('getIngredients.rejected должен выключать загрузку и записывать текст ошибки', () => {
    const stateDuringRequest = { ...initialState, isLoading: true };

    const state = ingredientsReducer(
      stateDuringRequest,
      getIngredients.rejected(
        new Error('Не удалось загрузить ингредиенты'),
        'test-request-id',
        undefined
      )
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: 'Не удалось загрузить ингредиенты'
    });
  });
});
