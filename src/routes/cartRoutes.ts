import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { protect } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get logged in user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/', protect, cartController.getMyCart);

/**
 * @swagger
 * /cart/all:
 *   get:
 *     summary: Admin only - Get all carts
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all carts
 *       403:
 *         description: Not authorized
 */
router.get('/all', protect, cartController.getAllCarts);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Create cart for logged user
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *     responses:
 *       201:
 *         description: Cart created
 *       400:
 *         description: Cart already exists
 */
router.post('/', protect, cartController.createCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 65f12abcde123
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart
 *       400:
 *         description: Product ID required
 */
router.post('/add', protect, cartController.addToCart);

/**
 * @swagger
 * /cart/{id}:
 *   patch:
 *     summary: Update cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cart updated
 *       403:
 *         description: Not owner
 *       404:
 *         description: Cart not found
 */
router.patch('/:id', protect, cartController.updateCart);

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Delete / clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Cart deleted
 *       403:
 *         description: Not owner
 *       404:
 *         description: Cart not found
 */
router.delete('/:id', protect, cartController.deleteCart);

export default router;
