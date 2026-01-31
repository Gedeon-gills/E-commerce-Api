"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cartSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
            product: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, default: 1 }
        }]
}, { timestamps: true });
exports.default = mongoose_1.default.model('Cart', cartSchema);
