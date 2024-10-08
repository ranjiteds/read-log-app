"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const readline_1 = __importDefault(require("readline"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const API_KEY = process.env.API_KEY; // Use a pre-defined API key for authentication
// Middleware to block all other request methods except GET
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
    }
    next();
});
// Middleware for API authentication (enabled if API_AUTH_ENABLED is true)
const apiAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized Access');
    }
    if (authHeader !== `Bearer ${API_KEY}`) {
        return res.status(401).send('Unauthorized Access');
    }
    next();
};
// Apply the authentication middleware globally
app.use(apiAuthMiddleware);
// Function to read the last n lines of a file
const readLastLines = (filePath, n) => {
    return new Promise((resolve, reject) => {
        const lines = [];
        const readStream = fs_1.default.createReadStream(filePath);
        const rl = readline_1.default.createInterface({
            input: readStream,
            crlfDelay: Infinity,
        });
        rl.on('line', (line) => {
            lines.push(line);
            if (lines.length > n) {
                lines.shift(); // Keep only the last n lines in memory
            }
        });
        rl.on('close', () => resolve(lines));
        rl.on('error', (err) => reject(err));
    });
};
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = req.query.file;
    const n = parseInt(req.query.n, 10) || 100;
    if (!fileName) {
        return res.status(400).send('File name is required');
    }
    const absolutePath = process.env.ABSOLUTE_PATH;
    if (!absolutePath) {
        return res.status(500).send('Server configuration error: ABSOLUTE_PATH is not set');
    }
    const filePath = path_1.default.join(absolutePath, fileName);
    // Check if file exists before proceeding
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }
    try {
        // If n is specified, read the last n lines, otherwise download the entire file
        if (n) {
            const lines = yield readLastLines(filePath, n);
            res.type('text/plain').send(lines.join('\n'));
        }
        else {
            //res.download(filePath);
            return res.status(401).send('Inavlid request');
        }
    }
    catch (error) {
        res.status(500).send(`Error reading the file: ${error.message}`);
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
