const { ethers } = require("ethers");

const ABI = [
  "function anchorHash(bytes32 _hash, string memory _batchId) public",
  "function verifyHash(bytes32 _hash) public view returns (bool exists, tuple(bytes32 batchHash, string batchId, uint256 timestamp, uint256 blockNumber) record)",
  "function getRecord(bytes32 _hash) public view returns (tuple(bytes32 batchHash, string batchId, uint256 timestamp, uint256 blockNumber))",
  "function getTotalAnchored() public view returns (uint256)",
  "function getAllHashes() public view returns (bytes32[] memory)"
];

let provider = null;
let contract = null;
let wallet = null;

const initBlockchain = () => {
  try {
    const rpcUrl = process.env.ETH_RPC_URL || "http://127.0.0.1:7545";
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.ETH_PRIVATE_KEY;

    if (!contractAddress || !privateKey) {
      console.warn("Blockchain config missing. Operating in MOCK blockchain mode.");
      return null;
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, ABI, wallet);
    
    console.log(`Blockchain Bridge Connected. Contract target: ${contractAddress}`);
    return { provider, contract, wallet };
  } catch (err) {
    console.error("Failed to initialize blockchain provider:", err.message);
    console.log("Operating in MOCK blockchain mode.");
    return null;
  }
};

module.exports = {
  initBlockchain,
  getContract: () => contract,
  getProvider: () => provider,
  getWallet: () => wallet
};
