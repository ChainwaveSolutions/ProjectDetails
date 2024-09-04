
// SPDX-License-Identifier: MIT


// link to published explorer: https://sepolia.etherscan.io/address/0x46508bCbEa60573D66eAA7040eeFc5A074095c4e#code
/*
* Treasury : 0xc690fE0d47803ed50E1EA7109a9750360117aa22
* USDC Token: See chain deets below
*/

/*
* Fuji
*
* test contract 1: 0x9A5De7C8faEacD606cE7F46422A6286C15a55F60
*
* router: 0xF694E193200268f9a4868e4Aa017A0118C9a8177
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
* test contract 1: 0x46508bCbEa60573D66eAA7040eeFc5A074095c4e
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




// File: @chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol


pragma solidity ^0.8.0;

// End consumer library.
library Client {
  /// @dev RMN depends on this struct, if changing, please notify the RMN maintainers.
  struct EVMTokenAmount {
    address token; // token address on the local chain.
    uint256 amount; // Amount of tokens.
  }

  struct Any2EVMMessage {
    bytes32 messageId; // MessageId corresponding to ccipSend on source.
    uint64 sourceChainSelector; // Source chain selector.
    bytes sender; // abi.decode(sender) if coming from an EVM chain.
    bytes data; // payload sent in original message.
    EVMTokenAmount[] destTokenAmounts; // Tokens and their amounts in their destination chain representation.
  }

  // If extraArgs is empty bytes, the default is 200k gas limit.
  struct EVM2AnyMessage {
    bytes receiver; // abi.encode(receiver address) for dest EVM chains
    bytes data; // Data payload
    EVMTokenAmount[] tokenAmounts; // Token transfers
    address feeToken; // Address of feeToken. address(0) means you will send msg.value.
    bytes extraArgs; // Populate this with _argsToBytes(EVMExtraArgsV1)
  }

  // bytes4(keccak256("CCIP EVMExtraArgsV1"));
  bytes4 public constant EVM_EXTRA_ARGS_V1_TAG = 0x97a657c9;
  struct EVMExtraArgsV1 {
    uint256 gasLimit;
  }

  function _argsToBytes(EVMExtraArgsV1 memory extraArgs) internal pure returns (bytes memory bts) {
    return abi.encodeWithSelector(EVM_EXTRA_ARGS_V1_TAG, extraArgs);
  }
}

// File: @chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol


pragma solidity ^0.8.0;


interface IRouterClient {
  error UnsupportedDestinationChain(uint64 destChainSelector);
  error InsufficientFeeTokenAmount();
  error InvalidMsgValue();

  /// @notice Checks if the given chain ID is supported for sending/receiving.
  /// @param chainSelector The chain to check.
  /// @return supported is true if it is supported, false if not.
  function isChainSupported(uint64 chainSelector) external view returns (bool supported);

  /// @notice Gets a list of all supported tokens which can be sent or received
  /// to/from a given chain id.
  /// @param chainSelector The chainSelector.
  /// @return tokens The addresses of all tokens that are supported.
  function getSupportedTokens(uint64 chainSelector) external view returns (address[] memory tokens);

  /// @param destinationChainSelector The destination chainSelector
  /// @param message The cross-chain CCIP message including data and/or tokens
  /// @return fee returns execution fee for the message
  /// delivery to destination chain, denominated in the feeToken specified in the message.
  /// @dev Reverts with appropriate reason upon invalid message.
  function getFee(
    uint64 destinationChainSelector,
    Client.EVM2AnyMessage memory message
  ) external view returns (uint256 fee);

  /// @notice Request a message to be sent to the destination chain
  /// @param destinationChainSelector The destination chain ID
  /// @param message The cross-chain CCIP message including data and/or tokens
  /// @return messageId The message ID
  /// @dev Note if msg.value is larger than the required fee (from getFee) we accept
  /// the overpayment with no refund.
  /// @dev Reverts with appropriate reason upon invalid message.
  function ccipSend(
    uint64 destinationChainSelector,
    Client.EVM2AnyMessage calldata message
  ) external payable returns (bytes32);
}

// File: @chainlink/contracts-ccip/src/v0.8/shared/interfaces/IOwnable.sol


pragma solidity ^0.8.0;

interface IOwnable {
  function owner() external returns (address);

  function transferOwnership(address recipient) external;

  function acceptOwnership() external;
}

// File: @chainlink/contracts-ccip/src/v0.8/shared/access/ConfirmedOwnerWithProposal.sol


pragma solidity ^0.8.0;


/// @title The ConfirmedOwner contract
/// @notice A contract with helpers for basic contract ownership.
contract ConfirmedOwnerWithProposal is IOwnable {
  address private s_owner;
  address private s_pendingOwner;

  event OwnershipTransferRequested(address indexed from, address indexed to);
  event OwnershipTransferred(address indexed from, address indexed to);

  constructor(address newOwner, address pendingOwner) {
    // solhint-disable-next-line custom-errors
    require(newOwner != address(0), "Cannot set owner to zero");

    s_owner = newOwner;
    if (pendingOwner != address(0)) {
      _transferOwnership(pendingOwner);
    }
  }

  /// @notice Allows an owner to begin transferring ownership to a new address.
  function transferOwnership(address to) public override onlyOwner {
    _transferOwnership(to);
  }

  /// @notice Allows an ownership transfer to be completed by the recipient.
  function acceptOwnership() external override {
    // solhint-disable-next-line custom-errors
    require(msg.sender == s_pendingOwner, "Must be proposed owner");

    address oldOwner = s_owner;
    s_owner = msg.sender;
    s_pendingOwner = address(0);

    emit OwnershipTransferred(oldOwner, msg.sender);
  }

  /// @notice Get the current owner
  function owner() public view override returns (address) {
    return s_owner;
  }

  /// @notice validate, transfer ownership, and emit relevant events
  function _transferOwnership(address to) private {
    // solhint-disable-next-line custom-errors
    require(to != msg.sender, "Cannot transfer to self");

    s_pendingOwner = to;

    emit OwnershipTransferRequested(s_owner, to);
  }

  /// @notice validate access
  function _validateOwnership() internal view {
    // solhint-disable-next-line custom-errors
    require(msg.sender == s_owner, "Only callable by owner");
  }

  /// @notice Reverts if called by anyone other than the contract owner.
  modifier onlyOwner() {
    _validateOwnership();
    _;
  }
}

// File: @chainlink/contracts-ccip/src/v0.8/shared/access/ConfirmedOwner.sol


pragma solidity ^0.8.0;


/// @title The ConfirmedOwner contract
/// @notice A contract with helpers for basic contract ownership.
contract ConfirmedOwner is ConfirmedOwnerWithProposal {
  constructor(address newOwner) ConfirmedOwnerWithProposal(newOwner, address(0)) {}
}

// File: @chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol


pragma solidity ^0.8.0;


/// @title The OwnerIsCreator contract
/// @notice A contract with helpers for basic contract ownership.
contract OwnerIsCreator is ConfirmedOwner {
  constructor() ConfirmedOwner(msg.sender) {}
}

// File: @chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol


pragma solidity ^0.8.0;


/// @notice Application contracts that intend to receive messages from
/// the router should implement this interface.
interface IAny2EVMMessageReceiver {
  /// @notice Called by the Router to deliver a message.
  /// If this reverts, any token transfers also revert. The message
  /// will move to a FAILED state and become available for manual execution.
  /// @param message CCIP Message
  /// @dev Note ensure you check the msg.sender is the OffRampRouter
  function ccipReceive(Client.Any2EVMMessage calldata message) external;
}

// File: @chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/utils/introspection/IERC165.sol


// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
// File: @chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol


pragma solidity ^0.8.0;




/// @title CCIPReceiver - Base contract for CCIP applications that can receive messages.
abstract contract CCIPReceiver is IAny2EVMMessageReceiver, IERC165 {
  address internal immutable i_ccipRouter;

  constructor(address router) {
    if (router == address(0)) revert InvalidRouter(address(0));
    i_ccipRouter = router;
  }

  /// @notice IERC165 supports an interfaceId
  /// @param interfaceId The interfaceId to check
  /// @return true if the interfaceId is supported
  /// @dev Should indicate whether the contract implements IAny2EVMMessageReceiver
  /// e.g. return interfaceId == type(IAny2EVMMessageReceiver).interfaceId || interfaceId == type(IERC165).interfaceId
  /// This allows CCIP to check if ccipReceive is available before calling it.
  /// If this returns false or reverts, only tokens are transferred to the receiver.
  /// If this returns true, tokens are transferred and ccipReceive is called atomically.
  /// Additionally, if the receiver address does not have code associated with
  /// it at the time of execution (EXTCODESIZE returns 0), only tokens will be transferred.
  function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
    return interfaceId == type(IAny2EVMMessageReceiver).interfaceId || interfaceId == type(IERC165).interfaceId;
  }

  /// @inheritdoc IAny2EVMMessageReceiver
  function ccipReceive(Client.Any2EVMMessage calldata message) external virtual override onlyRouter {
    _ccipReceive(message);
  }

  /// @notice Override this function in your implementation.
  /// @param message Any2EVMMessage
  function _ccipReceive(Client.Any2EVMMessage memory message) internal virtual;

  /////////////////////////////////////////////////////////////////////
  // Plumbing
  /////////////////////////////////////////////////////////////////////

  /// @notice Return the current router
  /// @return CCIP router address
  function getRouter() public view returns (address) {
    return address(i_ccipRouter);
  }

  error InvalidRouter(address router);

  /// @dev only calls from the set router are accepted.
  modifier onlyRouter() {
    if (msg.sender != address(i_ccipRouter)) revert InvalidRouter(msg.sender);
    _;
  }
}

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol


// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// File: @openzeppelin/contracts/security/ReentrancyGuard.sol


// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

// File: @openzeppelin/contracts/utils/math/SafeMath.sol


// OpenZeppelin Contracts (last updated v4.9.0) (utils/math/SafeMath.sol)

pragma solidity ^0.8.0;

// CAUTION
// This version of SafeMath should only be used with Solidity 0.8 or later,
// because it relies on the compiler's built in overflow checks.

/**
 * @dev Wrappers over Solidity's arithmetic operations.
 *
 * NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
 * now has built in overflow checking.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator.
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {trySub}.
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting with custom message when dividing by zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryMod}.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a % b;
        }
    }
}

// File: @openzeppelin/contracts/utils/structs/EnumerableSet.sol


// OpenZeppelin Contracts (last updated v5.0.0) (utils/structs/EnumerableSet.sol)
// This file was procedurally generated from scripts/generate/templates/EnumerableSet.js.

pragma solidity ^0.8.20;

/**
 * @dev Library for managing
 * https://en.wikipedia.org/wiki/Set_(abstract_data_type)[sets] of primitive
 * types.
 *
 * Sets have the following properties:
 *
 * - Elements are added, removed, and checked for existence in constant time
 * (O(1)).
 * - Elements are enumerated in O(n). No guarantees are made on the ordering.
 *
 * ```solidity
 * contract Example {
 *     // Add the library methods
 *     using EnumerableSet for EnumerableSet.AddressSet;
 *
 *     // Declare a set state variable
 *     EnumerableSet.AddressSet private mySet;
 * }
 * ```
 *
 * As of v3.3.0, sets of type `bytes32` (`Bytes32Set`), `address` (`AddressSet`)
 * and `uint256` (`UintSet`) are supported.
 *
 * [WARNING]
 * ====
 * Trying to delete such a structure from storage will likely result in data corruption, rendering the structure
 * unusable.
 * See https://github.com/ethereum/solidity/pull/11843[ethereum/solidity#11843] for more info.
 *
 * In order to clean an EnumerableSet, you can either remove all elements one by one or create a fresh instance using an
 * array of EnumerableSet.
 * ====
 */
library EnumerableSet {
    // To implement this library for multiple types with as little code
    // repetition as possible, we write it in terms of a generic Set type with
    // bytes32 values.
    // The Set implementation uses private functions, and user-facing
    // implementations (such as AddressSet) are just wrappers around the
    // underlying Set.
    // This means that we can only create new EnumerableSets for types that fit
    // in bytes32.

    struct Set {
        // Storage of set values
        bytes32[] _values;
        // Position is the index of the value in the `values` array plus 1.
        // Position 0 is used to mean a value is not in the set.
        mapping(bytes32 value => uint256) _positions;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function _add(Set storage set, bytes32 value) private returns (bool) {
        if (!_contains(set, value)) {
            set._values.push(value);
            // The value is stored at length-1, but we add 1 to all indexes
            // and use 0 as a sentinel value
            set._positions[value] = set._values.length;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function _remove(Set storage set, bytes32 value) private returns (bool) {
        // We cache the value's position to prevent multiple reads from the same storage slot
        uint256 position = set._positions[value];

        if (position != 0) {
            // Equivalent to contains(set, value)
            // To delete an element from the _values array in O(1), we swap the element to delete with the last one in
            // the array, and then remove the last element (sometimes called as 'swap and pop').
            // This modifies the order of the array, as noted in {at}.

            uint256 valueIndex = position - 1;
            uint256 lastIndex = set._values.length - 1;

            if (valueIndex != lastIndex) {
                bytes32 lastValue = set._values[lastIndex];

                // Move the lastValue to the index where the value to delete is
                set._values[valueIndex] = lastValue;
                // Update the tracked position of the lastValue (that was just moved)
                set._positions[lastValue] = position;
            }

            // Delete the slot where the moved value was stored
            set._values.pop();

            // Delete the tracked position for the deleted slot
            delete set._positions[value];

            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function _contains(Set storage set, bytes32 value) private view returns (bool) {
        return set._positions[value] != 0;
    }

    /**
     * @dev Returns the number of values on the set. O(1).
     */
    function _length(Set storage set) private view returns (uint256) {
        return set._values.length;
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function _at(Set storage set, uint256 index) private view returns (bytes32) {
        return set._values[index];
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function _values(Set storage set) private view returns (bytes32[] memory) {
        return set._values;
    }

    // Bytes32Set

    struct Bytes32Set {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(Bytes32Set storage set, bytes32 value) internal returns (bool) {
        return _add(set._inner, value);
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(Bytes32Set storage set, bytes32 value) internal returns (bool) {
        return _remove(set._inner, value);
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(Bytes32Set storage set, bytes32 value) internal view returns (bool) {
        return _contains(set._inner, value);
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(Bytes32Set storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(Bytes32Set storage set, uint256 index) internal view returns (bytes32) {
        return _at(set._inner, index);
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(Bytes32Set storage set) internal view returns (bytes32[] memory) {
        bytes32[] memory store = _values(set._inner);
        bytes32[] memory result;

        /// @solidity memory-safe-assembly
        assembly {
            result := store
        }

        return result;
    }

    // AddressSet

    struct AddressSet {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(AddressSet storage set, address value) internal returns (bool) {
        return _add(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(AddressSet storage set, address value) internal returns (bool) {
        return _remove(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(AddressSet storage set, address value) internal view returns (bool) {
        return _contains(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(AddressSet storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(AddressSet storage set, uint256 index) internal view returns (address) {
        return address(uint160(uint256(_at(set._inner, index))));
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(AddressSet storage set) internal view returns (address[] memory) {
        bytes32[] memory store = _values(set._inner);
        address[] memory result;

        /// @solidity memory-safe-assembly
        assembly {
            result := store
        }

        return result;
    }

    // UintSet

    struct UintSet {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(UintSet storage set, uint256 value) internal returns (bool) {
        return _add(set._inner, bytes32(value));
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(UintSet storage set, uint256 value) internal returns (bool) {
        return _remove(set._inner, bytes32(value));
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(UintSet storage set, uint256 value) internal view returns (bool) {
        return _contains(set._inner, bytes32(value));
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(UintSet storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(UintSet storage set, uint256 index) internal view returns (uint256) {
        return uint256(_at(set._inner, index));
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(UintSet storage set) internal view returns (uint256[] memory) {
        bytes32[] memory store = _values(set._inner);
        uint256[] memory result;

        /// @solidity memory-safe-assembly
        assembly {
            result := store
        }

        return result;
    }
}

// File: stakingBridgetestcompiled.sol



/*
* Treasury : 0xc690fE0d47803ed50E1EA7109a9750360117aa22
* USDC Token: See chain deets below
*/

/*
* Fuji
*
* test contract 1: 0x9A5De7C8faEacD606cE7F46422A6286C15a55F60
*
* router: 0xF694E193200268f9a4868e4Aa017A0118C9a8177
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
* test contract 1: 0x46508bCbEa60573D66eAA7040eeFc5A074095c4e
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

pragma solidity ^0.8.19;









contract ChainwaveUsdcCcipBridgeWithIntegratedStaking is CCIPReceiver, OwnerIsCreator, ReentrancyGuard {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    // Chainlink Router and LINK token interfaces
    IRouterClient private router;
    IERC20 private s_linkToken;

    // Stablecoin token interface (e.g., USDC)
    IERC20 private immutable token;

    // Allowlisted chains
    mapping(uint64 => bool) public allowlistedChains;

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
     */
    function lockAndSend(uint256 amount, uint64 destinationChainSelector) external nonReentrant onlyAllowlistedChain(destinationChainSelector) ensureHealthyPool {
        require(amount > 0, "Amount must be greater than zero");

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
            receiver: abi.encode(msg.sender),
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
