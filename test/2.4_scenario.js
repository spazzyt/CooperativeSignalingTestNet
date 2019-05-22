  /* ##########################################################################
	 scenario 4
   state transitions:
   init -> APPROVE,
   approve -> FUNDING,
   sendFunds -> PROOF,
   uploadProof -> RATE_T,
   ratingByTarget(2) -> RATE_M,
   wait(3000);
   ratingByMitigator(1) -> State.ABORT
   Final state: ABORT

  targetRating should be POSITIVE (2)
  mitigatorrating should be SELFISH (1)
  currentState should be ABORT (7)
  ########################################################################## */


var Protocol = artifacts.require("./Protocol.sol");

contract("Simulation_Protocol_4", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
  var listOfAddresses = "Network1,Network2";
  
  
	it("Upload Proof - M selfish --> no payment", async function() {
		var instance = await Protocol.deployed();
		var contractAddress = instance.address;

		await instance.init(MitigatorOwner,2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    // test currentState to be APPROVE
    assert.equal(await instance.getCurrentState(), 1, "[scenario4] currentState should be APPROVE.");


    let Mitigator_test_init = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_init = await web3.eth.getBalance(TargetOwner);
    let Contract_test_init = await web3.eth.getBalance(contractAddress);
    assert.equal(Contract_test_init==0, true, "[scenario4] The contract balance after init should be 0.");
    /*console.log("M init ", Mitigator_test_init);
    console.log("T init ", Target_test_init);
    console.log("C init ", Contract_test_init);*/


    await instance.approve(true, {from: MitigatorOwner});
    
    /* variables to compare balances in the end */
    let Mitigator_test_approve = await web3.eth.getBalance(MitigatorOwner);
    assert.equal(await instance.getCurrentState(), 2, "[scenario4] currentState should be FUNDING.");

		var fundsTarget = await web3.eth.getBalance(TargetOwner);
    var fundsContract = await web3.eth.getBalance(contractAddress);

		await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    assert.equal(await instance.getCurrentState(),3,"[scenario4] currentState should be PROOF.");


    let Mitigator_test_sendFunds = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_sendFunds = await web3.eth.getBalance(TargetOwner);
    let Contract_test_sendFunds = await web3.eth.getBalance(contractAddress);
    /*console.log("M sendFunds ", Mitigator_test_sendFunds);
    console.log("T sendFunds ", Target_test_sendFunds);
    console.log("C sendFunds ", Contract_test_sendFunds);*/


		assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))),true,"[scenario4] Balance of TargetOwner > (Balance of TargetOwner before sending funds) - 2 ether");


		await instance.uploadProof("Proof", {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),4,"[scenario4] currentState should be RATE_T.");
    assert.equal(await instance.getProof(),"Proof","[scenario4] instance.getProof() has length of 0.");


    // targetrating is positive
		await instance.ratingByTarget(2, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),5,"[scenario4] currentState should be RATE_M.");

    let Mitigator_test_ratingByTarget = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByTarget = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByTarget = await web3.eth.getBalance(contractAddress);
    /*console.log("M ratingByTarget ", Mitigator_test_ratingByTarget);
    console.log("T ratingByTarget ", Target_test_ratingByTarget);
    console.log("C ratingByTarget ", Contract_test_ratingByTarget);*/

    wait(3000);

    // after a wait, ratingByMitigator is 1 in any case ("selfish")
    await instance.ratingByMitigator(1, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[scenario4] currentState should be ABORT.");

    let Mitigator_test_ratingByMitigator = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByMitigator = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByMitigator = await web3.eth.getBalance(contractAddress);
    console.log("M ratingByMitigator ", Mitigator_test_ratingByMitigator);
    console.log("T ratingByMitigator ", Target_test_ratingByMitigator);
    console.log("C ratingByMitigator ", Contract_test_ratingByMitigator);


    // balance(TargetOwner) <= fundsTarget
		assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner),fundsTarget),true,"[scenario4] Endstate Target Funding not correct");




    var fundsMitigator = await web3.eth.getBalance(MitigatorOwner);

    // balance(TargetOwner) <= fudnsTarget - 2 ether
    assert.equal(isAtMost( await web3.eth.getBalance(TargetOwner),subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))),true,"[scenario4] 1-Endstate Funding Target not correct");


    // balance(MitigatorOwner) <= fundsMitigator + 2 ether
		assert.equal(isAtMost( await web3.eth.getBalance(MitigatorOwner),addition(fundsMitigator,await web3.utils.toWei('2.0', "ether"))),true,"[scenario4] 2-Endstate Funding Mitigator not correct");



    // test targetrating to be POSITIVE
    assert.equal(await instance.getTargetRating(),2,"[scenario4] targetRating should be POSITIVE.");

    // test mitigatorrating to be selfish
    assert.equal(await instance.getMitigatorRating(),1,"[scenario4] mitigatorrating should be SELFISH.");

    // test current state to be ABORT
    assert.equal(await instance.getCurrentState(),7,"[scenario4] currentState should be ABORT.");

    // tests whether the balance is correct or not, including gas prices
		assert.equal(isAtMost( await web3.eth.getBalance(contractAddress),await web3.utils.toWei('2.0', "ether")),true,"[scenario4] Endstate Funding Contract not correct");

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
