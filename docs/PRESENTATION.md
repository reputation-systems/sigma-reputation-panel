# REPUTATION SYSTEM

## Introduction

Our purpose to the Ergohack-VII is reputation system. A reputation system addresses a fundamental need in the blockchain ecosystem - trust. Trust is essential in any ecosystem, and our system aims to bridge the trust gap by providing a decentralized, user-driven mechanism for assigning and transferring reputation.

**Trust and Reputation:**

Trust is the foundation of any functional ecosystem, including the digital world of blockchain.
In this space, trust is equally vital.
Users must have confidence in the entities they interact with,
whether it's smart contracts, addresses, URLs, or other off-chain entities.
This reputation system aims to establish and maintain this trust.

**Basic explanation**

The main characteristic of this system is that it doesn’t require consensus.
That is: *Alice can trust Bob more than Criss.
But Dave can trust Criss more than Bob.*

For that, we suggest a system where Alice, Bob, Criss and Dave submit on who trust. 

Each of them can submit a record in a distributed and trustworthy database
(Ergo) so that the others can see in whom they invest their own reputation.
Each one has an incentive to maintain a good reputation,
and to do so, they should assign a good reputation only to those they consider better.

**Basic initial real-world economy example:**

This way, in, for example, an application like Airbnb, the cost of accommodation for a user will be inversely proportional to the reputation assigned to them by the tenant, which may be different from what other tenants assign (they don't have to reach a consensus, so they can rely on different ways to evaluate each other - giving more importance to punctuality than cleanliness, for example).

## **Aligment with the [Ergo Manifiesto](https://ergoplatform.org/en/blog/2021-04-26-the-ergo-manifesto/):**

Why is this an *ergonomic system*?

Well, in accordance with Ergo's principles, the system:

- It’s completely decentralized (****Decentralization First****), there's virtually no consensus among parties, as there isn't even a common token to represent reputation across all parties.

- It’s open and auditable (****Open Permissionless and Secure****), as a user can upload a different reputation contract (different from the one presented in this project), and it wouldn't fragment the system. The reputation proofs defined here could point to this new test with a different design as well.

- It’s ****Created for Regular People****, as there are no major entry barriers other than those inherent to the Ergo network.

- It’s focused on remaining cost-competitive ****(Platform for Contractual Money),**** as it allows providing economic agents with evidence of their past good behavior, preserving privacy.
    - This remains cost-competitive because it allows agents to consider a wider range of options. The lower the quality of reputation systems, the higher the cost of switching between services (e.g., switching from one dentist to another is more expensive if I have no reviews for either; if people share their experiences, there will be more competition).
    
- It Has a ****Long-term Focus****, as the development team has not based its approach on short-term vision.

## Applications

Some peer-to-peer networks need to have reputation system.
The simplest way to do that on a blockchain network is to create a brand, a token or maybe a DAO for governing.
This is not fully decentralized because the user will get the reputation based on a consensus with the rest of the token holders, this doesn't mean that in all cases we can do without tokens or DAOs; they are interesting solutions that aid in decentralization, but in some cases, they are just an attempt to cling to corporatism.

For that, reputation system like this can help. The users don’t need to make a consensus with the others.

In this way, an Airbnb peer-to-peer system could allow
assigning reputation to users or locations only based on the sources where the user trusts.

- Same for apps like Uber, JustEat …
- Some actors could have the incentive to improve their reputation proofs with more followers, and ensure that, the Airbnb’s locations where they assign reputation are correct.

## System design

**Reputation Trees:**
At the core of our system are Reputation Trees. These trees serve as hierarchical repositories of trust, with each tree containing a root Box representing 100% reputation. Within these trees, there are branches and leaves. Branches point to other reputation proofs, creating a hierarchy of trust, while leaves represent reputation proofs assigned to external objects in the form of metadata. This structure provides a systematic and scalable approach to reputation management.

![reputation_system-example.svg](resources/reputation_system-example.svg)

**User-Generated Reputation:**
A feature of this system is the ability for any user to submit reputation proofs.
It's a truly democratic approach to trust, empowering users to assign and transfer reputation.
Moreover, the system **does not require consensus** for reputation assignments,
allowing individual users to express their trust independently.

**Transfer of Reputation:**
Reputation should be dynamic, reflecting the evolving behavior of entities. The Reputation System allows for the transfer of reputation between proofs, offering a mechanism for the reward of good behavior and the accountability of bad behaviour.

**User Interface:**
We've designed an intuitive user interface that simplifies the process of submitting reputation proofs. The "Generate Reputation Proof" button allows users to specify the reputation amount from a new token or from another reputation proof (if they can spend it). 

- If the new Reputation Proof box has reputation object (could be called a pointer to an object too), it will be a leaf of the tree. That means that it will be unspendable.
- If not, the Reputation Proof is only a branch to assign reputation in the future.

**Versatile Use Cases:**
The Reputation System is designed to accommodate a wide range of use cases. Reputation proofs can be assigned to various entities, including software, URLs, Git repositories, and more. The system's versatility allows it to be applied to other contexts.

- The R5 registry allows assigning to other Ergo’s boxes (probably to other reputation systems)
- The R6 registry allows assigning to any external object (URLs, Git repositories, etc.)

**Scalability and Interoperability:**
As the blockchain ecosystem grows, scalability is paramount. Our system is designed to handle an increasing number of users and reputation assignments efficiently thanks to the eUTXO paradigm. We also consider interoperability with other blockchains and external services to create a seamless user experience.

**Accountability and Determinism:**
In our system, accountability is a fundamental principle.
Reputation proofs for on-chain objects cannot be spent or delegated,
ensuring a direct link between reputation and the object.
This restriction enhances accountability and trust in the system.

## **Problems not resolved**

Unfortunately, these past two days, we haven't been able to have a working version,
so we've had to settle for a version with demo data.
Nevertheless,
we will continue with the development and keep engaging with the community to receive feedback or any assistance.

There are certain things that we are not able to solve these two days, they are:

- The Fleet SDK usage could be improved:
    - Actually, we are taking the inputs from all the user’s unspended boxes but, on the UI, he selects a specific reputation proof (a specific box). So, we need to do that:
        - Solving the usage of the explorer api from off-chain code.
        - Doing that with Fleet from the browser.
- On the on-chain side:
    - The reputation object (or pointer to an object) uses to registers (R5 and R6) because it can have to type: a Box or a Tuple of bytes. That’s because ErgoScript don’t allow to use something like `type AssignedReputation = Box || (Cell[Byte], Cell[Byte])` types. We don’t know if there is a better way to do it.
    - We would want to limit the number of possible tokens to one, for a more specific contract.
- On the off-chain side:
    - We need to develop the `compute_reputation.py` script. It will allow computing the reputation of an object based on the user’s reputation proofs (and from those external proofs to which the user has assigned reputation).
    - The `extract_unexpended_reputation_proofs.py` script it’s only using random demo data for the user’s unexpended reputation proofs. It has the code to use the api explorer, but it didn't work.

## **Future aproaches**

This is a long-term project. Due to that, we recognize that reputation management needs to be adaptable.

Some possible branches to expand are:

- The UI allows seeing graphic reputation trees (owned to manage and external to be judged.)
- Allow to a more complex token/monetary policies.
- Each branch of the reputation tree could have its own rules and policies, allowing for customization to meet the unique needs of different communities and contexts. Events within the system can also trigger reputation transfers, creating a dynamic ecosystem.
    - For example
        
        *A reputation proof is directed towards a smart contract. Another reputation proof is directed towards a Git repository (or a specific commit) that serves as an interface to the contract. The second test is dependent on the first one, so if the contract's reputation drops, the interface's reputation will automatically decrease as well. (This could be achieved with a certain structure and monetary policies of the tree).*
        

## Conclusion

The Reputation System on the Ergo blockchain is a groundbreaking approach to decentralized trust and reputation.
Users have the power to independently assign, transfer, and maintain reputation.
Trust becomes a decentralized and dynamic force, promoting positive behavior and accountability.

*Thanks for reading.*
