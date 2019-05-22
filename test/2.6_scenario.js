var Protocol = artifacts.require("./Protocol.sol");

contract("Simulation_Protocol_6", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
	var listOfAddresses = "Network1,Network2";


  // ##########################################################################
	// scenario 6
  // state transitions:
  // init -> APPROVE,
  // approve -> FUNDING,
  // sendFunds -> PROOF,
  // uploadProof -> RATE_T,
  // ratingByTarget(1) -> RATE_M,
  // ratingByMitigator(1) -> State.ABORT
  // Final state: ABORT
  // ##########################################################################
	it("Upload Proof - T selfish - M selfish --> no payment", async function() {
		var instance = await Protocol.deployed();
		var contractAddress = instance.address;

		await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    // test currentState to be APPROVE
    assert.equal(await instance.getCurrentState(),1,"[scenario6] currentState should be APPROVE, is currently not.");

    let Mitigator_test_init = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_init = await web3.eth.getBalance(TargetOwner);
    let Contract_test_init = await web3.eth.getBalance(contractAddress);
    console.log("M init ", Mitigator_test_init);
    console.log("T init ", Target_test_init);
    console.log("C init ", Contract_test_init);
    console.log("");

		await instance.approve(true, {from: MitigatorOwner});
    // test currentState to be FUNDING
    assert.equal(await instance.getCurrentState(),2,"[scenario6] currentState should be FUNDING, is currently not.");

		var fundsTarget = await web3.eth.getBalance(TargetOwner);
    var fundsContract = await web3.eth.getBalance(contractAddress);

		await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    // test currentState to be PROOF
    assert.equal(await instance.getCurrentState(),3,"[scenario6] currentState should be PROOF, is currently not.");

    let Mitigator_test_sendFunds = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_sendFunds = await web3.eth.getBalance(TargetOwner);
    let Contract_test_sendFunds = await web3.eth.getBalance(contractAddress);
    console.log("M sendFunds ", Mitigator_test_sendFunds);
    console.log("T sendFunds ", Target_test_sendFunds);
    console.log("C sendFunds ", Contract_test_sendFunds);
    console.log("");


		assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))),true,"[scenario6] Balance of TargetOwner > (Balance of TargetOwner before sending funds) - 2 ether");


    let givenProof = "Proof"

    // here from: MitigatorOwner (might have something to do with bytes(Proof).length)
		await instance.uploadProof(givenProof, {from: MitigatorOwner});
    // test currentState to be RATE_T
    assert.equal(await instance.getCurrentState(),4,"[scenario6] currentState should be RATE_T, is currently not.");

    wait(3000);

    // the proof can only be updated and set if the sender is the Mitigator
    // else the byte(Proof).length is equal to ''
    assert.equal(await instance.getProof(),givenProof,"[scenario6] instance.getProof() has length of 0.");


    // second state is NOT_AVAILABLE and thus in the evalution function return(address(0),Enums.State.ABORT) is executed
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),5,"[scenario6] currentState should be RATE_M, is currently not.");

    let Mitigator_test_ratingByTarget = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByTarget = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByTarget = await web3.eth.getBalance(contractAddress);
    console.log("M ratingByTarget ", Mitigator_test_ratingByTarget);
    console.log("T ratingByTarget ", Target_test_ratingByTarget);
    console.log("C ratingByTarget ", Contract_test_ratingByTarget);
    console.log("");


    var fundsMitigator = await web3.eth.getBalance(MitigatorOwner);

    wait(3000);

    // in the code probably a bug in the protocol because 1 is selfish or is it 0??
    await instance.ratingByMitigator(1, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[scenario6] currentState should be ABORT, is currently not.");


    let Mitigator_test_ratingByMitigator = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByMitigator = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByMitigator = await web3.eth.getBalance(contractAddress);
    console.log("M ratingByMitigator ", Mitigator_test_ratingByMitigator);
    console.log("T ratingByMitigator ", Target_test_ratingByMitigator);
    console.log("C ratingByMitigator ", Contract_test_ratingByMitigator);
    console.log("");


    // balance(targetOwner) <= fundsTarget - 2 ether
    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))),true,"[scenario6] Endstate 1 Funding Target not correct");


    // balance(MitigatorOwner) <= fundsMitigator + 2
		assert.equal(isAtMost( await web3.eth.getBalance(MitigatorOwner),addition(fundsMitigator,await web3.utils.toWei('2.0', "ether"))),true,"[scenario6] Endstate 2 Funding Mitigator not correct");

    // balance on the contractAddress is currently at 2 since its aborted and
    // there was no transaction, clearing the contractAddress
    assert.equal(isAtMost(await web3.eth.getBalance(contractAddress),await web3.utils.toWei('2.0', "ether")),true,"Endstate Funding Contract not correct");



    // current state = complete(6)
    assert.equal(await instance.getCurrentState(),7,"[scenario6] State is not complete");
    assert.equal(await instance.getTargetRating(),1,"[scenario6] TargetRating should be selfish");
    assert.equal(await instance.getMitigatorRating(),1,"[scenario6] State is not selfish");
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
