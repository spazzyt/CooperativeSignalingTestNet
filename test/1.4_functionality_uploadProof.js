
var Protocol = artifacts.require("./Protocol.sol");

contract("functionality uploadProof", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
	var listOfAddresses = "Network1,Network2";
  var truffleAssert = require('truffle-assertions');

  it("[functionality uploadProof 1] - upload proof", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});

    // set state to COMPLETED
    await instance.setState(6);

    // testing require() statement in uploadProof()
    await truffleAssert.reverts(
      instance.uploadProof("PROOF", {from: MitigatorOwner}),
      "[uploadProof] State is not appropriate");

    // set state to PROOF
    await instance.setState(3);

    // testing require() statement in uploadProof()
    await truffleAssert.reverts(
      instance.uploadProof("PROOF", {from: TargetOwner}),
      "[uploadProof] sender is not required actor");
  });



  it("[functionality uploadProof 2] - upload proof with delay MitigatorOwner.", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});

    // check state to be PROOF
    assert.equal(
      await instance.getCurrentState(),
      3,
      "[functionality uploadProof 2] State after sendFunds should be PROOF.");

    // check time before wait to be valid
    assert.equal(
      await instance.getValidTime(),
      true,
      "[functionality uploadProof 2] now < Deadline is not true");

    // wait 3000 to set new deadline in uploadProof function
    wait(3000);

    // check time before wait to be not valid after wait
    assert.equal(
      await instance.getValidTime(),
      false,
      "[functionality uploadProof 2] now < Deadline is not true");

    await instance.uploadProof("PROOF", {from: MitigatorOwner});

    // check time after setNewDeadline() to be valid after function call
    assert.equal(
      await instance.getValidTime(),
      true,
      "[functionality uploadProof 2] now < Deadline is not true");

    // oldDeadline < Deadline
    var oldDeadline = await instance.getOldDeadline();
    var Deadline = await instance.getDeadline();


/*    assert.equal(
      await instance.compareDeadlines(oldDeadline, Deadline),
      true,
      "[functionality uploadProof 2] OldDeadline < Deadline is not true");*/
  });



});



function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
