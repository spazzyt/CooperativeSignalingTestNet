pragma solidity ^0.5.0;

import "./Enums.sol";


contract Protocol {

  address payable private Target;
	address payable private Mitigator;
	Enums.State CurrentState;

	string private ListOfAddresses;
	string private Proof;
	uint256 private OfferedFunds;
	Enums.Rating private TargetRating;
	Enums.Rating private MitigatorRating;
	uint256 private StartTime = now;
  // OldDeadline added for testing
  uint256 private OldDeadline = 0;
	uint256 private EndTime;
	uint256 private DeadlineInterval;
	uint256 private Deadline;
  event ProcessCreated(address _from, address addr);
	event FundsReceived(uint256 value);
  

	constructor() public payable{
    Target = msg.sender;
  }


  function init(address payable _Mitigator,uint _DeadlineInterval,uint256 _OfferedFunds,string memory _ListOfAddresses) public {
    require(msg.sender==Target,"[init] sender is not required actor");
		Mitigator = _Mitigator;
		Target = msg.sender;
		DeadlineInterval = _DeadlineInterval;
		OfferedFunds = _OfferedFunds;
		ListOfAddresses = _ListOfAddresses;
		CurrentState = Enums.State.APPROVE;
		emit ProcessCreated(msg.sender,address(this));
  }



  function approve(bool descision) public{
    //entering approve...
	  require(msg.sender==Mitigator,"[approve] sender is not required actor");
    require(CurrentState==Enums.State.APPROVE,"State is not appropriate");
    //require mitigator≠target
    //approve require ok...
    if(descision){
      //approve positive...
      CurrentState = Enums.State.FUNDING;
    }else{
      //approve negative...
      CurrentState = Enums.State.ABORT;
    }
  }



  function sendFunds() public payable {
    require(msg.sender==Target,"[sendFunds] sender is not required actor");
		require(CurrentState==Enums.State.FUNDING,"[sendFunds] State is not appropriate");
    require(msg.value >= OfferedFunds,"[sendFunds] send at least the offered funds");

		CurrentState = Enums.State.PROOF;
		setNewDeadline();
  }


  function uploadProof(string memory _Proof) public {
    require(CurrentState==Enums.State.PROOF,"[uploadProof] State is not appropriate");

    // when lazy
		if(now > Deadline){
			CurrentState = Enums.State.RATE_T;
			setNewDeadline();
			return;
		}

    require(msg.sender==Mitigator,"[uploadProof] sender is not required actor");

    Proof = _Proof;
		CurrentState = Enums.State.RATE_T;
		setNewDeadline();
  }


  function ratingByTarget(uint _Rating) public{
    require(CurrentState==Enums.State.RATE_T,"[ratingByTarget] State is not appropriate");
		if(now > Deadline){

			TargetRating = Enums.Rating.NOT_AVAILABLE;
			CurrentState = Enums.State.RATE_M;
			setNewDeadline();

			if(bytes(Proof).length==0){
				return endProcess();
			}
			return;
		}
		require(msg.sender==Target,"[ratingByTarget] sender is not required actor");
    TargetRating = Enums.Rating(_Rating);


    if(bytes(Proof).length==0){
      return endProcess();
    }

		CurrentState = Enums.State.RATE_M;
		setNewDeadline();
  }






  function ratingByMitigator(uint _Rating) public{
    require(CurrentState==Enums.State.RATE_M,"[ratingByMitigator] State is not appropriate");

		if(now > Deadline){
			MitigatorRating = Enums.Rating.NOT_AVAILABLE;
			return endProcess();
		}

		require(msg.sender==Mitigator,"[ratingByMitigator] sender is not required actor");
    MitigatorRating = Enums.Rating(_Rating);
	  return endProcess();
  }





	function endProcess() private{
		address payable owner;
		Enums.State stateToSet;
    (owner,stateToSet) = evaluate();
		CurrentState = stateToSet;

		if(owner!=address(0)){
			owner.transfer(address(this).balance);
		}
		EndTime = now;
	}





 function evaluate() private view returns (address payable, Enums.State){

    //evaluation with proof
    if(bytes(Proof).length>0){
 	    if(TargetRating==Enums.Rating.POSITIVE){
 			     return satisfied();
 		  }else if(TargetRating==Enums.Rating.DISSATISFIED){
 			     return dissatisfied();
 	    }else{
 			     return selfish();
 	    }
 	  //evaluation wihout proof
    }else{
       if(TargetRating==Enums.Rating.DISSATISFIED){
 			     return(Target,Enums.State.COMPLETE);
       }else{
            return(address(0),Enums.State.ABORT);
       }
    }
  }


 function satisfied() private view returns (address payable,Enums.State){
   if(MitigatorRating==Enums.Rating.POSITIVE){
	    return(Mitigator,Enums.State.COMPLETE);
   }else{
      return(address(0),Enums.State.ABORT);
   }
 }



 function selfish() private view returns (address payable,Enums.State){
   if(MitigatorRating==Enums.Rating.DISSATISFIED){
     return(Mitigator,Enums.State.COMPLETE);
   }else{
     return(address(0),Enums.State.ABORT);
   }
 }



 function dissatisfied() private view returns (address payable,Enums.State){
   if(MitigatorRating==Enums.Rating.DISSATISFIED){
      return(address(0),Enums.State.ESCALATE);
   }else{
     return(Target,Enums.State.COMPLETE);
   }
 }



 function() external payable{
   emit FundsReceived(msg.value);
 }


 function setNewDeadline() public{
   // OldDeadline is always the
   OldDeadline = Deadline;
   Deadline = now + DeadlineInterval * 1 seconds;
 }

 // for testing purposes
 function setState(uint newState) public{
   CurrentState = Enums.State(newState);
 }

 function getListOfAddresses() public view returns(string memory){
   return ListOfAddresses;
 }


 function getProof() public view returns(string memory){
   return Proof;
 }


 function getCurrentState() public view returns (Enums.State){
   return CurrentState;
 }


 function getTargetRating() public view returns (Enums.Rating){
	  return TargetRating;
 }


 function getMitigatorRating() public view returns (Enums.Rating){
	  return MitigatorRating;
 }


 function getStartTime() public view returns (uint256){
		return StartTime;
 }


 function getEndTime() public view returns (uint256){
		return EndTime;
 }

 function getDeadline() public view returns (uint256){
		return Deadline;
 }

 function getOldDeadline() public view returns (uint256){
		return OldDeadline;
 }

 // for testing purposes
 function getValidTime() public view returns(bool){
   if(now<Deadline){
     return true;
   }
   return false;
 }

 // for testing purposes
 function compareDeadlines(uint256 deadlineA, uint256 deadlineB) public pure returns(bool){
   if(deadlineA<deadlineB){
     return true;
   }
   return false;
 }





}
