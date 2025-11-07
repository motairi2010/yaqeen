(() => {
  const SYMBOL = "﷼";
  const SPACE = "\u00A0";
  const WORDS = /(^|[\s\u00A0])(?:SAR|ر\.?\s*س\.?|ال﷼|﷼(?:\s+سعودي)?)(?=$|[\s\u00A0])/gu;

  const shouldSkip = (n: Node) => {
    const el = n.parentNode as Element | null;
    if (!el) return true;
    const tag = (el.tagName || "").toLowerCase();
    return ["script","style"].includes(tag) || (el as HTMLElement).isContentEditable;
  };

  const fixTextNode = (n: Node) => {
    if (n.nodeType !== Node.TEXT_NODE || shouldSkip(n)) return;
    const t = n.nodeValue || "";
    if (!t) return;
    if (t.includes(SYMBOL)) return;
    const r = t.replace(WORDS, (m,g1)=> g1 + SYMBOL);
    if (r !== t) n.nodeValue = r;
  };

  const walk = (root: Node) => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while (node = w.nextNode()) fixTextNode(node);
  };

  // عالج الحقول: value/placeholder (تخطي input[type=number])
  const fixInput = (el: HTMLInputElement|HTMLTextAreaElement) => {
    const type = (el as HTMLInputElement).type?.toLowerCase?.() || "";
    if (el instanceof HTMLInputElement && type === "number") return;
    if (el.placeholder) el.placeholder = el.placeholder.replace(WORDS, (m,g1)=> g1 + SYMBOL);
    if (el.value) el.value = el.value.replace(WORDS, (m,g1)=> g1 + SYMBOL);
  };
  const fixAllInputs = (root: ParentNode) => {
    root.querySelectorAll("input,textarea").forEach(el => fixInput(el as any));
  };

  const obs = new MutationObserver(ms => {
    for (const m of ms) {
      if (m.type === "characterData" && m.target) fixTextNode(m.target);
      m.addedNodes?.forEach(n => {
        if (n.nodeType === 3) fixTextNode(n);
        else {
          walk(n);
          if (n instanceof Element) fixAllInputs(n);
        }
      });
      if (m.type === "attributes" && m.target instanceof Element) {
        if (["value","placeholder"].includes(m.attributeName || "")) {
          const el = m.target as any;
          if ("value" in el || "placeholder" in el) fixInput(el);
        }
      }
    }
  });

  const boot = () => {
    walk(document.body);
    fixAllInputs(document);
    obs.observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:["value","placeholder"]});
    // فحص دوري احتياطي لبعض الجداول الافتراضية
    setInterval(()=>{ walk(document.body); fixAllInputs(document); }, 1000);
  };
  if (typeof window !== "undefined" && document?.body) {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
  }
})();
