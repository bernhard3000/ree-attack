const Savings = artifacts.require("Savings");
const Evil = artifacts.require("Evil");

module.exports = function (deployer) {
  deployer.deploy(Savings);
  deployer.deploy(Evil);
};
