export const paramSlicer = (str: string | undefined): string | undefined => {
  return str ? str.slice(1, str.length - 1) : undefined;
};

export const CFL = (str: string): string => {
  return str[0].toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
};
// Capitializing first letter??
