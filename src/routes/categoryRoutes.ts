import { Router } from "express";
import * as catCtrl from "../controllers/categoryController";
import { protect, restrictTo } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", catCtrl.getAllCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create new category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  catCtrl.createCategory,
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get("/:id", catCtrl.getCategoryById);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update category by ID (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  catCtrl.updateCategoryById,
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category by ID (admin only)
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete("/:id", protect, restrictTo("admin"), catCtrl.deleteCategoryById);

export default router;
