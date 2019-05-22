/* ropsten infura, to revert just use truffle-config.js file in "truffle config js recovery" */
// ropsten const contract_address = '0xd072984cb3f1162af93d5c57af2b7b6c5d4be7fd'; 
// rinkeby const contract_address = '0xd072984cb3f1162af93d5c57af2b7b6c5d4be7fd'; 
// 
/**/
var privateKeys = [
  "558DB1188DA9740C39B6C980DE78272E86D6B8500E30A236C54928F43180F604", //private key of first account TargetOwner
  "7EB97B8369836E56DBB4D3E7EFEA5831C698FD914E3C1D766A7A497813201CE3", //private key of second account MitigatorOwner
];

//var provider = new HDWalletProvider(privateKeys, "https://rinkeby.infura.io/v3/0ccdbe40add2470298abf14c981dd804", 0, 2); //start at address_index 0 and load both addresses
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "brain copy nuclear ahead shiver fence pig disease measure success enroll accident";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },

    rinkeby: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider(privateKeys, "https://rinkeby.infura.io/v3/0ccdbe40add2470298abf14c981dd804", 0, 2), //start at address_index 0 and load both addresses
      network_id: '4',
      skipDryRun: true
    },

    ropsten: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/0ccdbe40add2470298abf14c981dd804"),
      network_id: '3',
      confirmations: 2, // # of confs to wait between deployments. (default: 0)
      skipDryRun: true
    }// add optimizer
  }
};