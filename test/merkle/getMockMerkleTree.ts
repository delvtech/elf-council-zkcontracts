import leavesJson from "test/leaves.json";
import { MerkleTree } from "zkp-merkle-airdrop-lib/src";
// import { MerkleTree as MT } from "merkletreejs";

export function getMockMerkleTree() {
  const leaves = leavesJson.map(({ commitment }) => commitment).map(BigInt);
  const merkleTree = MerkleTree.createFromLeaves(leaves);
  return merkleTree;
  // const otherMerkleTree = new MT(leaves);
  // console.log("merkleTree", otherMerkleTree);
  // return otherMerkleTree;
}
