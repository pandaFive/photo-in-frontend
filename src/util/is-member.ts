import { AccountData } from '../api/get-account';

export const isMember = (account: AccountData | null) => {
  if (account === null || account.role !== '0') {
    return false;
  } else {
    return true;
  }
};
