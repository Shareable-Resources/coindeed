type MoneyTdProps = {
  value: number;
  index?: number;
  col: number;
};
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function MoneyTd({ value, index = 0, col }: MoneyTdProps) {
  const negative = value < 0 ? true : false;
  const tailwind = `w-1/${col} py-3 pr-8 whitespace-nowrap text-sm w-auto text-left`;

  return (
    <>
      {negative ? (
        <td key={index} className={tailwind + ' text-moneyRed'}>
          {currencyFormatter.format(value)}
        </td>
      ) : (
        <td key={index} className={tailwind + ' text-moneyGreen'}>
          {currencyFormatter.format(value)}
        </td>
      )}
    </>
  );
}
