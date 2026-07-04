const hre = require("hardhat");

async function main() {
  const LogIntegrity = await hre.ethers.getContractFactory("LogIntegrity");
  const contract = await LogIntegrity.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`LogIntegrity smart contract deployed successfully to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
