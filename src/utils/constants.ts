export const DOCUMENTATION = {
  TITLE: 'BookNow API Documentation',
  DESCRIPTION: 'BookNow API description',
  VERSION: '1.0',
  PREFIX: 'api/v1',
  TAGS: {
    AUTH: 'AUTH',
    USERS: 'USERS',
    BOOKS: 'BOOKS',
    AUTHORS: 'AUTHORS',
    CATEGORIES: 'CATEGORIES',
    CARTS: 'CART',
    CART_ITEMS: 'CART_ITEMS',
    COMMENT: 'COMMENT',
  },
};

export const END_POINTS = {
  BASE: 'api/v1',
  AUTH: {
    BASE: '/auth',
    SIGN_IN: {
      BASE_SIGN_IN: '/sign-in',
      EMAIL: '/email',
      PHONE: '/phone',
    },
    SIGN_UP: {
      BASE_SIGN_UP: '/sign-up',
      EMAIL: '/email',
      PHONE: '/phone',
    },
    SIGN_OUT: '/sign-out',
    REFRESH: '/refresh-token',
    GET_ME: '/get-me',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
  },
  USERS: {
    BASE: '/users',
    GET_ALL: '/get-all',
    CREATE: '/create',
    UPDATE: '/update',
    DISABLE: '/:id/disable',
    ENABLE: '/:id/enable',
    GET_ONE: '/:id',
  },
  BOOKS: {
    BASE: '/books',
    GET_ALL: '/get-all',
    CREATE: '/create',
    UPDATE: '/update/:id',
    GET_ONE: '/get-one/:id',
    SEARCH: '/search',
    FILTER: '/filter',
    SORT: '/sort',
    ENABLE: '/enable/:id',
    DISABLE: '/disable/:id',
    COMMENT: '/:id/comment',
    SEARCH_BY_PRICE: '/search/price',
    SEARCH_BY_RATING: '/search/rating',
  },
  AUTHORS: {
    BASE: '/authors',
    GET_ALL: '/get-all',
    CREATE: '/create',
    UPDATE: '/update',
    GET_ONE: '/:id',
  },
  CATEGORIES: {
    BASE: '/categories',
    GET_ALL: '/get-all',
    CREATE: '/create',
    UPDATE: '/update/:id',
    DISABLE: '/disable/:id',
    GET_ONE: '/get-one/:id',
    ENABLE: '/enable/:id',
    SEARCH: '/search',
  },
  CARTS: {
    BASE: '/carts',
    GET_ALL: '/get-all',
    CREATE: '/create',
    UPDATE_CART: '/update',
    GET_ONE: '/:id',
    ADD_TO_CART: '/add-to-cart',
    REMOVE_FROM_CART: '/remove-from-cart',
    CHECKOUT_CART: '/checkout',
  },
  CART_ITEM: {
    BASE: '/cart-items',
    GET_ALL: '/get-all',
    GET_DETAILS: '/get-details',
    CREATE: '/create',
    UPDATE: '/update',
    GET_ONE: '/:id',
  },
  ORDER: {
    BASE: '/orders',
    GET_FULL_LIST: '/list',
    GET_ALL: '/get-all',
    CREATE: '/create',
    UPDATE_STATUS: '/status/update',
    GET_ONE: '/:id',
    GET_DETAILS: '/get-details',
    CANCEL_ORDER: '/:id/cancel-order',
    ORDER_HISTORY: '/history',
    ORDER_STATE: '/:id/state',
  },
  ORDER_DETAILS: {
    BASE: '/order-details',
    GET_ALL: '/get-all',
    CREATE: '/create',
    UPDATE: '/update',
    GET_ONE: '/:id',
  },
  DASHBOARD: {
    BASE: '/dashboard',
    GET_BOOK_REPORT: '/get-book-report',
    GET_ORDER_REPORT: '/get-order-report',
    GET_ORDER_SHPPING_RATE: '/get-order-rate',
  },
  REVIEW: {
    BASE: '/reviews',
    GET_ALL: '/get-all',
    GET_ONE: '/:id',
    REPLY: '/:id/reply',
  },
};

export enum ROLE {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}
export enum BOOKSTATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ORDER {
  ASC = 'asc',
  DESC = 'desc',
}
export const FILE_TYPES_REGEX = /(jpg|jpeg|png)$/i;
export enum EUploadFolder {
  book = 'book',
  author = 'author',
  user = 'user',
  storage = 'storage',
}
export enum DateFormat {
  DATE = 'DD-MM-YYYY',
  DATE_TIME = 'DD-MM-YYYY HH:mm:ss',
  TIME_DATE = 'HH:mm:ss DD-MM-YYYY',
}

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  SUCCESS: 'SUCCESS',
};

export const CURRENCY = 'VND';

export const JWT_ACCESS_STRATEGY = 'jwt-access-strategy';
export const JWT_REFRESH_STRATEGY = 'jwt-refresh-strategy';
