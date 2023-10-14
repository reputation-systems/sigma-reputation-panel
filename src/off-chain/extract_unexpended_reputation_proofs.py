#  Extract the reputation proofs of an owner that can be expended.
from typing import List
from random import randrange
from hashlib import sha512
from ergpy import appkit, helper_functions


class ReputationProofs:

    def __init__(self, box_id: bytes, token_id: bytes, total_amount: int, expended_amount: int):
        self.box_id = box_id
        self.token_id = token_id
        self.total_amount = total_amount
        self.free_amount = total_amount - expended_amount
        self.free_percentage = round((self.free_amount / total_amount) * 100, 2)

    def __dict__(self):
        return {
            "box_id": self.box_id.decode("utf-8"),
            "token_id": self.token_id.decode("utf-8"),
            "total_amount": self.total_amount,
            "free_amount": self.free_amount,
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
            # box_id=sha512(randrange(0, 10)).digest(), TODO
            # token_id=sha512(randrange(0, 10)).digest(),
            box_id=b"dfkjdaljd",
            token_id=b"ff9d7f8ad8979",
            total_amount=randrange(50, 100),
            expended_amount=randrange(0, 50)
        ) for _i in range(10)
    ]
