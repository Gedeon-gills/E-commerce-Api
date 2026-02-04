"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-commerce API PRO",
            version: "1.0.0",
            description: "Production-ready REST API for E-commerce with JWT, Multer, and Cloudinary",
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1",
                description: "Development server",
            },
            { url: "https://e-commerce-api-i03f.onrender.com", description: "Production server" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/routes/*.ts"],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
