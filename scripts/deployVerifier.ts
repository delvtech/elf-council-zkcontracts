import { Signer } from "ethers";
import { PlonkVerifier, PlonkVerifier__factory } from "typechain-types";

export async function deployVerifier(deployer: Signer): Promise<PlonkVerifier> {
  const plonkFactory = new PlonkVerifier__factory(deployer);
  const verifierContract = await plonkFactory.deploy();
  return verifierContract;
}
