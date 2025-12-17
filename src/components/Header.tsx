import { getAccount } from '@/src/api/get-account';
import HeaderContainer from '@/src/components/HeaderContainer';

const Header = async () => {
  const currentAccount = await getAccount();

  if (!currentAccount) {
    return null;
  }

  return (
    <HeaderContainer
      accountId={currentAccount.id}
      name={currentAccount.name}
      role={currentAccount.role}
    />
  );
};

export default Header;
