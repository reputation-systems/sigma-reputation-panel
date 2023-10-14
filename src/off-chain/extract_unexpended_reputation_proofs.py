#  Extract the reputation proofs of an owner that can be expended.
from typing import List
from random import randrange
from ergpy import appkit, helper_functions


class ReputationProofs:

    def __init__(self, box_id: bytes, token_id: bytes, total_amount: int, expended_amount: int):
        self.box_id = box_id
        self.token_id = token_id
        self.total_amount = total_amount
        self.expended_amount = expended_amount
        self.free_percentage = ((1 - expended_amount) / total_amount) * 100

    def __dict__(self):
        return {
            "box_id": self.box_id.decode("utf-8"),
            "token_id": self.token_id.decode("utf-8"),
            "total_amount": self.total_amount,
            "expended_amount": self.expended_amount,
            "free_percentage": self.free_percentage
        }


def extract_unexpended_reputation_proofs(owner_pk: bytes) -> List[ReputationProofs]:
    #
    # Return all the ReputationProofs that satisfies that:
    #    - R4 is the owner_pk
    #    - propositionBytes is the on-chain/reputation_proof.scala contract
    #    - Can be spent, that is:
    #          1. it has a token not fully expended, and
    #          2. it doesn't have a R5 registry (AssignedReputation object)
    #

    return [
        ReputationProofs(
            box_id=b"n2kl321k32j3k12j3klj12kl3jk12j2kl3jkl",
            token_id=b"fldfjad9fdaf8da08f0da98f098ad0f809ad8",
            total_amount=randrange(110000, 100000000000),
            expended_amount=randrange(0, 110000)
        ) for _i in range(10)
    ]
