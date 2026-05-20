// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Voting
 * @dev Hệ thống bầu cử phi tập trung trên Blockchain Ethereum
 *
 * Đặc điểm:
 * - Chỉ Admin (người deploy) có quyền thêm ứng viên và cấp phép cử tri
 * - Mỗi cử tri chỉ được bỏ phiếu đúng một lần, không thể thay đổi
 * - Mọi thao tác đều được ghi lại minh bạch qua Events
 * - Kết quả không thể bị sửa đổi sau khi ghi vào blockchain
 */
contract Voting {

    // ============================================================
    // DATA STRUCTURES
    // ============================================================

    struct Candidate {
        string name;
        string description;
        uint256 voteCount;
    }

    // ============================================================
    // STATE VARIABLES
    // ============================================================

    address public owner;
    string public electionTitle;

    Candidate[] private candidates;

    mapping(address => bool) public whitelist;
    mapping(address => bool) public hasVoted;
    mapping(address => uint256) public voterChoice;

    bool public electionActive;
    bool public electionEnded;
    uint256 public totalVotes;
    uint256 public startTime;
    uint256 public endTime;

    // ============================================================
    // EVENTS
    // ============================================================

    event Voted(address indexed voter, uint256 indexed candidateId, uint256 timestamp);
    event VoterWhitelisted(address indexed voter, address indexed grantedBy);
    event CandidateAdded(uint256 indexed candidateId, string name);
    event ElectionStarted(uint256 timestamp);
    event ElectionEnded(uint256 timestamp, uint256 totalVotesCast);

    // ============================================================
    // MODIFIERS
    // ============================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Chi Admin moi co quyen thuc hien hanh dong nay");
        _;
    }

    modifier whenElectionActive() {
        require(electionActive && !electionEnded, "Cuoc bau cu hien khong dang dien ra");
        _;
    }

    modifier whenElectionNotStarted() {
        require(!electionActive && !electionEnded, "Cuoc bau cu da bat dau hoac ket thuc");
        _;
    }

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor(string memory _electionTitle) {
        owner = msg.sender;
        electionTitle = _electionTitle;
        electionActive = false;
        electionEnded = false;
        totalVotes = 0;
    }

    // ============================================================
    // ADMIN FUNCTIONS
    // ============================================================

    /**
     * @dev Thêm ứng viên vào danh sách. Chỉ thực hiện trước khi bầu cử bắt đầu.
     */
    function addCandidate(string memory _name, string memory _description)
        external
        onlyOwner
        whenElectionNotStarted
    {
        require(bytes(_name).length > 0, "Ten ung vien khong duoc de trong");
        require(candidates.length < 50, "Toi da 50 ung vien");

        candidates.push(Candidate({
            name: _name,
            description: _description,
            voteCount: 0
        }));

        emit CandidateAdded(candidates.length - 1, _name);
    }

    /**
     * @dev Cấp quyền bầu cử cho một cử tri.
     */
    function whitelistVoter(address _voter) external onlyOwner {
        require(_voter != address(0), "Dia chi khong hop le");
        require(!whitelist[_voter], "Cu tri da duoc cap quyen");

        whitelist[_voter] = true;
        emit VoterWhitelisted(_voter, msg.sender);
    }

    /**
     * @dev Cấp quyền bầu cử hàng loạt.
     */
    function whitelistMultipleVoters(address[] calldata _voters) external onlyOwner {
        for (uint256 i = 0; i < _voters.length; i++) {
            if (_voters[i] != address(0) && !whitelist[_voters[i]]) {
                whitelist[_voters[i]] = true;
                emit VoterWhitelisted(_voters[i], msg.sender);
            }
        }
    }

    /**
     * @dev Bắt đầu cuộc bầu cử. Cần ít nhất 2 ứng viên.
     */
    function startElection() external onlyOwner whenElectionNotStarted {
        require(candidates.length >= 2, "Can it nhat 2 ung vien de bat dau bau cu");

        electionActive = true;
        startTime = block.timestamp;

        emit ElectionStarted(block.timestamp);
    }

    /**
     * @dev Kết thúc cuộc bầu cử.
     */
    function endElection() external onlyOwner whenElectionActive {
        electionActive = false;
        electionEnded = true;
        endTime = block.timestamp;

        emit ElectionEnded(block.timestamp, totalVotes);
    }

    // ============================================================
    // VOTER FUNCTIONS
    // ============================================================

    /**
     * @dev Bỏ phiếu cho ứng viên theo ID.
     * Điều kiện: bầu cử đang diễn ra, cử tri đã được cấp phép, chưa bỏ phiếu.
     */
    function vote(uint256 _candidateId) external whenElectionActive {
        require(whitelist[msg.sender], "Ban khong co quyen bau cu - lien he Admin de duoc cap phep");
        require(!hasVoted[msg.sender], "Ban da bau roi - moi cu tri chi duoc bau mot lan");
        require(_candidateId < candidates.length, "Ung vien khong ton tai");

        hasVoted[msg.sender] = true;
        voterChoice[msg.sender] = _candidateId;
        candidates[_candidateId].voteCount += 1;
        totalVotes += 1;

        emit Voted(msg.sender, _candidateId, block.timestamp);
    }

    // ============================================================
    // VIEW FUNCTIONS (miễn phí Gas)
    // ============================================================

    function getCandidatesCount() external view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 _candidateId)
        external
        view
        returns (string memory name, string memory description, uint256 voteCount)
    {
        require(_candidateId < candidates.length, "Ung vien khong ton tai");
        Candidate storage c = candidates[_candidateId];
        return (c.name, c.description, c.voteCount);
    }

    /**
     * @dev Lấy toàn bộ danh sách ứng viên một lần duy nhất (tiết kiệm Gas).
     */
    function getAllCandidates()
        external
        view
        returns (
            string[] memory names,
            string[] memory descriptions,
            uint256[] memory voteCounts
        )
    {
        uint256 count = candidates.length;
        names        = new string[](count);
        descriptions = new string[](count);
        voteCounts   = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            names[i]        = candidates[i].name;
            descriptions[i] = candidates[i].description;
            voteCounts[i]   = candidates[i].voteCount;
        }

        return (names, descriptions, voteCounts);
    }

    function getVotes(uint256 _candidateId) external view returns (uint256) {
        require(_candidateId < candidates.length, "Ung vien khong ton tai");
        return candidates[_candidateId].voteCount;
    }

    function getElectionStatus()
        external
        view
        returns (
            bool active,
            bool ended,
            uint256 totalVotesCast,
            uint256 electionStartTime,
            uint256 electionEndTime
        )
    {
        return (electionActive, electionEnded, totalVotes, startTime, endTime);
    }

    function isWhitelisted(address _voter) external view returns (bool) {
        return whitelist[_voter];
    }

    function hasVoterVoted(address _voter) external view returns (bool) {
        return hasVoted[_voter];
    }

    function getVoterChoice(address _voter) external view returns (uint256) {
        require(hasVoted[_voter], "Cu tri chua bau phieu");
        return voterChoice[_voter];
    }

    /**
     * @dev Lấy thông tin người chiến thắng (chỉ sau khi bầu cử kết thúc).
     */
    function getWinner()
        external
        view
        returns (
            uint256 winnerId,
            string memory winnerName,
            uint256 winnerVotes,
            bool isTie
        )
    {
        require(electionEnded, "Bau cu chua ket thuc");
        require(candidates.length > 0, "Khong co ung vien nao");

        uint256 maxVotes = 0;
        uint256 winnerIndex = 0;
        bool tie = false;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerIndex = i;
                tie = false;
            } else if (candidates[i].voteCount == maxVotes && maxVotes > 0) {
                tie = true;
            }
        }

        return (winnerIndex, candidates[winnerIndex].name, maxVotes, tie);
    }
}
