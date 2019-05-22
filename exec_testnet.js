/*
interesting for presentation: async-await hell
https://medium.freecodecamp.org/avoiding-the-async-await-hell-c77a0fb71c4c


so both of them are posted to the same address
const contract_address_rinkeby = '0xD072984CB3F1162Af93d5C57Af2b7b6C5d4bE7fD';
const contract_address_ropsten = '0xd072984cb3f1162af93d5c57af2b7b6c5d4be7fd';

Problem with this is that a deployed contract can only be used once because the
state is changed for that particular contract.

*/
const contract = artifacts.require("Protocol.sol");
const contract_address = '0xd072984cb3f1162af93d5c57af2b7b6c5d4be7fd';
const TargetOwner = '0x851f6a4Ba388b58F9954ecf155eE3b07Cdfa9b20';
const MitigatorOwner = '0x6dE3913C44C80EF7773dae4a52c9e10D9DaefeaB';
const listOfAddresses = "Network1,Network2";


module.exports = async function (callback) {
    var startTime, endTime;
    var time = [];

    //get the smart contract
    const ins = await contract.at(contract_address);


    //start time
    function start() {
        startTime = new Date();
    };

    //stop time + print
    function end() {
        endTime = new Date();
        var timeDiff = endTime - startTime; //in ms

        var mSeconds = Math.round(timeDiff);
        time.push(mSeconds);
        console.log(mSeconds + " ms");
    }

    //get state of instance
    async function getCurrentState() {
        
        let res = await ins.getCurrentState();
        console.log('the current state is: ' + res.toString());
        
    }


    async function initiate() {
        start();

        console.log('initiation...');
        var listOfAddresses = 'network1,network2';
        // deadline intervall in seconds
        var DeadlineIntervall = 20;
        // example ether earned through faucet
        var exampleAmountEther = web3.utils.toWei('1', "ether");


        //function init(address payable _Mitigator,uint _DeadlineInterval,uint256 _OfferedFunds,string memory _ListOfAddresses)
        await ins.init(MitigatorOwner,DeadlineIntervall,exampleAmountEther,listOfAddresses, {from: TargetOwner});

        

        
        console.log('exit initiation...');

        end();
    }

    async function approve(){
        start();

        console.log('approving...');
        await ins.approve(true, {from: MitigatorOwner});
        console.log('exit approving...');

        end();
    }


    async function getFunds(){
        console.log('MitigatorOwner Funds:' + await web3.utils.getBalance(MitigatorOwner));
        console.log('TargetOwner Funds:' + await web3.utils.getBalance(TargetOwner));
        console.log('Contract Funds:' + await web3.utils.getBalance(contract_address));
    }

    // get total elapsed time
    function getElapsedTime() {
        let sum = time.reduce((pv, cv) => pv + cv, 0);
        console.log(sum);
    }

    await getCurrentState();
    await initiate();
    await getCurrentState();
    await approve();
    //await sendFunds();
    //await uploadProof();
    //await ratingByTarget();
    //await ratingByMitigator();

    //getFunds();
    //await getElapsedTime();


}