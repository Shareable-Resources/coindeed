import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();

// Added pagination. URL will look like deeds?limit=10&before=20 or dees?limit=10&after=10
export const getDeeds = async (req: express.Request, res: express.Response) => {
  if (req.query && req.query.limit) {
    try {
      const beforeCursor = parseInt(req.query.before as string);
      const afterCursor = parseInt(req.query.after as string);
      let lastCursor = beforeCursor | afterCursor;
      const limit = parseInt(req.query.limit as string);

      // added the size of db here for error handling
      const numberOfDeeds = await prisma.deed.count();
      if (limit && (beforeCursor || afterCursor)) {
        if (beforeCursor < limit || limit + afterCursor > numberOfDeeds) return res.status(400).json({ error: 'Value is out of bounds.' });
      }

      const deeds =
        beforeCursor || afterCursor
          ? await prisma.deed.findMany({
              take: limit,
              skip: 1,
              cursor: {
                id: lastCursor,
              },
              orderBy: {
                id: beforeCursor ? 'desc' : 'asc',
              },
            })
          : await prisma.deed.findMany({
              take: limit,
              orderBy: {
                id: 'asc',
              },
            });

      const lastInResults = deeds[limit - 1];
      lastCursor = lastInResults.id;
      res.json({
        deeds,
        numberOfDeeds,
        lastCursor,
      });
    } catch (err) {
      res.status(400).json({ err: err.message });
    }
  } else {
    const deeds = await prisma.deed.findMany({});
    res.json(deeds);
  }
};

export const getDeed = async (req: express.Request, res: express.Response) => {
  const deedAddress = req.params.deedAddress;
  if (!deedAddress || deedAddress.length < 42) {
    return res.status(400).json('Deed address is invalid.');
  }
  const deed = await prisma.deed.findFirst({
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
export const getFilteredDeeds = async (req: express.Request, res: express.Response) => {
  if (req.query) {
    const { actionType, type, status, loanLeverage } = req.query as any;
    const results: any[] = [];

    if (actionType && !type && !status && !loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          actionType: {
            equals: actionType,
          },
        },
      });
      results.push(filteredDeeds);
    }
    if (!actionType && type && !status && !loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          type: {
            equals: type,
          },
        },
      });
      results.push(filteredDeeds);
    }
    if (!actionType && !type && status && !loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          status: {
            equals: status,
          },
        },
      });
      results.push(filteredDeeds);
    }
    if (!actionType && !type && !status && loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          loanLeverage: {
            gte: parseInt(loanLeverage),
            lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
          },
        },
      });
      results.push(filteredDeeds);
    }
    if (actionType && type && !status && !loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              actionType: {
                equals: actionType,
              },
            },
            {
              type: {
                equals: type,
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (actionType && !type && status && !loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              actionType: {
                equals: actionType,
              },
            },
            {
              status: {
                equals: status,
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (actionType && !type && !status && loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              actionType: {
                equals: actionType,
              },
            },
            {
              loanLeverage: {
                gte: parseInt(loanLeverage),
                lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (!actionType && type && status && !loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              type: {
                equals: type,
              },
            },
            {
              status: {
                equals: status,
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (actionType && type && status && !loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              actionType: {
                equals: actionType,
              },
            },
            {
              type: {
                equals: type,
              },
            },
            {
              status: {
                equals: status,
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (!actionType && type && status && loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              type: {
                equals: type,
              },
            },
            {
              status: {
                equals: status,
              },
            },
            {
              loanLeverage: {
                gte: parseInt(loanLeverage),
                lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (!actionType && !type && status && loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              status: {
                equals: status,
              },
            },
            {
              loanLeverage: {
                gte: parseInt(loanLeverage),
                lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (!actionType && type && !status && loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              type: {
                equals: type,
              },
            },
            {
              loanLeverage: {
                gte: parseInt(loanLeverage),
                lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (actionType && type && !status && loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              actionType: {
                equals: actionType,
              },
            },
            {
              type: {
                equals: type,
              },
            },
            {
              loanLeverage: {
                gte: parseInt(loanLeverage),
                lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (actionType && !type && status && loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              actionType: {
                equals: actionType,
              },
            },
            {
              status: {
                equals: status,
              },
            },
            {
              loanLeverage: {
                gte: parseInt(loanLeverage),
                lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (actionType && type && status && loanLeverage) {
      const filteredDeeds = await prisma.deed.findMany({
        where: {
          AND: [
            {
              actionType: {
                equals: actionType,
              },
            },
            {
              type: {
                equals: type,
              },
            },
            {
              status: {
                equals: status,
              },
            },
            {
              loanLeverage: {
                gte: parseInt(loanLeverage),
                lt: parseInt(loanLeverage) + (loanLeverage == 11 ? 10 : 5),
              },
            },
          ],
        },
      });
      results.push(filteredDeeds);
    }
    if (results.length === 0) res.json({ message: 'No Matching Deed.' });
    res.status(200).json(results);
  }
};

export const createDeed = async (req: express.Request, res: express.Response) => {
  try {
    const deed = req.body;
    if (deed) {
      await prisma.deed.create({ data: deed });
      res.status(200).json({ message: 'Deed has been created.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateDeed = async (req: express.Request, res: express.Response) => {
  try {
    const updatedDeedId = req.body?.id;
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

// // deeds/search?pair=ETH or deeds/search?deedManager=23fjsklerjksjerkl1j1ljfklfskjd or deeds/search?deedAddress=jkflskdjfsadl342
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

// deeds/sorted?sort=status&order=asc
export const getSortedDeeds = async (req: express.Request, res: express.Response) => {
  const { sort, order } = req.query;
  // console.log('sort is ', sort);
  const sortedItem =
    sort === 'pair'
      ? 'coinAName'
      : sort === 'deedType'
      ? 'type'
      : sort === 'leverage'
      ? 'loanLeverage'
      : sort === 'progress'
      ? 'sizeConsumed'
      : sort === 'management'
      ? 'deedManagerAddress'
      : sort === 'timeLeft'
      ? 'deedEndDate'
      : sort === 'duration'
      ? 'published'
      : sort; // just so the names in URL matche those in DB
  const sortingOrder: string = (order as string) || 'asc';
  let sortedResults;
  if (sortedItem && sortingOrder) {
    sortedResults = await prisma.deed.findMany({
      orderBy: {
        [sortedItem as string]: sortingOrder,
      },
    });
  }
  res.status(200).json(sortedResults);
};
// will need to figure out how to calculate profit/loss later
export default prisma;
