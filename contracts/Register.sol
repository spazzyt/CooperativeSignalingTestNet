pragma solidity ^0.5.0;

contract Register{

    address private creatorRegister;

    event LogProtocolAddresses(address protocolAddress);
    event LogNotValid(string s);
    event LogAddressOfTargetAndMitigator(string n, address m);

    struct MitigatorStr {
        address P;
        address payable M;
        bool isAdded;
    }

    mapping(string => MitigatorStr) private mitigators;


	constructor() public payable{
        creatorRegister = msg.sender;
    }

    function getMitigator(string memory _name)public payable returns(address payable){
        if(mitigators[_name].isAdded){
            mitigators[_name].P = msg.sender;
            return mitigators[_name].M;
        }else{
            emit LogNotValid('Mitigator not registered.');
        }
    }

    function setMitigator(string memory _name, address payable _Mitigator) public payable {
        require(msg.sender == creatorRegister, 'Only the creator of Register is able to access this function.');
        require(mitigators[_name].isAdded==false, 'The name of this mitigator is already added.');
        mitigators[_name] = MitigatorStr(address(0), _Mitigator, true);
    }
}
