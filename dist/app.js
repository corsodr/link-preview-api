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
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("./utils");
const robots_parser_1 = __importDefault(require("robots-parser"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8081;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const checkRobotsTxt = (url) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { protocol, host } = new URL(url);
        const robotsTxtUrl = `${protocol}//${host}/robots.txt`;
        const response = yield fetch(robotsTxtUrl);
        const robotsTxt = yield response.text();
        const robots = (0, robots_parser_1.default)(robotsTxtUrl, robotsTxt);
        const isAllowed = (_a = robots.isAllowed(url, 'LinkPreviewBot')) !== null && _a !== void 0 ? _a : true;
        return isAllowed;
    }
    catch (error) {
        // why return true here?
        return true;
    }
});
app.post('/api/preview', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        const isAllowed = yield checkRobotsTxt(url);
        if (!isAllowed) {
            return res.status(403).json({ error: 'Access to this URL is not allowed by robots.txt' });
        }
        // review headers 
        const headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +http://www.yourwebsite.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        };
        const response = yield fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = yield response.text();
        const previewData = (0, utils_1.extractPreviewData)(html, url);
        res.json(previewData);
        // review error 
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to generate preview',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
module.exports = app;
