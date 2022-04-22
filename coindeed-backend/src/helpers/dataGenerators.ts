export const hexGenerator = (size: number): string => {
  let hexElementsArray: Array<string> = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  let hexString: Array<string> = [];
  for (let i = 0; i < size; i++) {
    hexString.push(hexElementsArray[Math.floor(Math.random() * 16)]);
  }
  return hexString.join('');
};

export const coinTypes: Array<string> = ['ETH', 'USDT', 'USDC', 'DAI', 'UNI'];
export const statusTypes: Array<string> = ['Cancelled', 'Completed', 'Escrow', 'Open', 'Recruiting'];
export const wholesaleStatusTypes: Array<string> = ['Bounded', 'My', 'Open', 'Reserved', 'Completed', 'Invite'];
export const deedTypes: Array<string> = ['Fixed', 'Floating'];
export const actionTypes: Array<string> = ['Joined', 'Created', 'Staked'];
export const swapTypes: Array<string> = ['DEX', 'Wholesale'];
export const wholesaleTypes: Array<string> = ['Public', 'Private'];
export const allOrMyTypes: Array<string> = ['All', 'My'];

export const typeGenerator = (type: string): string => {
  switch (type) {
    case 'coinType':
      return coinTypes[Math.floor(Math.random() * coinTypes.length)];
    case 'statusType':
      return statusTypes[Math.floor(Math.random() * statusTypes.length)];
    case 'wholesaleStatusType':
      return wholesaleStatusTypes[Math.floor(Math.random() * wholesaleStatusTypes.length)];
    case 'deedType':
      return deedTypes[Math.floor(Math.random() * deedTypes.length)];
    case 'actionType':
      return actionTypes[Math.floor(Math.random() * actionTypes.length)];
    case 'swapType':
      return swapTypes[Math.floor(Math.random() * swapTypes.length)];
    case 'wholesaleType':
      return wholesaleTypes[Math.floor(Math.random() * wholesaleTypes.length)];
    case 'allOrMyType':
      return allOrMyTypes[Math.floor(Math.random() * allOrMyTypes.length)];
    default:
      return `Invalid type: ${type}`;
  }
};

export const numberGenerator = (size: number): number => {
  return Math.floor(Math.random() * size);
};

export const booleanGenerator = (): boolean => {
  if (Math.floor(Math.random()) > 0.5) return true;
  return false;
};

export const dateGenerator = (from: Date, to: Date): string => {
  const fromTime: number = from.getTime();
  const toTime: number = to.getTime();
  return new Date(fromTime + Math.random() * (toTime - fromTime)).toISOString();
};
