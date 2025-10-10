// مثال 1: استخدام مباشر
import RiyalSymbol from './components/RiyalSymbol';
<RiyalSymbol amount={100} />

// مثال 2: استخدام الهوك
import { useRiyal } from './hooks/useRiyal';
const { format, symbol } = useRiyal();
{format(150)}

// مثال 3: استخدام HOC
import { withRiyal } from './hocs/withRiyal';
const MyComponent = ({ riyal }) => {
  return <div>{riyal.format(200)}</div>;
};
export default withRiyal(MyComponent);
