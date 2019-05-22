
contract("Simulation_Protocol_1", async function(accounts) {
  
/* balance tests */
  it("No Proof Lazy - T completes, T refunded --> payment to T", async function() {

    var Protocol = artifacts.require("./Protocol.sol");
    const TargetOwner = accounts[0];
    const MitigatorOwner = accounts[1];
    const listOfAddresses = "Network1,Network2";
    const instance = await Protocol.deployed();
    const contractAddress = instance.address;

    await instance.init(MitigatorOwner,2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(), 1, "[scenario1] currentState should be APPROVE, is currently not.");

    let Mitigator_test_init = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_init = await web3.eth.getBalance(TargetOwner);
    let Contract_test_init = await web3.eth.getBalance(contractAddress);

    /*console.log("balances right after initiation");
    console.log(Mitigator_test_init);
    console.log(Target_test_init);
    console.log(Contract_test_init);
    console.log(""); */

    await instance.approve(true, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(), 2, "[scenario1] currentState should be FUNDING, is currently not.");

    let Mitigator_test_approve = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_approve = await web3.eth.getBalance(TargetOwner);
    let Contract_test_approve = await web3.eth.getBalance(contractAddress);

    /*console.log("balances right after approve");
    console.log(Mitigator_test_approve);
    console.log(Target_test_approve);
    console.log(Contract_test_approve);
    console.log(""); */

    var fundsTarget = await web3.eth.getBalance(TargetOwner);

    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    assert.equal(await instance.getCurrentState(), 3, "[scenario1] currentState should be PROOF.");

    // balance(TargetOwner) <= fundsTarget - 2 ether
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))), true, "[scenario1] Balance of TargetOwner > (Balance of TargetOwner before sending funds) - 2 ether");

    let Mitigator_test_sendFunds = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_sendFunds = await web3.eth.getBalance(TargetOwner);
    let Contract_test_sendFunds = await web3.eth.getBalance(contractAddress);

    /*console.log("balances right after sendFunds");
    console.log(Mitigator_test_sendFunds);
    console.log(Target_test_sendFunds);
    console.log(Contract_test_sendFunds);
    console.log(""); */

    assert.equal((Mitigator_test_approve == Mitigator_test_sendFunds), true, "[scenario1] funds mitigator before and funds mitigator after do not match.");
    assert.equal((Target_test_approve > Target_test_sendFunds), true, "[scenario1] funds target before and funds target after do not match.");
    assert.equal((Contract_test_approve < Contract_test_sendFunds), true, "[scenario1] No gas has been paid or eth has been received.");

    wait(3000);

    let givenProof = "";

    await instance.uploadProof(givenProof, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(), 4, "[scenario1] currentState should be RATE_T, is currently not.");

    let Mitigator_test_uploadProof = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_uploadProof = await web3.eth.getBalance(TargetOwner);
    let Contract_test_uploadProof = await web3.eth.getBalance(contractAddress);

    /*console.log("balances right after uploadProof");
    console.log(Mitigator_test_uploadProof);
    console.log(Target_test_uploadProof);
    console.log(Contract_test_uploadProof);
    console.log(""); */

    await instance.ratingByTarget(0, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(), 6, "[scenario1] currentState should be COMPLETE.");
    assert.equal(await instance.getTargetRating(), 0, "[scenario1] targetRating should be DISSATISFIED, is currently not.");

    let Mitigator_test_ratingtarget = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingtarget = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingtarget = await web3.eth.getBalance(contractAddress);

    /*console.log("balances right after ratingByTarget");
    console.log(Mitigator_test_ratingtarget);
    console.log(Target_test_ratingtarget);
    console.log(Contract_test_ratingtarget); */

    assert.equal((Mitigator_test_approve == Mitigator_test_ratingtarget), true, "[scenario1] after ratingByTarget funds mitigator before and funds mitigator after do not match.");
    assert.equal((Target_test_approve > Target_test_ratingtarget), true, "[scenario1] after ratingByTarget funds target before and funds target after do not match.");


    console.log("", Contract_test_approve, "\n", Contract_test_ratingtarget);
    assert.equal((Contract_test_approve == Contract_test_ratingtarget), true, "[scenario1] after ratingByTarget funds contract before and funds contract after do not match.");

    assert.equal(await web3.eth.getBalance(contractAddress) == 0, true, "[scenario1] ContractAddress balance is more than 0");
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner),fundsTarget), true, "[scenario1] targetOwners balance is bigger than fundsTarget balance");

    let gasPaid = Target_test_approve - Target_test_uploadProof;

    assert.equal(gasPaid > 0, true, "[scenario1] Gas Price has not been paid.");
    console.log("TargetOwner: "+ TargetOwner);
  });
});



function isBiggerOrEqualThan(a,b){
	if(a>=b){
		return true;
	}
	return false;
}

function addition(a,b){
	return parseInt(a)+parseInt(b);
}

function subtraction(a,b){
	return parseInt(a)-parseInt(b);
}

// whis is this function needed (it should be known exactly how much is given
// or received) -> probably because of gas prices which are calculated automatically
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
