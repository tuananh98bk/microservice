require('dotenv').config();
import 'reflect-metadata';
import 'module-alias/register';
import 'express-async-errors';
import './app/require';
import { RootRoute } from '$helpers/decorator';
import express from 'express';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { createServer } from 'http';
import logRequest from '$middlewares/logRequest';
import log from '$helpers/log';
import { handleError } from '$middlewares/handleError';
import { initServerLanguageData } from '$helpers/language';

const logger = log('Index');
const app = express();
const http = createServer(app);

createConnection()
  .then(async () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());
    app.use(helmet());
    app.use(logRequest);

    app.use(RootRoute);

    app.use(handleError);

    http.listen(process.env.SERVER_PORT, () => {
      console.log(`Express server started on port ${process.env.ENVIRONMENT}`);
    });
    await initServerLanguageData();
  })
  .catch((error) => logger.error(error));
