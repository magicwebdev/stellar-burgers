import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `${styles.link} ${isActive ? styles.link_active : ''}`;

const getIconType = (isActive: boolean): 'primary' | 'secondary' =>
  isActive ? 'primary' : 'secondary';

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => (
  <header className={styles.header}>
    <nav className={`${styles.menu} p-4`}>
      <div className={styles.menu_part_left}>
        <NavLink to='/' className={getLinkClassName} end>
          {({ isActive }) => (
            <>
              <BurgerIcon type={getIconType(isActive)} />
              <p className='text text_type_main-default ml-2 mr-10'>
                Конструктор
              </p>
            </>
          )}
        </NavLink>
        <NavLink to='/feed' className={getLinkClassName}>
          {({ isActive }) => (
            <>
              <ListIcon type={getIconType(isActive)} />
              <p className='text text_type_main-default ml-2'>Лента заказов</p>
            </>
          )}
        </NavLink>
      </div>
      <div className={styles.logo}>
        <Logo className='' />
      </div>
      <div className={styles.link_position_last}>
        <NavLink to='/profile' className={getLinkClassName}>
          {({ isActive }) => (
            <>
              <ProfileIcon type={getIconType(isActive)} />
              <p className='text text_type_main-default ml-2'>
                {userName || 'Личный кабинет'}
              </p>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  </header>
);
