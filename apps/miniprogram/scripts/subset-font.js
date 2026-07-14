// scripts/subset-font.js
// 自动扫描 miniprogram 源码里用到的文字，把 Sarasa 字体子集化。
//
// 用法：
//   1) npm i -D fontmin
//   2) 把下载的 sarasa-gothic-sc-*.ttf 放到 scripts/ 下
//   3) node scripts/subset-font.js scripts/sarasa-gothic-sc-regular.ttf
//   输出：scripts/dist/sarasa-subset.ttf  （再传到你的 CDN）

const Fontmin = require('fontmin');
const fs = require('fs');
const path = require('path');

const SRC_TTF = process.argv[2];
if (!SRC_TTF) {
  console.error('用法: node scripts/subset-font.js <源ttf路径>');
  process.exit(1);
}
const OUT_DIR = path.resolve(__dirname, 'dist');

// 递归收集 miniprogram 目录下所有源码文本
function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(wxml|wxss|ts|js|json|md)$/.test(name)) files.push(p);
  }
  return files;
}

const root = path.resolve(__dirname, '..'); // apps/miniprogram
let raw = '';
for (const f of walk(root)) raw += fs.readFileSync(f, 'utf8');

// 提取：常用汉字 + 中文标点 + 字母数字 + 空白
const keep = /[一-鿿，。！？：、；""''（）()《》·…—\-—\w\s]/g;
const chars = new Set();
for (const m of raw.matchAll(keep)) chars.add(m[0]);
// 补充设计稿常用但源码未必出现的标点
'，。！？：、；（）·…—「」『』“”'.split('').forEach((c) => chars.add(c));

const subset = Array.from(chars).join('');
console.log(`提取到 ${chars.size} 个独立字符，开始子集化...`);

const fontmin = new Fontmin()
  .src(SRC_TTF)
  .use(Fontmin.glyph({ text: subset }))
  .dest(OUT_DIR);

fontmin.run((err) => {
  if (err) throw err;
  const out = path.join(OUT_DIR, path.basename(SRC_TTF).replace(/\.ttf$/i, '-subset.ttf'));
  console.log('✅ 子集化完成 →', out);
  console.log('   把它上传到你的 https CDN，再把 URL 填进 utils/font.js 的 FONT_URL');
});
