
contract("Simulation_Protocol_2", async function(accounts) {

  it("No Proof Lazy - T selfish --> no payment", async function() {
    let Protocol = artifacts.require("./Protocol.sol");
    let TargetOwner = accounts[0];
    let MitigatorOwner = accounts[1];
    let listOfAddresses = "Network1,Network2";
    let instance = await Protocol.deployed();
    let contractAddress = instance.address;

    await instance.init(MitigatorOwner,2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(), 1, "[scenario2] currentState should be APPROVE.");

    /* variables to compare balances in the end */
    let Mitigator_test_init = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_init = await web3.eth.getBalance(TargetOwner);
    let Contract_test_init = await web3.eth.getBalance(contractAddress);
    /*console.log(Mitigator_test_init);
    console.log(Target_test_init);
    console.log(Contract_test_init);*/

    assert.equal(Contract_test_init, 0, "[scenario2] The contract balance after init should be 0.");


    await instance.approve(true, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(), 2, "[scenario2] currentState should be FUNDING.");

    let fundsTarget = await web3.eth.getBalance(TargetOwner);

    /* variables to compare balances in the end */
    let Mitigator_test_approve = await web3.eth.getBalance(MitigatorOwner);

    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});
    assert.equal(await instance.getCurrentState(), 3, "[scenario2] currentState should be PROOF.");

    /* */
    let Mitigator_test_sendFunds = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_sendFunds = await web3.eth.getBalance(TargetOwner);
    let Contract_test_sendFunds = await web3.eth.getBalance(contractAddress);
    /*console.log("sendFunds ", Mitigator_test_sendFunds);
    console.log("sendFunds ", Target_test_sendFunds);
    console.log("sendFunds ", Contract_test_sendFunds); */
    /* The mitigators balance has only changed in calling the approve function because of the paid gas. No changes after sendFunds function. */
    assert.equal(Mitigator_test_sendFunds == Mitigator_test_approve, true, "[scenario2] Target should have paid 2 ether.");
    /* In sendFunds the target will have to pay gas which leads to a balance less than the sendFunds value. */
    assert.equal(Target_test_sendFunds < Target_test_init - web3.utils.toWei('2.0', "ether"), true, "[scenario2] Target should have paid 2 ether.");
    /* After the sendFunds function the contract should exactly have the value amount declared in the sendFunds function */
    assert.equal(Contract_test_sendFunds, web3.utils.toWei('2.0', "ether"), "[scenario2] Contract should lock funds after sendFunds.");
    /* */

    assert.equal(isAtMost(await web3.eth.getBalance(TargetOwner), subtraction(fundsTarget,await web3.utils.toWei('2.0', "ether"))), true, "[scenario2] Balance of TargetOwner > (Balance of TargetOwner before sending funds) - 2 ether");
    
    // lazy
    wait(3000);
    let uploadedProof = "";
    // in the basecase there is no upload proof needed -> (lazy) no proof
    // no proof simulated with sending a message as TargetOwner
    await instance.uploadProof(uploadedProof, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(), 4, "[scenario2] currentState should be RATE_T.");

    // second state is NOT_AVAILABLE and thus in the evalution function return(address(0),Enums.State.ABORT) is executed
    await instance.ratingByTarget(1, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(), 7, "[scenario2] currentState should be ABORT.");
    assert.equal(await instance.getTargetRating(), 1, "[scenario2] targetRating should be SELFISH.");


    /* variables to compare balances in the end */
    let Mitigator_test_ratingByTarget = await web3.eth.getBalance(MitigatorOwner);
    let Target_test_ratingByTarget = await web3.eth.getBalance(TargetOwner);
    let Contract_test_ratingByTarget = await web3.eth.getBalance(contractAddress);
    /*console.log("ratingBytarget ", Mitigator_test_ratingByTarget);
    console.log("ratingBytarget ", Target_test_ratingByTarget);
    console.log("ratingBytarget ", Contract_test_ratingByTarget); */
    /* After completing ratingByTarget(1) the state is ABORT and thus in the protocol terminates because owner == address(0) in endProcess(). */
    assert.equal(Contract_test_ratingByTarget, web3.utils.toWei('2.0', "ether"), "[scenario2] Contract should not have any Funds after ratingByTarget.");

    // tests whether the balance is correct or not, with gas prices
    assert.equal(isAtMost(await web3.eth.getBalance(contractAddress),0), false, "[scenario2] Endstate Funding Contract not correct");
    assert.equal()


    });
});

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
   let start = new Date().getTime();
   let end = start;
   while(end < start + ms) {
     end = new Date().getTime();
   }
  }