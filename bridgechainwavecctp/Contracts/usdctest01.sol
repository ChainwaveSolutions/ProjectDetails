// SPDX-License-Identifier: MIT

/*
12/SEP/2024
Chainwave Solutions Incorporated
Direct USDC to EOA (wallet address) Bridging Tests (Internal Use only, not for production)

This contract allows users to transfer USDC between chains using Chainlink's CCIP system.

fuji:
   Router: 0xF694E193200268f9a4868e4Aa017A0118C9a8177
   Link token: 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846
   USDC: 0x5425890298aed601595a70AB815c96711a31Bc65

dev addy temp: 0x18Ff7f454B6A3233113f51030384F49054DD27BF

   Destination chain selectors:
   Sepolia ETH: 16015286601757825753
*/

pragma solidity ^0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/utils/SafeERC20.sol";

contract chosetosendusdc {
    using SafeERC20 for IERC20;

    // Custom errors
    error NotEnoughBalanceForFees(uint256 currentBalance, uint256 calculatedFees);
    error NotEnoughBalanceUsdcForTransfer(uint256 currentBalance);
    error NothingToWithdraw();
    error ChainConfigNotFound(uint256 chainId);

    address public owner;

    // Chain configuration struct
    struct ChainConfig {
        address router;
        address linkToken;
        address usdcToken;
        uint64 destinationChainSelector;
    }

    // Mapping of chain IDs to ChainConfig
    mapping(uint256 => ChainConfig) public chainConfigs;

    event ChainConfigAdded(uint256 chainId, address router, address linkToken, address usdcToken, uint64 destinationChainSelector);
    event UsdcTransferred(
        bytes32 messageId,
        uint64 destinationChainSelector,
        address receiver,
        uint256 amount,
        uint256 ccipFee
    );

    constructor() {
        owner = msg.sender;
    }

    // Function to add or update chain configuration
    function addOrUpdateChainConfig(
        uint256 chainId,
        address _router,
        address _linkToken,
        address _usdcToken,
        uint64 _destinationChainSelector
    ) external onlyOwner {
        chainConfigs[chainId] = ChainConfig({
            router: _router,
            linkToken: _linkToken,
            usdcToken: _usdcToken,
            destinationChainSelector: _destinationChainSelector
        });

        emit ChainConfigAdded(chainId, _router, _linkToken, _usdcToken, _destinationChainSelector);
    }

    // Fetch chain configuration by chain ID
    function getChainConfig(uint256 chainId) public view returns (ChainConfig memory) {
        ChainConfig memory config = chainConfigs[chainId];
        if (config.router == address(0)) revert ChainConfigNotFound(chainId);
        return config;
    }

    // Transfer USDC to a destination chain using the stored chain configuration
    function transferUsdc(
        uint256 chainId, // The chain ID to use for transfer (maps to the stored ChainConfig)
        address _receiver,
        uint256 _amount
    ) external returns (bytes32 messageId) {
        ChainConfig memory config = getChainConfig(chainId);

        IRouterClient ccipRouter = IRouterClient(config.router);
        IERC20 linkToken = IERC20(config.linkToken);
        IERC20 usdcToken = IERC20(config.usdcToken);

        // Prepare the token amounts array with one element (the USDC amount)
        Client.EVMTokenAmount;

        // Create a token amount for USDC
        Client.EVMTokenAmount memory tokenAmount = Client.EVMTokenAmount({
            token: address(usdcToken),
            amount: _amount
        });



        // Assign the token amount to the first position in the array
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
            tokenAmounts[0] = tokenAmount;

        // Create the message to be sent via CCIP
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})),
            feeToken: address(linkToken)
        });

        // Calculate the CCIP fee
        uint256 ccipFee = ccipRouter.getFee(config.destinationChainSelector, message);

        // Ensure the contract has enough LINK tokens to cover the fee
        if (ccipFee > linkToken.balanceOf(address(this))) {
            revert NotEnoughBalanceForFees(linkToken.balanceOf(address(this)), ccipFee);
        }

        // Approve LINK tokens for CCIP fee payment
        linkToken.approve(address(ccipRouter), ccipFee);

        // Ensure the user has enough USDC tokens for the transfer
        if (_amount > usdcToken.balanceOf(msg.sender)) {
            revert NotEnoughBalanceUsdcForTransfer(usdcToken.balanceOf(msg.sender));
        }

        // Transfer USDC from the user to the contract and approve for CCIP transfer
        usdcToken.safeTransferFrom(msg.sender, address(this), _amount);
        usdcToken.approve(address(ccipRouter), _amount);

        // Send CCIP message to Chainlink and then to the destination chain
        messageId = ccipRouter.ccipSend(config.destinationChainSelector, message);

        // Emit the event for the transfer
        emit UsdcTransferred(messageId, config.destinationChainSelector, _receiver, _amount, ccipFee);
    }

    // **New Read Function**: Get full details of a chain mapping
    function readChainConfig(uint256 chainId)
        public
        view
        returns (
            address router,
            address linkToken,
            address usdcToken,
            uint64 destinationChainSelector
        )
    {
        ChainConfig memory config = getChainConfig(chainId);
        return (
            config.router,
            config.linkToken,
            config.usdcToken,
            config.destinationChainSelector
        );
    }

    function allowanceUsdc(address _usdcToken) public view returns (uint256 usdcAmount) {
        IERC20 usdcToken = IERC20(_usdcToken);
        usdcAmount = usdcToken.allowance(msg.sender, address(this));
    }

    function balancesOf(address _linkToken, address _usdcToken, address account) public view returns (uint256 linkBalance, uint256 usdcBalance) {
        IERC20 linkToken = IERC20(_linkToken);
        IERC20 usdcToken = IERC20(_usdcToken);
        linkBalance = linkToken.balanceOf(account);
        usdcBalance = usdcToken.balanceOf(account);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Manually remove stuck tokens and transfer them from this contract back to the original source
    function withdrawToken(address _beneficiary, address _token) public onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));
        if (amount == 0) revert NothingToWithdraw();
        IERC20(_token).transfer(_beneficiary, amount);
    }
}
