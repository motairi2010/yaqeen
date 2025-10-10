/* Lightweight crash catcher for CRA/Vite: shows first errors on the page and Console */
(function(){
  if (typeof window === "undefined" || window.__CRASHCATCHER__) return;
  window.__CRASHCATCHER__ = true;

  function banner(txt, bg){
    try{
      var pre = document.createElement("pre");
      pre.style.cssText = "position:fixed;left:8px;right:8px;top:8px;z-index:2147483647;padding:12px;border:1px solid #0002;border-radius:8px;font:12px/1.5 monospace;white-space:pre-wrap;direction:ltr;background:"+bg+";color:#111";
      pre.textContent = txt;
      (document.body || document.documentElement).prepend(pre);
    }catch(e){}
  }
  function log(type,msg){
    try{ console[type] ? console[type](msg) : console.log(msg) }catch(e){}
  }

  window.addEventListener("error", function(e){
    var msg = "[ERROR] " + e.message + " @ " + (e.filename+":"+e.lineno+":"+e.colno);
    banner(msg, "#fee");
    log("error", msg);
  });
  window.addEventListener("unhandledrejection", function(e){
    var reason = e.reason && (e.reason.stack || e.reason) || String(e.reason);
    var msg = "[PROMISE] " + reason;
    banner(msg, "#eef");
    log("error", msg);
  });

  function checkEmptyRoot(){
    var root = document.getElementById("root");
    if (root && root.children && root.children.length === 0){
      banner("Root موجود لكن فارغ. التطبيق لم يعرض شيئاً. راجع App أو المسارات الأولى.", "#fffbcc");
      log("warn", "[CRASHCATCHER] #root is empty; App likely rendered nothing.");
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(checkEmptyRoot, 600); });
  } else {
    setTimeout(checkEmptyRoot, 600);
  }
  setTimeout(checkEmptyRoot, 1500);
})();
