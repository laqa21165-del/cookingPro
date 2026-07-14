# Project Rules

## Encoding

- When editing or creating WeChat Mini Program source files in this project, always save them as `UTF-8` **without BOM**.
- This applies at minimum to `*.json`, `*.wxss`, `*.wxml`, `*.js`, and `*.ts`.
- This rule is especially important for files such as `app.json`, page `*.json`, `app.wxss`, and similar files, because BOM can cause parse or compile errors in WeChat DevTools.
