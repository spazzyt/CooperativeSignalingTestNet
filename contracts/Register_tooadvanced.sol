
pragma solidity ^0.5.0;
/*
contract Register{


What this contract does
    A struct with Target and Mitigator is needed because we want to store
    for each protocol the correct Target (T) and Mitigator (M). Now a mapping is
    needed in order to be able to find the T and M by having the address of the
    Protocol (P). The addresses of all available Ps are additionally stored in a
    list for easy accessability.


Functions and purposes
    setProtocol(address _Target) is used for adding a new protocol which acts
    as a msg.sender here in the Register and is called in each P itself. After
    getting called T is added to the map and to the list with the respective
    Protocol as msg.sender as the address mapping.


    update() is used in order for adding one M to one P which is in need of
    mitigation and therefore has no M set yet (address(0)) before calling update().
    After M is added to one T in the map that M is set as the M in that protocol
    by assigning M to the contract Protocol.


    getProtocolAddress() emits all P addresses that are stored at the moment. Could
    be restricted to be only visible for the Register creator.


Ideas for the future
    First there could be more than one M for each T. This is just a prototype so
    to simplyfy things only one M is assigned.
    In the future it is possible to add prioritization or severity of DDoS attacks
    to the struct such that when a M joins the Register, the T with the hightest priority
    or with the biggest load of DDoS attacks can be focussed. So a managing role can
    be created for the Register contract.



    address creatorRegister;

	constructor() public payable{
        creatorRegister = msg.sender;
    }

    struct ProtocolStr {
        address Target;
        address Mitigator;
    }

    mapping(address => ProtocolStr) protocols;
    address[] public protocolAddresses;
    event LogProtocolAddresses(address protocolAddress);
    event LogNotValid(string s);
    event LogAddressOfTargetAndMitigator(address t, address m);

    function setProtocol(address _Target) public {
        protocols[msg.sender] = ProtocolStr(_Target, address(0));
        protocolAddresses.push(msg.sender);
    }

    function update() public {
        if(validate()){
            for(uint i = 0; i < protocolAddresses.length; i++){
                if(protocols[protocolAddresses[i]].Mitigator == address(0)){
                    protocols[protocolAddresses[i]].Mitigator = msg.sender;
                    //Register reg = Register(addressOfRegister);
                    Protocol p = Protocol(protocolAddresses[i]);
                    p.setMitigator(msg.sender);
                    emit LogProtocolAddresses(protocolAddresses[i]);
                    return;
                }
            }
        }else{
            emit LogNotValid('Mitigator is also Target.');
        }
    }

    function validate() private view returns(bool){
        for(uint i = 0; i < protocolAddresses.length; i++){
            if(protocols[protocolAddresses[i]].Mitigator == protocols[protocolAddresses[i]].Target){
                return false;
            }
        }
        return true;
    }

    function getProtocolAddresses() public payable{
        require(msg.sender == creatorRegister, 'Only creator of Register is able to access this function.');
        for(uint i = 0; i < protocolAddresses.length; i++){
            emit LogProtocolAddresses(protocolAddresses[i]);
            emit LogAddressOfTargetAndMitigator(
                protocols[protocolAddresses[i]].Mitigator,
                protocols[protocolAddresses[i]].Target);
        }
    }
}


contract Protocol{
    function setMitigator(address payable _Mitigator) public;
}
 */