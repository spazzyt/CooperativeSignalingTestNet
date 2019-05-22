var Protocol = artifacts.require("./Protocol.sol");

contract("Simulation_Protocol_3", async function (accounts) {

    it("Upload Proof - M completes, M rewarded --> payment to M", async function () {

        //const TargetOwner = '0x851f6a4Ba388b58F9954ecf155eE3b07Cdfa9b20';
        //const MitigatorOwner = '0x6dE3913C44C80EF7773dae4a52c9e10D9DaefeaB';

        const TargetOwner = accounts[0];
        const MitigatorOwner = accounts[1];
        const listOfAddresses = "Network1,Network2";
        const instance = await Protocol.deployed();
        const contractAddress = instance.address;
        var startTime = start();
        var endTime;
        

        let TargetOwnerBalance = await web3.eth.getBalance(TargetOwner);
        let MitigatorOwnerBalance = await web3.eth.getBalance(MitigatorOwner);
        console.log('Target starting balance: ' + await web3.utils.fromWei(TargetOwnerBalance.toString(), 'ether'));
        console.log('Mitigator starting balance: ' + await web3.utils.fromWei(MitigatorOwnerBalance.toString(), 'ether'));

        console.log('init...');
        await instance.init(MitigatorOwner, 15, web3.utils.toWei('0.5', "ether"), listOfAddresses, {
            from: TargetOwner
        });
        console.log('approve...');
        await instance.approve(true, {
            from: MitigatorOwner
        });
        console.log('sendFunds...');
        await instance.sendFunds({
            from: TargetOwner,
            value: await web3.utils.toWei('0.5', "ether")
        });
        
        
        endTime = end(startTime);
        console.log('time after sendFunds...'+endTime+'ms');

        // else condition expected in scenario 3
        let oldDeadline = await instance.getOldDeadline();
        if (oldDeadline > 0){
            console.log('New Deadline has been set.');
            console.log(oldDeadline);
        }else{
            console.log('sendFunds passed without resetting a new Deadline')
            console.log(oldDeadline.toString());
        }


        console.log('uploadProof...');
        await instance.uploadProof("Proof", {
            from: MitigatorOwner
        });
        console.log('ratingByTarget...');
        await instance.ratingByTarget(2, {
            from: TargetOwner
        });
        console.log('ratingByMitigator...');
        await instance.ratingByMitigator(2, {
            from: MitigatorOwner
        });


        let TargetOwnerEnd = await web3.eth.getBalance(TargetOwner);
        let MitigatorOwnerEnd = await web3.eth.getBalance(MitigatorOwner);

        // get gas spent from Target
        let gasPaidTarget = TargetOwnerBalance - TargetOwnerEnd - await web3.utils.toWei('0.5', 'ether');
        console.log('Gas paid by Target in Wei: ' + gasPaidTarget);
        console.log('Gas paid by Target in Eth: ' + await web3.utils.fromWei(gasPaidTarget.toString(), 'ether'));


        // get gas spent from Mitigator
        // example 50 eth at start - 51.9 eth at end = -1.9 eth, -1.9 eth + 2 eth = 0.1 gasPrice
        // or just switch start and end balance and get to positive number
        let gasPaidMitigator = -1 * (MitigatorOwnerEnd - MitigatorOwnerBalance - await web3.utils.toWei('0.5', 'ether'));
        console.log('Gas paid by Mitigator in Wei: ' + gasPaidMitigator);
        console.log('Gas paid by Mitigator in Eth: ' + await web3.utils.fromWei(gasPaidMitigator.toString(), 'ether'));


    });
});


//start time
function start() {
    var startTime = new Date().getTime();
    return startTime;
};

//stop time + print
function end(startTime) {
    var endTime = new Date().getTime();
    var timeDiff = endTime - startTime; //in ms

    var mSeconds = Math.round(timeDiff);
    return mSeconds;
}