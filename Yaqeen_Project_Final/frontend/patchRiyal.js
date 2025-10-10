const fs = require('fs');
const { JSDOM } = require('jsdom');

// دالة لتحويل حرف "س" إلى "ر"
function normalizeTextNodeText(text) {
  if (!text) return text;

  let out = text.replace(/س\./g, "ر");
  out = out.replace(/\bس(?=\s*\d)/g, "ر");
  out = out.replace(/(^|[\s:])س([\s]|$)/g, "$1ر$2");

  return out;
}

// دالة لتطبيق التحويل على كل النصوص داخل عنصر DOM
function applyToElement(elem) {
  if (!elem || !elem.childNodes) return;

  elem.childNodes.forEach(node => {
    if (node.nodeType === 3) { // Node.TEXT_NODE
      const newText = normalizeTextNodeText(node.textContent);
      if (newText !== node.textContent) {
        node.textContent = newText;
      }
    } else if (node.childNodes && node.childNodes.length > 0) {
      applyToElement(node);
    }
  });
}

// ضع هنا مسار ملف HTML الذي تريد تعديله
const htmlFilePath = './example.html';
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// إنشاء DOM باستخدام jsdom
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

// تطبيق التحويل على كامل الجسم
applyToElement(document.body);

// حفظ النتيجة في ملف جديد
const outputPath = './example_patched.html';
fs.writeFileSync(outputPath, dom.serialize());

console.log(`تم استبدال حروف "س" إلى "ر" في الملف. النتيجة محفوظة في: ${outputPath}`);
