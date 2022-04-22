export const wholesale = (state = { state: undefined }, action: { type: string; payload?: any }) => {
  switch (action.type) {
    case 'SET_WHOLESALE_STATE':
      return { ...state, state: action.payload };
  }
  return state;
};

export default wholesale;
