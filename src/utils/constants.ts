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
    GET_ONE: '/get-one/:id',
    SEARCH: '/search',
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
    ACTIVE: '/active/:id',
    INACTIVE: '/inactive/:id',
    COMMENT: '/:id/comment',
    SEARCH_BY_PRICE: '/search/price',
    SEARCH_BY_RATING: '/search/rating',
    SEARCH_BY_CATEGORY: '/search/:categoryId',
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
    REMOVE_FROM_CART: '/remove-from-cart/:bookId',
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
    UPDATE_STATUS: '/status/update/:id',
    GET_ONE: '/get-details/:id',
    CANCEL_ORDER: '/:id/cancel-order',
    GET_ONE_BY_ADMIN: '/get-details-by-admin/:id',
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
    GET_REVIEW_BY_ORDER_ID: '/get-review-by-order-id/:orderId',
    GET_REVIEW_BY_BOOK_ID: '/get-review-by-book-id/:bookId',
  },
  GOOGLE_OAUTH: {
    BASE: '/auth/google',
    REDIRECT: '/oauth2/redirect/code',
  },
  ADDRESS: {
    BASE: '/address',
    GET_ALL_BY_USER: '/get-all-by-user',
    GET_ALL_BY_ADMIN: '/get-all-by-admin',
    CREATE: '/create',
    UPDATE: '/update/:id',
    DELETE: '/delete/:id',
  },
  STATISTIC: {
    BASE: '/statistic',
    GET_OVERVIEW_STATISTIC: '/get-statistic',
    GET_PRODUCT_STATISTIC_BY_REVENUE: '/get-product-statistic',
    GET_PRODUCT_STATISTIC_BY_ORDER: '/get-product-statistic-order',
    GET_PRODUCT_STATISTIC_BY_ADD_TO_CART: '/get-product-statistic-add-to-cart',
    GET_REVENUE_STATISTIC_BY_CATEGROY: '/get-revenue-statistic-category',
    GET_REVENUE_STATISTIC_BY_CUSTOMER: '/get-revenue-statistic-customer',
    GET_PRODUCT_STATISTIC_BY_SOLD_QUANTITY:
      '/get-product-statistic-sold-quantity',
  },
  MESSAGES: {
    BASE: '/messages',
    GET_LATEST_MESSAGE_BY_CHAT: '/get-latest-by-chat/:chatId',
    GET_CHAT_BY_USER: '/get-chat-by-user/:userId',
    CREATE: '/create/:chatId',
    DELETE: '/delete/:id',
  },
  CHATS: {
    BASE: '/chats',
    GET_ALL_BY_ADMIN: '/get-all-chats',
    GET_ONE: '/get-one/:id',
    CREATE: '/create',
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

export enum ReviewState {
  UNREVIEW = 'UNREVIEW',
  REVIEWED = 'REVIEWED',
  REPLIED = 'REPLIED',
}

export enum ORDER_STATUS_ENUM {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  SUCCESS = 'SUCCESS',
  REJECT = 'REJECT',
}

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  SUCCESS: 'SUCCESS',
  REJECT: 'REJECT',
};

export const CURRENCY = 'VND';

export const JWT_ACCESS_STRATEGY = 'jwt-access-strategy';
export const JWT_REFRESH_STRATEGY = 'jwt-refresh-strategy';
export const GOOGLE_STRATEGY = 'google';

export const USER_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/booknow-22cff.appspot.com/o/book%2F1729848448797-default-user.jpeg?alt=media&token=c10f8393-cf17-4aa8-8b5f-a793a7058456';
