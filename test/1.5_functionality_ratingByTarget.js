
var Protocol = artifacts.require("./Protocol.sol");

contract("functionality ratingByTarget", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
	var listOfAddresses = "Network1,Network2";
  var truffleAssert = require('truffle-assertions');

  it("[functionality ratingByTarget 1] - ratingByTarget require RATE_T", async function() {
    /* checking whether states to be correct after usual call of
       ratingByTarget   */
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    // check state to be RATE_T
    assert.equal(
      await instance.getCurrentState(),
      4,
      "[functionality ratingByTarget 1] State after sendFunds should be RATE_T.");

    // preconditions are ok
    await instance.ratingByTarget(2, {from: TargetOwner});

    // check currentState to be RATE_M
    assert.equal(
      await instance.getCurrentState(),
      5,
      "[functionality ratingByTarget 1] currentState should be RATE_M, is currently not.");


    // check targetRating to be same as defined in ratingByTarget(2, {from: TargetOwner});
    assert.equal(
      await instance.getTargetRating(),
      2,
      "[functionality ratingByTarget 1] targetState should be positive, is currently not");

    // set state to COMPLETED
    await instance.setState(6);

    // testing require in ratingByTarget(rating)
    await truffleAssert.reverts(
      instance.ratingByTarget(2, {from: TargetOwner}),
      "[ratingByTarget] State is not appropriate");
  });

  it("[functionality ratingByTarget 2] - ratingByTarget require msg.sender == TargetOwner", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    // check state to be RATE_T
    assert.equal(
      await instance.getCurrentState(),
      4,
      "[functionality ratingByTarget 2] State after sendFunds should be RATE_T.");

    // testing require in ratingByTarget(rating)
    await truffleAssert.reverts(
      instance.ratingByTarget(2, {from: MitigatorOwner}),
      "[ratingByTarget] sender is not required actor");


    // check state to be RATE_M
    assert.equal(
      await instance.getCurrentState(),
      4,
      "[functionality ratingByTarget 2] currentState should be RATE_M, is currently not.");
  });

  it("[functionality ratingByTarget 3] - ratingByTarget with delay TargetOwner", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /* check for await instance.ratingByTarget(0, {from: TargetOwner}); */
    assert.equal(
      await instance.getCurrentState(),
      4,
      "[functionality ratingByTarget 3] State after sendFunds should be RATE_T.");

    wait(3000);
    await instance.ratingByTarget(0, {from: TargetOwner});

    // oldDeadline < Deadline
    var oldDeadline = await instance.getOldDeadline();
    var Deadline = await instance.getDeadline();

    //assert.equal(await instance.compareDeadlines(oldDeadline, Deadline),true,"[functionality ratingByTarget 3] OldDeadline < Deadline is not true");

    /* check state to be RATE_M */
    assert.equal(
      await instance.getCurrentState(),
      5,
      "[functionality ratingByTarget 3] currentState should be RATE_M, is currently not.");

    /* because of the wait the targetrating always is NOT_AVAILABLE and the
       current state would be RATE_M */
    assert.equal(
      await instance.getTargetRating(),
      1,
      "[functionality ratingByTarget 3] TargetState should be NOT_AVAILABLE, is currently not.");



    /* check for await instance.ratingByTarget(1, {from: TargetOwner}); */
    await instance.setState(4);

    wait(3000);
    await instance.ratingByTarget(1, {from: TargetOwner});

    // oldDeadline < Deadline
    var oldDeadline = await instance.getOldDeadline();
    var Deadline = await instance.getDeadline();

    assert.equal(
      await instance.compareDeadlines(oldDeadline, Deadline),
      true,
      "[functionality ratingByTarget 3] OldDeadline < Deadline is not true");

    assert.equal(
      await instance.getCurrentState(),
      5,
      "[functionality ratingByTarget 3] currentState should be RATE_M, is currently not.");

    assert.equal(
      await instance.getTargetRating(),
      1,
      "[functionality ratingByTarget 3] TargetState should be NOT_AVAILABLE, is currently not.");



    /* check for await instance.ratingByTarget(2, {from: TargetOwner}); */
    await instance.setState(4);

    wait(3000);
    await instance.ratingByTarget(2, {from: TargetOwner});

    // oldDeadline < Deadline
    var oldDeadline = await instance.getOldDeadline();
    var Deadline = await instance.getDeadline();

    assert.equal(
      await instance.compareDeadlines(oldDeadline, Deadline),
      true,
      "[functionality ratingByTarget 3] OldDeadline < Deadline is not true");

    assert.equal(
      await instance.getCurrentState(),
      5,
      "[functionality ratingByTarget 3] currentState should be RATE_M, is currently not.");

    assert.equal(
      await instance.getTargetRating(),
      1,
      "[functionality ratingByTarget 3] TargetState should be NOT_AVAILABLE, is currently not.");

  });

  it("[functionality ratingByTarget 4] - ratingByTarget without proof", async function() {
    /* without proof it ends the process here */
    var instance = await Protocol.deployed();
    var uploadedProof = "";

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof(uploadedProof, {from: MitigatorOwner});



    /* check with delay and no proof */
    wait(3000);
    await instance.ratingByTarget(0, {from: TargetOwner});

    // oldDeadline < Deadline
    var oldDeadline = await instance.getOldDeadline();
    var Deadline = await instance.getDeadline();

    assert.equal(
      await instance.compareDeadlines(oldDeadline, Deadline),
      true,
      "[functionality ratingByTarget 4] OldDeadline < Deadline is not true");

    /* check state to be ABORT because  (bytes(Proof).length==0) in ratingByTarget*/
    assert.equal(
      await instance.getCurrentState(),
      7,
      "[functionality ratingByTarget 4] currentState should be ABORT, is currently not.");

    /* because of the wait the targetrating always is NOT_AVAILABLE and the
       current state would be RATE_M */
    assert.equal(
      await instance.getTargetRating(),
      1,
      "[functionality ratingByTarget 4] TargetState should be NOT_AVAILABLE, is currently not.");

    /* get up to date deadlines
    the process has ended here and (deadline < endtime) */
    var oldDeadline = await instance.getOldDeadline();
    var Deadline = await instance.getDeadline();
    var EndTime = await instance.getEndTime();

    assert.equal(
      await instance.compareDeadlines(oldDeadline, EndTime),
      true,
      "[functionality ratingByTarget 4] OldDeadline < EndTime is not true");

    assert.equal(
      await instance.compareDeadlines(EndTime, oldDeadline),
      false,
      "[functionality ratingByTarget 4] Endtime < OldDeadline is true");



    /* check wihtout delay and no proof and DISSATISFIED*/
    await instance.setState(4);
    assert.equal(
      await instance.getCurrentState(),
      4,
      "[functionality ratingByTarget 4] currentState should be RATE_T, is currently not.");

    await instance.ratingByTarget(0, {from: TargetOwner});

    /* check state to be COMPLETE because  (bytes(Proof).length==0) in and DISSATISFIED */
    assert.equal(
      await instance.getCurrentState(),
      6,
      "[functionality ratingByTarget 4] currentState should be COMPLETED, is currently not.");

    /* because of the wait the targetrating always is NOT_AVAILABLE and the
       current state would be RATE_M */
    assert.equal(
      await instance.getTargetRating(),
      0,
      "[functionality ratingByTarget 4] TargetState should be NOT_AVAILABLE, is currently not.");





    /* check wihtout delay and no proof and NOT_AVAILABLE*/
    await instance.setState(4);
    assert.equal(
      await instance.getCurrentState(),
      4,
      "[functionality ratingByTarget 4] currentState should be RATE_T, is currently not.");

    await instance.ratingByTarget(1, {from: TargetOwner});

    /* check state to be COMPLETE because  (bytes(Proof).length==0) in and DISSATISFIED */
    assert.equal(
      await instance.getCurrentState(),
      7,
      "[functionality ratingByTarget 4] currentState should be ABORT, is currently not.");

    /* because of the wait the targetrating always is NOT_AVAILABLE and the
       current state would be RATE_M */
    assert.equal(
      await instance.getTargetRating(),
      1,
      "[functionality ratingByTarget 4] TargetState should be NOT_AVAILABLE, is currently not.");



    /* check wihtout delay and no proof and POSITIVE*/
    await instance.setState(4);
    assert.equal(
      await instance.getCurrentState(),
      4,
      "[functionality ratingByTarget 4] currentState should be RATE_T, is currently not.");

    await instance.ratingByTarget(2, {from: TargetOwner});

    /* check state to be COMPLETE because  (bytes(Proof).length==0) in and DISSATISFIED */
    assert.equal(
      await instance.getCurrentState(),
      7,
      "[functionality ratingByTarget 4] currentState should be ABORT, is currently not.");

    /* because of the wait the targetrating always is NOT_AVAILABLE and the
       current state would be RATE_M */
    assert.equal(
      await instance.getTargetRating(),
      2,
      "[functionality ratingByTarget 4] TargetState should be NOT_AVAILABLE, is currently not.");



  });

});

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
