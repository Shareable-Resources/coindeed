export interface SupplyPool {
    token: string;
    APY: number;
    interestEarned: string;
    supplyBalance: number;
}

export interface LendingPool {
    token: string;
    APY: number;
    totalLiquidity: number;
}