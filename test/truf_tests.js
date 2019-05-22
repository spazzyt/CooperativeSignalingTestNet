contract("Simulation_Protocol_3", async function (accounts) {

  it("Upload Proof - M completes, M rewarded --> payment to M", async function () {
    console.log('starting...');

    console.log('artifact loading...');
    var Protocol = artifacts.require("./Protocol.sol");

    console.log('find truffle-assertions...');
    const truffleAssert = require('truffle-assertions');

    console.log('identifying TargetOwner...');
    const TargetOwner = '0x851f6a4Ba388b58F9954ecf155eE3b07Cdfa9b20';
    let TargetOwnerBalance = await web3.eth.getBalance(TargetOwner); // needed for gas usage
    //const TargetOwner = accounts[0];

    console.log('identifying MitigatorOwner...');
    const MitigatorOwner = '0x6dE3913C44C80EF7773dae4a52c9e10D9DaefeaB'; //this account has no rights yet... needs to be unlocked
    let MitigatorOwnerBalance = await web3.eth.getBalance(MitigatorOwner); // needed for gas usage
    //const MitigatorOwner = accounts[1];


    console.log('adding list of addresses...');
    const listOfAddresses = "Network1,Network2";

    console.log('instance of protocol added...');
    const instance = await Protocol.deployed();

    console.log('adding contract address...');
    const contractAddress = instance.address;
    console.log(contractAddress);

    console.log('asserting state...');
    assert.equal(await instance.getCurrentState(), 0, "[scenario1] currentState should be REQUEST");

    console.log('initializing...');
    var result = await instance.init(MitigatorOwner, 60, web3.utils.toWei('0.5', "ether"), listOfAddresses, {from: TargetOwner});

    console.log('asserting state...');
    assert.equal(await instance.getCurrentState(), 1, "[scenario1] currentState should be APPROVE");


    console.log('Protocol address: ');
    console.log(Protocol.address);
    console.log('eth accounts: ' + await web3.eth.getAccounts());
    let Mitigator_test_init = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_init = await web3.eth.getBalance(TargetOwner);
    let Contract_test_init = await web3.eth.getBalance(contractAddress);
    console.log("balances right after initiation");
    console.log('TargetOwner init: ' + Target_test_init);
    console.log('MitigatorOwner init: ' + Mitigator_test_init);
    console.log('Contract init: ' + Contract_test_init);
    console.log(""); 



    await instance.approve(true, {from: MitigatorOwner});
    let currentState = await instance.getCurrentState();
    assert.equal(currentState, 2, "[scenario1] currentState should be FUNDING, is currently not.");
    console.log('Current State: ' + currentState)


    /* variables to compare balances in the end */
    let Mitigator_test_approve = await web3.eth.getBalance(MitigatorOwner);
    var fundsTarget = await web3.eth.getBalance(TargetOwner);
    var fundsContract = await web3.eth.getBalance(contractAddress);



    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('0.5', "ether")});
    assert.equal(await instance.getCurrentState(), 3, "[scenario3] currentState should be PROOF.");



    let Mitigator_test_sendFunds = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_sendFunds = await web3.eth.getBalance(TargetOwner);
    let Contract_test_sendFunds = await web3.eth.getBalance(contractAddress);
    /*console.log("M sendFunds ", Mitigator_test_sendFunds);
    console.log("T sendFunds ", Target_test_sendFunds);
    console.log("C sendFunds ", Contract_test_sendFunds); 
    console.log("");*/
    /* The mitigators balance has only changed in calling the approve function because of the paid gas. No changes after sendFunds function. */
    assert.equal(Mitigator_test_sendFunds == Mitigator_test_approve, true, "[scenario3.1] Target should have paid 0.5 ether.");
    /* In sendFunds the target will have to pay gas which leads to a balance less than the sendFunds value. */
    assert.equal(Target_test_sendFunds < Target_test_init - web3.utils.toWei('0.5', "ether"), true, "[scenario3.2] Target should have paid 0.5 ether.");
    /* After the sendFunds function the contract should exactly have the value amount declared in the sendFunds function */
    assert.equal(Contract_test_sendFunds, web3.utils.toWei('0.5', "ether"), "[scenario3.3] Contract should lock funds after sendFunds.");
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('0.5', "ether"))), true, "[scenario3] Balance of TargetOwner > (Balance of TargetOwner before sending funds) - 2 ether");

    
    await instance.uploadProof("Proof", {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(), 4, "[scenario3] currentState should be RATE_T.");


    await instance.ratingByTarget(2, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(), 5, "[scenario3] currentState should be RATE_M.");
    assert.equal(await instance.getTargetRating(), 2, "[scenario3] targetRating should be POSITIVE.");



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
    assert.equal(Contract_test_rateTarget, web3.utils.toWei('0.5', "ether"), "[scenario3] Contract should lock funds after sendFunds.");



 
    await instance.ratingByMitigator(2, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(), 6, "[scenario3] currentState should be COMPLETE.");
    
    
    
    
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner),fundsTarget), true, "[scenario3] Endstate Target Funding not correct");
    var fundsMitigator = await web3.eth.getBalance(MitigatorOwner);
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner),subtraction(fundsTarget,await web3.utils.toWei('0.5', "ether"))), true, "Endstate Funding Target not correct");
    assert.equal(isAtMost(await web3.eth.getBalance(MitigatorOwner),addition(fundsMitigator,await web3.utils.toWei('0.5', "ether"))), true, "Endstate Funding Mitigator not correct");
    

    // tests whether the balance is correct or not, including gas prices
    assert.equal(isAtMost(await web3.eth.getBalance(contractAddress),0), true, "[scenario3] Endstate Funding Contract not correct");
 

    let Mitigator_test_rateMitigator = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_rateMitigator = await web3.eth.getBalance(TargetOwner);
    let Contract_test_rateMitigator = await web3.eth.getBalance(contractAddress);
    console.log("M rateMitigator ", web3.utils.fromWei(Mitigator_test_rateMitigator, 'ether'));
    console.log("T rateMitigator ", web3.utils.fromWei(Target_test_rateMitigator, 'ether'));
    console.log("C rateMitigator ", web3.utils.fromWei(Contract_test_rateMitigator, 'ether'));
    console.log("");
    /* Paid gas in ratingByMitigator but funds received from contract. */
    let gasPaid = Mitigator_test_rateTarget + await web3.utils.toWei('0.5', "ether") - Mitigator_test_rateMitigator;
    console.log("gas paid: " + gasPaid);
    
    console.log("",Mitigator_test_rateMitigator, "\n", Mitigator_test_rateTarget);

    /* Fails always on the first run. Problem is probably values are too close to each other. After first iteration works as expected. */
    //assert.equal(Mitigator_test_rateMitigator > Mitigator_test_rateTarget, true, "[scenario3.6] Target should have paid 2 ether.");
    assert.equal((Mitigator_test_rateMitigator - Mitigator_test_rateTarget) > 0, true, "[scenario3.6] Target should have paid 2 ether.");
    // assert.equal(Mitigator_test_rateMitigator < Mitigator_test_rateTarget, true, "[scenario3.6] Target should have paid 2 ether.");

 
 
    /* In sendFunds the target will have to pay gas which leads to a balance less than the sendFunds value. */
    assert.equal(Target_test_rateMitigator == Target_test_rateTarget, true, "[scenario3.7] Target should have paid 2 ether.");
    /* Contract should have sent the funds, therefore it's balance should be 0. */
    assert.equal(Contract_test_rateMitigator, 0, "[scenario3] Contract should lock funds after sendFunds.");
    
    console.log("gas paid Target: " + await web3.utils.fromWei((TargetOwnerBalance - Target_test_rateMitigator),'ether'));
    console.log("gas paid Mitigator: " + await web3.utils.fromWei((MitigatorOwnerBalance - Mitigator_test_rateMitigator), 'ether'));

  });
});


function addition(a, b) {
  return parseInt(a) + parseInt(b);
}

function subtraction(a, b) {
  return parseInt(a) - parseInt(b);
}

// whis is this function needed (it should be known exactly how much is given
// or received) -> probably because of gas prices which are calculated automatically
function isAtMost(a, b) {
  if (a <= b) {
    return true;
  }
  return false;
}
