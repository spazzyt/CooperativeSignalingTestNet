
var Protocol = artifacts.require("./Protocol.sol");

contract("functionality approve", async function(accounts) {

  var TargetOwner = accounts[0];
	var MitigatorOwner = accounts[1];
	var listOfAddresses = "Network1,Network2";
  var truffleAssert = require('truffle-assertions');



  it("[functionality approve 1] - STANDARD approve true MitigatorOwner", async function() {
		var instance = await Protocol.deployed();
		var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

		await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(), 1,"[functionality approve 1] State after approve(true) should be APPROVE.");

		await instance.approve(true, {from: MitigatorOwner});

    // valid state changes when from: TargetOwner
    assert.equal(await instance.getCurrentState(),2,"[functionality approve 1] State after approve(true) should be FUNDING.");
  });


  it("[functionality approve 2] - approve false MitigatorOwner", async function() {
		var instance = await Protocol.deployed();
		var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

		await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),1,"[functionality approve 2] State after approve(true) should be APPROVE.");

    // state changes when from: TargetOwner
    await instance.approve(false, {from: MitigatorOwner});
    assert.equal(await instance.getCurrentState(),7,"[functionality approve 2] State after approve(true) should be ABORT.");
  });


  it("[functionality approve 3] - approve true TargetOwner", async function() {
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),1,"[functionality approve 3] State after approve(true) should be APPROVE.");

    // testing require() statement in approve()
    await truffleAssert.reverts(instance.approve(true, {from: TargetOwner}),"[approve] sender is not required actor");

    assert.equal(await instance.getCurrentState(),1,"[functionality approve 3] State after approve(true) should be APPROVE.");

  });


  it("[functionality approve 4] - approve false TargetOwner", async function() {
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),1,"[functionality approve 4] State after approve(true) should be APPROVE.");

    // testing require() statement in approve()
    await truffleAssert.reverts(instance.approve(false, {from: TargetOwner}),"[approve] sender is not required actor");

    // state doesn't change if requirement is violated
    assert.equal(await instance.getCurrentState(),1,"[functionality approve 4] State after approve(true) should be APPROVE.");
  });


  it("[functionality approve 5] - approve true MitigatorOwner wrong state.", async function() {
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),1,"[functionality approve 5] State after approve(true) should be APPROVE.");

    // set state to COMPLETED
    await instance.setState(6);
    assert.equal(await instance.getCurrentState(),6,"[functionality approve 5] 1 State after approve(true) should be APPROVE.");


    // testing require() statement in approve()
    await truffleAssert.reverts(instance.approve(true, {from: MitigatorOwner}),"State is not appropriate");

    assert.equal(await instance.getCurrentState(),6,"[functionality approve 5] State after approve(true) should be APPROVE.");
  });


  it("[functionality approve 6] - approve false MitigatorOwner wrong state.", async function() {
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),1,"[functionality approve 6] State after approve(true) should be APPROVE.");

    // set state to COMPLETED
    await instance.setState(6);
    assert.equal(await instance.getCurrentState(),6,"[functionality approve 6] 1 State after approve(true) should be APPROVE.");

    // testing require() statement in approve()
    await truffleAssert.reverts(instance.approve(false, {from: MitigatorOwner}),"State is not appropriate");

    assert.equal(await instance.getCurrentState(),6,"[functionality approve 6] State after approve(true) should be APPROVE.");
  });


  it("[functionality approve 7] - approve false TargetOwner wrong state.", async function() {
    var instance = await Protocol.deployed();
    var contractAddress = instance.address;
    var fundsTarget_before = await web3.eth.getBalance(TargetOwner);
    var fundsContract_before = await web3.eth.getBalance(contractAddress);
    var fundsMitigator_before = await web3.eth.getBalance(MitigatorOwner);

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"),listOfAddresses, {from: TargetOwner});
    assert.equal(await instance.getCurrentState(),1,"[functionality approve 7] State after approve(true) should be APPROVE.");

    // set state to COMPLETED
    await instance.setState(6);
    assert.equal(await instance.getCurrentState(),6,"[functionality approve 7] 1 State after approve(true) should be APPROVE.");


    // testing require() statement in approve()
    await truffleAssert.reverts(instance.approve(false, {from: TargetOwner}),"[approve] sender is not required actor");

    assert.equal(await instance.getCurrentState(),6,"[functionality approve 7] State after approve(true) should be APPROVE.");
  });

});
