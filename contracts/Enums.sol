pragma solidity ^0.5.0;

contract  Enums {
	//						0					1				2				3				4				5					6				7				8
	enum State {REQUEST, APPROVE, FUNDING, PROOF, RATE_T, RATE_M, COMPLETE, ABORT, ESCALATE}
	// 								0					1	(selfish)		  	2
  enum Rating {DISSATISFIED, NOT_AVAILABLE, POSITIVE}
}
