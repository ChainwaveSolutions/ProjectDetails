# Chainwave Solutions Burn and Mint Token

Chainwave Solutions presents the **Burn and Mint Token**, a robust cross-chain ERC20 token designed to leverage Chainlink's Cross-Chain Interoperability Protocol (CCIP) for seamless token transfers across multiple blockchains. This token model ensures security, flexibility, and scalability, making it ideal for decentralized applications that require cross-chain asset interoperability.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Contract Overview](#contract-overview)
- [Deployment](#deployment)
  - [Setting Up the Environment](#setting-up-the-environment)
  - [Deploying on Chain A](#deploying-on-chain-a)
  - [Deploying on Chain B](#deploying-on-chain-b)
- [Configuration](#configuration)
  - [Assigning Roles](#assigning-roles)
  - [Setting Allowed Chains and Contracts](#setting-allowed-chains-and-contracts)
- [Usage](#usage)
  - [Minting Tokens](#minting-tokens)
  - [Burning Tokens](#burning-tokens)
  - [Cross-Chain Transfers](#cross-chain-transfers)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

- **Burn and Mint Mechanism:** Tokens are burned on the source chain and minted on the destination chain, maintaining total supply across chains.
- **Cross-Chain Compatibility:** Utilizes Chainlink's CCIP for secure and reliable cross-chain messaging.
- **Access Control:** Granular role-based access control using OpenZeppelin's `AccessControl`, including roles like `ADMIN_ROLE`, `OPERATOR_ROLE`, and `CCIP_SENDER_ROLE`.
- **Allowed Chains and Contracts:** Only specified chains and contracts can interact with the token, enhancing security.
- **Reentrancy Protection:** Employs OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks.
- **Token Recovery:** Ability to recover ERC20 tokens mistakenly sent to the contract.
- **Operator Functions:** Operators can mint and burn tokens based on interactions with third-party contracts, useful for maintaining token peg or integrating with other protocols.
- **Event Emissions:** Comprehensive events emitted for all critical actions to facilitate off-chain tracking and auditing.

---

## Prerequisites

- **Node.js and npm:** Ensure you have Node.js and npm installed.
- **Solidity Compiler:** Version 0.8.0 or later.
- **Metamask Wallet:** Set up with accounts on both chains.
- **Testnet Funds:** Acquire testnet Ether or the native currency for both chains to cover deployment and transaction fees.
- **Chainlink CCIP Support:** Both chains must support Chainlink's CCIP.

---

## Installation

Clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/chainwave-solutions/burn-and-mint-token.git
cd burn-and-mint-token
npm install @openzeppelin/contracts
npm install @chainlink/contracts-ccip
```

---

## Contract Overview

Below is the full Solidity code for the Chainwave Solutions Burn and Mint Token. This contract incorporates all the features mentioned above.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// OpenZeppelin Contracts
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// Chainlink CCIP Interfaces
import "@chainlink/contracts-ccip/src/v0.8/interfaces/ICrossChainMessageReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/CCIPClient.sol";

contract BurnMintToken is ERC20, AccessControl, ReentrancyGuard, ICrossChainMessageReceiver {
    using SafeERC20 for IERC20;

    // Roles for access control
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant CCIP_SENDER_ROLE = keccak256("CCIP_SENDER_ROLE");

    // Mapping of burnt and minted tokens per user
    mapping(address => uint256) public burntTokens;
    mapping(address => uint256) public mintedTokens;

    // CCIP Client for cross-chain communication
    CCIPClient public ccipClient;

    // Allowed destination chains for cross-chain transfers
    mapping(uint64 => bool) public allowedChains;

    // Allowed contracts for minting and burning per source chain
    mapping(uint64 => mapping(bytes => bool)) public allowedContracts;

    // Events for monitoring activities
    event TokensSent(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint64 destinationChainId,
        bytes32 messageId
    );
    event TokensReceived(
        address indexed receiver,
        uint256 amount,
        uint64 sourceChainId,
        bytes32 messageId
    );
    event TransferRefunded(address indexed sender, uint256 amount, bytes32 messageId);
    event MessageFailed(address indexed sender, uint256 amount, bytes32 messageId, bytes reason);
    event BurntTokens(address indexed account, uint256 amount);
    event MintedTokens(address indexed account, uint256 amount);

    constructor(address _ccipClient) ERC20("ChainwaveToken", "CWT") {
        // Grant the deployer the default admin role
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        // Set the CCIP client address
        ccipClient = CCIPClient(_ccipClient);
    }

    // Owner mint function for initial token distribution
    function ownerMint(address to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
        mintedTokens[to] += amount;
        emit MintedTokens(to, amount);
    }

    // Operator mint function based on third-party contracts
    function operatorMint(address to, uint256 amount) external onlyRole(OPERATOR_ROLE) {
        require(allowedContracts[0][abi.encode(msg.sender)], "Contract not allowed");
        _mint(to, amount);
        mintedTokens[to] += amount;
        emit MintedTokens(to, amount);
    }

    // Operator burn function based on third-party contracts
    function operatorBurn(address from, uint256 amount) external onlyRole(OPERATOR_ROLE) {
        require(allowedContracts[0][abi.encode(msg.sender)], "Contract not allowed");
        _burn(from, amount);
        burntTokens[from] += amount;
        emit BurntTokens(from, amount);
    }

    // User burn function to reduce total supply
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        burntTokens[msg.sender] += amount;
        emit BurntTokens(msg.sender, amount);
    }

    // Cross-chain token transfer using CCIP
    function sendToChain(
        uint64 destinationChainId,
        address receiverAddress,
        uint256 amount,
        uint256 gasLimit
    ) external payable nonReentrant onlyRole(CCIP_SENDER_ROLE) {
        require(allowedChains[destinationChainId], "Destination chain not allowed");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Burn tokens on the source chain
        _burn(msg.sender, amount);
        burntTokens[msg.sender] += amount;
        emit BurntTokens(msg.sender, amount);

        // Prepare the payload for CCIP
        bytes memory payload = abi.encode(receiverAddress, amount);

        // Generate a unique message ID for tracking
        bytes32 messageId = keccak256(abi.encodePacked(msg.sender, receiverAddress, amount, block.timestamp));

        // Send the cross-chain message
        ccipClient.sendMessage{value: msg.value}(
            destinationChainId,
            payload,
            gasLimit
        );

        emit TokensSent(msg.sender, receiverAddress, amount, destinationChainId, messageId);
    }

    // Handle incoming CCIP messages to mint tokens on the destination chain
    function ccipReceive(
        uint64 sourceChainId,
        bytes calldata sender,
        bytes calldata data
    ) external override nonReentrant {
        require(msg.sender == address(ccipClient), "Unauthorized sender");
        require(allowedChains[sourceChainId], "Source chain not allowed");
        require(allowedContracts[sourceChainId][sender], "Sender contract not allowed");

        // Decode the payload to get receiver address and amount
        (address receiverAddress, uint256 amount) = abi.decode(data, (address, uint256));

        // Mint tokens to the receiver on the destination chain
        _mint(receiverAddress, amount);
        mintedTokens[receiverAddress] += amount;
        emit MintedTokens(receiverAddress, amount);

        // Generate a unique message ID for tracking
        bytes32 messageId = keccak256(abi.encodePacked(sender, receiverAddress, amount, block.timestamp));

        emit TokensReceived(receiverAddress, amount, sourceChainId, messageId);
    }

    // Set allowed destination chains for cross-chain transfers
    function setAllowedChain(uint64 chainId, bool allowed) external onlyRole(ADMIN_ROLE) {
        allowedChains[chainId] = allowed;
    }

    // Set allowed contracts that can interact via CCIP per source chain
    function setAllowedContract(
        uint64 chainId,
        bytes calldata contractAddress,
        bool allowed
    ) external onlyRole(ADMIN_ROLE) {
        allowedContracts[chainId][contractAddress] = allowed;
    }

    // Update the CCIP client address
    function setCCIPClient(address _ccipClient) external onlyRole(ADMIN_ROLE) {
        ccipClient = CCIPClient(_ccipClient);
    }

    // Recover ERC20 tokens mistakenly sent to this contract
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyRole(ADMIN_ROLE) {
        require(tokenAddress != address(this), "Cannot recover own tokens");
        IERC20(tokenAddress).safeTransfer(msg.sender, tokenAmount);
    }

    // Override transfer function with reentrancy protection
    function _transfer(address sender, address recipient, uint256 amount) internal override nonReentrant {
        super._transfer(sender, recipient, amount);
    }
}
```

---

## Deployment

### Setting Up the Environment

1. **Open Remix IDE:**

   - Access [Remix Online IDE](https://remix.ethereum.org/) in your web browser.

2. **Install Necessary Plugins:**

   - Ensure the following plugins are activated:
     - **File Explorers**
     - **Solidity Compiler**
     - **Deploy & Run Transactions**

3. **Connect Metamask:**

   - In the **"Deploy & Run Transactions"** tab, set **Environment** to **Injected Web3**.
   - Connect your Metamask wallet when prompted.

### Deploying on Chain A

1. **Switch to Chain A in Metamask:**

   - Select the desired network representing Chain A.

2. **Create and Compile the Contract:**

   - Create a new file `BurnMintToken.sol` in Remix and paste the contract code.
   - Set the compiler version to `0.8.0` and compile.

3. **Deploy the Contract:**

   - In the **"Deploy & Run Transactions"** tab, select the `BurnMintToken` contract.
   - Provide the CCIP client address for Chain A in the constructor parameter `_ccipClient`.
   - Click **"Transact"** and confirm the transaction in Metamask.
   - Save the deployed contract address as `ContractAAddress`.

### Deploying on Chain B

Repeat the steps for Chain A, but switch Metamask to Chain B and use the CCIP client address for Chain B. Save the deployed contract address as `ContractBAddress`.

---

## Configuration

### Assigning Roles

1. **ADMIN_ROLE:**

   - Automatically assigned to the deployer.
   - Has permission to set allowed chains, contracts, and perform administrative functions.

2. **OPERATOR_ROLE:**

   - Assign to addresses that will interact with operator functions.
   - Use the `grantRole` function with the role hash and the operator's address.

3. **CCIP_SENDER_ROLE:**

   - Assign to addresses allowed to initiate cross-chain transfers.
   - Use the `grantRole` function similarly.

**Computing Role Hashes:**

Use Remix's console or any Keccak256 hash tool:

```javascript
web3.utils.keccak256("OPERATOR_ROLE")
// Example output: "0x..."

web3.utils.keccak256("CCIP_SENDER_ROLE")
// Example output: "0x..."
```

### Setting Allowed Chains and Contracts

1. **Set Allowed Chains:**

   - Use the `setAllowedChain` function.
   - Input the chain ID (CCIP chain selector) and set `allowed` to `true`.

2. **Set Allowed Contracts:**

   - Use the `setAllowedContract` function.
   - Input the chain ID, the bytes representation of the contract address, and set `allowed` to `true`.

**Example:**

```solidity
// On Chain B, allow ContractAAddress from Chain A
setAllowedContract(chainIdOfChainA, abi.encodePacked(ContractAAddress), true);
```

---

## Usage

### Minting Tokens

#### Owner Mint (Initial Distribution)

- **Function:** `ownerMint(address to, uint256 amount)`
- **Access:** `ADMIN_ROLE`
- **Purpose:** Mint tokens for initial distribution.

#### Operator Mint

- **Function:** `operatorMint(address to, uint256 amount)`
- **Access:** `OPERATOR_ROLE`
- **Purpose:** Mint tokens based on third-party contract interactions.

### Burning Tokens

#### User Burn

- **Function:** `burn(uint256 amount)`
- **Access:** Any token holder
- **Purpose:** Allow users to burn their own tokens.

#### Operator Burn

- **Function:** `operatorBurn(address from, uint256 amount)`
- **Access:** `OPERATOR_ROLE`
- **Purpose:** Burn tokens from a user's balance based on contract interactions.

### Cross-Chain Transfers

#### Initiate Transfer

- **Function:** `sendToChain(uint64 destinationChainId, address receiverAddress, uint256 amount, uint256 gasLimit)`
- **Access:** `CCIP_SENDER_ROLE`
- **Steps:**
  1. Ensure `destinationChainId` is allowed.
  2. Provide sufficient `msg.value` to cover CCIP fees.
  3. Confirm the transaction.

#### Receive Tokens

- **Automatic Process:**
  - The `ccipReceive` function is invoked by the CCIP client on the destination chain.
  - Tokens are minted to the `receiverAddress`.

---

## Security Considerations

- **Access Control:**
  - Manage roles carefully to prevent unauthorized access.
  - Regularly review assigned roles.

- **Reentrancy Protection:**
  - Critical functions are protected using `nonReentrant`.

- **Allowed Chains and Contracts:**
  - Only specified chains and contracts can interact with the token.

- **Token Recovery:**
  - The `recoverERC20` function allows recovery of tokens sent to the contract by mistake.

- **Auditing:**
  - Perform thorough testing and consider professional audits before deploying to mainnet.

---

## Troubleshooting

- **Transaction Failures:**
  - Ensure sufficient funds and correct role assignments.
  - Verify that the destination chain and contracts are allowed.

- **CCIP Issues:**
  - Confirm that CCIP clients are operational and addresses are correct.
  - Check that gas limits are properly estimated.

- **Role Errors:**
  - Use the `hasRole` function to check if an address has a specific role.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear messages.
4. Open a pull request detailing your changes.

Please ensure that your code adheres to the existing style conventions and passes all tests.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Contact

For any questions or support, please reach out to the Chainwave Solutions team:

- **Email:** support@chainwavesolutions.com
- **Website:** [www.chainwavesolutions.com](https://www.chainwavesolutions.com)
- **GitHub:** [Chainwave Solutions](https://github.com/chainwave-solutions)

---

**Disclaimer:** This contract is provided as-is and is intended for educational and testing purposes. It is crucial to perform thorough testing and auditing before deploying to a production environment. Chainwave Solutions is not responsible for any loss or damage resulting from the use of this contract.

---
