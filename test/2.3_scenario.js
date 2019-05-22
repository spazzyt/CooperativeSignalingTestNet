/*
  scenario 3
  state transitions:
  init -> APPROVE,
  approve -> FUNDING,
  sendFunds -> PROOF,
  uploadProof -> RATE_T,
  ratingByTarget(2) -> RATE_M,
  ratingByMitigator(2) -> State.COMPLETE
  Final state: COMPLETE
*/
contract("Simulation_Protocol_3", async function (accounts) {

  it("Upload Proof - M completes, M rewarded --> payment to M", async function () {
    var Protocol = artifacts.require("./Protocol.sol");
    var TargetOwner = accounts[0];
    var MitigatorOwner = accounts[1];
    var listOfAddresses = "Network1,Network2";
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;


    let Mitigator_test_start = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_start = await web3.eth.getBalance(TargetOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {
      from: TargetOwner
    });
    assert.equal(await instance.getCurrentState(), 1, "[scenario3] currentState should be APPROVE.");

    /* */
    let Mitigator_test_init = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_init = await web3.eth.getBalance(TargetOwner);
    let Contract_test_init = await web3.eth.getBalance(contractAddress);
    assert.equal(Contract_test_init == 0, true, "[scenario3] The contract balance after init should be 0.");
    /*console.log("M init ", Mitigator_test_init);
    console.log("T init ", Target_test_init);
    console.log("C init ", Contract_test_init); 
    console.log("");*/
    /* */

    await instance.approve(true, {
      from: MitigatorOwner
    });
    assert.equal(await instance.getCurrentState(), 2, "[scenario3] currentState should be FUNDING.");

    /* variables to compare balances in the end */
    let Mitigator_test_approve = await web3.eth.getBalance(MitigatorOwner);

    var fundsTarget = await web3.eth.getBalance(TargetOwner);
    var fundsContract = await web3.eth.getBalance(contractAddress);

    await instance.sendFunds({
      from: TargetOwner,
      value: await web3.utils.toWei('2.0', "ether")
    });
    assert.equal(await instance.getCurrentState(), 3, "[scenario3] currentState should be PROOF.");


    /* */
    let Mitigator_test_sendFunds = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_sendFunds = await web3.eth.getBalance(TargetOwner);
    let Contract_test_sendFunds = await web3.eth.getBalance(contractAddress);
    /*console.log("M sendFunds ", Mitigator_test_sendFunds);
    console.log("T sendFunds ", Target_test_sendFunds);
    console.log("C sendFunds ", Contract_test_sendFunds); 
    console.log("");*/
    /* The mitigators balance has only changed in calling the approve function because of the paid gas. No changes after sendFunds function. */
    assert.equal(Mitigator_test_sendFunds == Mitigator_test_approve, true, "[scenario3.1] Target should have paid 2 ether.");
    /* In sendFunds the target will have to pay gas which leads to a balance less than the sendFunds value. */
    assert.equal(Target_test_sendFunds < Target_test_init - web3.utils.toWei('2.0', "ether"), true, "[scenario3.2] Target should have paid 2 ether.");
    /* After the sendFunds function the contract should exactly have the value amount declared in the sendFunds function */
    assert.equal(Contract_test_sendFunds, web3.utils.toWei('2.0', "ether"), "[scenario3.3] Contract should lock funds after sendFunds.");
    /* */


    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget, await web3.utils.toWei('2.0', "ether"))), true, "[scenario3] Balance of TargetOwner > (Balance of TargetOwner before sending funds) - 2 ether");

    // here from: MitigatorOwner (might have something to do with bytes(Proof).length)
    await instance.uploadProof("Proof", {
      from: MitigatorOwner
    });
    assert.equal(await instance.getCurrentState(), 4, "[scenario3] currentState should be RATE_T.");


    await instance.ratingByTarget(2, {
      from: TargetOwner
    });
    assert.equal(await instance.getCurrentState(), 5, "[scenario3] currentState should be RATE_M.");
    assert.equal(await instance.getTargetRating(), 2, "[scenario3] targetRating should be POSITIVE.");


    /* */
    let Mitigator_test_rateTarget = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_rateTarget = await web3.eth.getBalance(TargetOwner);
    let Contract_test_rateTarget = await web3.eth.getBalance(contractAddress);
    /* console.log("M rateTarget ", Mitigator_test_rateTarget);
    console.log("T rateTarget ", Target_test_rateTarget);
    console.log("C rateTarget ", Contract_test_rateTarget); 
    console.log(""); */
    /* Paid gas in uploadProof. */
    assert.equal(Mitigator_test_rateTarget < Mitigator_test_sendFunds, true, "[scenario3.4] Target should have paid 2 ether.");
    /* In sendFunds the target will have to pay gas which leads to a balance less than the sendFunds value. */
    assert.equal(Target_test_rateTarget < Target_test_sendFunds, true, "[scenario3.5] Target should have paid 2 ether.");
    /* Contract has not changed yet, still the same */
    assert.equal(Contract_test_rateTarget, web3.utils.toWei('2.0', "ether"), "[scenario3] Contract should lock funds after sendFunds.");
    /* */




    await instance.ratingByMitigator(2, {
      from: MitigatorOwner
    });
    assert.equal(await instance.getCurrentState(), 6, "[scenario3] currentState should be COMPLETE.");
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), fundsTarget), true, "[scenario3] Endstate Target Funding not correct");
    var fundsMitigator = await web3.eth.getBalance(MitigatorOwner);
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget, await web3.utils.toWei('2.0', "ether"))), true, "Endstate Funding Target not correct");
    assert.equal(isAtMost(await web3.eth.getBalance(MitigatorOwner), addition(fundsMitigator, await web3.utils.toWei('2.0', "ether"))), true, "Endstate Funding Mitigator not correct");
    assert.equal(isAtMost(await web3.eth.getBalance(contractAddress), 0), true, "Endstate Funding Contract not correct");


    // tests whether the balance is correct or not, including gas prices
    assert.equal(isAtMost(await web3.eth.getBalance(contractAddress), 0), true, "[scenario3] Endstate Funding Contract not correct");


    /* */
    let Mitigator_test_rateMitigator = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_rateMitigator = await web3.eth.getBalance(TargetOwner);
    let Contract_test_rateMitigator = await web3.eth.getBalance(contractAddress);
    console.log("M rateMitigator ", web3.utils.fromWei(Mitigator_test_rateMitigator, 'ether'));
    console.log("T rateMitigator ", web3.utils.fromWei(Target_test_rateMitigator, 'ether'));
    console.log("C rateMitigator ", web3.utils.fromWei(Contract_test_rateMitigator, 'ether'));
    console.log("");
    /* Paid gas in ratingByMitigator but funds received from contract. */
    let gasPaid = Mitigator_test_rateTarget + await web3.utils.toWei('2.0', "ether") - Mitigator_test_rateMitigator;

    console.log("", Mitigator_test_rateMitigator, "\n", Mitigator_test_rateTarget);

    /* Fails always on the first run. Problem is probably values are too close to each other. After first iteration works as expected. */
    //assert.equal(Mitigator_test_rateMitigator > Mitigator_test_rateTarget, true, "[scenario3.6] Target should have paid 2 ether.");
    assert.equal((Mitigator_test_rateMitigator - Mitigator_test_rateTarget) > 0, true, "[scenario3.6] Target should have paid 2 ether.");
    // assert.equal(Mitigator_test_rateMitigator < Mitigator_test_rateTarget, true, "[scenario3.6] Target should have paid 2 ether.");



    /* In sendFunds the target will have to pay gas which leads to a balance less than the sendFunds value. */
    assert.equal(Target_test_rateMitigator == Target_test_rateTarget, true, "[scenario3.7] Target should have paid 2 ether.");
    /* Contract should have sent the funds, therefore it's balance should be 0. */
    assert.equal(Contract_test_rateMitigator, 0, "[scenario3] Contract should lock funds after sendFunds.");

    // get gas spent from Target
    let gasPaidTarget = Target_test_start - Target_test_rateMitigator - web3.utils.toWei('2.0', 'ether');
    console.log('Gas paid by Target in Wei: '+ gasPaidTarget);
    console.log('Gas paid by Target in Eth: '+ web3.utils.fromWei(gasPaidTarget.toString(), 'ether'));


    // get gas spent from Mitigator
    // example 50 eth at start - 51.9 eth at end = -1.9 eth, -1.9 eth + 2 eth = 0.1 gasPrice
    // or just switch start and end balance and get to positive number
    let gasPaidMitigator = -1*(Mitigator_test_rateMitigator - Mitigator_test_start - web3.utils.toWei('2.0', 'ether'));
    console.log('Gas paid by Mitigator in Wei: ' + gasPaidMitigator);
    console.log('Gas paid by Mitigator in Eth: ' + web3.utils.fromWei(gasPaidMitigator.toString(), 'ether'));

    let sumAccounts = web3.eth.getBalance(MitigatorOwner) + web3.eth.getBalance(TargetOwner);
    console.log('this is the sum of both accounts: ' + sumAccounts);
    //console.log('gas paid until now: '+ 200 - sumAccounts)
  });

});



function isBiggerOrEqualThan(a, b) {
  if (a >= b) {
    return true;
  }
  return false;
}

function addition(a, b) {
  return parseInt(a) + parseInt(b);
}

function subtraction(a, b) {
  return parseInt(a) - parseInt(b);
}

function isAtMost(a, b) {
  if (a <= b) {
    return true;
  }
  return false;
}

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}