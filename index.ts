import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const API_AUTH_ENABLED = process.env.API_AUTH_ENABLED === 'true'; // Read from .env (true/false)
const API_KEY = process.env.API_KEY; // Use a pre-defined API key for authentication

// Middleware to block all other request methods except GET
app.use((req: Request, res: any, next: NextFunction) => {
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
    }
    next();
});

// Middleware for API authentication (enabled if API_AUTH_ENABLED is true)
const apiAuthMiddleware = (req: Request, res: any, next: NextFunction) => {
    if (API_AUTH_ENABLED) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).send('Unauthorized: No API key provided');
        }

        if (authHeader !== `Bearer ${API_KEY}`) {
            return res.status(401).send('Unauthorized: Invalid API key');
        }
    }
    next();
};

// Apply the authentication middleware globally
app.use(apiAuthMiddleware);

// Function to read the last n lines of a file
const readLastLines = (filePath: string, n: number): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const lines: string[] = [];
        const readStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
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

app.get('/', async (req: Request, res: any) => {
    const fileName = req.query.file as string | undefined;
    const n = parseInt(req.query.n as string, 10) || undefined;

    if (!fileName) {
        return res.status(400).send('File name is required');
    }

    const absolutePath = process.env.ABSOLUTE_PATH;
    if (!absolutePath) {
        return res.status(500).send('Server configuration error: ABSOLUTE_PATH is not set');
    }

    const filePath = path.join(absolutePath, fileName);

    // Check if file exists before proceeding
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    try {
        // If n is specified, read the last n lines, otherwise download the entire file
        if (n) {
            const lines = await readLastLines(filePath, n);
            res.type('text/plain').send(lines.join('\n'));
        } else {
            res.download(filePath);
        }
    } catch (error) {
        res.status(500).send(`Error reading the file: ${(error as Error).message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
