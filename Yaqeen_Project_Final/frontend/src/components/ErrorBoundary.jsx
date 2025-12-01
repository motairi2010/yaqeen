import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    console.error('Error caught by boundary:', error, errorInfo);

    if (window.errorLogger) {
      window.errorLogger.log({
        error: error.toString(),
        stack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: '24px',
            marginBottom: '16px',
            color: '#DC2626'
          }}>
            {this.props.title || 'حدث خطأ غير متوقع'}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            marginBottom: '32px'
          }}>
            {this.props.message || 'نعتذر، حدث خطأ أثناء معالجة طلبك. يُرجى المحاولة مرة أخرى.'}
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              textAlign: 'left',
              marginBottom: '24px',
              padding: '16px',
              background: '#F3F4F6',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                تفاصيل الخطأ (وضع التطوير فقط)
              </summary>
              <pre style={{
                overflow: 'auto',
                fontSize: '12px',
                direction: 'ltr',
                textAlign: 'left'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              إعادة تحميل الصفحة
            </button>

            {this.props.onReset && (
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  this.props.onReset();
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#E5E7EB',
                  color: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                المحاولة مرة أخرى
              </button>
            )}
          </div>

          {this.props.showHomeButton && (
            <button
              onClick={() => window.location.href = '/'}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#6B7280',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              العودة للصفحة الرئيسية
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
