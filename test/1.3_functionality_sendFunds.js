
var Protocol = artifacts.require("./Protocol.sol");

contract("functionality sendFunds", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
	var listOfAddresses = "Network1,Network2";
  var truffleAssert = require('truffle-assertions');



  it("[functionality sendFunds 1] - STANDARD sendFunds", async function() {
    var instance = await Protocol.deployed();

    // deadline not initialized yet
    assert.equal(
      await instance.getValidTime(),
      false,
      "[functionality sendFunds 5] Deadline is already set, should not be set yet.");

    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});

    var fundsTarget_after = await web3.eth.getBalance(TargetOwner);
    var fundsMitigator_after = await web3.eth.getBalance(MitigatorOwner);
    var fundsContract_after = await web3.eth.getBalance(contractAddress);
    var two_ether = await web3.utils.toWei('2.0', "ether");

    assert.equal(
      isAtMost(fundsTarget_after, subtraction(fundsTarget_before, two_ether)),
      true,
      "[functionality sendFunds 1] fundsTarget_after <= fundsTarget_before - 2 ether");

    assert.equal(
      fundsContract_before,
      0,
      "[functionality sendFunds 1] fundsContract_before should be 0.");

    assert.equal(
      fundsContract_after,
      two_ether,
      "[functionality sendFunds 1] fundsContract_after should be 2 ether");

    assert.equal(
      await instance.getCurrentState(),
      3,
      "[functionality sendFunds 1] State after approve(true) should be PROOF.");
  });


  it("[functionality sendFunds 2] - sendFunds MitigatorOwner", async function() {
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});


    // testing require() statement in sendFunds()
    await truffleAssert.reverts(
      instance.sendFunds({from: MitigatorOwner,value: await web3.utils.toWei('2.0', "ether")}),
      "[sendFunds] sender is not required actor");

    assert.equal(
      await instance.getCurrentState(),
      2,
      "[functionality sendFunds 2] State after approve(true) should be FUNDING.");

  });


  it("[functionality sendFunds 3] - sendFunds TargetOwner wrong State", async function() {
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});

    // set state to COMPLETE
    await instance.setState(6);

    // testing require() statement in sendFunds()
    await truffleAssert.reverts(
      instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")}),
      "[sendFunds] State is not appropriate");

    assert.equal(
      await instance.getCurrentState(),
      6,
      "[functionality sendFunds 3] State after sendFunds reverts and should be COMPLETE.");

  });


  it("[functionality sendFunds 4] - sendFunds TargetOwner OfferedFunds too small", async function() {
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});

    // testing require() statement in sendFunds()
    await truffleAssert.reverts(
      instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('1.0', "ether")}),
      "[sendFunds] send at least the offered funds");

    assert.equal(
      await instance.getCurrentState(),
      2,
      "[functionality sendFunds 4] State after sendFunds reverts and should be FUNDING.");

  });


  it("[functionality sendFunds 5] - sendFunds deadline", async function() {
    var instance_a = await Protocol.deployed();

    /* prepare states */
    await instance_a.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    // deadline not initialized yet
    await instance_a.approve(true, {from: MitigatorOwner});
    // deadline not initialized yet
    await instance_a.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});

    assert.equal(
      await instance_a.getValidTime(),
      true,
      "[functionality sendFunds 5] now < Deadline is not true");

    wait(3000);

    // new deadline should be set
    assert.equal(
      await instance_a.getValidTime(),
      false,
      "[functionality sendFunds 5] now > Deadline is not true");

    assert.equal(
      await instance_a.getCurrentState(),
      3,
      "[functionality sendFunds 5] State after approve(true) should be FUNDING.");

  });

});



function subtraction(a,b){
  return parseInt(a)-parseInt(b);
}

function isAtMost(a,b){
  if(a<=b){
    return true;
  }
  return false;
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
