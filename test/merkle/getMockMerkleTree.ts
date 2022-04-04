import leavesJson from "test/leaves.json";
import { MerkleTree } from "zkp-merkle-airdrop-lib/src";

export function getMockMerkleTree() {
  const leaves = leavesJson.map(({ commitment }) => commitment).map(BigInt);
  const merkleTree = MerkleTree.createFromLeaves(leaves);
  return merkleTree;
}
