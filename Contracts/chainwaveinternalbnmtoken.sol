// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*

fuji
-
contract: 0x8bCfdFBa1541f8F449ef9EC9c0dEFC57cF483069
chainselector: 14767482510784806043
router: 0xF694E193200268f9a4868e4Aa017A0118C9a8177
link: 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846

base
-
contract: 0xD3C3dE07521a35fF1bC69CC2fc070fBdDf647F24
chainselector: 10344971235874465080
router: 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93
link: 0xE4aB69C077896252FAFBD49EFD26B5D171A32410

*/

// Chainlink CCIP Imports
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BNMToken is ERC20Burnable, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Roles for access control
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CCIP_SENDER_ROLE = keccak256("CCIP_SENDER_ROLE");

    // LINK token address and CCIP Router for cross-chain communication
    IERC20 public linkToken;
    IRouterClient public ccipRouter;

    // Treasury address for collecting the 4% fee
    address public treasuryAddress;

    // Unified allowed contracts mapping (chainId => contractAddress => allowed)
    mapping(uint64 => mapping(address => bool)) public allowedContracts;

    // Store allowed destination chains in an array for easy reading
    uint64[] public allowedDestinationChains;

    // Fee percentage (3.25%)
    uint256 public constant FEE_PERCENTAGE = 325; // Representing 3.25%

    // Events for monitoring activities
    event TokensBurnt(address indexed sender, uint256 amount, uint64 destinationChainId, bytes32 messageId);
    event TokensMinted(address indexed receiver, uint256 amount, uint64 sourceChainId, bytes32 messageId);
    event FeeCollected(address indexed treasury, uint256 amount);
    event LinkDeposited(address indexed sender, uint256 amount);
    event LinkWithdrawn(address indexed receiver, uint256 amount);
    event EstimatedFeeLogged(uint256 estimatedFee); // New event for logging the estimated fee

    constructor(address _ccipRouter, address _linkToken, address _treasuryAddress) ERC20("BNMToken", "BNM") {
        // Grant roles to the deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(CCIP_SENDER_ROLE, msg.sender);

        ccipRouter = IRouterClient(_ccipRouter);
        linkToken = IERC20(_linkToken);
        treasuryAddress = _treasuryAddress;
    }

    // Set the treasury address
    function setTreasuryAddress(address _treasuryAddress) external onlyRole(ADMIN_ROLE) {
        treasuryAddress = _treasuryAddress;
    }

    // Admin mint function to mint tokens for liquidity, distribution, or any other purpose
    function mint(address to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
    }

    // Unified function to allow or disallow contracts on a specific chain (both source and destination)
    function setAllowedContract(uint64 chainId, address contractAddress, bool allowed) external onlyRole(ADMIN_ROLE) {
        allowedContracts[chainId][contractAddress] = allowed;

        // Add the chainId to the allowedDestinationChains array if it's newly allowed and not already added
        if (allowed && !isChainInAllowedList(chainId)) {
            allowedDestinationChains.push(chainId);
        }
    }

    // Function to check if a chainId is already in the allowed list
    function isChainInAllowedList(uint64 chainId) internal view returns (bool) {
        for (uint256 i = 0; i < allowedDestinationChains.length; i++) {
            if (allowedDestinationChains[i] == chainId) {
                return true;
            }
        }
        return false;
    }

    // Deposit LINK tokens into the contract to pay for CCIP fees
    function depositLink(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        linkToken.safeTransferFrom(msg.sender, address(this), amount);
        emit LinkDeposited(msg.sender, amount);
    }

    // Withdraw LINK tokens from the contract (only for admin)
    function withdrawLink(uint256 amount) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(linkToken.balanceOf(address(this)) >= amount, "Insufficient LINK balance");
        linkToken.safeTransfer(msg.sender, amount);
        emit LinkWithdrawn(msg.sender, amount);
    }

    // Cross-chain token transfer using CCIP with 3.25% fee and dynamic destination contract
    function sendToChain(
        uint64 destinationChainId,
        address receiverAddress,
        address destinationContract,  // Dynamic destination contract address
        uint256 amount
    ) external nonReentrant onlyRole(CCIP_SENDER_ROLE) {
        require(allowedContracts[destinationChainId][destinationContract], "Destination contract not allowed");
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");

        // Calculate the 3.25% fee and the net amount to send
        uint256 feeAmount = (amount * FEE_PERCENTAGE) / 10000;  // 3.25% fee calculation
        uint256 netAmount = amount - feeAmount;

        // Send the fee to the treasury address
        _transfer(msg.sender, treasuryAddress, feeAmount);
        emit FeeCollected(treasuryAddress, feeAmount);

        // Burn the net amount of tokens on the source chain
        _burn(msg.sender, netAmount);
        emit TokensBurnt(msg.sender, netAmount, destinationChainId, keccak256(abi.encodePacked(block.timestamp, msg.sender, receiverAddress, netAmount)));

        // Create the CCIP message (Client.EVMTokenAmount[] array)
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(this),
            amount: netAmount
        });

        // Create the CCIP message (Client.EVM2AnyMessage)
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationContract), // Specify destination contract address
            data: abi.encode(receiverAddress),          // The receiver address on the destination chain
            tokenAmounts: tokenAmounts,
            feeToken: address(linkToken),
            extraArgs: ""
        });

        // Estimate the LINK fee required and log it
        uint256 estimatedFee = estimateCCIPFee(destinationChainId, message);
        emit EstimatedFeeLogged(estimatedFee); // Log the estimated fee

        require(linkToken.balanceOf(address(this)) >= estimatedFee, "Insufficient LINK tokens for CCIP fee");

        // Approve LINK tokens for CCIP Router
        linkToken.safeApprove(address(ccipRouter), estimatedFee);

        // Send the cross-chain message using CCIP and pay the fee in LINK tokens
        ccipRouter.ccipSend(destinationChainId, message);

        // After sending the message, reset the approval to 0 to prevent over-approval issues
        linkToken.safeApprove(address(ccipRouter), 0);
    }

    // Estimate CCIP fee based on the destination chain and message structure
    function estimateCCIPFee(uint64 destinationChainId, Client.EVM2AnyMessage memory message) public view returns (uint256) {
        return ccipRouter.getFee(destinationChainId, message);
    }

    // Handle incoming CCIP messages to mint tokens on the destination chain
    function ccipReceive(
        uint64 sourceChainId,
        bytes calldata sender,
        bytes calldata data
    ) external nonReentrant {
        require(msg.sender == address(ccipRouter), "Unauthorized sender");

        // Ensure the sender contract is allowed on the source chain
        address sourceContract = abi.decode(sender, (address));
        require(allowedContracts[sourceChainId][sourceContract], "Source contract not allowed");

        // Decode the payload to get receiver address and amount
        (address receiverAddress, uint256 netAmount) = abi.decode(data, (address, uint256));

        // Mint tokens to the receiver on the destination chain
        _mint(receiverAddress, netAmount);
        emit TokensMinted(receiverAddress, netAmount, sourceChainId, keccak256(abi.encodePacked(block.timestamp, sender, receiverAddress, netAmount)));
    }
}
