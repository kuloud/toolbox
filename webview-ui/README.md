# `webview-ui` Directory

This directory contains all of the code that will be executed within the webview context. It can be thought of as the place where all the "frontend" code of a webview is contained.

Types of content that can be contained here:

- Frontend framework code (i.e. React, Svelte, Vue, etc.)
- JavaScript files
- CSS files
- Assets / resources (i.e. images, illustrations, etc.)

## Serverless API (Vercel)

This project includes a serverless proxy at `api/translate.ts` which forwards translation requests to a LibreTranslate deployment. Configure the following environment variables when deploying to Vercel:

- `LIBRETRANSLATE_API_URL` (optional, default: `https://libretranslate.de`)
- `LIBRETRANSLATE_API_KEY` (optional)

The frontend calls `/api/translate` (POST) for translations and GET `/api/translate` to fetch supported languages.
