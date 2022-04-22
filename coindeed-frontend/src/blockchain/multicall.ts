
import { ethers } from 'ethers'
import { genMulticalContract } from './instance'

export const multicall = async (abi: any[], calls: any[]) => {
  const multi = await genMulticalContract()
  const itf = new ethers.utils.Interface(abi)

  const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
  const { returnData } = await multi.aggregate(calldata)
  const res = returnData.map((call: any, i: any) => itf.decodeFunctionResult(calls[i].name, call))

  return res
}