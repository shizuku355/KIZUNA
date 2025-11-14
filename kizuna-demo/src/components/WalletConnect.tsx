import { ConnectButton, useAccounts } from '@mysten/dapp-kit';

export function WalletConnect() {
  const accounts = useAccounts();
  const account = accounts[0];

  return (
    <div className="flex items-center gap-3">
      <ConnectButton
        className="px-4 py-2 rounded-lg font-semibold border border-gray-700 bg-transparent text-white hover:bg-gray-800"
      />
      {account && (
        <span className="text-sm text-gray-200">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
      )}
    </div>
  );
}
