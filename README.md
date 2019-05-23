# CooperativeSignalingTestNet
DDoS mitigation service for distributed network.

[Work in progress]

https://medium.com/coinmonks/5-minute-guide-to-deploying-smart-contracts-with-truffle-and-ropsten-b3e30d5ee1e

```sh
$ truffle compile
$ truffle migrate --network ropsten
```




to deploy in any case: 
$ truffle migrate --reset --network ropsten


to test on ropsten or rinkeby with my accounts:

```sh
$ truffle test /truf_tests.js --network rinkeby
$ truffle test /truf_tests.js --network ropsten
```



truffle console --network ropsten
var Protocol = artifacts.require("./Protocol.sol");
Protocol.deployed().then(function(instance){return instance }); or 
web3.eth.contract(Protocol.abi, 0xd072984cb3f1162af93d5c57af2b7b6c5d4be7fd)
Protocol.at(0xd072984cb3f1162af93d5c57af2b7b6c5d4be7fd) [not working]

Protocol.deployed().then(function(instance){return instance./*functioncall()*/});

- good link for deploying and ropsten console https://www.ironin.it/blog/deploying-ethereums-smart-contracts.html



CooperativeSignaling
CooperativeSignaling is a smart contract which is used as a protoype for the IFI (Departement of Informatics) at university of Zurich. The goals is to deliver an example prototype of DDoS mitigation by a reward mechanism as there is still no automated way for a smart contract to review the quality of the service on the side of the peers.

In general Blockchains do provide some benefits as for example not having to trust a third party or saving costs by disintermediating trust. In the field of Finance and Technology for example a disintermediation would allow for parties to exchange upon agreement, not requiring any intermediary and also leading to (in some cases) faster transactions. With the cooperative signaling protocol the Blockchain can be used for signaling DDoS attacks. The signal requests mitigation on the Blockchain where a smart contract defines mitigation services. The blockchain here serves as an immutable platform for the exchange of mitigation services. Now this seems like a really great way to allay DDoS attacks and it really is. But there are still challenges like for example having to trust other peers. However with a reputation system with a foundation of trust, self-policing nature, incentive and penalites, robustness, accurate and verifiable scoring engine and anonymity and privacy such a reputation scheme can be defined.

For example, in the context of a Distributed Denial-of-Service (DDoS) cooperative defense, blockchain capabilities can be leveraged for signaling attacks as a mitigation requests across a blockchain network and serve as an immutable platform for the exchange of mitigation services defined in smart contracts of different peers.

[todo]

blockchain
problemdescription
BLoSS, DOTS, AITF
ethereum
smart contracts
remix
solidity
first project
different protocol
need for correctness
testing
javascript
truffle
ganache
rinkeby
Testnet Rinkeby is an example for a testnnet which can be used to deploy smart contracts and test on a "real" testnet and more importantly with real mining. Until now everything I have tested and run was local and to see how the protocol behaves in a testnet environment is a very important requirement. To start out with rinkeby (on macOS) a few commands on the terminal are needed. First of all the testnet
