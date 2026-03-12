import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index';
import authRouter from './routes/auth';
import recipesRouter from './routes/recipes';
import ingredientsRouter from './routes/ingredients';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN,
		credentials: true,
	}),
);

app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/ingredients', ingredientsRouter);

app.use((req: Request, res: Response) => {
	res.status(404).json({ error: 'Not found' });
});

interface CustomError extends Error {
	status?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
	res.status(err.status || 500).json({
		error: err.message || 'Internal server error',
	});
});

export default app;
