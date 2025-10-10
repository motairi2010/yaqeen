/* ==== DOMSAFE v3 (querySelector-only, no recursion, pre-entry) ==== */
(function(){
  // لا تكرر الحقن
  if (window.__DOMSAFE__ && window.__DOMSAFE__.__v === 3) return;

  function escapeCssId(id){
    if (window.CSS && typeof CSS.escape === "function") return CSS.escape(id);
    return String(id).replace(/([ #.;?+*~':"!^\$\[\]\(\)=>|\/@])/g, "\\$1");
  }

  // نربط دوال querySelector الأصلية مباشرة (بدون الاعتماد على أي ربط سابق)
  const QS_DOC  = Document.prototype.querySelector;
  const QS_EL   = Element.prototype.querySelector;
  const QSA_DOC = Document.prototype.querySelectorAll;
  const QSA_EL  = Element.prototype.querySelectorAll;

  let _guard = false;

  function qsel(rootLike, sel){
    try{
      if (!rootLike) return QS_DOC.call(document, sel);
      // Document
      if (rootLike.nodeType === 9) return QS_DOC.call(rootLike, sel);
      // Element/ShadowRoot (يمتلك querySelector)
      if (typeof rootLike.querySelector === "function") return QS_EL.call(rootLike, sel);
      // fallback
      return QS_DOC.call(document, sel);
    } catch { return null; }
  }

  function qselAll(rootLike, sel){
    try{
      if (!rootLike) return QSA_DOC.call(document, sel);
      if (rootLike.nodeType === 9) return QSA_DOC.call(rootLike, sel);
      if (typeof rootLike.querySelectorAll === "function") return QSA_EL.call(rootLike, sel);
      return QSA_DOC.call(document, sel);
    } catch { return []; }
  }

  function getById(rootLike, id){
    if (!id) return null;
    if (_guard) return null; // اقفل أي دخول متكرر عرضي
    _guard = true;
    try {
      const sel = "#" + escapeCssId(id);
      return qsel(rootLike, sel) || qsel(document, sel) || null;
    } finally { _guard = false; }
  }

  function queryAll(rootLike, selector){
    if (!selector) return [];
    return qselAll(rootLike, selector);
  }

  // صدّر واجهة ثابتة
  Object.defineProperty(window, "__DOMSAFE__", {
    value: Object.freeze({ getById, queryAll, escapeCssId, __v: 3 }),
    writable: false, configurable: true, enumerable: false
  });

  // افرض استبدال أي safeGetById قديم بالنسخة الجديدة
  try { window.safeGetById = getById; } catch { /* ignore */ }

  // خيار حاسم: لو تم تلويث getElementById بدورة، افصله ليستخدم querySelector داخلياً
  try {
    Document.prototype.getElementById = function(id){
      try { return QS_DOC.call(this, "#" + escapeCssId(id)); } catch { return null; }
    };
  } catch { /* لا ننهار لو ممنوع التعديل */ }

})();
 /* ==== end DOMSAFE v3 ==== */
