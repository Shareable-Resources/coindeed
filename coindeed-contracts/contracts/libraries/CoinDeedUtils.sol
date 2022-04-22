// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interface/ICoinDeed.sol";
import "../interface/ILendingPool.sol";
import "../interface/ICoinDeedAddressesProvider.sol";

library CoinDeedUtils {
    uint256 public constant BASE_DENOMINATOR = 10_000;

    function cancelCheck(
        ICoinDeed.DeedState state,
        ICoinDeed.ExecutionTime memory executionTime,
        ICoinDeed.DeedParameters memory deedParameters,
        uint256 totalSupply,
        uint256 totalStake,
        uint256 stakeManager,
        bool isDeedReady
    ) external view returns (bool) {

        if (
            state == ICoinDeed.DeedState.SETUP 
        )
        {
            if (totalStake - stakeManager == 0) {
                return true;
            }
            else if (
                !isDeedReady &&
                block.timestamp > executionTime.recruitingEndTimestamp
            ) 
            {
                return true;
            }
            else {
                return false;
            }

        }
        else if (
            totalSupply < deedParameters.deedSize * deedParameters.minimumBuy / BASE_DENOMINATOR / deedParameters.leverage &&
            block.timestamp > executionTime.buyTimestamp
        )
        {
            return true;
        }
        else {
            return false;
        }
    }

    function withdrawStakeCheck(
        ICoinDeed.DeedState state,
        ICoinDeed.ExecutionTime memory executionTime,
        uint256 stake,
        bool isManager
    ) external view returns (bool) {
        require(
            state != ICoinDeed.DeedState.READY &&
            state != ICoinDeed.DeedState.OPEN,
            "Deed is not in correct state"
        );
        require(stake > 0, "No stake");
        require(
            state == ICoinDeed.DeedState.CLOSED ||
            !isManager,
            "Can not withdraw your stake."
        );
        require(
            state != ICoinDeed.DeedState.SETUP ||
            executionTime.recruitingEndTimestamp < block.timestamp,
            "Recruiting did not end."
        );
        return true;
    }


    function getClaimAmount(
        ICoinDeed.DeedState state,
        address tokenA,
        uint256 totalSupply,
        uint256 totalManagementFee,
        uint256 buyIn
    ) external view returns (uint256 claimAmount)
    {
        require(buyIn > 0, "No share.");
        uint256 balance;
        // Get balance. Assuming delegate call as a library function
        if (tokenA == address(0x00)) {
            balance = address(this).balance;
        }
        else {
            balance = IERC20(tokenA).balanceOf(address(this)) - totalManagementFee;
        }

        // Assign claim amount
        if (state == ICoinDeed.DeedState.CLOSED) {
            // buyer can claim tokenA in the same proportion as their buyins
            claimAmount = balance * buyIn / (totalSupply);
            // just a sanity check in case division rounds up
            if (claimAmount > balance) {
                claimAmount = balance;
            }
        } else {
            // buyer can claim tokenA back
            claimAmount = buyIn;
        }
        return claimAmount;
    }
}