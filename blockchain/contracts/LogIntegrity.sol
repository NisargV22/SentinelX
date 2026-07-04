// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract LogIntegrity {
    address public owner;

    struct LogRecord {
        bytes32 batchHash;
        string batchId;
        uint256 timestamp;
        uint256 blockNumber;
    }

    mapping(bytes32 => LogRecord) public registry;
    bytes32[] public allHashes;
    uint256 public totalAnchored;

    event HashAnchored(bytes32 indexed batchHash, string batchId, uint256 timestamp, uint256 blockNumber);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier hashNotExists(bytes32 _hash) {
        require(registry[_hash].timestamp == 0, "Hash already anchored");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function anchorHash(bytes32 _hash, string memory _batchId) public onlyOwner hashNotExists(_hash) {
        LogRecord memory record = LogRecord({
            batchHash: _hash,
            batchId: _batchId,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        registry[_hash] = record;
        allHashes.push(_hash);
        totalAnchored++;
        emit HashAnchored(_hash, _batchId, block.timestamp, block.number);
    }

    function verifyHash(bytes32 _hash) public view returns (bool exists, LogRecord memory record) {
        record = registry[_hash];
        exists = (record.timestamp != 0);
        return (exists, record);
    }

    function getRecord(bytes32 _hash) public view returns (LogRecord memory) {
        return registry[_hash];
    }

    function getTotalAnchored() public view returns (uint256) {
        return totalAnchored;
    }

    function getAllHashes() public view returns (bytes32[] memory) {
        return allHashes;
    }
}
