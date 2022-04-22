export const wallet = (
  state = { isModalWalletConnect: false, isModalWalletDisconnect: false, userAddress: undefined },
  action: { type: string; payload?: any },
) => {
  switch (action.type) {
    case 'SET_MODAL_WALLET_CONNECT':
      return { ...state, isModalWalletConnect: action.payload };
    case 'SET_MODAL_WALLET_DISCONNECT':
      return { ...state, isModalWalletDisconnect: action.payload };
    case 'SET_USER_ADDRESS':
      return { ...state, userAddress: action.payload };
  }
  return state;
};

export default wallet;
