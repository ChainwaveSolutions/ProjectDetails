// SPDX-License-Identifier: MIT

/*
* Treasury : 0xc690fE0d47803ed50E1EA7109a9750360117aa22
* USDC Token: See chain deets below
*/

/*
* Fuji
*
* test contract 1: 0x633B76a5B4b1bb503e05C55242E98246B5f5fF87
*
* router: 0xF694E193200268f9a4868e4Aa017A0118C9a8177 // Newest with contract allow
* chain selector: 14767482510784806043
* official chainid: 43113
* LINK Token on chain: 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846
* Native Currency: AVAX
* USDC on chain: 0x5425890298aed601595a70AB815c96711a31Bc65
* WETH Token: WAVAX
* WETH Token on chain: 0xd00ae08403B9bbb9124bB305C09058E32C39A48c
*/


/*
* Sepolia
*
* test contract 1: 0x22efE8B04612ED6B06Eb868323B71d4Bf45e6B1C
*
* router: 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59
* chain selector: 16015286601757825753
* official chainid: 11155111
* LINK Token on chain: 0x779877A7B0D9E8603169DdbD7836e478b4624789
* Native Currency: ETH
* USDC on chain: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
* WETH Token: WETH
* WETH Token on chain: 0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534
*/

/*
* Base Testnet (Sepolia Base)
*
* test contract 1:  0x4604c631823ab1dBE9811c1447c156073cF6EbFd ***BASE LATEST*** 0x4604c631823ab1dBE9811c1447c156073cF6EbFd
*
* router: 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93
* chain selector: 10344971235874465080
* official chainid: 84532
* LINK Token on chain: 0xE4aB69C077896252FAFBD49EFD26B5D171A32410
* Native Currency: ETH
* USDC on chain: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
* WETH Token: WETH
* WETH Token on chain: 0x4200000000000000000000000000000000000006
*/

/*
* Arbitrum Testnet (Sepolia Arbitrum)
*
* test contract 1:  0x4604c631823ab1dBE9811c1447c156073cF6EbFd
*
* router: 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165
* chain selector: 3478487238524512106
* official chainid: 421614
* LINK Token on chain: 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E
* Native Currency: ETH
* USDC on chain: 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
* WETH Token: WETH
* WETH Token on chain: 0xE591bf0A0CF924A0674d7792db046B23CEbF5f34
*/


/*
* BSC Testnet               ***Only fuji sepolia amoy base networks to chain bsc with***
*
* test contract 1:    0x4B7f78b2AF5fbA9a388c2ec8f65f44AAE67D7f0b
*
* router: 0xE1053aE1857476f36A3C62580FF9b016E8EE8F6f
* chain selector: 13264668187771770619
* official chainid: 97
* LINK Token on chain: 0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06
* Native Currency: BNB
* cUSDC on chain: 0x36e50b8c7be83546e11567e0D5871a99c7c554e0 *Custom token created to check bridge works as per test on testnet*
* WETH Token: WBNB
* WETH Token on chain: 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd
*/


/*
* Amoy Testnet (Amoy Polygon Testnet)
*
* test contract 1:
*
* router: 0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2
* chain selector: 16281711391670634445
* official chainid: 80002
* LINK Token on chain: 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904
* Native Currency: MATIC
* USDC on chain: NO USDC ON CHAIN TESTNET USE 18 DECIMAL STABLE
* WETH Token: WMATIC
* WETH Token on chain: 0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9
*/



pragma solidity ^0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ChainWaveBridgeWithStakingTEST is CCIPReceiver, OwnerIsCreator, ReentrancyGuard {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    // Chainlink Router and LINK token interfaces
    IRouterClient private router;
    IERC20 private s_linkToken;

    // Stablecoin token interface (e.g., USDC)
    IERC20 private immutable token;

    // Allowlisted chains and destination contracts
    mapping(uint64 => bool) public allowlistedChains;
    mapping(address => bool) public allowlistedContracts;

    // Treasury address
    address public treasury;

    // Fee settings
    uint256 public bridgeFeePercentage = 300; // 3.0% in basis points
    uint256 public stakingFeePercentage = 100;  // 1.0% in basis points
    uint256 public constant BASIS_POINTS = 10000;

    // Staking variables
    uint256 public totalStaked;
    uint256 public developerStake;
    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public rewards;
    EnumerableSet.AddressSet private stakers;

    // Events
    event TokensLockedAndSent(
        address indexed sender,
        uint256 amount,
        uint64 destinationChain,
        bytes32 indexed messageId,
        uint256 fee
    );
    event TokensUnlocked(bytes32 indexed messageId, uint256 amount, address recipient);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event FeesUpdated(uint256 bridgeFeePercentage, uint256 stakingFeePercentage);
    event TreasuryUpdated(address indexed newTreasury);
    event OwnerFundsDeposited(uint256 amount);
    event OwnerFundsWithdrawn(uint256 amount, address to);
    event HealthFactorUpdated(uint256 healthFactor);
    event ContractAllowlisted(address indexed contractAddress, bool allowed);
    event ChainAllowlisted(uint64 indexed chainSelector, bool allowed);

    /**
     * @dev Constructor to initialize the contract.
     * @param _router Address of the Chainlink Router contract.
     * @param _token Address of the stablecoin token (e.g., USDC).
     * @param _linkToken Address of the LINK token.
     * @param _treasury Address of the treasury to receive a portion of the fees.
     */
    constructor(
        address _router,
        address _token,
        address _linkToken,
        address _treasury
    ) CCIPReceiver(_router) {
        require(_token != address(0), "Invalid token address");
        require(_linkToken != address(0), "Invalid LINK token address");
        require(_treasury != address(0), "Invalid treasury address");

        router = IRouterClient(_router);
        token = IERC20(_token);
        s_linkToken = IERC20(_linkToken);
        treasury = _treasury;
    }

    /**
     * @dev Modifier to allow only allowlisted chains.
     */
    modifier onlyAllowlistedChain(uint64 chainSelector) {
        require(allowlistedChains[chainSelector], "Chain not allowlisted");
        _;
    }

    /**
     * @dev Modifier to allow only allowlisted destination contracts.
     */
    modifier onlyAllowlistedContract(address destinationContract) {
        require(allowlistedContracts[destinationContract], "Contract not allowlisted");
        _;
    }

    /**
     * @dev Modifier to ensure the pool's health factor is sufficient for operations.
     */
    modifier ensureHealthyPool() {
        uint256 healthFactor = calculateHealthFactor();
        require(healthFactor >= 100, "Pool health factor too low");
        _;
    }

    /**
     * @dev Allows the owner to add or remove allowlisted chains.
     * @param chainSelector The selector of the chain.
     * @param allowed Boolean indicating if the chain is allowed.
     */
    function allowlistChain(uint64 chainSelector, bool allowed) external onlyOwner {
        allowlistedChains[chainSelector] = allowed;
        emit ChainAllowlisted(chainSelector, allowed);
    }

    /**
     * @dev Allows the owner to add or remove allowlisted destination contracts.
     * @param contractAddress The address of the destination contract.
     * @param allowed Boolean indicating if the contract is allowed.
     */
    function allowlistContract(address contractAddress, bool allowed) external onlyOwner {
        allowlistedContracts[contractAddress] = allowed;
        emit ContractAllowlisted(contractAddress, allowed);
    }

    /**
     * @dev Updates the treasury address.
     * @param _treasury The new treasury address.
     */
    function updateTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    /**
     * @dev Updates the bridge and staking fee percentages.
     * @param _bridgeFeePercentage Bridge fee in basis points.
     * @param _stakingFeePercentage Staking fee in basis points.
     */
    function updateFees(uint256 _bridgeFeePercentage, uint256 _stakingFeePercentage) external onlyOwner {
        require(_bridgeFeePercentage + _stakingFeePercentage <= BASIS_POINTS, "Total fees exceed 100%");
        bridgeFeePercentage = _bridgeFeePercentage;
        stakingFeePercentage = _stakingFeePercentage;
        emit FeesUpdated(_bridgeFeePercentage, _stakingFeePercentage);
    }

    /**
     * @dev Allows the owner to deposit additional funds into the contract.
     * @param amount The amount of tokens to deposit.
     */
    function ownerDepositFunds(uint256 amount) external onlyOwner {
        require(amount > 0, "Cannot deposit zero tokens");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        developerStake = developerStake.add(amount);
        emit OwnerFundsDeposited(amount);
    }

    /**
     * @dev Allows the owner to withdraw funds from the contract.
     * @param amount The amount of tokens to withdraw.
     * @param to The address to receive the withdrawn tokens.
     */
    function ownerWithdrawFunds(uint256 amount, address to) external onlyOwner ensureHealthyPool {
        require(amount > 0, "Cannot withdraw zero tokens");
        require(to != address(0), "Invalid recipient address");

        require(token.transfer(to, amount), "Token transfer failed");

        developerStake = developerStake.sub(amount);
        emit OwnerFundsWithdrawn(amount, to);
    }

    /**
     * @dev Locks tokens and sends them to the destination chain.
     * @param amount The amount of tokens to lock and send.
     * @param destinationChainSelector The chain selector for the destination chain.
     * @param destinationContract The address of the destination contract.
     */
    function lockAndSend(
        uint256 amount,
        uint64 destinationChainSelector,
        address destinationContract
    ) external nonReentrant onlyAllowlistedChain(destinationChainSelector) onlyAllowlistedContract(destinationContract) ensureHealthyPool {
        require(amount > 0, "Amount must be greater than zero");
        require(destinationContract != address(0), "Invalid destination contract address");

        // Calculate fees
        uint256 bridgeFee = (amount * bridgeFeePercentage) / BASIS_POINTS;
        uint256 stakingFee = (amount * stakingFeePercentage) / BASIS_POINTS;
        uint256 totalFee = bridgeFee + stakingFee;
        uint256 amountAfterFee = amount - totalFee;

        // Transfer the total fee to the contract
        require(token.transferFrom(msg.sender, address(this), totalFee), "Fee transfer failed");
        // Transfer the remaining amount to be locked
        require(token.transferFrom(msg.sender, address(this), amountAfterFee), "Amount transfer failed");

        // Distribute staking fee
        _distributeStakingFee(stakingFee);

        // Transfer bridge fee to the treasury
        require(token.transfer(treasury, bridgeFee), "Bridge fee transfer failed");

        // Building the cross-chain message to unlock on the destination chain and send to the original sender
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationContract),
            data: abi.encode(amountAfterFee, msg.sender),
            tokenAmounts: new Client.EVMTokenAmount[] (0), // Initialize an empty array of EVMTokenAmount
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 200_000})),
            feeToken: address(s_linkToken)
        });

        uint256 linkFees = router.getFee(destinationChainSelector, evm2AnyMessage);

        require(s_linkToken.balanceOf(address(this)) >= linkFees, "Insufficient LINK for fees");
        require(s_linkToken.approve(address(router), linkFees), "LINK approval failed");

        bytes32 messageId = router.ccipSend(destinationChainSelector, evm2AnyMessage);

        emit TokensLockedAndSent(msg.sender, amountAfterFee, destinationChainSelector, messageId, totalFee);
    }

    /**
     * @dev Handles incoming cross-chain messages to unlock tokens.
     * @param any2EvmMessage The incoming cross-chain message.
     */
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
        (uint256 amount, address recipient) = abi.decode(any2EvmMessage.data, (uint256, address));

        require(recipient != address(0), "Invalid recipient address");

        // Unlock tokens by transferring from the contract to the recipient
        require(token.transfer(recipient, amount), "Token transfer failed");

        emit TokensUnlocked(any2EvmMessage.messageId, amount, recipient);
    }

    /**
     * @dev Allows users to stake their tokens.
     * @param amount The amount of tokens to stake.
     */
    function stakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake zero tokens");

        // Transfer tokens to the contract
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        // Update staking balance
        stakedBalances[msg.sender] = stakedBalances[msg.sender].add(amount);
        totalStaked = totalStaked.add(amount);

        // Add to stakers set if not already present
        if (!stakers.contains(msg.sender)) {
            stakers.add(msg.sender);
        }

        emit TokensStaked(msg.sender, amount);
    }

    /**
     * @dev Allows users to unstake their tokens.
     * @param amount The amount of tokens to unstake.
     */
    function unstakeTokens(uint256 amount) external nonReentrant ensureHealthyPool {
        require(amount > 0, "Cannot unstake zero tokens");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");

        // Update staking balance
        stakedBalances[msg.sender] = stakedBalances[msg.sender].sub(amount);
        totalStaked = totalStaked.sub(amount);

        // Remove from stakers set if balance is zero
        if (stakedBalances[msg.sender] == 0) {
            stakers.remove(msg.sender);
        }

        // Transfer tokens back to the user
        require(token.transfer(msg.sender, amount), "Token transfer failed");

        emit TokensUnstaked(msg.sender, amount);
    }

    /**
     * @dev Allows users to claim their accumulated rewards.
     */
    function claimRewards() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");

        // Reset user's rewards before transfer to prevent re-entrancy
        rewards[msg.sender] = 0;

        // Transfer rewards to the user
        require(token.transfer(msg.sender, reward), "Reward transfer failed");

        emit RewardsClaimed(msg.sender, reward);
    }

    /**
     * @dev Distributes the staking fee among all stakers proportionally.
     * @param stakingFee The total staking fee to distribute.
     */
    function _distributeStakingFee(uint256 stakingFee) internal {
        if (totalStaked == 0) {
            // If no one is staking, send the staking fee to the treasury
            require(token.transfer(treasury, stakingFee), "Staking fee transfer failed");
            return;
        }

        // Distribute staking fee proportionally to stakers
        uint256 stakersCount = stakers.length();
        for (uint256 i = 0; i < stakersCount; i++) {
            address staker = stakers.at(i);
            uint256 stakerShare = (stakingFee * stakedBalances[staker]) / totalStaked;
            rewards[staker] = rewards[staker].add(stakerShare);
        }
    }

    /**
     * @dev Calculates the health factor of the pool, which is the ratio of developer stake to user stakes.
     * @return healthFactor The calculated health factor.
     */
    function calculateHealthFactor() public view returns (uint256 healthFactor) {
        if (totalStaked == 0) {
            return type(uint256).max; // If no user stakes, the health factor is infinite.
        }
        healthFactor = (developerStake.mul(BASIS_POINTS)).div(totalStaked);
        // emit HealthFactorUpdated(healthFactor); // Removed because view functions can't emit events
        return healthFactor;
    }

    /**
     * @dev Retrieves the LINK token balance of the contract.
     * @return linkBalance The LINK token balance of the contract.
     */
    function getLinkBalance() external view returns (uint256 linkBalance) {
        return s_linkToken.balanceOf(address(this));
    }

    /**
     * @dev Retrieves the combined value of staked balances and developer stakes.
     * @return combinedValue The combined value of staked balances and developer stakes.
     */
    function getCombinedStakedValue() external view returns (uint256 combinedValue) {
        return totalStaked.add(developerStake);
    }

    /**
     * @dev Checks if a destination contract is allowlisted.
     * @param contractAddress The address of the destination contract.
     * @return isAllowlisted Boolean indicating if the contract is allowlisted.
     */
    function isContractAllowlisted(address contractAddress) external view returns (bool isAllowlisted) {
        return allowlistedContracts[contractAddress];
    }

    /**
     * @dev Checks if a chain is allowlisted.
     * @param chainSelector The selector of the chain.
     * @return isAllowlisted Boolean indicating if the chain is allowlisted.
     */
    function isChainAllowlisted(uint64 chainSelector) external view returns (bool isAllowlisted) {
        return allowlistedChains[chainSelector];
    }

    /**
     * @dev Allows the owner to deposit LINK tokens for bridge operations.
     * @param amount The amount of LINK tokens to deposit.
     */
    function depositLink(uint256 amount) external onlyOwner {
        require(amount > 0, "Cannot deposit zero LINK");
        require(s_linkToken.transferFrom(msg.sender, address(this), amount), "LINK transfer failed");
    }

    /**
     * @dev Allows the owner to withdraw LINK tokens from the contract.
     * @param amount The amount of LINK tokens to withdraw.
     * @param to The address to send the withdrawn LINK tokens.
     */
    function withdrawLink(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        require(s_linkToken.transfer(to, amount), "LINK transfer failed");
    }

    /**
     * @dev Retrieves the list of all current stakers.
     * @return An array of staker addresses.
     */
    function getAllStakers() external view returns (address[] memory) {
        uint256 stakersCount = stakers.length();
        address[] memory stakersList = new address[](stakersCount);
        for (uint256 i = 0; i < stakersCount; i++) {
            stakersList[i] = stakers.at(i);
        }
        return stakersList;
    }

    /**
     * @dev Retrieves the staked balance of a user.
     * @param user The address of the user.
     * @return The staked balance of the user.
     */
    function getStakedBalance(address user) external view returns (uint256) {
        return stakedBalances[user];
    }

    /**
     * @dev Retrieves the reward balance of a user.
     * @param user The address of the user.
     * @return The reward balance of the user.
     */
    function getRewardBalance(address user) external view returns (uint256) {
        return rewards[user];
    }

    /**
     * @dev Fallback function to receive ETH if needed.
     */
    receive() external payable {}
}
