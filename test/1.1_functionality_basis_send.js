
contract("functionality basic sending funds", async function(accounts) {
  let Protocol = artifacts.require("./Protocol.sol");
  let TargetOwner = accounts[0];
	let MitigatorOwner = accounts[1];
	let listOfAddresses = "Network1,Network2";
  let truffleAssert = require('truffle-assertions');

  it("functionality basic send test balances before and after sending funds to contract address", async function() {
    let instance = await Protocol.deployed();
    let contractAddress = instance.address;
    let fundsTarget_before_init = await web3.eth.getBalance(TargetOwner);
    let fundsContract_before_init = await web3.eth.getBalance(contractAddress);

    // testing require() statement in init(), expected: "from: TargetOwner"
    await truffleAssert.reverts(instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: MitigatorOwner}),"[init] sender is not required actor");

    await instance.init(MitigatorOwner, 2, web3.utils.toWei('2.0', "ether"), listOfAddresses, {from: TargetOwner});
    await instance.approve(true, {from: MitigatorOwner});

    let fundsMitigator_before_init = await web3.eth.getBalance(MitigatorOwner);

    await instance.sendFunds({from: TargetOwner,value: await web3.utils.toWei('2.0', "ether")});

    let fundsTarget_after = await web3.eth.getBalance(TargetOwner);
    let fundsMitigator_after = await web3.eth.getBalance(MitigatorOwner);
    let fundsContract_after = await web3.eth.getBalance(contractAddress);
    let two_ether = await web3.utils.toWei('2.0', "ether");

    assert.equal(isAtMost(fundsTarget_after, subtraction(fundsTarget_before_init, two_ether)),true,"[functionality basic send 1] fundsTarget_after <= fundsTarget_before_init - 2 ether");
    assert.equal(fundsMitigator_before_init,fundsMitigator_after,"[functionality basic send 1] fundsMitigator should be 0.");
    assert.equal(fundsContract_before_init,0,"[functionality basic send 1] fundsContract_before_init should be 0.");
    assert.equal(fundsContract_after,two_ether,"[functionality basic send 1] fundsContract_after should be 2 ether");


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

