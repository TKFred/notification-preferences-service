import express from 'express';
import pinoHttp from 'pino-http';
import { DataSource } from 'typeorm';
import { EvaluationService } from './application/services/evaluationService';
import { PreferencesService } from './application/services/preferencesService';
import { errorHandler } from './http/middlewares/errorHandler';
import { createEvaluationRouter } from './http/routes/evaluation.routes';
import { createPreferencesRouter } from './http/routes/preferences.routes';
import { PoliciesRepository } from './typeorm/repositories/policiesRepository';
import { PreferencesRepository } from './typeorm/repositories/preferencesRepository';

type CreateAppOptions = {
  dataSource: DataSource;
};

export function createApp(options: CreateAppOptions) {
  const app = express();

  const preferencesRepository = new PreferencesRepository(options.dataSource);
  const policiesRepository = new PoliciesRepository(options.dataSource);

  const preferencesService = new PreferencesService(preferencesRepository);
  const evaluationService = new EvaluationService(
    preferencesRepository,
    policiesRepository,
  );

  app.use(express.json());
  app.use(pinoHttp());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(createPreferencesRouter(preferencesService));
  app.use(createEvaluationRouter(evaluationService));

  app.use(errorHandler);

  return app;
}