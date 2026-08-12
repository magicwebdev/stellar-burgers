import {
  constructorReducer,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../constructorSlice';
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

const testSauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png'
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
  bun: null,
  ingredients: []
};

describe('редьюсер конструктора бургера (constructorSlice)', () => {
  test('должен вернуть начальное состояние для неизвестного экшена', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(
      initialState
    );
  });

  test('addIngredient с булкой должен положить её в поле bun', () => {
    const state = constructorReducer(initialState, addIngredient(testBun));

    expect(state.bun).toEqual({ ...testBun, id: expect.any(String) });
    expect(state.ingredients).toHaveLength(0);
  });

  test('addIngredient с начинкой должен добавить её в конец списка ingredients', () => {
    const state = constructorReducer(initialState, addIngredient(testSauce));

    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([
      { ...testSauce, id: expect.any(String) }
    ]);
  });

  test('removeIngredient должен убрать ингредиент с указанным id', () => {
    const sauceAction = addIngredient(testSauce);
    const mainAction = addIngredient(testMain);

    let state = constructorReducer(initialState, sauceAction);
    state = constructorReducer(state, mainAction);

    const idToRemove = sauceAction.payload.id;
    state = constructorReducer(state, removeIngredient(idToRemove));

    expect(state.ingredients).toEqual([
      { ...testMain, id: mainAction.payload.id }
    ]);
  });

  test('moveIngredient должен менять местами два соседних ингредиента', () => {
    const sauceAction = addIngredient(testSauce);
    const mainAction = addIngredient(testMain);

    let state = constructorReducer(initialState, sauceAction);
    state = constructorReducer(state, mainAction);

    state = constructorReducer(
      state,
      moveIngredient({ index: 1, direction: 'up' })
    );

    expect(state.ingredients).toEqual([
      { ...testMain, id: mainAction.payload.id },
      { ...testSauce, id: sauceAction.payload.id }
    ]);
  });

  test('moveIngredient не должен менять порядок, если направление выходит за границы списка', () => {
    const sauceAction = addIngredient(testSauce);
    const state = constructorReducer(initialState, sauceAction);

    const stateAfterMove = constructorReducer(
      state,
      moveIngredient({ index: 0, direction: 'up' })
    );

    expect(stateAfterMove).toEqual(state);
  });

  test('clearConstructor должен очищать булку и список ингредиентов', () => {
    let state = constructorReducer(initialState, addIngredient(testBun));
    state = constructorReducer(state, addIngredient(testSauce));

    state = constructorReducer(state, clearConstructor());

    expect(state).toEqual(initialState);
  });
});
