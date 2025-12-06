export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = (sources) => {
  return Promise.all(sources.map(preloadImage));
};

export const prefetchRoute = (routePath) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  link.href = routePath;
  document.head.appendChild(link);
};

export const preconnect = (url) => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
};

export const dnsPrefetch = (url) => {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = url;
  document.head.appendChild(link);
};

export const optimizeImages = () => {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
};

export const deferNonCriticalCSS = (href) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  document.head.appendChild(link);
};

export const loadScriptAsync = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export const removeUnusedCSS = () => {
  if (process.env.NODE_ENV === 'development') return;

  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  const usedSelectors = new Set();

  document.querySelectorAll('*').forEach(element => {
    usedSelectors.add(element.tagName.toLowerCase());
    element.classList.forEach(className => {
      usedSelectors.add(`.${className}`);
    });
    if (element.id) {
      usedSelectors.add(`#${element.id}`);
    }
  });

  console.log('Used selectors:', usedSelectors.size);
};
