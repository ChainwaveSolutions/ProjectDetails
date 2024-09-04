# ChainWaveBridgeWithStaking (USDC Stablecoin Version)

## Overview

ChainWaveBridgeWithStaking is a cross-chain token bridging smart contract integrated with staking functionality, specifically using **USDC Stablecoin** as the token. It enables users to lock their USDC tokens on a source chain and unlock equivalent tokens on a destination chain. The system also incorporates staking rewards for users, developer stake management, and secure cross-chain messaging powered by Chainlink's **Cross-Chain Interoperability Protocol (CCIP)**.

This contract is deployed across multiple testnets, including **Fuji**, **Sepolia**, **Base Testnet**, and **BSC Testnet**. It ensures seamless token bridging and staking across different networks while maintaining a stable 1:1 ratio with USDC.

---

## Features

### 1. Cross-Chain Bridging (USDC)
- **USDC Stablecoin** is used as the main token for both locking and unlocking operations across chains.
- **Chainlink CCIP** is used for cross-chain messaging to securely transfer token data and execute cross-chain transactions.
- Users can lock USDC on a source chain and receive an equivalent amount of USDC on a destination chain.
- Only allowlisted destination contracts and chains are permitted for cross-chain transactions.

### 2. Staking Mechanism (USDC)
- Users can **stake USDC tokens** and earn rewards based on their staked balance.
- The developer's stake is used for liquidity management but is **excluded from rewards distribution** to maintain fairness for users.

### 3. Fees
- The contract applies both a **bridge fee** and a **staking fee**, which are configurable by the contract owner:
  - Bridge Fee: Applied during token lock and cross-chain transfer.
  - Staking Fee: Distributed among stakers as rewards.
- The treasury address receives the accumulated fees, and staking rewards are distributed proportionally to users based on their staking balance.

### 4. Contract and Chain Allowlisting
- To ensure security, the contract supports allowlisting of destination contracts and chains. Only allowlisted contracts are eligible for cross-chain transactions.
- The **owner** or **operator** can update the allowlist of contracts and chains.

---

## Smart Contract Workflow

### **1. Token Locking and Cross-Chain Messaging**
1. **Lock USDC**:
   - A user locks USDC tokens on the source chain by invoking the `lockAndSend()` function.
   - The system calculates the bridge and staking fees, deducts them from the locked amount, and sends the remaining balance.
   - Locked tokens are added to the developer stake for liquidity management.

2. **Cross-Chain Messaging**:
   - A **Chainlink CCIP** message is generated, containing the necessary information (amount, sender, and receiver).
   - The **destination contract address** and **chain selector** must be provided during the locking process. Only allowlisted chains and contracts are permitted.

3. **Unlocking USDC**:
   - On the destination chain, the corresponding amount of USDC is unlocked and sent to the recipient specified in the cross-chain message.

### **2. Staking USDC**
- Users can stake their USDC by invoking the `stakeTokens()` function.
- Staked balances are tracked, and staking rewards are distributed based on the staked amount.
- **Developer's stake is excluded** from the rewards distribution to ensure fairness.

### **3. Rewards and Fees**
- Rewards are distributed proportionally among stakers based on their contribution to the total staked USDC.
- The **staking fee** is distributed as rewards to the users, while the **bridge fee** is transferred to the treasury.

### **4. Allowlisting Contracts and Chains**
- The contract includes functions for allowlisting destination contracts and chains. These functions can only be invoked by the **owner** or **operator**:
   - `allowlistChain()`: Allows a specific chain by its selector.
   - `allowlistContract()`: Allows a specific contract address on the destination chain.

---

## Contract Functions

### **Public User Functions**
1. **lockAndSend(uint256 amount, uint64 destinationChainSelector, address destinationContract)**:
   - Locks USDC on the source chain and sends a cross-chain message to unlock USDC on the destination chain.
   - Requires the destination chain and contract to be allowlisted.

2. **stakeTokens(uint256 amount)**:
   - Allows users to stake USDC into the contract and start earning rewards.

3. **unstakeTokens(uint256 amount)**:
   - Unstakes the user's USDC, subject to the health factor of the pool.

4. **claimRewards()**:
   - Claims accumulated staking rewards in USDC.

### **Owner/Operator Functions**
1. **setOperator(address newOperator)**:
   - Assigns an operator who can manage the contract in addition to the owner.

2. **allowlistChain(uint64 chainSelector, bool allowed)**:
   - Adds or removes a chain from the allowlist.

3. **allowlistContract(address contractAddress, bool allowed)**:
   - Adds or removes a destination contract from the allowlist.

4. **projectsDepositFunds(uint256 amount)**:
   - Allows the owner or operator to deposit additional USDC for liquidity or project needs.

5. **projectsWithdrawFunds(uint256 amount, address to)**:
   - Allows the owner or operator to withdraw USDC.

6. **updateFees(uint256 bridgeFeePercentage, uint256 stakingFeePercentage)**:
   - Updates the bridge and staking fees for transactions.

---

## Usage

### Deploying the Contract

- The contract can be deployed to supported chains like Fuji, Sepolia, Base Testnet, and BSC Testnet.
- During deployment, the following parameters are required:
  - **router**: Address of the Chainlink CCIP router contract.
  - **token**: Address of the USDC token on the chain.
  - **linkToken**: Address of the LINK token on the chain.
  - **treasury**: Address to receive the treasury fees.

### Using the Contract

1. **Lock USDC and Unlock on Destination Chain**:
   - Call `lockAndSend(amount, destinationChainSelector, destinationContract)` to lock USDC on the source chain and send an equivalent amount to the destination chain.
   - Ensure that the `destinationChainSelector` and `destinationContract` are allowlisted.

2. **Stake USDC**:
   - Call `stakeTokens(amount)` to stake USDC and participate in rewards.

3. **Unstake and Claim Rewards**:
   - Call `unstakeTokens(amount)` to unstake USDC.
   - Call `claimRewards()` to claim accumulated rewards.

### Allowlisting Chains and Contracts
- Call `allowlistChain(chainSelector, allowed)` to manage allowed chains.
- Call `allowlistContract(contractAddress, allowed)` to manage allowed destination contracts.

---

## Testing

The contract is deployed on several testnets, and you can use the following test tokens:

- **Fuji**: Test with USDC at address `0x5425890298aed601595a70AB815c96711a31Bc65`.
- **Sepolia**: Test with USDC at address `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`.
- **Base Testnet**: Test with USDC at address `0x036CbD53842c5426634e7929541eC2318f3dCF7e`.
- **BSC Testnet**: Custom test token created at `0x36e50b8c7be83546e11567e0D5871a99c7c554e0`.

---

## License
This project is licensed under the **MIT License**.

---

### References

- [Chainlink CCIP Documentation](https://docs.chain.link/ccip)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/4.x/)
- [Chainlink Testnets Faucet](https://faucets.chain.link/)

---
