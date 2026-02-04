"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
// Temporarily remove auth for testing
// router.use(protect);
// router.use(restrictTo('admin'));
router.get('/stats', adminController_1.getDashboardStats);
router.get('/customers', adminController_1.getCustomers);
router.get('/orders', adminController_1.getOrders);
router.get('/products/top', adminController_1.getTopProducts);
router.get('/analytics', (req, res) => {
    res.json({
        status: 'success',
        data: {
            revenue: { current: 12450.50, previous: 10200.30, change: 22.1 },
            orders: { current: 89, previous: 76, change: 17.1 },
            customers: { current: 150, previous: 142, change: 5.6 },
            chartData: [
                { date: '2024-01-08', revenue: 1200, orders: 12 },
                { date: '2024-01-09', revenue: 1800, orders: 18 },
                { date: '2024-01-10', revenue: 1500, orders: 15 },
                { date: '2024-01-11', revenue: 2200, orders: 22 },
                { date: '2024-01-12', revenue: 1900, orders: 19 },
                { date: '2024-01-13', revenue: 2100, orders: 21 },
                { date: '2024-01-14', revenue: 1750, orders: 17 }
            ]
        }
    });
});
exports.default = router;
