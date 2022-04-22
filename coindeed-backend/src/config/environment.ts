import dotenv from 'dotenv';

dotenv.config();

export const isProd: boolean = process.env.NODE_ENV === 'prod';
export const isDev: boolean = process.env.NODE_ENV === 'dev';
export const isTest: boolean = process.env.NODE_ENV === 'test';
