// SPDX-License-Identifier: MIT

/*
* Treasury : 0xc690fE0d47803ed50E1EA7109a9750360117aa22
* USDC Token: See chain deets below
*/

/*
* Fuji
*
* test contract 1: BBBB THIS 0x9a5EC19e391c841D203990afcA81313fbD7103ba
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
* test contract 1:  BBBBBB THIS
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
* test contract 1:   ***BASE LATEST***
*
* router: 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93
* chain selector: 10344971235874465080
* official chainid: 84532
* LINK Token on chain: 0xE4aB69C077896252FAFBD49EFD26B5D171A32410
* Native Currency: ETH
* USDC on chain: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
* WETH Token: WETH
* WETH Token on chain: 0x4200000000000000000000000000000000000006
* Dex Router: 0xFE6508f0015C778Bdcc1fB5465bA5ebE224C9912 // base pancake testnet router
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
* test contract 1:
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
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";


contract ChainWaveBridgeWithStakingTEST is CCIPReceiver, OwnerIsCreator, ReentrancyGuard {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    // Chainlink Router and LINK token interfaces
    IRouterClient private router;
    IERC20 private s_linkToken;

    // Stablecoin token interface (e.g., USDC)
    IERC20 private immutable token;

    // Operator address for managing project funds across chains
    address public operator;

    // Allowlisted chains and destination contracts
    mapping(uint64 => bool) public allowlistedChains;
    mapping(address => bool) public allowlistedContracts;

    //Dex router here
    IUniswapV2Router02 public dexRouter;

    // Treasury address
    address public treasury;

    // Fee settings
    uint256 public bridgeFeePercentage = 300; // 3.0% in basis points
    uint256 public stakingFeePercentage = 100;  // 1.0% in basis points
    uint256 public flatRateUSDCFee = 4 * 10 ** 6; // 4 USDC flat fee
    uint256 public constant BASIS_POINTS = 10000;

    // Staking variables
    uint256 public totalStaked;
    uint256 public projectsStake;
    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public rewards;
    EnumerableSet.AddressSet private stakers;

    // Events
    event OperatorUpdated(address indexed newOperator);
    event TokensLockedAndSent(address indexed sender, uint256 amount, uint64 destinationChain, bytes32 indexed messageId, uint256 fee);
    event TokensUnlocked(bytes32 indexed messageId, uint256 amount, address recipient);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event FeesUpdated(uint256 bridgeFeePercentage, uint256 stakingFeePercentage, uint256 flatRateUSDCFee);
    event TreasuryUpdated(address indexed newTreasury);
    event PojectsFundsDeposited(uint256 amount);
    event PojectsFundsWithdrawn(uint256 amount, address to);
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
        address _treasury,
        address _dexRouter // Add the DEX router address as a parameter
    ) CCIPReceiver(_router) {
        require(_token != address(0), "Invalid token address");
        require(_linkToken != address(0), "Invalid LINK token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_dexRouter != address(0), "Invalid DEX router address");

        router = IRouterClient(_router);
        token = IERC20(_token);
        s_linkToken = IERC20(_linkToken);
        treasury = _treasury;
        dexRouter = IUniswapV2Router02(_dexRouter); // Initialize the DEX router
    }

    /**
     * @dev Modifier to allow only the operator or the owner to execute certain functions.
     */
    modifier onlyOperatorOrOwner() {
        require(msg.sender == operator || msg.sender == owner(), "Caller is not operator or owner");
        _;
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




    // ** Operator, Treasury, and Fee Management ** //

    function setOperator(address _operator) external onlyOwner {
        require(_operator != address(0), "Invalid operator address");
        operator = _operator;
        emit OperatorUpdated(_operator);
    }

    function updateFees(
        uint256 _bridgeFeePercentage,
        uint256 _stakingFeePercentage,
        uint256 _flatRateUSDCFee
    ) external onlyOwner {
        require(_bridgeFeePercentage <= BASIS_POINTS, "Bridge fee exceeds basis points");
        require(_stakingFeePercentage <= BASIS_POINTS, "Staking fee exceeds basis points");
        require(_flatRateUSDCFee > 0, "Flat rate fee must be greater than zero");

        bridgeFeePercentage = _bridgeFeePercentage;
        stakingFeePercentage = _stakingFeePercentage;
        flatRateUSDCFee = _flatRateUSDCFee;

        emit FeesUpdated(_bridgeFeePercentage, _stakingFeePercentage, _flatRateUSDCFee);
    }

    function updateTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    /**
    * @dev Allows the owner or operator to deposit additional funds into the contract.
    * @param amount The amount of tokens to deposit.
    */
    function projectsDepositFunds(uint256 amount) external onlyOperatorOrOwner {
        require(amount > 0, "Cannot deposit zero tokens");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        projectsStake = projectsStake.add(amount);
        emit PojectsFundsDeposited(amount);
    }

    /**
    * @dev Allows the owner or operator to withdraw funds from the contract.
    * @param amount The amount of tokens to withdraw.
    * @param to The address to receive the withdrawn tokens.
    */
    function projectsWithdrawFunds(uint256 amount, address to) external onlyOperatorOrOwner ensureHealthyPool {
        require(amount > 0, "Cannot withdraw zero tokens");
        require(to != address(0), "Invalid recipient address");

        require(token.transfer(to, amount), "Token transfer failed");

        projectsStake = projectsStake.sub(amount);
        emit PojectsFundsWithdrawn(amount, to);
    }


    // ** Locking, Sending, and Cross-Chain Functionality ** //

    function lockAndSend(
        uint256 amount,
        uint64 destinationChainSelector,
        address destinationContract
    ) external nonReentrant onlyAllowlistedChain(destinationChainSelector) onlyAllowlistedContract(destinationContract) ensureHealthyPool {
        require(amount > 0, "Amount must be greater than zero");
        require(destinationContract != address(0), "Invalid destination contract address");

        uint256 amountAfterFee = _calculateAndDistributeFees(amount);

        _handleAvailablePool(amountAfterFee);

        _sendCrossChainMessage(amountAfterFee, destinationChainSelector, destinationContract);
    }

   function lockAndSendWithSwap(
        uint256 amount,
        uint64 destinationChainSelector,
        address destinationContract
    ) external nonReentrant onlyAllowlistedChain(destinationChainSelector) onlyAllowlistedContract(destinationContract) ensureHealthyPool {
        require(amount > 0, "Amount must be greater than zero");
        require(destinationContract != address(0), "Invalid destination contract address");

        uint256 amountAfterFee = _calculateAndDistributeFees(amount);

        // Handle pool balance
        _handleAvailablePool(amountAfterFee);

        // Sending the cross-chain message (no swap here yet)
        _sendCrossChainMessage(amountAfterFee, destinationChainSelector, destinationContract);
    }



function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
    (uint256 amount, address recipient) = abi.decode(any2EvmMessage.data, (uint256, address));

    require(recipient != address(0), "Invalid recipient address");

    // Swap USDC for native currency (e.g., ETH) on the destination chain
    _swapUSDCForNative(amount, recipient);

    emit TokensUnlocked(any2EvmMessage.messageId, amount, recipient);
}

function _swapUSDCForNative(uint256 amount, address recipient) internal {
    require(amount > 0, "Amount must be greater than zero");
    require(recipient != address(0), "Invalid recipient address");

    require(token.approve(address(dexRouter), amount), "Token approval failed");

     address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = dexRouter.WETH();

    dexRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
        amount,
        0,
        path,
        recipient,
        block.timestamp + 300
    );
}




    function _sendCrossChainMessage(
        uint256 amountAfterFee,
        uint64 destinationChainSelector,
        address destinationContract
    ) internal {
        Client.EVMTokenAmount[] memory tokenAmounts;

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationContract),
            data: abi.encode(amountAfterFee, msg.sender),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 200_000})),
            feeToken: address(s_linkToken)
        });

        uint256 linkFees = router.getFee(destinationChainSelector, evm2AnyMessage);

        require(s_linkToken.balanceOf(address(this)) >= linkFees, "Insufficient LINK for fees");
        require(s_linkToken.approve(address(router), linkFees), "LINK approval failed");

        bytes32 messageId = router.ccipSend(destinationChainSelector, evm2AnyMessage);

        emit TokensLockedAndSent(msg.sender, amountAfterFee, destinationChainSelector, messageId, linkFees);
    }


    function _calculateAndDistributeFees(uint256 amount) internal returns (uint256 amountAfterFee) {
        // Calculate fees
        uint256 bridgeFee = (amount * bridgeFeePercentage) / BASIS_POINTS;
        uint256 stakingFee = (amount * stakingFeePercentage) / BASIS_POINTS;
        uint256 totalFee = bridgeFee + stakingFee;

        // Amount after deducting fees
        amountAfterFee = amount - totalFee;

        // Transfer the fees to the contract (this assumes the user must approve the transfer before calling)
        require(token.transferFrom(msg.sender, address(this), totalFee), "Fee transfer failed");

        // Distribute staking fee
        _distributeStakingFee(stakingFee);

        // Transfer the bridge fee to the treasury
        require(token.transfer(treasury, bridgeFee), "Bridge fee transfer failed");

        return amountAfterFee;
    }

    function _handleAvailablePool(uint256 amountAfterFee) internal {
        // Calculate available pool including both staked tokens and project stake
        uint256 availablePool = projectsStake + totalStaked;
        require(availablePool >= amountAfterFee, "Insufficient pool balance");

        // Deduct from project stake first, then staked balances if necessary
        if (projectsStake < amountAfterFee) {
            uint256 neededFromStaking = amountAfterFee - projectsStake;
            _deductFromStakedBalances(neededFromStaking);
            projectsStake = 0;
        } else {
            projectsStake = projectsStake - amountAfterFee;
        }
    }

    function _deductFromStakedBalances(uint256 amountNeeded) internal {
        uint256 stakersCount = stakers.length();
        require(stakersCount > 0, "No stakers available");

        for (uint256 i = 0; i < stakersCount; i++) {
            address staker = stakers.at(i);
            uint256 stakerBalance = stakedBalances[staker];

            // Calculate proportional deduction from each staker
            uint256 deduction = (amountNeeded * stakerBalance) / totalStaked;

            // Update the staker's balance and total staked amount
            stakedBalances[staker] = stakedBalances[staker].sub(deduction);
            totalStaked = totalStaked.sub(deduction);
        }
    }


    // ** Staking and Rewards ** //

    function stakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake zero tokens");

        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        stakedBalances[msg.sender] = stakedBalances[msg.sender].add(amount);
        totalStaked = totalStaked.add(amount);

        if (!stakers.contains(msg.sender)) {
            stakers.add(msg.sender);
        }

        emit TokensStaked(msg.sender, amount);
    }

    function unstakeTokens(uint256 amount) external nonReentrant ensureHealthyPool {
        require(amount > 0, "Cannot unstake zero tokens");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");

        stakedBalances[msg.sender] = stakedBalances[msg.sender].sub(amount);
        totalStaked = totalStaked.sub(amount);

        if (stakedBalances[msg.sender] == 0) {
            stakers.remove(msg.sender);
        }

        require(token.transfer(msg.sender, amount), "Token transfer failed");

        emit TokensUnstaked(msg.sender, amount);
    }

    function _distributeStakingFee(uint256 stakingFee) internal {
        if (totalStaked == 0) {
            require(token.transfer(treasury, stakingFee), "Staking fee transfer failed");
            return;
        }

        uint256 stakersCount = stakers.length();
        for (uint256 i = 0; i < stakersCount; i++) {
            address staker = stakers.at(i);
            uint256 stakerShare = (stakingFee * stakedBalances[staker]) / totalStaked;
            rewards[staker] = rewards[staker].add(stakerShare);
        }
    }

    function claimRewards() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");

        rewards[msg.sender] = 0;
        require(token.transfer(msg.sender, reward), "Reward transfer failed");

        emit RewardsClaimed(msg.sender, reward);
    }


    // ** Helper Functions ** //

    function calculateHealthFactor() public view returns (uint256 healthFactor) {
        if (totalStaked == 0) {
            return type(uint256).max; // If no user stakes, the health factor is infinite.
        }
        healthFactor = (projectsStake.mul(BASIS_POINTS)).div(totalStaked);
        return healthFactor;
    }

    function getLinkBalance() external view returns (uint256 linkBalance) {
        return s_linkToken.balanceOf(address(this));
    }

    function getCombinedStakedValue() external view returns (uint256 combinedValue) {
        return totalStaked.add(projectsStake);
    }

    function setAllowlistedChain(uint64 chainSelector, bool allowed) external onlyOperatorOrOwner {
        require(chainSelector != 0, "Invalid chain selector");
        allowlistedChains[chainSelector] = allowed;
        emit ChainAllowlisted(chainSelector, allowed);
    }

    function setAllowlistedContract(address contractAddress, bool allowed) external onlyOperatorOrOwner {
        require(contractAddress != address(0), "Invalid contract address");
        allowlistedContracts[contractAddress] = allowed;
        emit ContractAllowlisted(contractAddress, allowed);
    }

    function isContractAllowlisted(address contractAddress) external view returns (bool) {
        return allowlistedContracts[contractAddress];
    }

    function isChainAllowlisted(uint64 chainSelector) external view returns (bool) {
        return allowlistedChains[chainSelector];
    }

    // ** LINK and ETH Functions ** //

    function depositLink(uint256 amount) external onlyOwner {
        require(amount > 0, "Cannot deposit zero LINK");
        require(s_linkToken.transferFrom(msg.sender, address(this), amount), "LINK transfer failed");
    }

    function withdrawLink(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        require(s_linkToken.transfer(to, amount), "LINK transfer failed");
    }

    receive() external payable {}
}
