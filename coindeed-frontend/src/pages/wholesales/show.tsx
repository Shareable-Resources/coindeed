import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { multicall } from '../../blockchain/multicall';
import { Wholesale } from '../../components/wholesales/dashboard/WholesaleTable';
import { ViewWholesale } from '../../components/wholesales/edit/ViewWholesale';
import { queryGraph } from '../../services/graphql';
import WholesaleABI from '../../blockchain/abi/Wholesale.json';
import { useDispatch } from 'react-redux';
import Error from '../error';
// import { wholesales } from '../../components/wholesales/dashboard/WholesaleDashboard';

type WholesaleParams = {
  wholesaleId: string;
};
const WHOLESALE_ADDRESS = process.env.REACT_APP_WHOLESALE_ADDRESS;

export const ViewWholesalePage = () => {
  const dispatch = useDispatch();
  const [wholesale, setWholesale] = useState<Wholesale>({} as Wholesale);
  const { wholesaleId } = useParams<WholesaleParams>();

  useEffect(() => {
    const tokensQuery = `
      query {
        newWholesales(where: {saleId: ${wholesaleId}}) {
          id
          saleId
          offeredBy
          tokenOffered
          tokenRequested
          offeredAmount
          requestedAmount
          minSaleAmount
          deadline
          reservedTo
        }
      }
  `;
    const doSearch = async () => {
      const [res] = await queryGraph(tokensQuery);
      const dataWholesales = (res as any)?.data?.newWholesales;
      const listOfCalls = dataWholesales?.map((wholesale: Wholesale) => [
        // pair of tokens
        {
          address: WHOLESALE_ADDRESS,
          name: 'getWholesale',
          params: [wholesale.saleId],
        },
      ]);
      let result = await Promise.all(listOfCalls.map((call: any) => multicall(WholesaleABI, call)));
      const newWholesale = dataWholesales.map((e: any, index: number) => {
        dispatch({ type: 'SET_WHOLESALE_STATE', payload: (result as any)[index][0][0].state });
        return {
          ...e,
          status: (result as any)[index][0][0].state,
          receivedAmount: (result as any)[index][0][0].receivedAmount.toString(),
          isPrivate: (result as any)[index][0][0].isPrivate,
          reservedTo: (result as any)[index][0][0].reservedTo,
        };
      });
      setWholesale(newWholesale[0]);
    };
    doSearch();
    //eslint-disable-next-line
  }, [wholesaleId]);

  return <>{wholesale ? <ViewWholesale wholesale={wholesale} /> : <Error />}</>;
};
