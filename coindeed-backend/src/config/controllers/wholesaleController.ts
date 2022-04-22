import { PrismaClient, Prisma, Wholesale, PurchaseToken, DepositToken } from '@prisma/client';
import express from 'express';
import { CFL, paramSlicer } from '../../helpers/dataManipulation';
import { DEED_ADDRESS, END_DATE, PUB, SIZE, STATUS, TOKEN, WHOLESALE_ADDRESS, WHOLESALE_MANAGER } from '../../helpers/constants';

const prisma = new PrismaClient();
/*
  REQUEST Filters on wholesales
  type(Filter)     ['Public', 'Private'] // DEFAULTS TO PUBLIC
  
  view(Filter)     ['Bounded', 'My', 'Open','Reserved','Completed','Invited'] // NO DEFAULT

  searchEntry      - 
  searchFilter 
    token                - Token Name
    wholesaleAddress     - Wholesale Address
    wholesaleManager     - Wholesale Manager
    address              - Deed Address
    all                  - Search All of Above // DEFAULTS TO ALL 

  sortName        [status,token,wholesaleAddress,wholesaleManager,deedAddress,size,endDate,timeLeft,] // NO DEFAULT
  sortDirection   ['asc','desc'] // NO DEFAULT WILL NOT RUN UNLESS sortName and sortDirection are entered correctly
  
  **Pagination**
  take  - # of records per page           
  skip  - where we start

  ===== example URLS ======
  localhost:4000/wholesales?take={10}
  localhost:4000/wholesales?take={10}&skip{10}
  localhost:4000/wholesales?take={10}&type{Private}
  localhost:4000/wholesales?take={10}&type{Private}&sortName={status}
  localhost:4000/wholesales??take={10}&type={Public}&view={Open}
  localhost:4000/wholesales?take={10}&searchEntry={ETH}                                   
  localhost:4000/wholesales?take={10}&searchEntry={ETH}&searchFilter={token}              
  localhost:4000/wholesales?take={10}&searchEntry={ETH}&searchFilter={wholesaleAddress} 
  localhost:4000/wholesales?take={10}&searchEntry={ETH}&searchFilter={token}&sortName={status}&sortDirection={asc}

 */

interface SearchObj {
  status: string | undefined;
  token: string | undefined;
  wholesaleAddress: string | undefined;
  wholesaleManager: string | undefined;
  deedAddress: string | undefined;
  size: number | undefined;
  wholesaleEndDate: string | undefined;
}

interface SortObj {
  status: Prisma.SortOrder | undefined;
  token: Prisma.SortOrder | undefined;
  wholesaleAddress: Prisma.SortOrder | undefined;
  wholesaleManager: Prisma.SortOrder | undefined; // managementAddress
  deedAddress: Prisma.SortOrder | undefined;
  size: Prisma.SortOrder | undefined;
  wholesaleEndDate: Prisma.SortOrder | undefined;
}

const handleSortingInputs = (sortObj: SortObj, sortName: string, sortDirection: Prisma.SortOrder | undefined): SortObj => {
  const newSortObj: SortObj = { ...sortObj };
  switch (sortName) {
    case STATUS:
      newSortObj.status = sortDirection;
      break;
    case TOKEN:
      newSortObj.token = sortDirection;
      break;
    case WHOLESALE_ADDRESS:
      newSortObj.wholesaleAddress = sortDirection;
      break;
    case WHOLESALE_MANAGER:
      newSortObj.wholesaleManager = sortDirection;
      break;
    case DEED_ADDRESS:
      newSortObj.deedAddress = sortDirection;
      break;
    case SIZE:
      newSortObj.size = sortDirection;
      break;
    case END_DATE:
      newSortObj.wholesaleEndDate = sortDirection;
      break;
  }

  return newSortObj;
};

const handleSearchInputs = (searchObj: SearchObj, searchFilterStr: string, searchEntryStr: string): SearchObj => {
  let newSearchObj: SearchObj = { ...searchObj };
  switch (searchFilterStr) {
    case TOKEN:
      newSearchObj.token = searchEntryStr;
      break;
    case WHOLESALE_ADDRESS:
      newSearchObj.wholesaleAddress = searchEntryStr;
      break;
    case WHOLESALE_MANAGER:
      newSearchObj.wholesaleManager = searchEntryStr;
      break;
    case DEED_ADDRESS:
      newSearchObj.deedAddress = searchEntryStr;
      break;
    default:
      newSearchObj.token = searchEntryStr;
      newSearchObj.deedAddress = searchEntryStr;
      newSearchObj.wholesaleManager = searchEntryStr;
      newSearchObj.wholesaleAddress = searchEntryStr;
      newSearchObj.status = searchEntryStr;
      newSearchObj.wholesaleEndDate = searchEntryStr;
      newSearchObj.size = !isNaN(parseInt(searchEntryStr)) ? parseInt(searchEntryStr) : undefined;
      break;
  }
  return newSearchObj;
};

export const getWholesalesV2 = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  const {
    type,
    view,
    searchEntry,
    searchFilter,
    sortName,
    sortDirection,
    take,
    skip,
    // before,
    // after,
  } = req.query;

  let searchObj: SearchObj = {
    token: undefined,
    wholesaleAddress: undefined,
    wholesaleManager: undefined,
    deedAddress: undefined,
    wholesaleEndDate: undefined,
    status: undefined,
    size: undefined,
  };

  let sortObj: SortObj = {
    status: undefined,
    token: undefined,
    wholesaleAddress: undefined,
    wholesaleManager: undefined,
    deedAddress: undefined,
    size: undefined,
    wholesaleEndDate: undefined,
  };

  // Pagination
  const takeInt: number | undefined = take && take !== undefined ? parseInt(paramSlicer(take.toString()) as string) : undefined;
  const skipInt: number | undefined = skip && skip !== undefined ? parseInt(paramSlicer(skip.toString()) as string) : undefined;

  // Public/Private Filter
  const typeStr: string | undefined = type ? CFL(paramSlicer(type.toString()) as string) : undefined;
  // View filter
  const viewStr: string | undefined = view ? paramSlicer(view.toString()) : undefined;

  // Search and Its Possible Filters
  const searchEntryStr: string | undefined = searchEntry ? paramSlicer(searchEntry.toString()) : '';
  const searchFilterStr: string | undefined = searchFilter ? paramSlicer(searchFilter.toString()) : 'all';
  searchObj = handleSearchInputs(searchObj, searchFilterStr as string, searchEntryStr as string);

  // Sorting
  const sortNameStr: string | undefined = sortName ? paramSlicer(sortName.toString()) : undefined;
  const slicedSortDir: string | undefined = sortDirection ? paramSlicer(sortDirection.toString()) : undefined;
  const sortDirectionStr: Prisma.SortOrder | undefined = slicedSortDir === 'asc' || slicedSortDir === 'desc' ? slicedSortDir : undefined;
  sortObj = handleSortingInputs(sortObj, sortNameStr as string, sortDirectionStr);

  const wholesales: Array<Wholesale> = await prisma.wholesale.findMany({
    where: {
      type: typeStr || PUB,
      status: viewStr || undefined,

      OR: [
        {
          token: { contains: searchObj.token, mode: 'insensitive' } || undefined,
        },
        {
          wholesaleAddress: { contains: searchObj.wholesaleAddress, mode: 'insensitive' } || undefined,
        },
        {
          wholesaleManager: { contains: searchObj.wholesaleManager, mode: 'insensitive' } || undefined,
        },
        {
          deedAddress: { contains: searchObj.deedAddress, mode: 'insensitive' } || undefined,
        },
        { size: searchObj.size },
        { status: { contains: searchObj.status, mode: 'insensitive' } } || undefined,

        // {
        //   wholesaleEndDate:
        //     {
        //       gte: (new Date(searchObj.wholesaleEndDate)) : undefined,
        //       lt: undefined,
        //     } || undefined,
        // },
      ],
    },
    orderBy: {
      status: sortObj.status || undefined,
      token: sortObj.token || undefined,
      wholesaleAddress: sortObj.wholesaleAddress || undefined,
      wholesaleManager: sortObj.wholesaleManager || undefined,
      deedAddress: sortObj.deedAddress || undefined,
      size: sortObj.size || undefined,
      wholesaleEndDate: sortObj.wholesaleEndDate || undefined,
    },
    take: takeInt,
    skip: skipInt,
  });

  res.json(wholesales);
};

export const getWholesales = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  if (req.query && req.query.limit) {
    try {
      const beforeCursor: number = parseInt((req.query as any).before);
      const afterCursor: number = parseInt((req.query as any).after);
      let lastCursor: number = beforeCursor | afterCursor;
      const limit: number = parseInt((req.query as any).limit);

      if (beforeCursor < limit) res.status(400).json({ error: 'Value is out of bounds.' });

      const wholesales: Array<Wholesale> =
        beforeCursor || afterCursor
          ? await prisma.wholesale.findMany({
              take: limit,
              skip: 1,
              cursor: {
                id: lastCursor,
              },
              orderBy: {
                id: beforeCursor ? 'desc' : 'asc',
              },
            })
          : await prisma.wholesale.findMany({
              take: limit,
              orderBy: {
                id: 'asc',
              },
            });

      const lastInResults: Wholesale = wholesales[limit - 1];
      lastCursor = lastInResults.id;
      res.json({
        wholesales,
        lastCursor,
      });
    } catch (err) {
      res.status(400).json({ err: err.message });
    }
  } else {
    const wholesales: Array<Wholesale> = await prisma.wholesale.findMany({});
    res.json(wholesales);
  }
};

export const getWholesale = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  const wholesaleAddress: string = req.params.wholesaleAddress;
  if (!wholesaleAddress || wholesaleAddress.length < 42) {
    return res.status(400).json('wholesale address is invalid.');
  }
  const wholesale: Wholesale | null = await prisma.wholesale.findFirst({
    where: {
      wholesaleAddress: wholesaleAddress,
    },
  });
  res.json(wholesale);
};

export const importToken = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const purchaseToken: PurchaseToken = req.body;
    const existToken = await prisma.purchaseToken.findFirst({
      where: {
        address: purchaseToken.address.toLowerCase(),
      },
    });
    if (existToken) {
      return res.status(400).send({ error: 'This token already exists.' });
    }
    if (!purchaseToken || purchaseToken === undefined) {
      return res.status(400).json({ error: `No token found in the request body... body: ${req.body}` });
    }
    if (purchaseToken) {
      await prisma.purchaseToken.create({ data: purchaseToken });
      res.status(200).json({ message: 'Token has been imported.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const importDepositToken = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const depositToken: DepositToken = req.body;
    const existToken = await prisma.depositToken.findFirst({
      where: {
        address: depositToken.address.toLowerCase(),
      },
    });
    if (existToken) {
      return res.status(400).send({ error: 'This token already exists.' });
    }
    if (!depositToken || depositToken === undefined) {
      return res.status(400).json({ error: `No token found in the request body... body: ${req.body}` });
    }
    if (depositToken) {
      await prisma.depositToken.create({ data: depositToken });
      res.status(200).json({ message: 'Token has been imported.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deletePurchaseToken = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const id: string = req.query.id as string;
    const existToken = await prisma.purchaseToken.findFirst({
      where: {
        id: Number(id),
      },
    });
    if (existToken) {
      await prisma.purchaseToken.delete({ where: { id: Number(id) } });
      res.status(200).json({ message: 'Token has been deleted.' });
    } else {
      return res.status(400).json({ error: `No token found in the request body... body: ${id}` });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteDepositToken = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const id: string = req.query.id as string;
    const existToken = await prisma.depositToken.findFirst({
      where: {
        id: Number(id),
      },
    });
    if (existToken) {
      await prisma.depositToken.delete({ where: { id: Number(id) } });
      res.status(200).json({ message: 'Token has been deleted.' });
    } else {
      return res.status(400).json({ error: `No token found in the request body... body: ${id}` });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updatePurchseToken = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const purchaseToken: PurchaseToken = req.body;
    const existToken = await prisma.purchaseToken.findFirst({
      where: {
        id: purchaseToken.id,
      },
    });
    if (existToken) {
      await prisma.purchaseToken.update({
        where: { id: purchaseToken.id },
        data: { isActive: purchaseToken.isActive },
      });
      res.status(200).json({ message: 'Token has been updated.' });
    } else {
      return res.status(400).json({ error: 'No token found in the request body.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateDepositToken = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const depositToken: DepositToken = req.body;
    const existToken = await prisma.depositToken.findFirst({
      where: {
        id: depositToken.id,
      },
    });
    if (existToken) {
      await prisma.depositToken.update({
        where: { id: depositToken.id },
        data: { isActive: depositToken.isActive },
      });
      res.status(200).json({ message: 'Token has been updated.' });
    } else {
      return res.status(400).json({ error: 'No token found in the request body.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
