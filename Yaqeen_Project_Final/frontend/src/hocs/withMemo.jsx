import { memo } from 'react';

export const withMemo = (Component, propsAreEqual) => {
  return memo(Component, propsAreEqual);
};

export const withDeepMemo = (Component) => {
  return memo(Component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

export const withShallowMemo = (Component) => {
  return memo(Component);
};
