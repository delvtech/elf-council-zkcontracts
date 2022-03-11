import { Leaf } from "src/common/merkle/Leaf";

export interface MerkleProof {
  leaf: Leaf;
  proof: string[];
}
