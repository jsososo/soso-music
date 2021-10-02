import { allProvide } from './state';
import { allWatch } from './watch';

export default () => allWatch(allProvide());
