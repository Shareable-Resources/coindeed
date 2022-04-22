import { combineReducers } from 'redux';

import wallet from './wallet';
import wholesale from './wholesale';

export default combineReducers({ wallet, wholesale });
