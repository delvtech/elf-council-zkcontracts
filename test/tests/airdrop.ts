import { expect } from "chai";
import {
  LockingVault__factory,
  MockERC20,
  MockERC20__factory,
} from "elf-council-typechain";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { readFileSync } from "fs";
import { waffle } from "hardhat";
import { createSnapshot, restoreSnapshot } from "test/helpers/snapshots";
import leaves from "test/leaves.json";
import { getMockMerkleTree } from "test/merkle/getMockMerkleTree";
import { PrivateAirdrop__factory } from "typechain-types";
import { PlonkVerifier__factory } from "typechain-types/factories/PlonkVerifier__factory";
import { PlonkVerifier } from "typechain-types/PlonkVerifier";
import { PrivateAirdrop } from "typechain-types/PrivateAirdrop";
import {
  generateProofCallData,
  MerkleTree,
  pedersenHash,
  toHex,
} from "zkp-merkle-airdrop-lib/src";

const { provider } = waffle;
const WASM_PATH = "circuits/circuit.wasm";
const ZKEY_PATH = "circuits/circuit_final.zkey";

const WASM_BUFF = readFileSync(WASM_PATH);
const ZKEY_BUFF = readFileSync(ZKEY_PATH);

// amount of blocks before delegated votes expire for a proposal
const STALE_BLOCK_LAG = 1000;
const NUM_ERC20_TO_DISTRIBUTE = parseEther("80000");

describe("PrivateAirdrop", function () {
  let airdropContract: PrivateAirdrop;
  let verifierContract: PlonkVerifier;
  let tokenContract: MockERC20;

  const amountPerRedemption = ethers.constants.WeiPerEther;

  let merkleTree: MerkleTree;

  const [deployer] = provider.getWallets();

  before(async function () {
    await createSnapshot(provider);

    const tokenDeployer = new MockERC20__factory(deployer);
    tokenContract = await tokenDeployer.deploy(
      "Elf Token",
      "ELFI",
      deployer.address
    );

    const vaultDeployer = new LockingVault__factory(deployer);

    const vaultContract = await vaultDeployer.deploy(
      tokenContract.address,
      STALE_BLOCK_LAG
    );

    const verifierDeployer = new PlonkVerifier__factory(deployer);
    verifierContract = await verifierDeployer.deploy();

    merkleTree = getMockMerkleTree();
    const merkleRoot = toHex(merkleTree.root.val);

    const airdropDeployer = new PrivateAirdrop__factory(deployer);
    airdropContract = await airdropDeployer.deploy(
      tokenContract.address,
      amountPerRedemption,
      verifierContract.address,
      merkleRoot,
      vaultContract.address
    );

    await tokenContract.setBalance(
      airdropContract.address,
      NUM_ERC20_TO_DISTRIBUTE
    );
  });

  after(async () => {
    await restoreSnapshot(provider);
  });

  beforeEach(async () => {
    await createSnapshot(provider);
  });

  afterEach(async () => {
    await restoreSnapshot(provider);
  });

  // interface Error {
  //   message: string;
  // }

  describe("claimAirdropAndDelegate", async () => {
    const [leaf] = leaves;
    const { key, secret } = leaf;

    it("should claim into the vault", async () => {
      const proof = await generateProofCallData(
        merkleTree,
        BigInt(key),
        BigInt(secret),
        deployer.address,
        WASM_BUFF,
        ZKEY_BUFF
      );

      const keyHash = toHex(pedersenHash(BigInt(key)));

      await airdropContract.claimAirdropAndDelegate(
        proof,
        keyHash,
        deployer.address
      );

      expect(true).to.equal(true);
    });
  });
});
