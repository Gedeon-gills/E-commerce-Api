"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController = __importStar(require("../controllers/cartController"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
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
router.get('/', auth_1.protect, cartController.getMyCart);
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
router.get('/all', auth_1.protect, cartController.getAllCarts);
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
router.post('/', auth_1.protect, cartController.createCart);
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
router.post('/add', auth_1.protect, cartController.addToCart);
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
router.patch('/:id', auth_1.protect, cartController.updateCart);
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
router.delete('/:id', auth_1.protect, cartController.deleteCart);
exports.default = router;
