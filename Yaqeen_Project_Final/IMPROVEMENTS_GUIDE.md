# دليل استخدام التحسينات الجديدة

## 📚 نظرة عامة

تم إضافة مجموعة من التحسينات التقنية المتقدمة إلى برنامج يقين دون المساس بواجهة المستخدم. هذا الدليل يشرح كيفية استخدام كل تحسين.

---

## 🚀 Performance Optimizations

### 1. استخدام React.memo

```javascript
import { withMemo, withDeepMemo } from './hocs/withMemo';

const MyComponent = ({ data }) => {
  return <div>{data.name}</div>;
};

export default withMemo(MyComponent);
```

### 2. Lazy Loading للمكونات

```javascript
import { lazyLoad, lazyLoadWithRetry } from './utils/lazyLoad';

const Dashboard = lazyLoadWithRetry(
  () => import('./pages/Dashboard'),
  3,
  <div>جاري التحميل...</div>
);
```

### 3. مراقبة الأداء

```javascript
import { usePerformance } from './hooks/usePerformance';

function MyComponent() {
  const { measureOperation, renderCount } = usePerformance('MyComponent');

  const handleClick = () => {
    measureOperation('handleClick', () => {
      // العملية المراد قياسها
    });
  };

  return <div>Rendered {renderCount} times</div>;
}
```

---

## 📱 PWA Capabilities

### 1. تفعيل Service Worker

في ملف `index.js`:

```javascript
import { register } from './utils/serviceWorkerRegistration';

register({
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('New version available');
  }
});
```

### 2. استخدام Offline Status

```javascript
import { useOffline, useNetworkStatus } from './hooks/useOffline';

function MyComponent() {
  const isOffline = useOffline();
  const networkStatus = useNetworkStatus();

  if (isOffline) {
    return <div>أنت غير متصل بالإنترنت</div>;
  }

  return <div>متصل منذ {networkStatus.since}</div>;
}
```

### 3. تخزين البيانات Offline

```javascript
import { offlineStorage, syncPendingRequests } from './utils/offlineStorage';

async function saveDataOffline(data) {
  await offlineStorage.addPendingRequest({
    type: 'CREATE_INVOICE',
    data: data
  });
}

window.addEventListener('online', async () => {
  await syncPendingRequests(async (request) => {
    // مزامنة البيانات مع السيرفر
    await api.post('/invoices', request.data);
  });
});
```

---

## 📊 Monitoring & Analytics

### 1. تتبع الأحداث

```javascript
import { analytics, trackEvent, trackPageView } from './utils/analytics';

function MyComponent() {
  useEffect(() => {
    trackPageView('Dashboard');
  }, []);

  const handleButtonClick = () => {
    trackEvent('button_click', { button: 'submit' });
  };

  return <button onClick={handleButtonClick}>إرسال</button>;
}
```

### 2. تتبع الأخطاء

```javascript
import { captureError } from './utils/errorTracking';

try {
  // الكود الذي قد يسبب خطأ
  riskyOperation();
} catch (error) {
  captureError(error, { context: 'InvoiceCreation' });
}
```

### 3. مراقبة شاملة

```javascript
import { initMonitoring, getMonitoringData } from './utils/monitoring';

initMonitoring();

const exportData = () => {
  const data = getMonitoringData();
  console.log('Performance:', data.performance);
  console.log('Errors:', data.errors);
  console.log('Analytics:', data.analytics);
};
```

---

## 📦 Code Splitting

### 1. Route-based Splitting

```javascript
import { routeBasedSplitting, preloadRoute } from './utils/codeSplitting';

const Dashboard = lazy(routeBasedSplitting.Dashboard);

const handleMouseEnter = () => {
  preloadRoute('Products');
};
```

### 2. Component Preloading

```javascript
import { usePreload } from './hooks/useCodeSplitting';

function Menu() {
  const { loaded } = usePreload(() => import('./pages/Dashboard'));

  return (
    <nav>
      <Link to="/dashboard" onMouseEnter={() => preloadRoute('Dashboard')}>
        لوحة التحكم
      </Link>
    </nav>
  );
}
```

---

## 🧪 Testing

### 1. كتابة الاختبارات

```javascript
import { render, screen } from '@testing-library/react';
import { renderWithRouter, mockSupabase } from './utils/testHelpers';

test('renders invoice list', () => {
  const { getByText } = renderWithRouter(<InvoicesList />);
  expect(getByText('الفواتير')).toBeInTheDocument();
});
```

### 2. Mock البيانات

```javascript
import { mockInvoice, mockProduct } from './utils/testHelpers';

test('creates invoice', async () => {
  const invoice = mockInvoice;
  // استخدم البيانات في الاختبار
});
```

### 3. تشغيل الاختبارات

```bash
npm test
npm run test:coverage
```

---

## 🔧 Bundle Optimization

### 1. تحسين الصور

```javascript
import { optimizeImages } from './utils/bundleOptimization';

useEffect(() => {
  optimizeImages();
}, []);
```

### 2. Prefetching

```javascript
import { prefetchRoute, preconnect } from './utils/bundleOptimization';

preconnect('https://api.example.com');
prefetchRoute('/dashboard');
```

---

## 📈 Web Vitals

### 1. قياس Web Vitals

```javascript
import { reportWebVitals } from './utils/performanceMonitor';

reportWebVitals((metric) => {
  console.log(metric.name, metric.value);
});
```

---

## ⚙️ إعدادات متقدمة

### 1. تعطيل Analytics في Development

```javascript
const analytics = new Analytics();
analytics.enabled = process.env.NODE_ENV === 'production';
```

### 2. تعطيل Performance Monitoring

```javascript
const performanceMonitor = new PerformanceMonitor();
performanceMonitor.enabled = false;
```

---

## 🛠 أدوات مفيدة

### 1. تصدير البيانات

```javascript
import { getMonitoringData } from './utils/monitoring';
import { getErrorLogs } from './utils/errorTracking';

const exportAllData = () => {
  const monitoring = getMonitoringData();
  const errors = getErrorLogs();

  const blob = new Blob([JSON.stringify({ monitoring, errors }, null, 2)]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yaqeen-data-${Date.now()}.json`;
  a.click();
};
```

### 2. مسح البيانات

```javascript
import { clearMonitoringData } from './utils/monitoring';
import { errorTracker } from './utils/errorTracking';

const clearAllData = () => {
  clearMonitoringData();
  errorTracker.clearErrors();
};
```

---

## 🎯 أفضل الممارسات

1. **استخدم Lazy Loading للصفحات الكبيرة**
   - قم بتحميل الصفحات عند الحاجة فقط

2. **راقب الأداء في Development**
   - استخدم usePerformance hook لتحديد المكونات البطيئة

3. **اختبر Offline Mode**
   - تأكد من عمل التطبيق بدون اتصال

4. **تتبع الأحداث المهمة فقط**
   - لا تفرط في استخدام analytics

5. **اكتب اختبارات للمكونات الحرجة**
   - ركز على الأجزاء المهمة من التطبيق

---

## 📞 الدعم

إذا واجهت أي مشكلة، تحقق من:
- Error logs في localStorage
- Console في المتصفح
- Network tab للتحقق من الطلبات

---

## 🎉 الخلاصة

جميع التحسينات تعمل بشكل تلقائي في الخلفية. لا حاجة لتعديل الكود الموجود. يمكنك استخدام الميزات الجديدة تدريجياً حسب الحاجة.
