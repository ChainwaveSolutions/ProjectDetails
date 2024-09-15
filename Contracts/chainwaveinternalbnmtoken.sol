// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract CrossChainToken is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public operator;
    address public treasury; // Treasury address for bridge fees
    uint256 public bridgeFee = 325; // 3.25% bridge fee
    address public linkToken; // LINK token for CCIP fees
    IRouterClient public ccipRouter; // Chainlink CCIP Router

    // Mapping of allowed contracts by chain ID for minting
    mapping(uint64 => mapping(address => bool)) public allowedContractsForMinting;

    // Allowed CCIP chain IDs
    mapping(uint64 => bool) public allowedChains;

    event BridgeInitiated(address indexed sender, address indexed receiver, uint256 amount, uint64 destinationChainId, address destinationContract);
    event TokenMinted(address indexed recipient, uint256 amount);
    event TokenBurned(address indexed burner, uint256 amount);
    event OperatorChanged(address indexed newOperator);
    event TreasuryChanged(address indexed newTreasury);
    event ContractAllowed(uint64 indexed chainId, address contractAddress, bool allowed);
    event ChainAllowed(uint64 indexed chainId, bool allowed);

    modifier onlyOperatorOrOwner() {
        require(msg.sender == operator || msg.sender == owner(), "Not operator or owner");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address _ccipRouter,
        address _linkToken,
        address _treasury
    ) ERC20(name_, symbol_) Ownable(msg.sender) {  // Fixing the constructor by passing msg.sender to Ownable
        ccipRouter = IRouterClient(_ccipRouter);
        linkToken = _linkToken;
        treasury = _treasury;
    }

    // Allow the contract to accept LINK tokens for paying CCIP fees
    receive() external payable {}

    // Function to get the current LINK balance in the contract
    function getLinkBalance() external view returns (uint256) {
        return IERC20(linkToken).balanceOf(address(this));
    }

    // Admin function to withdraw any ERC20 tokens (including LINK) sent to the contract
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    // Set the operator who can mint new tokens
    function setOperator(address newOperator) external onlyOwner {
        operator = newOperator;
        emit OperatorChanged(newOperator);
    }

    // Set the treasury address for receiving bridge fees
    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
        emit TreasuryChanged(newTreasury);
    }

    // Mint tokens by owner or operator
    function mint(address to, uint256 amount) external onlyOperatorOrOwner {
        _mint(to, amount);
        emit TokenMinted(to, amount);
    }

    // Burn tokens before bridging
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokenBurned(msg.sender, amount);
    }

    // Allow or disallow contracts on specific chains for minting
    function allowContractOnChain(uint64 chainId, address contractAddress, bool allowed) external onlyOwner {
        allowedContractsForMinting[chainId][contractAddress] = allowed;
        emit ContractAllowed(chainId, contractAddress, allowed);
    }

    // Allow or disallow specific chain IDs for CCIP
    function allowChain(uint64 chainId, bool allowed) external onlyOwner {
        allowedChains[chainId] = allowed;
        emit ChainAllowed(chainId, allowed);
    }

    // Bridge tokens to another chain using CCIP, using LINK tokens held by the contract for fees
    function bridgeTokens(
        uint256 amount,
        uint64 destinationChainId,
        address receiver,
        address destinationContract
    ) external nonReentrant {
        require(allowedChains[destinationChainId], "Destination chain not allowed");
        require(allowedContractsForMinting[destinationChainId][destinationContract], "Destination contract not allowed");
        require(receiver != address(0), "Invalid receiver address");

        uint256 feeAmount = (amount * bridgeFee) / 10000; // 3.25% fee
        uint256 amountAfterFee = amount - feeAmount;

        // Burn the tokens
        _burn(msg.sender, amount);

        // Transfer the fee to the treasury
        _mint(treasury, feeAmount);

        // Declare and initialize the `tokenAmounts` array
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1); // Declare memory array with one element

        // Populate the `tokenAmounts` array
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(this),
            amount: amountAfterFee
        });

        // Prepare the cross-chain message with the receiver's address
        bytes memory data = abi.encode(receiver);
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationContract),
            data: data,
            tokenAmounts: tokenAmounts, // Use the `tokenAmounts` array
            feeToken: linkToken, // Use LINK tokens held by the contract for paying CCIP fees
            extraArgs: "" // Optional extra arguments, can be left empty
        });

        // Send the message using Chainlink CCIP router
        ccipRouter.ccipSend(destinationChainId, message);
        emit BridgeInitiated(msg.sender, receiver, amountAfterFee, destinationChainId, destinationContract);
    }

    // Receive CCIP message and mint tokens to the recipient, only from allowed contracts and chains
    function ccipReceive(Client.EVM2AnyMessage memory message) external {
        require(msg.sender == address(ccipRouter), "Unauthorized sender");

        // Decode the receiver's address and the sender's contract on the source chain
        address receiver = abi.decode(message.data, (address));

        // Assuming the correct field is `amounts`
        uint256 amount = message.tokenAmounts[0].amount;

        // Get the originating chain ID from the message (chainSelector)
        uint64 originatingChainId = uint64(bytes8(message.receiver));

        // Validate the chain ID and originating contract
        require(allowedChains[originatingChainId], "Originating chain not allowed");
        require(allowedContractsForMinting[originatingChainId][address(this)], "Sender contract not allowed");

        // Mint tokens to the receiver
        _mint(receiver, amount);
        emit TokenMinted(receiver, amount);
    }

}
