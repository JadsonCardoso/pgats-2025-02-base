import express from 'express';
import checkoutController from '../controllers/checkoutController.js';

const router = express.Router();
router.post('/', checkoutController.checkout);

export default router;
