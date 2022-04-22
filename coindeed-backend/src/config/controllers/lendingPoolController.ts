import { LendingPool, Prisma, PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();

export const getListLendingPools = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  const { keyword, skip, take } = req.query;

  // Pagination
  const skipInt = skip ? Number(skip) : undefined;
  const takeInt = take ? Number(take) : undefined;

  const where: Prisma.LendingPoolWhereInput | undefined = keyword ? {
    name: {
      contains: String(keyword || ''),
      mode: 'insensitive',
    },
  } : undefined;

  const data = await prisma.lendingPool.findMany({ where, skip: skipInt, take: takeInt });
  const count = await prisma.lendingPool.count({ where });

  const result = { tokens: data, length: count };

  return res.json(result);
};

export const getLendingPoolByID = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const id = req.params?.id;
    if (typeof id != 'number') return res.status(400).json({ error: 'The parameter is not a number!' });

    const data = await prisma.lendingPool.findUnique({ where: { id: Number(id) } });
    if (!data) return res.status(404).json(null);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getLendingPoolByTokenAddress = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const tokenAddress = req.params?.tokenAddress;
    if (!tokenAddress) return res.status(400).json({ error: 'You have not entered tokenAddress!' });

    const data = await prisma.lendingPool.findFirst({ where: { tokenAddress: { equals: tokenAddress, mode: 'insensitive' } } });
    if (!data) return res.status(404).json(null);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getLendingPoolByOracelTokenAddress = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const oracelTokenAddress = req.params?.oracelTokenAddress;

    const data = await prisma.lendingPool.findFirst({ where: { oracelTokenAddress: { equals: oracelTokenAddress, mode: 'insensitive' } } });
    if (!data) return res.status(404).json(null);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createPool = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const pool: LendingPool = req.body;
    if (!pool) {
      return res.status(400).json({ error: `No pool found in the request body... body: ${req.body}` });
    }
    const data = await prisma.lendingPool.create({ data: pool });
    return res.status(200).json({ message: 'Pool has been created.', data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePool = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    const pool: LendingPool = req.body;
    if (!pool) {
      return res.status(400).json({ error: `No pool found in the request body... body: ${req.body}` });
    }
    const data = await prisma.lendingPool.update({ data: pool, where: { id: pool.id } });
    return res.status(200).json({ message: 'Pool has been updated.', data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deletePool = async (req: express.Request, res: express.Response): Promise<express.Response | void> => {
  try {
    let id: number | string = req.params?.id;
    if (!id) return res.status(400).json({ error: 'You have not entered the ID!' });
    id = Number(id);

    const hasData = await prisma.lendingPool.findUnique({ where: { id } });
    if (!hasData) return res.status(404).json({ error: `No records found with id: ${id}` });

    await prisma.lendingPool.delete({ where: { id } });
    return res.status(200).json({ message: 'Pool has been deleted.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
