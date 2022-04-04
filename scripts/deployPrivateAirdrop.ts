import { BigNumber, BytesLike, Signer } from "ethers";
import { PrivateAirdrop, PrivateAirdrop__factory } from "typechain-types";

export async function deployPrivateAirdrop(
  deployer: Signer,
  tokenAddress: string,
  vaultAddress: string,
  verifierAddress: string,
  amountPerRedemption: BigNumber,
  merkleRoot: BytesLike
): Promise<PrivateAirdrop> {
  const airdropFactory = new PrivateAirdrop__factory(deployer);

  const airdropContract = await airdropFactory.deploy(
    tokenAddress,
    amountPerRedemption,
    verifierAddress,
    merkleRoot,
    vaultAddress
  );

  return airdropContract;
}
