// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Savings is ReentrancyGuard {
    mapping(address => uint256) public _savings;

    function deposit() public payable {
        _savings[msg.sender] += msg.value;
    }

    // Unsafe withdrawal, vulnerable to reentrant calls
    // Don't do this
    function unsafeWithdraw() public {
        uint256 amount = _savings[msg.sender];
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw savings");
        _savings[msg.sender] = 0;
    }

    // Safe withdrawal v1
    // Checks-Effects-Interactions Pattern
    function safeWithdrawV1() public {
        uint256 amount = _savings[msg.sender];
        _savings[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw savings");
    }

    // Safe withdrawal v2
    // Using a mutex as a "lock"
    bool private _mutex = false;

    function safeWithdrawV2() public {
        require(!_mutex, "Reentrant calls are not allowed!");
        _mutex = true; // lock

        uint256 amount = _savings[msg.sender];
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw savings");
        _savings[msg.sender] = 0;

        _mutex = false; // unlock
    }


    // Safe withdrawal v3
    // OpenZeppelin ReentrancyGuard (gas efficient)
    function safeWithdrawV3() public nonReentrant {
        uint256 amount = _savings[msg.sender];
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw savings");
        _savings[msg.sender] = 0;
    }

    function getStoredSavings() public view returns (uint256) {
        return address(this).balance;
    }
}