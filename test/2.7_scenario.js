var Protocol = artifacts.require("./Protocol.sol");

contract("Simulation_Protocol_7", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
	var listOfAddresses = "Network1,Network2";


  // ##########################################################################
	// scenario 7
  // state transitions:
  // init -> APPROVE,
  // approve -> FUNDING,
  // sendFunds -> PROOF,
  // uploadProof -> RATE_T,
  // ratingByTarget(0) -> RATE_M,
  // ratingByMitigator(2) -> State.ESCALATE
  // Final state: COMPLETE
  // ##########################################################################
	it("Proof - T dissatisfied, M rational --> no payment, escalation", async function() {
		var instance = await Protocol.deployed();
		var contractAddress = instance.address;

		await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),1,"[scenario7] currentState should be APPROVE.");

    let Mitigator_test_init = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_init = await web3.eth.getBalance(TargetOwner);
    let Contract_test_init = await web3.eth.getBalance(contractAddress);
    console.log("M init ", Mitigator_test_init);
    console.log("T init ", Target_test_init);
    console.log("C init ", Contract_test_init);
    console.log("");


		await instance.approve(true, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),2,"[scenario7] currentState should be FUNDING.");

		var fundsTarget = await web3.eth.getBalance(TargetOwner);
    var fundsContract = await web3.eth.getBalance(contractAddress);

		await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    assert.equal(await instance.getCurrentState(),3,"[scenario7] currentState should be PROOF.");


    let Mitigator_test_sendFunds = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_sendFunds = await web3.eth.getBalance(TargetOwner);
    let Contract_test_sendFunds = await web3.eth.getBalance(contractAddress);
    console.log("M sendFunds ", Mitigator_test_sendFunds);
    console.log("T sendFunds ", Target_test_sendFunds);
    console.log("C sendFunds ", Contract_test_sendFunds);
    console.log("");


		assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))),true,"[scenario7] Balance of TargetOwner > (Balance of TargetOwner before sending funds) - 2 ether");

    let givenProof = "Proof";

		await instance.uploadProof(givenProof, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),4,"[scenario7] currentState should be RATE_T.");
    assert.equal(await instance.getProof(),givenProof,"[scenario7] instance.getProof() has length of 0.");


    await instance.ratingByTarget(0, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),5,"[scenario7] currentState should be RATE_M.");


    let Mitigator_test_ratingByTarget = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByTarget = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByTarget = await web3.eth.getBalance(contractAddress);
    console.log("M ratingByTarget ", Mitigator_test_ratingByTarget);
    console.log("T ratingByTarget ", Target_test_ratingByTarget);
    console.log("C ratingByTarget ", Contract_test_ratingByTarget);
    console.log("");


    var fundsMitigator = await web3.eth.getBalance(MitigatorOwner);



    await instance.ratingByMitigator(0, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),8,"[scenario7] currentState should be ESCALATE");


    let Mitigator_test_ratingByMitigator = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByMitigator = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByMitigator = await web3.eth.getBalance(contractAddress);
    console.log("M ratingByMitigator ", Mitigator_test_ratingByMitigator);
    console.log("T ratingByMitigator ", Target_test_ratingByMitigator);
    console.log("C ratingByMitigator ", Contract_test_ratingByMitigator);
    console.log("");


    //balance(targetOwner) <= fundsTarget - 2 ether
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))),true,"[scenario7] Endstate 1 Funding Target not correct");


    // balance(MitigatorOwner) <= fundsMitigator + 2
		assert.equal(isAtMost( await web3.eth.getBalance(MitigatorOwner),addition(fundsMitigator,await web3.utils.toWei('2.0', "ether"))),true,"[scenario7] Endstate 2 Funding Mitigator not correct");

    // balance on the contractAddress is currently at 2 since its aborted and
    // there was no transaction, clearing the contractAddress
    assert.equal(isAtMost(await web3.eth.getBalance(contractAddress),await web3.utils.toWei('2.0', "ether")),true,"Endstate Funding Contract not correct");



    // current state = complete(6)
    assert.equal(await instance.getCurrentState(),8,"[scenario6] State should be ESCALATE");
    assert.equal(await instance.getTargetRating(),0,"[scenario6] State should be DISSATISFIED");
    assert.equal(await instance.getMitigatorRating(),0,"[scenario6] State should be Rational");
    });

  });



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
