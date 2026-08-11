import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { TOrder } from '@utils-types';
import { orderBurgerApi, getOrdersApi, getOrderByNumberApi } from '@api';

type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
  userOrders: TOrder[];
  userOrdersIsLoading: boolean;
  userOrdersError: string | null;
  orderDetails: TOrder | null;
  orderDetailsIsLoading: boolean;
};

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  error: null,
  userOrders: [],
  userOrdersIsLoading: false,
  userOrdersError: null,
  orderDetails: null,
  orderDetailsIsLoading: false
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredientIds: string[]) => orderBurgerApi(ingredientIds)
);

export const getUserOrders = createAsyncThunk('order/getUserOrders', async () =>
  getOrdersApi()
);

export const getOrderByNumber = createAsyncThunk(
  'order/getOrderByNumber',
  async (number: number) => getOrderByNumberApi(number)
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderModalData: (state) => {
      state.orderModalData = null;
      state.error = null;
    }
  },
  selectors: {
    selectOrderRequest: (state) => state.orderRequest,
    selectOrderModalData: (state) => state.orderModalData,
    selectOrderError: (state) => state.error,
    selectUserOrders: (state) => state.userOrders,
    selectUserOrdersIsLoading: (state) => state.userOrdersIsLoading,
    selectOrderDetails: (state) => state.orderDetails,
    selectOrderDetailsIsLoading: (state) => state.orderDetailsIsLoading
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message || 'Что-то пошло не так...';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = {
          ...action.payload.order,
          ingredients: action.meta.arg
        };
      })
      .addCase(getUserOrders.pending, (state) => {
        state.userOrdersIsLoading = true;
        state.userOrdersError = null;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.userOrdersIsLoading = false;
        state.userOrdersError =
          action.error.message || 'Что-то пошло не так...';
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.userOrdersIsLoading = false;
        state.userOrders = action.payload;
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.orderDetailsIsLoading = true;
      })
      .addCase(getOrderByNumber.rejected, (state) => {
        state.orderDetailsIsLoading = false;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.orderDetailsIsLoading = false;
        state.orderDetails = action.payload.orders[0] || null;
      });
  }
});

export const orderReducer = orderSlice.reducer;

export const { clearOrderModalData } = orderSlice.actions;

export const {
  selectOrderRequest,
  selectOrderModalData,
  selectOrderError,
  selectUserOrders,
  selectUserOrdersIsLoading,
  selectOrderDetails,
  selectOrderDetailsIsLoading
} = orderSlice.selectors;
