import { PrismaClient, Prisma, Deed } from '@prisma/client';
import express from 'express';
import { CFL, paramSlicer } from '../../helpers/dataManipulation';
import { ALL, DEED_ADDRESS, DEED_MANAGER, DEED_TYPE, DURATION, LEVERAGE, LOAN, MY, PAIR, PROFIT, PROGRESS, SIZE, STATUS, TIME_LEFT } from '../../helpers/constants';

const prisma: PrismaClient<any, any, any> = new PrismaClient();

/*
  REQUEST Filters ON deeds
  allOrMy(Filter)     ['All', 'My'] // DEFAULTS TO ALL
  
  action(Filter)     ['Joined', 'Created','Staked'] // NO DEFAULT
  deedType(Filter)      ['Fixed', 'Floating] // no default
  status(Filter)     ['Recruiting', 'Escrow', 'Open', 'Completed', 'Canceled']
  leverage(Filter)   [1,6,11,20] 

  searchEntry           - 
  searchFilter 
  status                - ['Recruiting', 'Escrow', 'Open', 'Completed', 'Canceled']
    deedAddress         - deed Address
    deedManager         - deed Manager
    all                 - searches many things

  sortName        [status,token,wholesaleAddress,wholesaleManager,deedAddress,size,endDate,timeLeft,] // NO DEFAULT
  sortDirection   ['asc','desc'] // NO DEFAULT WILL NOT RUN UNLESS sortName and sortDirection are entered correctly
  
  **Pagination**
  take  - # of records per page           
  skip  - where we start

  ===== example URLS ======
  localhost:4000/deeds?take={10}
  localhost:4000/deeds?take={10}&skip{10}
  localhost:4000/deeds?take={10}&type{Private}
  localhost:4000/deeds?take={10}&type{Private}&sortName={status}
  localhost:4000/deeds??take={10}&type={Public}&view={Open}
  localhost:4000/deeds?take={10}&searchEntry={ETH}                                   
  localhost:4000/deeds?take={10}&searchEntry={ETH}&searchFilter={token}              
  localhost:4000/deeds?take={10}&searchEntry={ETH}&searchFilter={wholesaleAddress} 
  localhost:4000/deeds?take={10}&searchEntry={ETH}&searchFilter={token}&sortName={status}&sortDirection={asc}
*/

type SearchObj = {
  pair: string | undefined;
  status: string | undefined;
  deedAddress: string | undefined;
  deedManager: string | undefined;
  deedType: string | undefined;
  leverage: number | undefined;
};

type SortObj = {
  pair: Prisma.SortOrder | undefined;
  status: Prisma.SortOrder | undefined;
  timeLeft: Prisma.SortOrder | undefined;
  deedManager: Prisma.SortOrder | undefined;
  deedType: Prisma.SortOrder | undefined;
  deedAddress: Prisma.SortOrder | undefined;
  leverage: Prisma.SortOrder | undefined;
  profit: Prisma.SortOrder | undefined;
  size: Prisma.SortOrder | undefined;
  duration: Prisma.SortOrder | undefined;
  progress: Prisma.SortOrder | undefined;
};

const handleSearchInputs = (searchObj: SearchObj, searchFilterStr: string, searchEntryStr: string): SearchObj => {
  let newSearchObj: SearchObj = { ...searchObj };

  switch (searchFilterStr) {
    case PAIR:
      newSearchObj.pair = searchEntryStr;
      break;
    case DEED_MANAGER:
      newSearchObj.deedManager = searchEntryStr;
      break;
    case DEED_ADDRESS:
      newSearchObj.deedAddress = searchEntryStr;
      break;
    default:
      newSearchObj.pair = searchEntryStr;
      newSearchObj.deedManager = searchEntryStr;
      newSearchObj.deedAddress = searchEntryStr;
      break;
  }
  return newSearchObj;
};

const handleSortingInputs = (sortObj: SortObj, sortName: string, sortDirection: Prisma.SortOrder | undefined): SortObj => {
  const newSortObj: SortObj = { ...sortObj };
  switch (sortName) {
    case PAIR:
      newSortObj.pair = sortDirection;
      break;
    case STATUS:
      newSortObj.status = sortDirection;
      break;
    case TIME_LEFT:
      newSortObj.timeLeft = sortDirection;
      break;
    case DEED_MANAGER:
      newSortObj.deedManager = sortDirection;
      break;
    case DEED_TYPE:
      newSortObj.deedType = sortDirection;
      break;
    case DEED_ADDRESS:
      newSortObj.deedAddress = sortDirection;
      break;
    case LOAN + CFL(LEVERAGE):
      newSortObj.leverage = sortDirection;
      break;
    case PROFIT:
      newSortObj.profit = sortDirection;
      break;
    case SIZE:
      newSortObj.size = sortDirection;
      break;
    case DURATION:
      newSortObj.duration = sortDirection;
      break;
    case PROGRESS:
      newSortObj.progress = sortDirection;
      break;
  }

  return newSortObj;
};
export const getDeedsV2 = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  const { allOrMy, action, deedType, status, leverage, searchEntry, searchFilter, sortName, sortDirection, take, skip } = req.query;

  let searchObj: SearchObj = {
    pair: undefined,
    deedAddress: undefined,
    deedManager: undefined,
    status: undefined,
    deedType: undefined,
    leverage: undefined,
  };

  let sortObj: SortObj = {
    pair: undefined,
    status: undefined,
    timeLeft: undefined,
    deedManager: undefined,
    deedType: undefined,
    deedAddress: undefined,
    leverage: undefined,
    profit: undefined,
    size: undefined,
    duration: undefined,
    progress: undefined,
  };
  // Pagination
  const takeInt: number | undefined = take && take !== undefined ? parseInt(paramSlicer(take.toString()) as string) : undefined;
  const skipInt: number | undefined = skip && skip !== undefined ? parseInt(paramSlicer(skip.toString()) as string) : undefined;

  // Public/Private Filter
  const allOrMyStr: string | undefined = allOrMy ? CFL(paramSlicer(allOrMy.toString()) as string) : undefined;

  // View filter
  const actionStr: string | undefined = action ? paramSlicer(action.toString()) : undefined;
  // Deed filter
  const deedTypeStr: string | undefined = deedType ? paramSlicer(deedType.toString()) : undefined;
  // Status filter
  const statusStr: string | undefined = status ? paramSlicer(status.toString()) : undefined;
  // Leverage filter
  const leverageStr: string | undefined = leverage ? paramSlicer(leverage.toString()) : undefined;
  const leverageNumber: number | undefined = !isNaN(parseInt(leverageStr as string)) ? parseInt(leverageStr as string) : undefined;

  // Search and Its Possible Filters
  const searchEntryStr: string | undefined = searchEntry ? paramSlicer(searchEntry.toString()) : '';
  const searchFilterStr: string | undefined = searchFilter ? paramSlicer(searchFilter.toString()) : 'all';
  searchObj = handleSearchInputs(searchObj, searchFilterStr as string, searchEntryStr as string);

  // Sorting
  const sortNameStr: string | undefined = sortName ? paramSlicer(sortName.toString()) : undefined;
  const sortDirStr: string | undefined = sortDirection ? paramSlicer(sortDirection.toString()) : undefined;
  const sortDirectionStr: Prisma.SortOrder | undefined = sortDirStr === 'asc' || sortDirStr === 'desc' ? sortDirStr : undefined;
  sortObj = handleSortingInputs(sortObj, sortNameStr as string, sortDirectionStr);

  const wholesales: Array<Deed> = await prisma.deed.findMany({
    where: {
      // ALL OR MY DEEDS
      allOrMy: allOrMyStr === CFL(ALL) || allOrMyStr === undefined ? undefined : CFL(MY),

      //FILTERS
      actionType: actionStr || undefined,
      type: deedTypeStr || undefined,
      status: statusStr || undefined,
      loanLeverage:
        {
          gte: leverageNumber ? leverageNumber : undefined,
          lte: leverageNumber ? (leverageNumber != 20 ? leverageNumber + 5 : 150) : undefined,
        } || undefined,

      // SEARCHES
      OR: [
        {
          coinAName: { contains: searchObj.pair, mode: 'insensitive' } || undefined,
        },
        {
          coinBName: { contains: searchObj.pair, mode: 'insensitive' } || undefined,
        },
        {
          deedAddress: { contains: searchObj.deedAddress, mode: 'insensitive' } || undefined,
        },
        {
          deedManager: { contains: searchObj.deedManager, mode: 'insensitive' } || undefined,
        },
      ],
    },

    //SORTING
    orderBy: {
      coinAName: sortObj.pair || undefined,
      status: sortObj.status || undefined,
      deedEndDate: sortObj.timeLeft || sortObj.duration || undefined,
      deedManager: sortObj.deedManager || undefined,
      type: sortObj.deedType || undefined,
      deedAddress: sortObj.deedAddress || undefined,
      loanLeverage: sortObj.leverage || undefined,
      profit: sortObj.profit || undefined,
      size: sortObj.size || undefined,
      progress: sortObj.progress || undefined,
    },
    take: takeInt,
    skip: skipInt,
  });
  res.json(wholesales);
};

// Added pagination. URL will look like deeds?limit=10&before=20 or dees?limit=10&after=10
// export const getDeeds = async (req: express.Request, res: express.Response) => {
//   if (req.query && req.query.limit) {
//     try {
//       const beforeCursor = parseInt(req.query.before as string);
//       const afterCursor = parseInt(req.query.after as string);
//       let lastCursor = beforeCursor | afterCursor;
//       const limit = parseInt(req.query.limit as string);

//       // added the size of db here for error handling
//       const numberOfDeeds = await prisma.deed.count();
//       if (limit && (beforeCursor || afterCursor)) {
//         if (beforeCursor < limit || limit + afterCursor > numberOfDeeds)
//           return res.status(400).json({ error: 'Value is out of bounds.' });
//       }

//       const deeds =
//         beforeCursor || afterCursor
//           ? await prisma.deed.findMany({
//               take: limit,
//               skip: 1,
//               cursor: {
//                 id: lastCursor,
//               },
//               orderBy: {
//                 id: beforeCursor ? 'desc' : 'asc',
//               },
//             })
//           : await prisma.deed.findMany({
//               take: limit,
//               orderBy: {
//                 id: 'asc',
//               },
//             });

//       const lastInResults = deeds[limit - 1];
//       lastCursor = lastInResults.id;
//       res.json({
//         deeds,
//         numberOfDeeds,
//         lastCursor,
//       });
//     } catch (err) {
//       res.status(400).json({ err: err.message });
//     }
//   } else {
//     const deeds = await prisma.deed.findMany({});
//     res.json(deeds);
//   }
// };

export const getDeed = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  const deedAddress: string = req.params.deedAddress;
  if (!deedAddress || deedAddress === undefined) {
    return res.status(400).json({ error: `No deed address found in the request params... params: ${req.params}` });
  }
  if (deedAddress.length < 42) {
    return res.status(400).json({ error: 'Deed address is of invalid length.' });
  }
  const deed: Deed | null = await prisma.deed.findFirst({
    where: {
      deedAddress: deedAddress,
    },
  });
  res.json(deed);
};

/* 
    URL will look something like this: deeds?actionType=Created&type=Open&status=Open&loanLeverage=1
    This code may need refactoring down the road. 
*/
// export const getFilteredDeeds = async (req: express.Request, res: express.Response) => {
//   if (req.query) {
//     const { actionType, type, status, loanLeverage } = req.query as any;
//     const results: any[] = [];

//     if (actionType && !type && !status && !loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           actionType: {
//             equals: actionType,
//           },
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (!actionType && type && !status && !loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           type: {
//             equals: type,
//           },
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (!actionType && !type && status && !loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           status: {
//             equals: status,
//           },
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (!actionType && !type && !status && loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           loanLeverage: {
//             gte: parseInt(loanLeverage),
//             lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
//           },
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (actionType && type && !status && !loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               actionType: {
//                 equals: actionType,
//               },
//             },
//             {
//               type: {
//                 equals: type,
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (actionType && !type && status && !loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               actionType: {
//                 equals: actionType,
//               },
//             },
//             {
//               status: {
//                 equals: status,
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (actionType && !type && !status && loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               actionType: {
//                 equals: actionType,
//               },
//             },
//             {
//               loanLeverage: {
//                 gte: parseInt(loanLeverage),
//                 lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (!actionType && type && status && !loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               type: {
//                 equals: type,
//               },
//             },
//             {
//               status: {
//                 equals: status,
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (actionType && type && status && !loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               actionType: {
//                 equals: actionType,
//               },
//             },
//             {
//               type: {
//                 equals: type,
//               },
//             },
//             {
//               status: {
//                 equals: status,
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (!actionType && type && status && loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               type: {
//                 equals: type,
//               },
//             },
//             {
//               status: {
//                 equals: status,
//               },
//             },
//             {
//               loanLeverage: {
//                 gte: parseInt(loanLeverage),
//                 lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (!actionType && !type && status && loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               status: {
//                 equals: status,
//               },
//             },
//             {
//               loanLeverage: {
//                 gte: parseInt(loanLeverage),
//                 lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (!actionType && type && !status && loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               type: {
//                 equals: type,
//               },
//             },
//             {
//               loanLeverage: {
//                 gte: parseInt(loanLeverage),
//                 lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (actionType && type && !status && loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               actionType: {
//                 equals: actionType,
//               },
//             },
//             {
//               type: {
//                 equals: type,
//               },
//             },
//             {
//               loanLeverage: {
//                 gte: parseInt(loanLeverage),
//                 lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (actionType && !type && status && loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               actionType: {
//                 equals: actionType,
//               },
//             },
//             {
//               status: {
//                 equals: status,
//               },
//             },
//             {
//               loanLeverage: {
//                 gte: parseInt(loanLeverage),
//                 lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (actionType && type && status && loanLeverage) {
//       const filteredDeeds = await prisma.deed.findMany({
//         where: {
//           AND: [
//             {
//               actionType: {
//                 equals: actionType,
//               },
//             },
//             {
//               type: {
//                 equals: type,
//               },
//             },
//             {
//               status: {
//                 equals: status,
//               },
//             },
//             {
//               loanLeverage: {
//                 gte: parseInt(loanLeverage),
//                 lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
//               },
//             },
//           ],
//         },
//       });
//       results.push(filteredDeeds);
//     }
//     if (results.length === 0) res.json({ message: 'No Matching Deed.' });
//     res.status(200).json(results);
//   }
// };

export const createDeed = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const deed: Deed = req.body;
    if (!deed || deed === undefined) {
      return res.status(400).json({ error: `No deed found in the request body... body: ${req.body}` });
    }
    if (deed) {
      await prisma.deed.create({ data: deed });
      res.status(200).json({ message: 'Deed has been created.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateDeed = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const updatedDeedId: number | undefined = req.body?.id;
    if (!updatedDeedId || updatedDeedId === undefined) {
      return res.status(400).json({ error: `No deed id found in the request body... body: ${req.body}` });
    }
    if (req.body) {
      await prisma.deed.update({
        data: req.body,
        where: {
          id: updatedDeedId,
        },
      });
      res.status(200).json({ message: 'Deed has been updated.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// deeds/search?pair=ETH or deeds/search?deedManager=23fjsklerjksjerkl1j1ljfklfskjd or deeds/search?deedAddress=jkflskdjfsadl342
// export const getSearchedDeeds = async (req: express.Request, res: express.Response) => {
//   const { pair, deedAddress, deedManager } = req.query;
//   let searchedResults;
//   if (pair) {
//     searchedResults = await prisma.deed.findMany({
//       where: {
//         OR: [
//           {
//             coinAName: {
//               contains: pair as string,
//             },
//           },
//           {
//             coinBName: {
//               contains: pair as string,
//             },
//           },
//         ],
//       },
//     });
//   } else if (deedManager) {
//     searchedResults = await prisma.deed.findMany({
//       where: {
//         deedManagerAddress: deedManager as string,
//       },
//     });
//   } else if (deedAddress) {
//     searchedResults = await prisma.deed.findMany({
//       where: {
//         deedAddress: deedAddress as string,
//       },
//     });
//   }
//   if (!searchedResults || searchedResults.length === 0) {
//     return res.json({ message: 'No records found. Try another search.' });
//   }
//   res.status(200).json(searchedResults);
// };
// export const getSortedDeeds = async (req: express.Request, res: express.Response) => {
//   const { sort, order } = req.query;
//   console.log('sort is ', sort);
//   const sortedItem =
//     sort === 'pair'
//       ? 'coinAName'
//       : sort === 'deedType'
//       ? 'type'
//       : sort === 'leverage'
//       ? 'loanLeverage'
//       : sort === 'progress'
//       ? 'sizeConsumed'
//       : sort === 'management'
//       ? 'deedManagerAddress'
//       : sort === 'timeLeft'
//       ? 'deedEndDate'
//       : sort === 'duration'
//       ? 'published'
//       : sort; // just so the names in URL matche those in DB
//   const sortingOrder: string = (order as string) || 'asc';
//   let sortedResults;
//   if (sortedItem && sortingOrder) {
//     sortedResults = await prisma.deed.findMany({
//       orderBy: {
//         [sortedItem as string]: sortingOrder,
//       },
//     });
//   }
//   res.status(200).json(sortedResults);
// };
export const getDepositTokens = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const tokens = await prisma.depositToken.findMany();
    if (!tokens) {
      throw new Error('No tokens found.');
    }
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// go to deeds/deposit-tokens and deeds/purchase-tokens for respective tokens
export const getPurchaseTokens = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const tokens = await prisma.purchaseToken.findMany();
    if (!tokens) {
      throw new Error('No tokens found.');
    }
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPurchaseToken = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const tokenName: string = req.query.tokenName as string;
    if (!tokenName) {
      throw new Error('Param tokens found.');
    }
    const token = await prisma.purchaseToken.findFirst({
      where: {
        name: tokenName.toUpperCase(),
      },
    });
    if (!token) {
      throw new Error('No tokens found.');
    }
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDepositToken = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const tokenName: string = req.query.tokenName as string;
    if (!tokenName) {
      throw new Error('Param tokens found.');
    }
    const token = await prisma.depositToken.findFirst({
      where: {
        name: tokenName.toUpperCase(),
      },
    });
    if (!token) {
      throw new Error('No tokens found.');
    }
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// go to deeds/createTokens to create purchase and deposit tokens
export const createTokens = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const existingPurchaseTokens = await prisma.purchaseToken.findMany();
    const existingDepositTokens = await prisma.depositToken.findMany();
    // For this test we only want to ensure there's no existing tokens, so they can create test tokens once
    if (existingPurchaseTokens.length === 0 && existingDepositTokens.length === 0) {
      await prisma.purchaseToken.createMany({
        data: [
          { name: 'USDT', decimals: 6, address: '0x9dec1bf22848b27f22b00e412fc0d181faf57370' },
          { name: 'TKN1', decimals: 18, address: '0x0196674A7Ec59F821023F8eE03326d6d3907E656' },
          { name: 'TKN2', decimals: 18, address: '0xED18CD520eF5a46f358b555365912759FE54fE0A' },
        ],
      });
      await prisma.depositToken.createMany({
        data: [
          {
            name: 'USDT',
            decimals: 6,
            address: '0x9dec1bf22848b27f22b00e412fc0d181faf57370',
          },
          {
            name: 'ETH',
            decimals: 18,
            address: '0x0000000000000000000000000000000000000000',
          },
        ],
      });
      return res.status(201).json({ message: 'Tokens created.' });
    } else {
      throw new Error('Tokens existed.');
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
export default prisma;
