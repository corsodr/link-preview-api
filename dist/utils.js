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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPreviewData = extractPreviewData;
const cheerio = __importStar(require("cheerio"));
function extractPreviewData(html, url) {
    const $ = cheerio.load(html);
    const getMetatag = (name) => $(`meta[name="${name}"]`).attr('content') ||
        $(`meta[property="og:${name}"]`).attr('content') ||
        $(`meta[property="twitter:${name}"]`).attr('content') ||
        '';
    const getFavicon = () => {
        const favicon = $('link[rel="shortcut icon"]').attr('href') ||
            $('link[rel="icon"]').attr('href');
        return favicon ? new URL(favicon, url).href : '';
    };
    const getImage = () => {
        const image = getMetatag('image') ||
            $('link[rel="image_src"]').attr('href') ||
            '';
        return image ? new URL(image, url).href : '';
    };
    const getDomain = (url) => {
        const domain = new URL(url).hostname;
        return domain.startsWith('www.') ? domain.slice(4) : domain;
    };
    return {
        url,
        domain: getDomain(url),
        title: $('title').text() || '',
        favicon: getFavicon(),
        description: getMetatag('description'),
        image: getImage(),
    };
}
