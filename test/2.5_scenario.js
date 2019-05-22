  /* ##########################################################################
	 scenario 5
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

contract("Simulation_Protocol_5", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
	var listOfAddresses = "Network1,Network2";


	it("Upload Proof - T selfish - M rational --> M completes, M rewarded", async function() {
		var instance = await Protocol.deployed();
		var contractAddress = instance.address;

		await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),1,"[scenario5] currentState should be APPROVE.");

    let Mitigator_test_init = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_init = await web3.eth.getBalance(TargetOwner);
    let Contract_test_init = await web3.eth.getBalance(contractAddress);
    console.log("M init ", Mitigator_test_init);
    console.log("T init ", Target_test_init);
    console.log("C init ", Contract_test_init);
    console.log("");

		await instance.approve(true, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),2,"[scenario5] currentState should be FUNDING.");

		var fundsTarget = await web3.eth.getBalance(TargetOwner);
    var fundsContract = await web3.eth.getBalance(contractAddress);

		await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    assert.equal(await instance.getCurrentState(),3,"[scenario5] currentState should be PROOF.");

    let Mitigator_test_sendFunds = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_sendFunds = await web3.eth.getBalance(TargetOwner);
    let Contract_test_sendFunds = await web3.eth.getBalance(contractAddress);
    console.log("M sendFunds ", Mitigator_test_sendFunds);
    console.log("T sendFunds ", Target_test_sendFunds);
    console.log("C sendFunds ", Contract_test_sendFunds);
    console.log("");

		assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))),true,"[scenario5] Balance of TargetOwner > (Balance of TargetOwner before sending funds) - 2 ether");

    let givenProof = "Proof";


		await instance.uploadProof(givenProof, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),4,"[scenario5] currentState should be RATE_T.");

    wait(3000);

    assert.equal(await instance.getProof(),givenProof,"[scenario5] instance.getProof() is not the uploaded proof.");


    // NOT_AVAILABLE = selfish, -> RATE_M
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),5,"[scenario5] currentState should be RATE_M.");


    let Mitigator_test_ratingByTarget = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByTarget = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByTarget = await web3.eth.getBalance(contractAddress);
    console.log("M ratingByTarget ", Mitigator_test_ratingByTarget);
    console.log("T ratingByTarget ", Target_test_ratingByTarget);
    console.log("C ratingByTarget ", Contract_test_ratingByTarget);
    console.log("");

    var fundsMitigator = await web3.eth.getBalance(MitigatorOwner);

    // rational rating of mitigator when target is not available
    await instance.ratingByMitigator(0, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),6,"[scenario5] currentState should be COMPLETE.");

    let Mitigator_test_ratingByMitigator = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByMitigator = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByMitigator = await web3.eth.getBalance(contractAddress);
    console.log("M ratingByMitigator ", Mitigator_test_ratingByMitigator);
    console.log("T ratingByMitigator ", Target_test_ratingByMitigator);
    console.log("C ratingByMitigator ", Contract_test_ratingByMitigator);
    console.log("");


    // balance(targetOwner) <= fundsTarget - 2 ether
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))),true,"[scenario5] Endstate Funding Target not correct");


    // balance(MitigatorOwner) <= fundsMitigator + 2
		assert.equal(isAtMost( await web3.eth.getBalance(MitigatorOwner),addition(fundsMitigator,await web3.utils.toWei('2.0', "ether"))),true,"[scenario5] Endstate Funding Mitigator not correct");


    // balance(contractAddress) <= 0
		assert.equal(isAtMost(await web3.eth.getBalance(contractAddress), 0),true,"[scenario5] Endstate Funding Contract not correct");


    assert.equal(await instance.getCurrentState(),6,"[scenario5] State should be Complete.");
    assert.equal(await instance.getTargetRating(),1,"[scenario5] TargetRating should be Complete.");
    assert.equal(await instance.getMitigatorRating(),0,"[scenario5] MitigatorRating should be Complete.");
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
