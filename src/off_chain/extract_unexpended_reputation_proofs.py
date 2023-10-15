#  Extract the reputation proofs of an owner that can be expended.
from typing import List

DEMO_DATA = True
CONTRACT_HASH = "2Ud2Ryh6MkC8Lstg1BiSE86Vbs7FTBdChEMo2c3ZK3pyGaQoY2Ck9QQiz2n4vWP6"


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
    # Return all the reputation proof that satisfies that:
    #    - R4 is the owner_pk
    #    - propositionBytes is the on_chain/reputation_proof.scala contract
    #    - Can be spent, that is:
    #          1. it has a token not fully expended, and
    #          2. it doesn't have a R5 and R6 registries (AssignedReputation object)
    #

    if DEMO_DATA:
        from random import randrange, randbytes
        from hashlib import sha512
        return [
            ReputationProofs(
                box_id=sha512(randbytes(10)).hexdigest().encode('utf-8'),
                token_id=sha512(randbytes(10)).hexdigest().encode('utf-8'),
                total_amount=randrange(50, 100),
                expended_amount=randrange(0, 50)
            ) for _i in range(randrange(1, 100))
        ]

    else:
        import requests
        api_url = "https://api.ergoplatform.com/api/v1/boxes/unspent/search"
        payload = {
          "ergoTreeTemplateHash": CONTRACT_HASH,
          "registers": {
            "property4": owner_pk.decode("utf-8")
          }
        }

        response = requests.post(api_url, data=payload)
        # Check if the request was successful (HTTP status code 200)
        if response.status_code == 200:
            # Parse and work with the response data (JSON in this case)
            data = response.json()
            print(data)
            #   TODO filter only the contracts that don't have the R5 and R6 registries.
            return data  # TODO convert to a List[ReputationProofs]
        else:
            print(f"Request failed with status code {response.status_code} {response.reason}")


if __name__ == "__main__":
    DEMO_DATA = False
    extract_unexpended_reputation_proofs(owner_pk="9ejNy2qoifmzfCiDtEiyugthuXMriNNPhNKzzwjPtHnrK3esvbD".encode("utf-8"))
