import { parseEther } from "ethers/lib/utils";
import { getMerkleTree } from "test/helpers/merkle";
import { Account } from "test/merkle/Account";

import leaves from "./leaves.json";

export function getMockMerkleTree() {
  const accounts: Account[] = leaves.map(({ address, value }) => ({
    address,
    value: parseEther(value),
  }));
  const merkleTree = getMerkleTree(accounts);

  return merkleTree;
}
