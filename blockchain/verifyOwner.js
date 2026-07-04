const hre = require("hardhat");

async function check() {
  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const LogIntegrity = await hre.ethers.getContractFactory("LogIntegrity");
  const contract = LogIntegrity.attach(contractAddress);

  const owner = await contract.owner();
  console.log("=== CONTRACT OWNER ===");
  console.log("Contract Address:", contractAddress);
  console.log("Contract Owner:", owner);

  // Check the address of the backend private key
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new hre.ethers.Wallet(privateKey);
  console.log("Backend Wallet Address:", wallet.address);

  if (owner.toLowerCase() === wallet.address.toLowerCase()) {
    console.log("MATCH: Backend wallet IS the contract owner.");
  } else {
    console.log("MISMATCH: Backend wallet is NOT the contract owner.");
  }
}

check().catch(console.error);
