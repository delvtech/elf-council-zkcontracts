import { BytesLike, ethers, Signer } from "ethers";
import {
  PlonkVerifier,
  PlonkVerifier__factory,
  PrivateAirdrop,
  PrivateAirdrop__factory,
} from "typechain-types";

const NUM_TOKEN_PER_REDEMPTION = ethers.constants.WeiPerEther;

export async function deployContracts(
  deployer: Signer,
  tokenAddress: string,
  vaultAddress: string,
  merkleRoot: BytesLike
): Promise<{
  verifierContract: PlonkVerifier;
  airdropContract: PrivateAirdrop;
}> {
  const plonkFactory = new PlonkVerifier__factory(deployer);

  const verifierContract = await plonkFactory.deploy();

  const airdropFactory = new PrivateAirdrop__factory(deployer);

  const airdropContract = await airdropFactory.deploy(
    tokenAddress,
    NUM_TOKEN_PER_REDEMPTION,
    verifierContract.address,
    merkleRoot,
    vaultAddress
  );

  return { verifierContract, airdropContract };
}
