import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.js';
import userRoutes from './routes/userRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
