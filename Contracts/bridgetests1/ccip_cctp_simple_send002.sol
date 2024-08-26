// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;
/*
Chainwave Solutions Incorporated
Direct USDC to eoa (wallet address) Bridging Tests ( Internal Use only not for production)

TO ADD

in frontend add usdc approve spend for contract to allow usdc spend on bridge behalf of users

fee structures as discussed in next meet up , for consideration to have minimum cost to bridge and therefore a minimum token amount to be feasible
Link tokens to be provided by team to use as payment system for bridging with ccip with approx tx for bridging of arounds 50cents per current rate aug 2024


*/
/* @cheyne_dev this contract test is for fuji first test to sepolia as per masterclass #4
*
* Directly send USDC from chain 1 to chain 2 on testnets (awaiting Mainnet access from Circle and also Chainlink )
*
* to be considered-  mapping chains or use separate contracts for chains?? I'll work on both till best option found
* if using single contracts, the source chain and destination chains to be addressed as mappings and selectable on frontend
* Using CCIP system to transfer USDC tokens across compatible Networks see list link below
* if interested to learn more or join the chainwave team please contact us at chainwavesolutions https://chainwave.tech
*/

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/utils/SafeERC20.sol";

contract TransferUSDCBasicFuji2Sepolia {
    using SafeERC20 for IERC20;

    // Link fees for CCIP and fee balances
    error NotEnoughBalanceForFees(uint256 currentBalance, uint256 calculatedFees);
    // USDC Bucket refill for circle mint on destination chain
    error NotEnoughBalanceUsdcForTransfer(uint256 currentBalance);
    // Zero Tokens to withdraw using withdraw function
    error NothingToWithdraw();

    address public owner;
    // Current router used is 1.2 as per Chainlink CCIP documentation of current active router
    IRouterClient private immutable ccipRouter;
    IERC20 private immutable linkToken;
    IERC20 private immutable usdcToken;

    // Here for the other supported network identifiers https://docs.chain.link/ccip/supported-networks/v1_2_0/testnet#avalanche-fuji

    /*
    * @cheyne_dev . This Contract uses the updated addresses for Chainlink version 1.2 updated to use the latest router address.
    * Currently hardcoded but will add mapping to edit and update as versions change.
    */
    address ccipRouterAddress = 0xF694E193200268f9a4868e4Aa017A0118C9a8177;
    // link token on source chain (mapping required to select and spend on source chain) https://docs.chain.link/resources/link-token-contracts#fuji-testnet

    /*
    * @cheyne_dev . Using Latest addresses for LINK token and USDC Coin as per documentation link below
    * link token latest address url https://docs.chain.link/resources/link-token-contracts
    * USDC coin latest addresses url https://developers.circle.com/stablecoins/docs/usdc-on-test-networks
    */
    address linkAddress = 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846;
    // https://developers.circle.com/stablecoins/docs/usdc-on-test-networks
    address usdcAddress = 0x5425890298aed601595a70AB815c96711a31Bc65;

    /*
    * @cheyne_dev. Currently using updated destination address as per the latest version 1.2 addresses and network chain select url below
    * https://docs.chain.link/ccip/supported-networks/v1_2_0/testnet#ethereum-sepolia
    */
    uint64 destinationChainSelector = 16015286601757825753;

    /*
    * all message data with CCIP is now sent as bytes and CCIP system using non-byte32 is to be converted with frontend
    * data has to now be sent as bytes as per Chainlink CCIP and Circle CCTP specifications
    */
    event UsdcTransferred(
        bytes32 messageId,
        uint64 destinationChainSelector,
        address receiver,
        uint256 amount,
        uint256 ccipFee
    );

    constructor() {
        owner = msg.sender;
        ccipRouter = IRouterClient(ccipRouterAddress);
        linkToken = IERC20(linkAddress);
        usdcToken = IERC20(usdcAddress);
    }

   // Single test function to tx usdc funds from chain 1 to chain 2
    function transferUsdcToSepolia(
        address _receiver,
        uint256 _amount
    )
        external
        returns (bytes32 messageId)
    {
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        Client.EVMTokenAmount memory tokenAmount = Client.EVMTokenAmount({
            token: address(usdcToken),
            amount: _amount
        });
        tokenAmounts[0] = tokenAmount;

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 0})
            ),
            feeToken: address(linkToken)
        });

        uint256 ccipFee = ccipRouter.getFee(
            destinationChainSelector,
            message
        );

        if (ccipFee > linkToken.balanceOf(address(this)))
            revert NotEnoughBalanceForFees(linkToken.balanceOf(address(this)), ccipFee);
        linkToken.approve(address(ccipRouter), ccipFee);

        if (_amount > usdcToken.balanceOf(msg.sender))
            revert NotEnoughBalanceUsdcForTransfer(usdcToken.balanceOf(msg.sender));
        usdcToken.safeTransferFrom(msg.sender, address(this), _amount);
        usdcToken.approve(address(ccipRouter), _amount);

        // Send CCIP Message to chainlink explorer and finally to destination chain
        messageId = ccipRouter.ccipSend(destinationChainSelector, message);

        emit UsdcTransferred(
            messageId,
            destinationChainSelector,
            _receiver,
            _amount,
            ccipFee
        );
    }

    function allowanceUsdc() public view returns (uint256 usdcAmount) {
        usdcAmount = usdcToken.allowance(msg.sender, address(this));
    }

    function balancesOf(address account) public view returns (uint256 linkBalance, uint256 usdcBalance) {
        linkBalance =  linkToken.balanceOf(account);
        usdcBalance = IERC20(usdcToken).balanceOf(account);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Manually remove stuck tokens and transfer them from this contract back to the original source
    function withdrawToken(
        address _beneficiary,
        address _token
    ) public onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));
        if (amount == 0) revert NothingToWithdraw();
        IERC20(_token).transfer(_beneficiary, amount);
    }
}
