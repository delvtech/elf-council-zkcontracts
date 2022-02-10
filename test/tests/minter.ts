import { expect } from "chai";
import { waffle } from "hardhat";
import { MerkleTree } from "merkletreejs";
import { Account, getMerkleTree } from "test/helpers/merkle";
import { createSnapshot, restoreSnapshot } from "test/helpers/snapshots";
import {
  ElfNFT,
  ElfNFT__factory,
  Minter,
  Minter__factory,
} from "typechain-types";

const { provider } = waffle;

describe("Minter", function () {
  let elfNFT: ElfNFT;
  let minter: Minter;
  let merkleTree: MerkleTree;

  const [deployer, wallet1, wallet2] = provider.getWallets();

  before(async function () {
    await createSnapshot(provider);

    const signers = provider.getWallets();
    const accounts: Account[] = [];
    for (const i in signers) {
      accounts.push({
        address: signers[i].address,
        value: i,
      });
    }

    merkleTree = await getMerkleTree(accounts);
    const merkleRoot = merkleTree.getHexRoot();

    const tokenDeployer = new ElfNFT__factory(deployer);
    const minterDeployer = new Minter__factory(deployer);

    elfNFT = await tokenDeployer.deploy(
      "Elfie NFT",
      "ELFNFT",
      deployer.address
    );

    minter = await minterDeployer.deploy(elfNFT.address, merkleRoot);
    await elfNFT.setOwner(minter.address);
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

  interface Error {
    message: string;
  }

  describe("mint", async () => {
    // The ERC721 should not be able to mint tokens directly
    it("token should not mint an NFT", async () => {
      elfNFT.connect(wallet1);
      try {
        await elfNFT.mint(wallet1.address, 1);
      } catch (error) {
        expect((error as Error)?.message).to.include("Sender not owner");
      }
    });

    it("minter should not mint an NFT", async () => {
      // incorrect signer
      minter = minter.connect(wallet2);
      const leaves = merkleTree.getLeaves();
      const merkleProof = merkleTree.getHexProof(leaves[1]);
      try {
        await minter.mint(1, merkleProof);
      } catch (error) {
        expect((error as Error)?.message).to.include("Invalid Proof");
      }
    });

    it("minter should not mint an NFT twice", async () => {
      minter = minter.connect(wallet1);
      const leaves = merkleTree.getLeaves();
      const merkleProof = merkleTree.getHexProof(leaves[1]);
      await minter.mint(1, merkleProof);

      // mint the first one
      const owner = await elfNFT.ownerOf(1);
      expect(owner).to.equal(wallet1.address);

      // should fail minting again
      try {
        await minter.mint(1, merkleProof);
      } catch (error) {
        expect((error as Error)?.message).to.include("ALREADY_MINTED");
      }
    });

    it("minter should mint an NFT", async () => {
      minter = minter.connect(wallet1);
      const leaves = merkleTree.getLeaves();
      const merkleProof = merkleTree.getHexProof(leaves[1]);
      await minter.mint(1, merkleProof);
      const owner = await elfNFT.ownerOf(1);

      expect(owner).to.equal(wallet1.address);
    });
  });

  describe("setMerkleRoot", async () => {
    it("onlyOwner should set merkleRoot", async () => {
      minter = minter.connect(deployer);
      const signers = provider.getWallets();
      const accounts: Account[] = [];
      for (const i in signers) {
        accounts.push({
          address: signers[i].address,
          value: i + 1,
        });
      }
      const newMerkleTree = await getMerkleTree(accounts);
      const newMerkleRoot = newMerkleTree.getHexRoot();
      await minter.setRewardsRoot(newMerkleRoot);
      const newRoot = await minter.merkleRoot();

      expect(newMerkleRoot).to.equal(newRoot);
    });

    it("not owner should not set merkleRoot", async () => {
      // incorrect owner
      minter = minter.connect(wallet1);
      const signers = provider.getWallets();
      const accounts: Account[] = [];
      for (const i in signers) {
        accounts.push({
          address: signers[i].address,
          value: i + 1,
        });
      }
      const newMerkleTree = await getMerkleTree(accounts);
      const newMerkleRoot = newMerkleTree.getHexRoot();
      try {
        await minter.setRewardsRoot(newMerkleRoot);
      } catch (error) {
        expect((error as Error)?.message).to.include("Sender not owner");
      }
    });
  });
});
