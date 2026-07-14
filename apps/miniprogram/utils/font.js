// utils/font.js
// ─────────────────────────────────────────────────────────────
// 加载 Sarasa Gothic SC（手绘圆体）作为小程序全局字体
//
// 为什么必须这样加载？
//   1. 小程序 WXSS 的 @font-face 不支持本地字体文件路径，
//      只能通过 wx.loadFontFace 从 https CDN 加载。
//   2. Sarasa 全量字体每字重几十 MB，直接加载会超时/超限，
//      必须先子集化（只保留项目用到的汉字）再上传到 CDN。
//
// 用法：在 app.js 的 onLaunch 里调用一次：
//   require('./utils/font').loadSarasaFont();
// ─────────────────────────────────────────────────────────────

// 字体 family 名，需与 app.wxss 中 font-family 首选名一致
const FONT_FAMILY = 'Sarasa Gothic SC';

// TODO(你来做): 把子集化后的字体文件上传到你的 https CDN/OSS，
// 然后把下面这个 URL 换成真实地址（建议 .ttf，兼容性最好）。
const FONT_URL = 'https://YOUR_CDN_DOMAIN/fonts/sarasa-subset.ttf';

let loadPromise = null;

/**
 * 加载 Sarasa Gothic SC 字体（全局只加载一次，自动缓存结果）
 * @returns {Promise<boolean>} 是否加载成功
 */
function loadSarasaFont() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    if (!FONT_URL || FONT_URL.includes('YOUR_CDN_DOMAIN')) {
      console.warn('[font] 未配置 FONT_URL，跳过 Sarasa 字体加载（使用系统字体兜底）');
      return resolve(false);
    }
    wx.loadFontFace({
      family: FONT_FAMILY,
      source: `url("${FONT_URL}")`,
      global: true, // 全局生效，所有页面无需再单独设置
      success() {
        console.log('[font] Sarasa Gothic SC 加载成功');
        resolve(true);
      },
      fail(err) {
        console.warn('[font] Sarasa Gothic SC 加载失败，回退系统字体', err);
        resolve(false);
      },
    });
  });

  return loadPromise;
}

module.exports = { loadSarasaFont, FONT_FAMILY };
