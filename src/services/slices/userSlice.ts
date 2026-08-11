import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { TUser } from '@utils-types';
import {
  registerUserApi,
  loginUserApi,
  logoutApi,
  getUserApi,
  updateUserApi,
  TRegisterData,
  TLoginData
} from '@api';
import { setCookie, deleteCookie, getCookie } from '../../utils/cookie';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  loginUserError: string | null;
  registerUserError: string | null;
  updateUserError: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isAuthenticated: false,
  loginUserError: null,
  registerUserError: null,
  updateUserError: null
};

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (data: TRegisterData) => registerUserApi(data)
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (data: TLoginData) => loginUserApi(data)
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () =>
  logoutApi()
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>) => updateUserApi(data)
);

export const checkUserAuth = createAsyncThunk(
  'user/checkUserAuth',
  async (_, { dispatch }) => {
    if (getCookie('accessToken')) {
      try {
        const res = await getUserApi();
        dispatch(setUser(res.user));
      } catch {
        deleteCookie('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    dispatch(setAuthChecked());
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<TUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setAuthChecked: (state) => {
      state.isAuthChecked = true;
    }
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectLoginUserError: (state) => state.loginUserError,
    selectRegisterUserError: (state) => state.registerUserError,
    selectUpdateUserError: (state) => state.updateUserError
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerUserError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerUserError =
          action.error.message || 'Не удалось зарегистрироваться';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        setCookie('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.loginUserError = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserError = action.error.message || 'Не удалось войти';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        setCookie('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        deleteCookie('accessToken');
        localStorage.removeItem('refreshToken');
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateUserError = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserError =
          action.error.message || 'Не удалось обновить данные';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  }
});

export const userReducer = userSlice.reducer;

export const { setUser, setAuthChecked } = userSlice.actions;

export const {
  selectUser,
  selectIsAuthChecked,
  selectIsAuthenticated,
  selectLoginUserError,
  selectRegisterUserError,
  selectUpdateUserError
} = userSlice.selectors;
