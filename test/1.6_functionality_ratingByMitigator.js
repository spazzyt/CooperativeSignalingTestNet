
var Protocol = artifacts.require("./Protocol.sol");

contract("functionality ratingByMitigator", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
	var listOfAddresses = "Network1,Network2";
  var truffleAssert = require('truffle-assertions');

  it("[functionality ratingByMitigator 1.1] - ratingByMitigator require RATE_M to ESCALATE", async function() {
    /* checking whether states to be correct after usual call of ratingByTarget   */
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /* preconditions are ok */
    await instance.ratingByTarget(0, {from: TargetOwner});

    /* check currentState to be RATE_M */
    assert.equal(await instance.getCurrentState(),5,"[functionality ratingByMitigator 1.1] currentState should be RATE_M.");

    /* check targetRating to be same as defined in ratingByTarget(0, {from: TargetOwner}); */
    assert.equal(await instance.getTargetRating(),0,"[functionality ratingByMitigator 1.1] targetState should be 0 (Dissatisfied)");

    /* preconditions are ok, here structure similar to 2.7_scenario.js */
    await instance.ratingByMitigator(0, {from: MitigatorOwner});

    /* check standard ratingByMitigator is working as expected */
    assert.equal(await instance.getCurrentState(),8,"[functionality ratingByMitigator 1.1] currentState should be ESCALATE.");

    /* set state manually to a not allowed state for ratingByMitigator */
    await instance.setState(4);

    /* testing require in ratingByTarget(rating) */
    await truffleAssert.reverts(instance.ratingByMitigator(0, {from: MitigatorOwner}),"[ratingByMitigator] State is not appropriate");

  });


  it("[functionality ratingByMitigator 1.2] - ratingByMitigator require RATE_M to COMPLETE", async function() {
    /* checking whether states to be correct after usual call of ratingByTarget   */
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /* preconditions are ok */
    await instance.ratingByTarget(2, {from: TargetOwner});

    /* check currentState to be RATE_M */
    assert.equal(await instance.getCurrentState(),5,"[functionality ratingByMitigator 1.2] currentState should be RATE_M.");

    /* check targetRating to be same as defined in ratingByTarget(0, {from: TargetOwner}); */
    assert.equal(await instance.getTargetRating(),2,"[functionality ratingByMitigator 1.2] targetState should be 0 (Dissatisfied)");

    /* preconditions are ok, here structure similar to 2.3_scenario.js */
    await instance.ratingByMitigator(2, {from: MitigatorOwner});

    /* check standard ratingByMitigator is working as expected */
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 1.2] currentState should be COMPLETE.");

    /* set state manually to a not allowed state for ratingByMitigator */
    await instance.setState(4);

    /* testing require in ratingByTarget(rating) */
    await truffleAssert.reverts(instance.ratingByMitigator(0, {from: MitigatorOwner}),"[ratingByMitigator] State is not appropriate");
  });


  it("[functionality ratingByMitigator 1.3] - ratingByMitigator require RATE_M to ABORT", async function() {
    /* checking whether states to be correct after usual call of ratingByTarget */
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /* preconditions are ok */
    await instance.ratingByTarget(2, {from: TargetOwner});

    /* check currentState to be RATE_M */
    assert.equal(await instance.getCurrentState(),5,"[functionality ratingByMitigator 1.3] currentState should be RATE_M.");

    /* check targetRating to be same as defined in ratingByTarget(0, {from: TargetOwner}); */
    assert.equal(await instance.getTargetRating(),2,"[functionality ratingByMitigator 1.3] targetState should be 0 (Dissatisfied)");


    wait(3000);

    /* preconditions are ok, here structure similar to 2.4_scenario.js */
    await instance.ratingByMitigator(2, {from: MitigatorOwner});


    /*  */
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 1.3] Mitigator rating should be NOT_AVAILABLE.");

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();


    /* check time before wait to be valid */
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 1.3] now < Deadline is not true");

    /* check standard ratingByMitigator is working as expected */
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 1.3] currentState should be ABORT.");

    /* set state manually to a not allowed state for ratingByMitigator */
    await instance.setState(4);

    /* testing require in ratingByTarget(rating) */
    await truffleAssert.reverts(instance.ratingByMitigator(0, {from: MitigatorOwner}),"[ratingByMitigator] State is not appropriate");
  });



  it("[functionality ratingByMitigator 2] - ratingByMitigator require correct sender", async function() {
    /* checking whether states to be correct after usual call of
       ratingByTarget   */
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /* preconditions are ok */
    await instance.ratingByTarget(2, {from: TargetOwner});

    /* check currentState to be RATE_M */
    assert.equal(await instance.getCurrentState(),5,"[functionality ratingByMitigator 2] currentState should be RATE_M.");

    /* check targetRating to be same as defined in ratingByTarget(0, {from: TargetOwner}); */
    assert.equal(await instance.getTargetRating(),2,"[functionality ratingByMitigator 2] targetState should be 0 (Dissatisfied)");

    /* testing require in ratingByTarget(rating) */
    await truffleAssert.reverts(instance.ratingByMitigator(2, {from: TargetOwner}),"[ratingByMitigator] sender is not required actor");

    /* check ratingByMitigator to stay the same as before calling ratingByMitigator */
    assert.equal(await instance.getCurrentState(),5,"[functionality ratingByMitigator 2] currentState should be RATE_M.");

    /* set state manually to a not allowed state for ratingByMitigator */
    await instance.setState(4);

    /* testing require in ratingByTarget(rating) */
    await truffleAssert.reverts(instance.ratingByMitigator(0, {from: MitigatorOwner}),"[ratingByMitigator] State is not appropriate");
  });







  /* #################################################################################################### */
  it("[functionality ratingByMitigator 3.1] - ratingByMitigator with delay with proof 0-0 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});


    /*  ratingByTarget(0) -> ratingByMitigator(0) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(0, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),false,"[functionality 3.1] Time should not be valid after delay.");
    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.1] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 3.1] currentState should be COMPLETE.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.1] TargetState should be DISSATISFIED.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 3.2] - ratingByMitigator with delay with proof 1-0 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});


    /*  ratingByTarget(1) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(0, {from: MitigatorOwner});

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.2] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 3.2] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.2] TargetState should be DISSATISFIED.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 3.3] - ratingByMitigator with delay with proof 2-0 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});


    /*  ratingByTarget(2) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(0, {from: MitigatorOwner});

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.3] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 3.3] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.3] TargetState should be DISSATISFIED.");
    /* ------------------------------------------------------- */
  });

  it("[functionality ratingByMitigator 3.4] - ratingByMitigator with delay with proof 0-1 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});


    /*  ratingByTarget(0) -> ratingByMitigator(1) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(1, {from: MitigatorOwner});

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.4] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 3.4] currentState should be COMPLETE.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.4] TargetState should be DISSATISFIED.");
    /* ------------------------------------------------------- */
  });

  it("[functionality ratingByMitigator 3.5] - ratingByMitigator with delay with proof 1-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(1) = ABORT */
    await instance.ratingByTarget(1, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(1, {from: MitigatorOwner});

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.5] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 3.5] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.5] TargetState should be DISSATISFIED.");
    /* ------------------------------------------------------- */
  });

  it("[functionality ratingByMitigator 3.6] - ratingByMitigator with delay with proof 2-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(2) -> ratingByMitigator(1) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(1, {from: MitigatorOwner});

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.6] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 3.6] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.6] TargetState should be DISSATISFIED.");
    /* ------------------------------------------------------- */
  });


  it("[functionality ratingByMitigator 3.7] - ratingByMitigator with delay with proof 0-2 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});


    /*  ratingByTarget(0) -> ratingByMitigator(2) = COMPLETE */
    await instance.ratingByTarget(0, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(2, {from: MitigatorOwner});

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.7] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 3.7] currentState should be COMPLETE.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.7] TargetState should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */
  });

  it("[functionality ratingByMitigator 3.8] - ratingByMitigator with delay with proof 1-2 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});


    /*  ratingByTarget(1) -> ratingByMitigator(2) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(2, {from: MitigatorOwner});

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.8] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 3.8] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.8] MitigatorRating should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */
  });


  it("[functionality ratingByMitigator 3.9] - ratingByMitigator with delay with proof 2-2 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});


    /*  ratingByTarget(2) -> ratingByMitigator(2) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    wait(3000);
    await instance.ratingByMitigator(2, {from: MitigatorOwner});

    var oldDeadline = await instance.getOldDeadline();
    var endTime = await instance.getEndTime();
    assert.equal(await instance.compareDeadlines(oldDeadline, endTime),true,"[functionality ratingByMitigator 3.9] OldDeadline < Deadline is not true");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 3.9] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 3.9] MitigatorRating should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */

  });












  /* #################################################################################################### */
  it("[functionality ratingByMitigator 4.1] - ratingByMitigator with delay without proof 0-0 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(0) -> ratingByMitigator(0) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 4.1] currentState should be COMPLETE.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(0, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 4.1] currentState should be COMPLETE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 4.2] - ratingByMitigator with delay without proof 1-0 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.2] currentState should be ABORT.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(0, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.2] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 4.3] - ratingByMitigator with delay without proof 2-0 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(2) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.3] currentState should be ABORT.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(0, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.3] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 4.4] - ratingByMitigator with delay without proof 0-1 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(0) -> ratingByMitigator(1) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 4.4] currentState should be COMPLETE.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(1, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 4.4] currentState should be COMPLETE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 4.5] - ratingByMitigator with delay without proof 1-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(1) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.5] currentState should be ABORT.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(1, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.5] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 4.6] - ratingByMitigator with delay without proof 2-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(2) -> ratingByMitigator(1) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.6] currentState should be ABORT.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(1, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.6] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 4.7] - ratingByMitigator with delay without proof 0-2 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(0) -> ratingByMitigator(2) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 4.7] currentState should be COMPLETE.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(2, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 4.7] currentState should be COMPLETE.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 4.8] - ratingByMitigator with delay without proof 1-2 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(2) = COMPLETE  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.8] currentState should be ABORT.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(2, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.8] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 4.9] - ratingByMitigator with delay without proof 2-2 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(2) -> ratingByMitigator(2) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.9] currentState should be ABORT.");

    await instance.setState(5);
    wait(3000);

    await instance.ratingByMitigator(2, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 4.9] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });











  /* #################################################################################################### */
  it("[functionality ratingByMitigator 5.1] - ratingByMitigator without delay without proof 0-0 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(0) -> ratingByMitigator(0) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 5.1] currentState should be COMPLETE.");

    await instance.setState(5);

    await instance.ratingByMitigator(0, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 5.1] currentState should be COMPLETE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 5.2] - ratingByMitigator without delay without proof 1-0 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.2] currentState should be ABORT.");

    await instance.setState(5);

    await instance.ratingByMitigator(0, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.2] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 5.3] - ratingByMitigator without delay without proof 0-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(2) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.3] currentState should be ABORT.");

    await instance.setState(5);

    await instance.ratingByMitigator(0, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.3] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 5.4] - ratingByMitigator without delay without proof 0-1 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(0) -> ratingByMitigator(1) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 5.4] currentState should be COMPLETE.");

    await instance.setState(5);

    await instance.ratingByMitigator(1, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 5.4] currentState should be COMPLETE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 5.5] - ratingByMitigator without delay without proof 1-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(1) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.5] currentState should be ABORT.");

    await instance.setState(5);

    await instance.ratingByMitigator(1, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.5] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 5.6] - ratingByMitigator without delay without proof 2-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(2) -> ratingByMitigator(1) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.6] currentState should be ABORT.");

    await instance.setState(5);

    await instance.ratingByMitigator(1, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.6] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 5.7] - ratingByMitigator without delay without proof 0-2 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(0) -> ratingByMitigator(2) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 5.7] currentState should be COMPLETE.");

    await instance.setState(5);

    await instance.ratingByMitigator(2, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 5.7] currentState should be COMPLETE.");
    /* ------------------------------------------------------- */

  });


  it("[functionality ratingByMitigator 5.8] - ratingByMitigator without delay without proof 1-2 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(2) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.8] currentState should be ABORT.");

    await instance.setState(5);

    await instance.ratingByMitigator(2, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.8] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });



  it("[functionality ratingByMitigator 5.9] - ratingByMitigator without delay without proof 2-2 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(2) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.9] currentState should be ABORT.");

    await instance.setState(5);

    await instance.ratingByMitigator(2, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 5.9] currentState should be ABORT.");
    /* ------------------------------------------------------- */

  });









/* #################################################################################################### */
  it("[functionality ratingByMitigator 6.1] - ratingByMitigator without delay with proof 0-0 ESCALATE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(0) -> ratingByMitigator(0) = ESCALATE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    await instance.ratingByMitigator(0, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.1] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),8,"[functionality ratingByMitigator 6.1] currentState should be ESCALATE.");
    assert.equal(await instance.getMitigatorRating(),0,"[functionality ratingByMitigator 6.1] MitigatorRating should be DISSATISFIED.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 6.2] - ratingByMitigator without delay with proof 1-0 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = COMPLETE  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    await instance.ratingByMitigator(0, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.2] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 6.2] currentState should be COMPLETE.");
    assert.equal(await instance.getMitigatorRating(),0,"[functionality ratingByMitigator 6.2] MitigatorRating should be DISSATISFIED.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 6.3] - ratingByMitigator without delay with proof 2-0 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    await instance.ratingByMitigator(0, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.3] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 6.3] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),0,"[functionality ratingByMitigator 6.3] MitigatorRating should be DISSATISFIED.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 6.4] - ratingByMitigator without delay with proof 0-1 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    await instance.ratingByMitigator(1, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.4] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 6.4] currentState should be COMPLETE.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 6.4] MitigatorRating should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 6.5] - ratingByMitigator without delay with proof 1-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    await instance.ratingByMitigator(1, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.5] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 6.5] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 6.5] MitigatorRating should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 6.6] - ratingByMitigator without delay with proof 2-1 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    await instance.ratingByMitigator(1, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.6] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 6.6] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),1,"[functionality ratingByMitigator 6.6] MitigatorRating should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 6.7] - ratingByMitigator without delay with proof 0-2 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = COMPLETE  */
    await instance.ratingByTarget(0, {from: TargetOwner});
    await instance.ratingByMitigator(2, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.7] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 6.7] currentState should be COMPLETE.");
    assert.equal(await instance.getMitigatorRating(),2,"[functionality ratingByMitigator 6.7] MitigatorRating should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 6.8] - ratingByMitigator without delay with proof 1-2 ABORT", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = ABORT  */
    await instance.ratingByTarget(1, {from: TargetOwner});
    await instance.ratingByMitigator(2, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.7] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),7,"[functionality ratingByMitigator 6.7] currentState should be ABORT.");
    assert.equal(await instance.getMitigatorRating(),2,"[functionality ratingByMitigator 6.7] MitigatorRating should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */

  });

  it("[functionality ratingByMitigator 6.9] - ratingByMitigator without delay with proof 2-2 COMPLETE", async function() {
    var instance = await Protocol.deployed();

    /* prepare states */
    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});
    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    await instance.uploadProof("Proof", {from: MitigatorOwner});

    /*  ratingByTarget(1) -> ratingByMitigator(0) = COMPLETE  */
    await instance.ratingByTarget(2, {from: TargetOwner});
    await instance.ratingByMitigator(2, {from: MitigatorOwner});

    assert.equal(await instance.getValidTime(),true,"[functionality ratingByMitigator 6.9] Now > Deadline should not be possible");
    assert.equal(await instance.getCurrentState(),6,"[functionality ratingByMitigator 6.9] currentState should be COMPLETE.");
    assert.equal(await instance.getMitigatorRating(),2,"[functionality ratingByMitigator 6.9] MitigatorRating should be NOT_AVAILABLE.");
    /* ------------------------------------------------------- */

  });


});


function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
