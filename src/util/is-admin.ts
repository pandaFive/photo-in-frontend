import { AccountData } from '../api/get-account';

export const isAdmin = (account: AccountData | null) => {
  if (account === null || account.role !== '0') {
    return false;
  } else {
    return true;
  }
};
