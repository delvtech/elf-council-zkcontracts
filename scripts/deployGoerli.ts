import "tsconfig-paths/register";

import { providers, Signer, Wallet } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import hre from "hardhat";
import { deployPrivateAirdrop } from "scripts/deployPrivateAirdrop";
import { deployVerifier } from "scripts/deployVerifier";
import { PlonkVerifier__factory } from "typechain-types/factories/PlonkVerifier__factory";
import { PlonkVerifier } from "typechain-types/PlonkVerifier";

import { sleep } from "src/sleep";

const {
  ALCHEMY_GOERLI_API_KEY,
  GOERLI_DEPLOYER_PRIVATE_KEY,
  GOERLI_ELEMENT_TOKEN_ADDRESS,
  GOERLI_LOCKING_VAULT_ADDRESS,
  GOERLI_VERIFIER_ADDRESS,
  GOERLI_MERKLE_RROT,
} = process.env;

const ALCHEMY_GOERLI_RPC_HOST = `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_GOERLI_API_KEY}`;

const tokenAddress = GOERLI_ELEMENT_TOKEN_ADDRESS;
const vaultAddress = GOERLI_LOCKING_VAULT_ADDRESS;

const verifyContracts = false;
const verifierAddress = "0xd0abdb2175ef925a3f3780b5489f319db7dae42c";
const amountPerRedemption = parseEther("204.63288859785544");

async function main() {
  if (!ALCHEMY_GOERLI_RPC_HOST) {
    console.log("No rpc host provided");
    return;
  }

  if (!GOERLI_DEPLOYER_PRIVATE_KEY) {
    console.log("No deployer private key provided");
    return;
  }

  if (!tokenAddress) {
    console.log("No airdrop token address provided");
    return;
  }

  if (!vaultAddress) {
    console.log("No vault address provided");
    return;
  }

  if (!GOERLI_MERKLE_RROT) {
    console.log("No merkle root provided");
    return;
  }

  const provider = new providers.JsonRpcProvider(ALCHEMY_GOERLI_RPC_HOST);
  const deployer = new Wallet(GOERLI_DEPLOYER_PRIVATE_KEY, provider);

  const verifierContract = await getVerifierContract(deployer, verifierAddress);
  const airdropContract = await deployPrivateAirdrop(
    deployer,
    tokenAddress,
    vaultAddress,
    verifierAddress,
    amountPerRedemption,
    GOERLI_MERKLE_RROT
  );

  if (!GOERLI_VERIFIER_ADDRESS) {
    console.log("verifierContract deployed at", verifierContract.address);
  }
  console.log("airdropContract deployed at", airdropContract.address);
  console.log("amount per redemption", formatEther(amountPerRedemption));

  // Note: you only have to verify each contract type once, etherscan will
  // figure out the other instances after that.
  if (!verifyContracts) {
    return;
  }

  await sleep(40000);

  try {
    await hre.run("verify:verify", {
      network: "goerli",
      address: verifierContract.address,
      constructorArguments: [
        tokenAddress,
        amountPerRedemption,
        verifierAddress,
        GOERLI_MERKLE_RROT,
        vaultAddress,
      ],
    });
    await hre.run("verify:verify", {
      network: "goerli",
      address: airdropContract.address,
      constructorArguments: [
        tokenAddress,
        amountPerRedemption,
        verifierAddress,
        GOERLI_MERKLE_RROT,
        vaultAddress,
      ],
    });
  } catch (error) {
    console.log("verify failed", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function getVerifierContract(
  deployer: Signer,
  verifierAddres: string | undefined
): Promise<PlonkVerifier> {
  if (verifierAddres) {
    return PlonkVerifier__factory.connect(verifierAddress, deployer);
  }

  return deployVerifier(deployer);
}
