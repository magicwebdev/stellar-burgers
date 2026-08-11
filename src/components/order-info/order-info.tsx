import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import {
  selectAllIngredients,
  selectFeedOrders,
  selectUserOrders,
  selectOrderDetails,
  getOrderByNumber
} from '@slices';

export const OrderInfo: FC = () => {
  const { number } = useParams();
  const orderNumber = Number(number);
  const dispatch = useDispatch();

  const feedOrders = useSelector(selectFeedOrders);
  const userOrders = useSelector(selectUserOrders);
  const orderDetails = useSelector(selectOrderDetails);
  const ingredients = useSelector(selectAllIngredients);

  const orderData = useMemo(
    () =>
      [...feedOrders, ...userOrders].find(
        (order) => order.number === orderNumber
      ) || (orderDetails?.number === orderNumber ? orderDetails : null),
    [feedOrders, userOrders, orderDetails, orderNumber]
  );

  useEffect(() => {
    if (!orderData) {
      dispatch(getOrderByNumber(orderNumber));
    }
  }, [dispatch, orderNumber, orderData]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
