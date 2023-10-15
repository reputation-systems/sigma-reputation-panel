# PRESENTATION

**Introduction:**
Our purpose to the Ergohack-VII is a reputation system. A reputation system addresses a fundamental need in the blockchain ecosystem - trust. Trust is essential in any ecosystem, and our system aims to bridge the trust gap by providing a decentralized, user-driven mechanism for assigning and transferring reputation.

**Trust and Reputation:**
Trust is the foundation of any functional ecosystem, including the digital world of blockchain. In this space, trust is equally vital. Users must have confidence in the entities they interact with, whether it's smart contracts, addresses, URLs, or other off-chain entities. The Reputation System aims to establish and maintain this trust.

**Reputation Trees:**
At the core of our system are Reputation Trees. These trees serve as hierarchical repositories of trust, with each tree containing a root Box representing 100% reputation. Within these trees, there are branches and leaves. Branches point to other reputation proofs, creating a hierarchy of trust, while leaves represent reputation proofs assigned to external objects in the form of metadata. This structure provides a systematic and scalable approach to reputation management.

![reputation_system-example.svg](PRESENTATION%20e9b688a04a8448f2b53c13badbce5ad4/reputation_system-example.svg)

**User-Generated Reputation:**
A feature of this system is the ability for any user to submit reputation proofs. It's a truly democratic approach to trust, empowering users to assign and transfer reputation. Moreover, the system **does** not require consensus for reputation assignments, allowing individual users to express their trust independently.

**Transfer of Reputation:**
Reputation should be dynamic, reflecting the evolving behavior of entities. The Reputation System allows for the transfer of reputation between proofs, offering a mechanism for the reward of good behavior and the accountability of bad behaviour.

**User Interface:**
We've designed an intuitive user interface that simplifies the process of submitting reputation proofs. The "Generate Reputation Proof" button allows users to specify the reputation amount from a new token or from another reputation proof (if they can spend it). 

- If the new Reputation Proof box has a reputation object (could be called a pointer to an object too) it will be a leaf of the tree. That means that it will be unspendable.
- If not, the Reputation Proof is only a branch  to assign reputation on the future.

**Versatile Use Cases:**
The Reputation System is designed to accommodate a wide range of use cases. Reputation proofs can be assigned to various entities, including software, URLs, Git repositories, and more. The system's versatility allows it to be applied to other contexts.

- The R5 registry allows to assign to other Ergo’s boxes (probably to other reputation systems)
- The R6 registry allows to assign to any external object (URLs, Git repositories, etc)

**Scalability and Interoperability:**
As the blockchain ecosystem grows, scalability is paramount. Our system is designed to handle an increasing number of users and reputation assignments efficiently thanks to the eUTXO paradigm. We also consider interoperability with other blockchains and external services to create a seamless user experience.

**Accountability and Determinism:**
In our system, accountability is a fundamental principle. Reputation proofs for on-chain objects cannot be spent or delegated, ensuring a direct link between reputation and the object. This restriction enhances accountability and trust in the system.

**Problems not resolved:**

There are certain things that we are not able to solve these two days, they are:

- The Fleet SDK usage could be improved:
    - Actually we are taking the inputs from all the user’s unspended boxes but, on the UI, he selects a specific reputation proof (a specific box). So, we need to do that:
        - Solving the usage of the explorer api from off-chain code.
        - Doing that with Fleet from the browser.
- On the on-chain side:
    - The reputation object (or pointer to an object) uses to registers (R5 and R6) because it can have to types: a Box or a Tuple of bytes. That’s because ErgoScript don’t allow to use something like `type AssignedReputation = Box || (Cell[Byte], Cell[Byte])` types. We don’t know if there is a better way to do it.
    - We would want to limit the number of possible tokens to one, for a more specific contract.
- On the off-chain side:
    - We need to develop the compute reputation script. It will allow to compute the reputation of an object based on the user’s reputation proofs (and from those external proofs to which the user has assigned reputation).
    - The `extract_unexpended_reputation_proofs.py` script it’s only using random demo data for the user’s unexpended reputation proofs. It has the code to use the api explorer, but doesn’t work.

**Future aproaches:**
We recognize that reputation management needs to be adaptable. 

Some possible branches to expand are:

- The UI allow to see graphic reputation trees (owned to manage and external to be judged.)
- Allow to a more complex token/monetary policies.
- Each branch of the reputation tree could have its own rules and policies, allowing for customization to meet the unique needs of different communities and contexts. Events within the system can also trigger reputation transfers, creating a dynamic ecosystem.
    - For example
        
        *A reputation proof is directed towards a smart contract. Another reputation proof is directed towards a Git repository (or a specific commit) that serves as an interface to the contract. The second test is dependent on the first one, so if the contract's reputation drops, the interface's reputation will automatically decrease as well. (This could be achieved with a certain structure and monetary policies of the tree).*
        

**Conclusion:**
The Reputation System on the Ergo blockchain is a groundbreaking approach to decentralized trust and reputation. Users have the power to independently assign, transfer, and maintain reputation. Trust becomes a decentralized and dynamic force, promoting positive behavior and accountability.

Thanks for reading.