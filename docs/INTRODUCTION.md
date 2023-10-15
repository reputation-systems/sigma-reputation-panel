We are working on a draft of a reputation system within the Ergo blockchain. 
This system aims to assign reputation to various entities, 
including UTXOs within Ergo and external objects such as addresses, URLs, and Git repositories.

The reputation system is based on reputation trees, which are sets of UTXOs. 
Each tree has a root UTXO containing 100% reputation, with branches and leaves 
pointing to other reputation proofs and external objects as metadata.

Key properties of the system include the ability for any user to submit reputation proofs, 
the transfer of reputation between proofs, 
and the various types of reputation proofs for both on-chain and off-chain objects.

This system doesn't require consensus and allows users to assign reputation to entities they trust, 
creating incentives for maintaining good reputations. It offers a decentralized approach to trust and reputation.
