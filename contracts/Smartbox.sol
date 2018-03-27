pragma solidity ^0.4.18;

contract Smartbox {
	mapping (uint256 => mapping (address => bool)) public authorizedUsers;
	uint256 public index;

	address public owner;
	address public renter;

	uint256 public endTimestamp;
	uint256 public duration;
	uint256 minimumAmount = 0.001 ether;

	event Rented(address indexed smartbox, address indexed _from, uint256 _value);
	event Opened(address indexed smartbox, address indexed _from);
	event Returned(address indexed smartbox, address indexed _from);
	event Authorized(address indexed smartbox, address indexed _from);

	function Smartbox() public {
		owner = msg.sender;
	}

	function rent() public payable {
//		check if the smart box is available
		require (now > endTimestamp);

//		check ether transferred
		require (msg.value >= minimumAmount);

//		calculate the duration for the rent based on the ether transferred
//		minimumAmount corresponds one minute renting time
		duration = (msg.value / minimumAmount);

//		set the variable authorizedUsers and endTimestamp
		endTimestamp = now + duration * 60;
		index += 1;
		authorizedUsers[index][msg.sender] = true;
		renter = msg.sender;

//		emit the event Rented
		Rented(address(this), msg.sender, duration);

//		smart contracts possesses the ether. The ether should be transferred to the smart box owner in the future.
	}

	function open() public {
//		check if permissioned
		require (authorizedUsers[index][msg.sender] == true);

		Opened(address(this), msg.sender);
	}

	function withdraw() public {
		require(owner == msg.sender);
		require(address(this).balance > 0);
		owner.transfer(address(this).balance);
	}

	function isUserAuthorized(address account) public view returns (bool) {
		return authorizedUsers[index][account];
	}

	function returnBox() public {
		require (authorizedUsers[index][msg.sender] == true || msg.sender == owner);

		delete authorizedUsers[index][msg.sender];
		endTimestamp = 0;
		Returned(address(this), msg.sender);
	}

	function authorizeUser(address account) public {
		require(renter == msg.sender);
		authorizedUsers[index][account] = true;
		Authorized(address(this), account);
	}
}
