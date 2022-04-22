export interface DeedParams {
  deedSize: string;
  leverage: number;
  managementFee: number;
  minimumBuy: number;
  minimumJoin: string
}

export interface ExecutionTime {
  recruitingEndTimestamp: any;
  buyTimestamp: any;
  sellTimestamp: any;
}

export interface RiskMitigation {
  leverage: number;
  trigger: number;
  secondTrigger: number;
}

export interface BrokerConfig {
  allowed: boolean;
}

export interface CreateDeed {
  pairOfTokens: {
    tokenA: any;
    tokenB: any;
  };
  stakingAmount: string;
  wholesaleId: number;
  deedParams: DeedParams;
  executionTime: ExecutionTime;
  riskMitigation: RiskMitigation;
  brokerConfig: BrokerConfig;
}

export interface EditDeed {
  deedParams: DeedParams;
  executionTime: ExecutionTime;
  riskMitigation: RiskMitigation;
  brokerConfig: BrokerConfig;
  wholesaleId: number;
}

export type TokenFormat = {
  name: string;
  decimals: number;
  address: string;
};
