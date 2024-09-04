# ChainWave's Stable Bridging System (USDC Stablecoin Version)

## Overview

ChainWave's Stable Bridging System is a cross-chain token bridging smart contract integrated with staking functionality, specifically using **USDC Stablecoin** as the token. It enables users to lock their USDC tokens on a source chain and unlock equivalent tokens on a destination chain. The system also incorporates staking rewards for users, developer stake management, and secure cross-chain messaging powered by Chainlink's **Cross-Chain Interoperability Protocol (CCIP)**.

This contract is deployed across multiple testnets, including **Fuji**, **Sepolia**, **Base Testnet**, and **BSC Testnet**. It ensures seamless token bridging and staking across different networks while maintaining a stable 1:1 ratio with USDC.

---
![Stable CCIP Bridge 02](https://raw.githubusercontent.com/ChainwaveSolutions/ProjectDetails/main/Contracts/StakingBridgeTest/bridgesystemccip.png)

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

Here's an updated section for the `README.md` file, covering the **Health Factor** and its role in limiting pools, interactions with staking, and ecosystem balancing:

---

## Health Factor: Pool Management and Ecosystem Balancing

### **Overview**

The **Health Factor** is a critical component in the **ChainWave's Stable Bridging System** contract that manages the balance and sustainability of the staking pool and cross-chain liquidity. It acts as a safeguard to ensure that the system's liquidity remains healthy and stable, especially when handling large amounts of staked USDC across multiple chains.

The Health Factor determines when the ecosystem pool requires balancing between chains and restricts certain interactions, such as staking, unstaking, and cross-chain token transfers, if the pool is unhealthy.

### **How Health Factor Works**

The Health Factor is calculated based on the ratio of the **project’s stake** (developer's liquidity) to the **total user stakes** in the contract. The goal is to ensure that the contract holds enough liquidity to cover all staking and cross-chain transfer obligations, minimizing the risk of insolvency or imbalance between chains.

#### **Health Factor Formula**

```solidity
healthFactor = (projectsStake * BASIS_POINTS) / totalStaked;
```

- **projectsStake**: The amount of tokens held by the contract for liquidity and ecosystem management.
- **totalStaked**: The total amount of tokens staked by all users in the contract.
- **BASIS_POINTS**: A constant value used to represent percentage calculations in basis points.

#### **Key Considerations**

- A **Health Factor** of **100% or greater** indicates a healthy pool, meaning there is sufficient liquidity in the ecosystem to support user stakes and transfers.
- If the Health Factor falls below 100%, the system restricts certain operations (such as withdrawals and cross-chain transfers) to prevent further imbalance and allows time for the pool to recover.

### **Role of the Health Factor in Pool Operations**

#### **1. Restricting User Interactions**
- If the **Health Factor** drops below a certain threshold (100%), the contract restricts user interactions such as **unstaking**, **withdrawing funds**, and **initiating cross-chain transfers**.
- This restriction prevents further depletion of the pool and allows the system to stabilize.

#### **2. Pool Balancing Across Chains**
- In the rare case where there is an imbalance in the ecosystem across multiple chains, the Health Factor triggers a pool balancing mechanism. This balancing ensures that enough liquidity is maintained to cover obligations on all supported chains.
- Balancing occurs automatically and typically takes up to **30 minutes** to complete. During this time, there may be delays in bridging and transfer operations as the system ensures all chains remain balanced.

#### **3. Impact on Staking and Unstaking**
- Users are still able to **stake tokens** when the pool is unhealthy, but they cannot unstake or claim rewards until the pool is back to a healthy state.
- Staking rewards continue to accumulate during this period, but users will only be able to claim them once the **Health Factor** reaches a safe level again.

### **How the Health Factor Limits Ecosystem Interactions**

The **Health Factor** directly influences the following operations:
- **Staking**: Users can continue to stake even when the pool is unhealthy, but their interactions are subject to the pool's ability to recover.
- **Unstaking**: Users cannot unstake tokens if the Health Factor is below 100%, preventing further depletion of liquidity in the pool.
- **Cross-Chain Transfers**: Cross-chain transfers are restricted until the pool is balanced and the Health Factor returns to a stable state. This ensures the ecosystem's stability across multiple networks.

### **Ecosystem Pool Balancing and Delays**

- **Balancing Across Chains**: In some instances, delays in cross-chain transfers may occur due to **ecosystem pool balancing**. The system automatically adjusts liquidity between chains to ensure the Health Factor remains healthy across the ecosystem.
- **Delays in Bridging and Transfers**: In rare cases, delays in bridging and token transfers may take up to **30 minutes** while the pool balancing completes. Once the balancing is finished, normal operations resume, and users can continue cross-chain transfers and withdrawals.

---

### **Health Factor Events**

Several events related to the **Health Factor** help track the pool's health status and liquidity:

- **HealthFactorUpdated(uint256 healthFactor)**: Triggered when the health factor is calculated or updated.
- **PojectsFundsDeposited(uint256 amount)**: Emitted when project funds are deposited, potentially improving the pool's health.
- **PojectsFundsWithdrawn(uint256 amount, address to)**: Emitted when project funds are withdrawn, which can affect the pool's health.

---

By integrating the **Health Factor** into the contract’s logic, **ChainWave's Stable Bridging System** ensures that the ecosystem remains balanced, secure, and sustainable, minimizing risks associated with liquidity and cross-chain operations.



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

---



## Usage

### Using the Contract

1. **Lock USDC and Unlock on Destination Chain**:
   - Call `lockAndSend(amount, destinationChainSelector, destinationContract)` to lock USDC on the source chain and send an equivalent amount to the destination chain.
   - Ensure that the `destinationChainSelector` and `destinationContract` are allowlisted.

2. **Stake USDC**:
   - Call `stakeTokens(amount)` to stake USDC and participate in rewards.

3. **Unstake and Claim Rewards**:
   - Call `unstakeTokens(amount)` to unstake USDC.
   - Call `claimRewards()` to claim accumulated rewards.

### User Functions

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

   ---
---

## Developer Steps for Owner to Setup the Bridging System

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

To ensure proper functioning of the bridge, the owner (or operator) needs to follow the steps below:

### Step 1: Deploy the Contract

- Deploy the contract on the desired blockchain network by providing the required parameters (router, token, linkToken, and treasury).

During deployment, the following parameters are required:
- **router**: Address of the Chainlink CCIP router contract.
- **token**: Address of the USDC token on the chain.
- **linkToken**: Address of the LINK token on the chain.
- **treasury**: Address to receive the treasury fees.

### Step 2: Fund the Contract with LINK

- Deposit LINK into the contract using the `depositLink(amount)` function to ensure the contract has enough funds to pay for CCIP operations.

1. **Deposit LINK tokens**:
   - Call `depositLink(amount)` from the owner account to deposit LINK into the contract. This will fund CCIP operations.

   Example:
   ```solidity
   contract.depositLink(1000 * 10**18); // Deposits 1000 LINK tokens
   ```

2. **Check LINK Balance**:
   - Call `getLinkBalance()` to view the total LINK balance available for the contract's CCIP fees.


### Step 3: Allowlist Chains and Contracts

1. **Allowlist a Chain**:
   - Call `allowlistChain(chainSelector, allowed)` to manage allowed chains.
   - `chainSelector` is the unique identifier for the chain (provided by Chainlink CCIP), and `allowed` is a boolean (`true` to allow, `false` to deny).

   Example:
   ```solidity
   contract.allowlistChain(14767482510784806043, true); // Allow Fuji chain
   ```

2. **Allowlist a Destination Contract**:
   - Call `allowlistContract(contractAddress, allowed)` to manage allowed destination contracts.
   - `contractAddress` is the address of the contract that will receive the unlocked tokens on the destination chain.

   Example:
   ```solidity
   contract.allowlistContract(0x22efE8B04612ED6B06Eb868323B71d4Bf45e6B1C, true); // Allow destination contract
   ```

3. **Check if Chain or Contract is Allowlisted**:
   - Call `isChainAllowlisted(chainSelector)` to check if a chain is allowed.
   - Call `isContractAllowlisted(contractAddress)` to check if a destination contract is allowed.

### Step 4: Configure Fees

- Set the bridge and staking fees according to the project’s business model by calling `updateFees(bridgeFeePercentage, stakingFeePercentage)`. This ensures that the fees deducted during token bridging and staking are configured properly.

### Step 5: Manage Operator Access

- If needed, assign an operator who will manage the day-to-day operations, like managing project funds and interactions across chains. Use `setOperator(operatorAddress)` to set the operator.

### Step 6: Monitor Health Factor

- Use the `calculateHealthFactor()` function to monitor the health of the staking pool. The health factor ensures that the staking pool remains balanced, preventing excessive withdrawals or imbalances across chains.
- If the health factor falls below the threshold, bridging operations may be delayed until balance is restored. The system is designed to automatically rebalance over 30 minutes.

## Security Considerations

### Allowlist Mechanism for Enhanced Security

- **Chain Security**: Only allowlisted chains can interact with the bridge, ensuring that token transfers are confined to trusted chains. This prevents malicious or unknown chains from accessing the contract.
- **Contract Security**: Only allowlisted destination contracts can receive tokens from the bridge. This guarantees that tokens are unlocked only in approved contracts on the destination chain.
- These allowlists are managed by the contract owner or operator, adding a layer of control over cross-chain transactions.

### Health Factor to Safeguard Staking Pool

- The health factor mechanism prevents over-staking or imbalances within the pool. It ensures that the total staked amount remains proportional to the developer stake.
- When the health factor drops below a certain threshold, bridging may be delayed to prevent potential pool drain. Rebalancing the pools across chains takes up to 30 minutes during such rare occurrences, providing ecosystem stability.



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
