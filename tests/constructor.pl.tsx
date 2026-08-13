import { test, expect, Page } from '@playwright/test';

const INGREDIENTS_HAR = './tests/hars/ingredients.har';
const USER_HAR = './tests/hars/user.har';
const ORDERS_HAR = './tests/hars/orders.har';
const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const SAUCE_NAME = 'Соус Spicy-X';
const ORDER_NUMBER = 109087;

const mockIngredients = (page: Page) =>
  page.routeFromHAR(INGREDIENTS_HAR, {
    url: '**/api/ingredients',
    update: false
  });

const ingredientRow = (page: Page, name: string) =>
  page.locator('li', { hasText: name });

const constructorSection = (page: Page) =>
  page
    .locator('section')
    .filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) });

const mockAuth = (page: Page) =>
  page.routeFromHAR(USER_HAR, {
    url: '**/api/auth/user',
    update: false
  });

const mockOrders = (page: Page) =>
  page.routeFromHAR(ORDERS_HAR, {
    url: '**/api/orders',
    update: false
  });

const setAuthTokens = async (page: Page) => {
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: 'super-secret-auth-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
  await page.addInitScript(() => {
    window.localStorage.setItem('refreshToken', 'super-secret-auth-token');
  });
};

const buildBurger = async (page: Page) => {
  await ingredientRow(page, BUN_NAME)
    .getByRole('button', { name: 'Добавить' })
    .click();
  await ingredientRow(page, SAUCE_NAME)
    .getByRole('button', { name: 'Добавить' })
    .click();
};

const placeOrder = async (page: Page) => {
  await buildBurger(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
};

test.describe('Список ингредиентов конструктора', () => {
  test('запрос api/ingredients подменяется моком из HAR-файла', async ({
    page
  }) => {
    await mockIngredients(page);

    await page.goto('/');

    await expect(page.getByTestId('ingredients')).toBeVisible();
    await expect(page.getByText(BUN_NAME)).toBeVisible();
    await expect(page.getByText(MAIN_NAME)).toBeVisible();
    await expect(page.getByText(SAUCE_NAME)).toBeVisible();
  });
});

test.describe('Добавление ингредиента в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredients(page);
    await page.goto('/');
    await expect(page.getByTestId('ingredients')).toBeVisible();
  });

  test('добавляет булку по клику на кнопку "Добавить"', async ({ page }) => {
    const constructor = constructorSection(page);
    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();

    await ingredientRow(page, BUN_NAME)
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(constructor.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
    await expect(constructor.getByText('Выберите булки')).not.toBeVisible();
  });

  test('добавляет начинку по клику на кнопку "Добавить"', async ({ page }) => {
    const constructor = constructorSection(page);
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await ingredientRow(page, MAIN_NAME)
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(constructor.getByText('Выберите начинку')).not.toBeVisible();
    await expect(
      constructor.getByText(MAIN_NAME, { exact: true })
    ).toBeVisible();
  });

  test('добавляет булку и начинку одновременно', async ({ page }) => {
    const constructor = constructorSection(page);

    await ingredientRow(page, BUN_NAME)
      .getByRole('button', { name: 'Добавить' })
      .click();
    await ingredientRow(page, SAUCE_NAME)
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(constructor.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).not.toBeVisible();
    await expect(
      constructor.getByText(SAUCE_NAME, { exact: true })
    ).toBeVisible();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredients(page);
    await page.goto('/');
    await expect(page.getByTestId('ingredients')).toBeVisible();
  });

  test('открывается по клику на ингредиент из списка', async ({ page }) => {
    await ingredientRow(page, SAUCE_NAME).getByText(SAUCE_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(SAUCE_NAME, { exact: true })).toBeVisible();
  });

  test('показывает данные именно того ингредиента, по которому кликнули', async ({
    page
  }) => {
    const modal = page.locator('#modals');

    await ingredientRow(page, BUN_NAME).getByText(BUN_NAME).click();
    await expect(modal.getByText(BUN_NAME, { exact: true })).toBeVisible();
    await expect(modal.getByText(SAUCE_NAME)).not.toBeVisible();

    await modal.getByRole('button').click();
    await expect(modal.getByText('Детали ингредиента')).not.toBeVisible();

    await ingredientRow(page, SAUCE_NAME).getByText(SAUCE_NAME).click();
    await expect(modal.getByText(SAUCE_NAME, { exact: true })).toBeVisible();
    await expect(modal.getByText(BUN_NAME)).not.toBeVisible();
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    await ingredientRow(page, SAUCE_NAME).getByText(SAUCE_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();

    await modal.getByRole('button').click();

    await expect(modal.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await ingredientRow(page, SAUCE_NAME).getByText(SAUCE_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();

    await page.mouse.click(5, 5);

    await expect(modal.getByText('Детали ингредиента')).not.toBeVisible();
  });
});

test.describe('Создание заказа', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthTokens(page);
    await mockIngredients(page);
    await mockAuth(page);
    await mockOrders(page);

    await page.goto('/');
    await expect(page.getByTestId('ingredients')).toBeVisible();
  });

  test('собирает бургер и оформляет заказ по клику на кнопку "Оформить заказ"', async ({
    page
  }) => {
    const constructor = constructorSection(page);

    await buildBurger(page);

    await expect(constructor.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
    await expect(
      constructor.getByText(SAUCE_NAME, { exact: true })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(
      page.locator('#modals').getByText('идентификатор заказа')
    ).toBeVisible();
  });

  test('открывает модальное окно заказа с верным номером', async ({ page }) => {
    await placeOrder(page);

    const modal = page.locator('#modals');
    await expect(
      modal.getByText(String(ORDER_NUMBER), { exact: true })
    ).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();
  });

  test('очищает конструктор после успешного оформления заказа', async ({
    page
  }) => {
    const constructor = constructorSection(page);

    await placeOrder(page);

    const modal = page.locator('#modals');
    await expect(
      modal.getByText(String(ORDER_NUMBER), { exact: true })
    ).toBeVisible();

    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
  });

  test('закрывает модальное окно заказа по клику на крестик', async ({
    page
  }) => {
    await placeOrder(page);

    const modal = page.locator('#modals');
    await expect(
      modal.getByText(String(ORDER_NUMBER), { exact: true })
    ).toBeVisible();

    await modal.getByRole('button').click();

    await expect(
      modal.getByText(String(ORDER_NUMBER), { exact: true })
    ).not.toBeVisible();
  });
});
