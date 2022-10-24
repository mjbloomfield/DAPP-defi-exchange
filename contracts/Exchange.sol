//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping(address => uint256)) public tokens;
    //orders mapping
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 = > bool) public orderCancelled; //true or false

    event Deposit(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );
    event Withdraw(
        address token,
        address user,
        uint256 amount, 
        uint256 balance
    );
    event Order(
         uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    //way to model the order
    struct _Order {
        uint256 id; //unique identifier for order
        address user;//User who made order
        address tokenGet; //address of the token they receive
        uint256 amountGet; //Amount received
        address tokenGive; //address of the token they give
        uint256 amountGive; //amount given
        uint256 timestamp; //when order was created

    } 


    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
//--------------------------------
//Deposit & Withdraw Token

    function depositToken(address _token, uint256 _amount)
        public {
        //transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        //update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        //emit event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
            }

     function withdrawToken(address _token, uint256 _amount) 
        public {
        //ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount);
        //Transfer tokens to user
        Token(_token).transfer(msg.sender, _amount);

        //update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
        
        //emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);


    }


// Check Balances
    function balanceOf(address _token, address _user)
        public
        view
        returns(uint256)
        {
            return tokens[_token][_user];
        }

//-----------------
// Make & Cancel Order


function makeOrder(
    address _tokenGet,
    uint256 _amountGet,
    address _tokenGive,
    uint256 _amountGive
    ) public {

    // Token Give (the token they want to spend) - which token,  and how much?
    
    //Token Get (the token they want to receive) - which token, and how much?
   //Require token balance
    require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

   //Instantiate Order
    orderCount = orderCount + 1;
    
     orders[orderCount] = _Order(
        orderCount, //id
        msg.sender, //user
        _tokenGet,
        _amountGet,
        _tokenGive,
        _amountGive,
        block.timestamp //timestamp of bl0ck in epoch time
     );

     //Emit Event
    emit Order(
        orderCount,
        msg.sender,
        _tokenGet,
        _amountGet,
        _tokenGive,
        _amountGive,
        block.timestamp
    );
    
    }
    function cancelOrder(uint256 _id) public {
        //Fetch Order
        _Order storage _order = _orders[_id]; 
        // Cancel Order
        orderCancelled[_id] = true   
    }

}