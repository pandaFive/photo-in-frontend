import { AccountData } from '../types';

export const isAdmin = (account: AccountData | null) => {
  if (account === null || account.role !== 'admin') {
    return false;
  } else {
    return true;
  }
};
