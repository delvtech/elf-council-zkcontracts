import "tsconfig-paths/register";

import { providers, Wallet } from "ethers";
import { deployContracts } from "scripts/deployContracts";

const {
  ALCHEMY_GOERLI_API_KEY,
  GOERLI_DEPLOYER_PRIVATE_KEY,
  ELEMENT_TOKEN_ADDRESS,
  LOCKING_VAULT_ADDRESS,
  MERKLE_ROOT,
} = process.env;

const ALCHEMY_GOERLI_RPC_HOST = `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_API_KEY}`;

const tokenAddress = ELEMENT_TOKEN_ADDRESS;
const vaultAddress = LOCKING_VAULT_ADDRESS;

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

  if (!MERKLE_ROOT) {
    console.log("No merkle root provided");
    return;
  }

  const provider = new providers.JsonRpcProvider(ALCHEMY_GOERLI_RPC_HOST);
  const deployer = new Wallet(GOERLI_DEPLOYER_PRIVATE_KEY, provider);

  const { verifierContract, airdropContract } = await deployContracts(
    deployer,
    tokenAddress,
    vaultAddress,
    MERKLE_ROOT
  );

  console.log("verifierContract deployed at", verifierContract.address);
  console.log("airdropContract deployed at", airdropContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
