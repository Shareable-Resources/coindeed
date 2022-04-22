import express from 'express';
import { addAsync, ExpressWithAsync } from '@awaitjs/express';
import { Server } from 'http';
import { isTest } from './config/environment';
import helmet from 'helmet';
import cors from 'cors';
import deedRouter from './routes/deed';
import wholesaleRouter from './routes/wholesale';
import lendingPoolRouter from './routes/lendingPool';
// import prisma from './config/prisma';

export const app: ExpressWithAsync = addAsync(express());
const port: number = Number(process.env.PORT) || 4000;

//health checks
app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('Hello Coindeed Backend!');
});

app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/deeds', deedRouter);
app.use('/wholesales', wholesaleRouter);
app.use('/lending-pool', lendingPoolRouter);

export const start = (): Server => {
  return app.listen(port, () => {
    console.info(`coindeed backend listening on port ${port}`);
  });
};

if (!isTest) {
  try {
    start();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
