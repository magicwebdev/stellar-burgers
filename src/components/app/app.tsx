import { FC, useEffect } from 'react';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import '../../index.css';
import styles from './app.module.css';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import {
  AppHeader,
  ProtectedRoute,
  Modal,
  OrderInfo,
  IngredientDetails
} from '@components';
import { Preloader } from '@ui';
import {
  getIngredients,
  selectAllIngredients,
  selectIngredientsIsLoading,
  selectIngredientsError,
  checkUserAuth
} from '@slices';

const OrderModal: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { number } = useParams();
  const orderTitle = number
    ? `#${number.padStart(6, '0')}`
    : 'Информация о заказе';
  return (
    <Modal title={orderTitle} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const OrderPage: FC = () => {
  const { number } = useParams();
  const orderTitle = number
    ? `#${number.padStart(6, '0')}`
    : 'Информация о заказе';
  return (
    <div className={styles.detailPageWrap}>
      <h2 className={`${styles.detailHeader} text text_type_main-large`}>
        {orderTitle}
      </h2>
      <OrderInfo />
    </div>
  );
};

const ConstructorPageWrapper: FC = () => {
  const isIngredientsLoading = useSelector(selectIngredientsIsLoading);
  const ingredients = useSelector(selectAllIngredients);
  const error = useSelector(selectIngredientsError);

  if (isIngredientsLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div
        className={`text text_type_main-medium pt-4`}
        style={{ color: 'red' }}
      >
        {error}
      </div>
    );
  }

  if (!ingredients.length) {
    return (
      <div className={`text text_type_main-medium pt-4`}>Нет ингредиентов</div>
    );
  }

  return <ConstructorPage />;
};

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const backgroundLocation = location.state?.background;

  useEffect(() => {
    dispatch(getIngredients());
    dispatch(checkUserAuth());
  }, [dispatch]);

  const onModalClose = () => {
    backgroundLocation
      ? navigate(backgroundLocation, { replace: true })
      : navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={backgroundLocation || location}>
        <Route path='/' element={<ConstructorPageWrapper />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/feed/:number' element={<OrderPage />} />
        <Route
          path='/login'
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/ingredients/:id'
          element={
            <div className={styles.detailPageWrap}>
              <h2
                className={`${styles.detailHeader} text text_type_main-large`}
              >
                Детали ингредиента
              </h2>
              <IngredientDetails />
            </div>
          }
        />
        <Route path='*' element={<NotFound404 />} />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route
            path='/feed/:number'
            element={<OrderModal onClose={onModalClose} />}
          />
          <Route
            path='/ingredients/:id'
            element={
              <Modal title='Детали ингредиента' onClose={onModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute>
                <OrderModal onClose={onModalClose} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
