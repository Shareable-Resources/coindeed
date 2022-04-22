export const abbreviateNumber = (number: number) => {
  let count: number = 0;
  if (number < 10000) return number;

  while (number / 1000 >= 1) {
    number = number / 1000;
    count++;
  }

  switch (count) {
    case 1:
      return `${Math.floor(number)}K`;
    case 2:
      return `${Math.floor(number)}M`;
    case 3:
      return `${Math.floor(number)}B`;
    case 4:
      return `${Math.floor(number)}T`;
    default:
      return number;
  }
};
export let USDFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const CFL = (str: string): string => {
  return str[0].toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
};

export const formatNumberSemicolon = (rawNumber: any) => {
  if (!rawNumber) return 0;
  return rawNumber.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
};

export const roundNumber = (rawValue: any, decimal = 3) => {
  return Number(rawValue).toFixed(decimal);
};
export const NumberToFixed = (num: any, fixed: number = 3) => {
  const reg = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
  const formated = String(num).toString().match(reg);
  return formated ? formated[0] : 0;
};
export const NumberToFixedFormater = (
  value: any,
  decimal: number = 3,
  formatFixed: boolean = false,
  clearDecimal: boolean = false,
) => {
  // if (Number(value) > 1) decimal = 2;
  value = NumberToFixed(value, decimal);
  if (formatFixed) value = Number(value).toFixed(decimal);
  if (clearDecimal) value = parseFloat(value);
  value += '';
  const list = value.split('.');
  const prefix = list[0].charAt(0) === '-' ? '-' : '';
  let num = prefix ? list[0].slice(1) : list[0];
  let result = '';
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`;
    num = num.slice(0, num.length - 3);
  }
  if (num) result = num + result;
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
};

export const NumberToFixedFormaterNoComma = (
  value: any,
  decimal: number = 3,
  formatFixed: boolean = false,
  clearDecimal: boolean = false,
) => {
  if (Number(value) > 1) decimal = 2;
  value = NumberToFixed(value, decimal);
  if (formatFixed) value = Number(value).toFixed(decimal);
  if (clearDecimal) value = parseFloat(value);
  value += '';
  const list = value.split('.');
  const prefix = list[0].charAt(0) === '-' ? '-' : '';
  let num = prefix ? list[0].slice(1) : list[0];
  let result = '';
  while (num.length > 3) {
    result = `${num.slice(-3)}${result}`;
    num = num.slice(0, num.length - 3);
  }
  if (num) result = num + result;
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
};

export const shrinkAddressX = (address: string, one: number, two: number) =>
  `${address?.slice(0, one)}...${address?.slice(-two)}`;
