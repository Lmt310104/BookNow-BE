export const DOCUMENTATION = {
  TITLE: 'BookNow API Documentation',
  DESCRIPTION: 'BookNow API description',
  VERSION: '1.0',
  PREFIX: 'api/v1',
  TAGS: {
    AUTH: 'AUTH',
    USERS: 'USERS',
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
    GET_ALL: '',
    CREATE: '',
    DISABLE: '',
  },
};

export enum ROLE {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export const JWT_ACCESS_STRATEGY = 'jwt-access-strategy'
export const JWT_REFRESH_STRATEGY = 'jwt-refresh-strategy'

