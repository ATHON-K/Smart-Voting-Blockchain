'use strict';

// ================================================================
//  BlockVote — app.js  (Ethers.js v5 + MetaMask)
// ================================================================
//
//  ⚡ BẮT BUỘC CẬP NHẬT sau khi deploy:
//     Thay "YOUR_CONTRACT_ADDRESS_HERE" bằng địa chỉ in ra từ terminal
//
// ================================================================

// ── Cấu hình ────────────────────────────────────────────────────
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ABI khớp chính xác với contracts/Voting.sol đã viết.
// Sau khi `npx hardhat compile`, bạn cũng có thể copy từ:
//   artifacts/contracts/Voting.sol/Voting.json -> trường "abi"
const CONTRACT_ABI = [
  // Constructor
  { "inputs": [{ "internalType": "string", "name": "_electionTitle", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" },

  // Events
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "candidateId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }], "name": "CandidateAdded", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "totalVotesCast", "type": "uint256" }], "name": "ElectionEnded", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "ElectionStarted", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "voter", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "candidateId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "Voted", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "voter", "type": "address" }, { "indexed": true, "internalType": "address", "name": "grantedBy", "type": "address" }], "name": "VoterWhitelisted", "type": "event" },

  // Write functions
  { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }], "name": "addCandidate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_voter", "type": "address" }], "name": "whitelistVoter", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address[]", "name": "_voters", "type": "address[]" }], "name": "whitelistMultipleVoters", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "startElection", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "endElection", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_candidateId", "type": "uint256" }], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" },

  // View functions
  { "inputs": [], "name": "getCandidatesCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_candidateId", "type": "uint256" }], "name": "getCandidate", "outputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getAllCandidates", "outputs": [{ "internalType": "string[]", "name": "names", "type": "string[]" }, { "internalType": "string[]", "name": "descriptions", "type": "string[]" }, { "internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_candidateId", "type": "uint256" }], "name": "getVotes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getElectionStatus", "outputs": [{ "internalType": "bool", "name": "active", "type": "bool" }, { "internalType": "bool", "name": "ended", "type": "bool" }, { "internalType": "uint256", "name": "totalVotesCast", "type": "uint256" }, { "internalType": "uint256", "name": "electionStartTime", "type": "uint256" }, { "internalType": "uint256", "name": "electionEndTime", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_voter", "type": "address" }], "name": "isWhitelisted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_voter", "type": "address" }], "name": "hasVoterVoted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_voter", "type": "address" }], "name": "getVoterChoice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getWinner", "outputs": [{ "internalType": "uint256", "name": "winnerId", "type": "uint256" }, { "internalType": "string", "name": "winnerName", "type": "string" }, { "internalType": "uint256", "name": "winnerVotes", "type": "uint256" }, { "internalType": "bool", "name": "isTie", "type": "bool" }], "stateMutability": "view", "type": "function" },

  // Public state variables (auto-getters)
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "electionTitle", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "electionActive", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "electionEnded", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalVotes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "whitelist", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "hasVoted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
];

const HARDHAT_CHAIN_ID = '0x7a69'; // 31337

// ── App State ────────────────────────────────────────────────────
let provider       = null;
let signer         = null;
let contract       = null;       // with signer (write)
let contractRO     = null;       // read-only (JsonRpc or MetaMask)
let contractRO_RPC = null;       // riêng cho JsonRpcProvider – để cleanup đúng
let currentAccount = null;
let isAdmin        = false;
let userWhitelisted = false;
let userHasVoted   = false;
let userVoteChoice = null;
let electionActive = false;
let electionEnded  = false;
let candidatesData = [];          // [{name,description,voteCount}]
let pendingVoteCandId = null;     // candidate pending confirm
let txModalInstance = null;
let voteConfirmModalInstance = null;
const counterTimers = {};         // track active counter animations per element
let currentSessionId   = 0;          // tăng mỗi lần đổi account — vô hiệu hóa handler cũ
const processedTxHashes = new Set(); // chống duplicate events từ ethers.js

// ── Bootstrap modal refs ─────────────────────────────────────────
function getTxModal() {
  if (!txModalInstance) {
    txModalInstance = new bootstrap.Modal(document.getElementById('txModal'));
  }
  return txModalInstance;
}
function getVoteConfirmModal() {
  if (!voteConfirmModalInstance) {
    voteConfirmModalInstance = new bootstrap.Modal(document.getElementById('voteConfirmModal'));
  }
  return voteConfirmModalInstance;
}

// ================================================================
//  INITIALIZATION
// ================================================================
window.addEventListener('load', async () => {
  // Guard: contract address not yet set
  if (CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') {
    showToast('warning', 'Chưa cấu hình Contract Address', 'Mở frontend/js/app.js và cập nhật biến CONTRACT_ADDRESS sau khi deploy.');
  }

  if (typeof window.ethereum === 'undefined') {
    document.getElementById('noMetaMask').classList.remove('d-none');
    document.getElementById('connectNotice').classList.add('d-none');
    document.getElementById('connectBtn').disabled = true;
    return;
  }

  // Listen for account/chain changes
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged',    handleChainChanged);

  // Attempt read-only data load
  await tryLoadReadOnly();

  // Auto-reconnect if user was previously connected
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length > 0) {
    await initWithAccount(accounts[0]);
  }

  // Wire up vote confirm button
  document.getElementById('btnConfirmVote').addEventListener('click', executeVote);
});

// ── Read-only load (no wallet needed) ───────────────────────────
async function tryLoadReadOnly() {
  if (CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') return;
  try {
    const rpc = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    contractRO_RPC = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, rpc);
    contractRO = contractRO_RPC;
    await loadElectionInfo(contractRO_RPC);
    await loadCandidates(contractRO_RPC);
    // Không gọi listenForEvents ở đây – chỉ lắng nghe events SAU KHI
    // ví được kết nối để tránh duplicate listeners gây counter nhảy số.
  } catch (err) {
    console.warn('[BlockVote] Read-only load failed (node not running?):', err.message);
  }
}

// ── Full initialization with wallet ─────────────────────────────
async function initWithAccount(account) {
  // ── Bước 1: Tăng session ID — vô hiệu hóa mọi handler từ session cũ ──
  // Nếu user đổi account NHIỀU LẦN NHANH, chỉ session mới nhất mới execute đc
  const mySessionId = ++currentSessionId;
  processedTxHashes.clear();

  // ── Bước 2: Reset toàn bộ trạng thái user ──
  isAdmin         = false;
  userWhitelisted = false;
  userHasVoted    = false;
  userVoteChoice  = null;

  currentAccount = account.toLowerCase();
  provider = new ethers.providers.Web3Provider(window.ethereum);
  provider.pollingInterval = 1000; // Poll mỗi 1s thay vì 4s mặc định
  signer   = provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  // ── Bước 3: Dọn DỨT ĐIỂM tất cả listener cũ ──
  if (contractRO_RPC) {
    contractRO_RPC.removeAllListeners();
    contractRO_RPC = null;
  }
  if (contractRO) {
    contractRO.removeAllListeners();
    contractRO = null;
  }

  contractRO = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  updateNavbarAccount(account);
  hideConnectNotice();

  await loadElectionInfo(contractRO);
  if (mySessionId !== currentSessionId) return; // Account đổi lại khi đang load

  await loadUserStatus();
  if (mySessionId !== currentSessionId) return;

  await loadCandidates(contractRO);
  if (mySessionId !== currentSessionId) return;

  // ── Bước 4: Lấy block hiện tại — listenForEvents chỉ nghe event từ đây trở đi ──
  // Đây là cốt lõi của fix: ngăn ethers.js replay các event cũ
  // (ElectionEnded, Voted) từ các session trước vẫn ở trong blockchain history
  let listenFromBlock = 0;
  try {
    listenFromBlock = await contractRO.provider.getBlockNumber();
  } catch(e) { /* fallback to 0 */ }

  if (mySessionId !== currentSessionId) return;

  listenForEvents(contractRO, listenFromBlock, mySessionId);
}

// ================================================================
//  WALLET CONNECTION
// ================================================================
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    showToast('error', 'MetaMask chưa cài đặt', 'Vui lòng cài MetaMask extension trước.');
    return;
  }
  try {
    await ensureCorrectNetwork();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await initWithAccount(accounts[0]);
    showToast('success', 'Kết nối thành công!', `Ví: ${shortenAddr(accounts[0])}`);
  } catch (err) {
    if (err.code === 4001) {
      showToast('warning', 'Đã từ chối', 'Bạn đã hủy yêu cầu kết nối ví.');
    } else {
      showToast('error', 'Lỗi kết nối', err.message);
    }
  }
}

function showSwitchAccountTip() {
  new bootstrap.Modal(document.getElementById('switchAccountModal')).show();
}

function disconnectWallet() {
  // Huỷ session hiện tại — ngăn bất kỳ handler nào tiếp tục chạy
  currentSessionId++;
  processedTxHashes.clear();
  if (contractRO)     { contractRO.removeAllListeners();     contractRO = null; }
  if (contractRO_RPC) { contractRO_RPC.removeAllListeners(); contractRO_RPC = null; }

  currentAccount = null;
  provider = signer = contract = null;
  isAdmin = userWhitelisted = userHasVoted = false;
  userVoteChoice = null;

  // Reset UI
  document.getElementById('accountChip').classList.add('d-none');
  document.getElementById('connectBtn').classList.remove('d-none');
  document.getElementById('networkBadge').classList.add('d-none');
  document.getElementById('adminPanel').classList.add('d-none');
  document.getElementById('voterStatusBar').classList.add('d-none');
  document.getElementById('adminTag').classList.add('d-none');
  document.getElementById('connectNotice').classList.remove('d-none');
  document.getElementById('statMyStatus').textContent = '—';

  renderCandidates(); // re-render without vote buttons
  showToast('info', 'Đã ngắt kết nối', 'Ví đã được ngắt khỏi trang web.');
}

// ── Network helpers ──────────────────────────────────────────────
async function ensureCorrectNetwork() {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== HARDHAT_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HARDHAT_CHAIN_ID }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: HARDHAT_CHAIN_ID,
            chainName: 'Hardhat Localhost',
            rpcUrls: ['http://127.0.0.1:8545'],
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          }],
        });
      } else {
        throw switchErr;
      }
    }
  }
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else if (accounts[0].toLowerCase() !== currentAccount) {
    showToast('info', 'Tài khoản thay đổi', `Đang chuyển sang ${shortenAddr(accounts[0])}`);
    initWithAccount(accounts[0]);
  }
}

function handleChainChanged() {
  showToast('warning', 'Mạng đã thay đổi', 'Trang sẽ tải lại...');
  setTimeout(() => window.location.reload(), 1500);
}

// ================================================================
//  LOAD DATA FROM CONTRACT
// ================================================================
async function loadElectionInfo(ctr) {
  try {
    const title = await ctr.electionTitle();
    const [active, ended, total] = await ctr.getElectionStatus();

    document.getElementById('electionTitle').innerHTML =
      `<span class="gradient-text">${escapeHtml(title)}</span>`;
    electionActive = active;
    electionEnded  = ended;

    updateStatusPill(active, ended);
    animateCounter('statTotal', total.toNumber());
  } catch (err) {
    console.warn('[BlockVote] loadElectionInfo:', err.message);
  }
}

async function loadCandidates(ctr) {
  if (CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') return;
  try {
    const [names, descs, counts] = await ctr.getAllCandidates();
    candidatesData = names.map((name, i) => ({
      id: i,
      name,
      description: descs[i],
      voteCount: counts[i].toNumber(),
    }));

    document.getElementById('statCandidates').textContent = candidatesData.length;
    document.getElementById('sectionCandCount').textContent =
      candidatesData.length > 0 ? `${candidatesData.length} ứng viên` : '';

    renderCandidates();
    if (electionEnded) renderResults();
  } catch (err) {
    console.warn('[BlockVote] loadCandidates:', err.message);
    showEmptyCandidates();
  }
}

async function loadUserStatus() {
  if (!currentAccount || !contractRO || CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') return;
  try {
    const ownerAddr = await contractRO.owner();
    isAdmin = ownerAddr.toLowerCase() === currentAccount;

    if (isAdmin) {
      document.getElementById('adminTag').classList.remove('d-none');
      document.getElementById('adminPanel').classList.remove('d-none');
      updateAdminButtons();
    } else {
      // Ẩn admin panel khi đổi sang tài khoản không phải owner
      document.getElementById('adminTag').classList.add('d-none');
      document.getElementById('adminPanel').classList.add('d-none');
    }

    userWhitelisted = await contractRO.isWhitelisted(currentAccount);
    userHasVoted    = await contractRO.hasVoterVoted(currentAccount);

    if (userHasVoted) {
      userVoteChoice = (await contractRO.getVoterChoice(currentAccount)).toNumber();
    }

    updateVoterStatusBar();
    updateMyStatusStat();
  } catch (err) {
    console.warn('[BlockVote] loadUserStatus:', err.message);
  }
}

// ================================================================
//  REAL-TIME EVENT LISTENER
// ================================================================
// listenFromBlock: chỉ nhận event từ block này trở đi
// sessionId:      snapshot của currentSessionId khi hàm này được gọi
function listenForEvents(ctr, listenFromBlock, sessionId) {
  ctr.removeAllListeners();

  // ── BA LỚP KIỂM TRA trước khi xử lý bất kỳ event nào ──
  // 1. Session guard  : account đã đổi → bỏ qua
  // 2. Block guard    : event từ block cũ hơn listenFromBlock → bỏ qua
  //    (đây là fix chính cho "election auto-end" và "vote sai người":
  //     ethers.js v5 + MetaMask đôi khi replay các event cũ khi mới subscribe)
  // 3. TxHash guard   : cùng tx được deliver 2 lần → bỏ qua
  function isValidEvent(event) {
    if (currentSessionId !== sessionId) return false;
    if (event.blockNumber < listenFromBlock) return false;
    if (processedTxHashes.has(event.transactionHash)) return false;
    processedTxHashes.add(event.transactionHash);
    // Giữ set không quá 200 phần tử
    if (processedTxHashes.size > 200) {
      processedTxHashes.delete(processedTxHashes.values().next().value);
    }
    return true;
  }

  ctr.on('Voted', async (voter, candidateId, timestamp, event) => {
    if (!isValidEvent(event)) return;
    const idx = candidateId.toNumber();
    const candName = candidatesData[idx]?.name || `#${idx}`;
    await loadElectionInfo(ctr);
    await loadCandidates(ctr);
    if (voter.toLowerCase() !== currentAccount) {
      showToast('info', 'Phiếu mới vừa được ghi!', `Ứng viên "${candName}" nhận thêm 1 phiếu.`);
    }
  });

  ctr.on('ElectionStarted', async (timestamp, event) => {
    if (!isValidEvent(event)) return;
    await loadElectionInfo(ctr);
    await loadCandidates(ctr);
    if (currentAccount) await loadUserStatus();
    updateAdminButtons();
    showToast('success', 'Bầu cử đã bắt đầu!', 'Cử tri có thể bỏ phiếu ngay bây giờ.');
  });

  ctr.on('ElectionEnded', async (ts, totalCast, event) => {
    if (!isValidEvent(event)) return;
    await loadElectionInfo(ctr);
    await loadCandidates(ctr);
    if (currentAccount) await loadUserStatus();
    updateAdminButtons();
    showToast('info', 'Bầu cử đã kết thúc', `Tổng ${totalCast.toNumber()} phiếu bầu.`);
  });

  ctr.on('CandidateAdded', async (id, name, event) => {
    if (!isValidEvent(event)) return;
    showToast('success', 'Ứng viên mới được thêm', `#${id.toNumber()}: ${name}`);
    await loadCandidates(ctr);
  });

  ctr.on('VoterWhitelisted', async (voter, grantedBy, event) => {
    if (!isValidEvent(event)) return;
    if (voter.toLowerCase() === currentAccount) {
      userWhitelisted = true;
      updateVoterStatusBar();
      renderCandidates();
      showToast('success', 'Bạn đã được cấp quyền bầu cử!', 'Chọn ứng viên và bỏ phiếu ngay.');
    }
  });
}

// ================================================================
//  ADMIN FUNCTIONS
// ================================================================
async function addCandidate() {
  const name = document.getElementById('inputCandName').value.trim();
  const desc = document.getElementById('inputCandDesc').value.trim();

  if (!name) { showToast('warning', 'Thiếu thông tin', 'Vui lòng nhập tên ứng viên.'); return; }
  if (!contract) { showToast('error', 'Chưa kết nối ví', 'Kết nối MetaMask trước.'); return; }

  showTxModal('Đang thêm ứng viên...', `Vui lòng xác nhận trong MetaMask`);
  try {
    const tx = await contract.addCandidate(name, desc || 'Không có mô tả');
    setTxModalDesc('Đang chờ xác nhận trên blockchain...');
    await tx.wait();
    hideTxModal();
    document.getElementById('inputCandName').value = '';
    document.getElementById('inputCandDesc').value = '';
    showToast('success', 'Thêm ứng viên thành công!', `"${name}" đã được thêm vào danh sách.`);
    await loadCandidates(contractRO);
  } catch (err) {
    hideTxModal();
    handleContractError(err);
  }
}

async function whitelistVoter() {
  const addr = document.getElementById('inputVoterAddr').value.trim();

  if (!ethers.utils.isAddress(addr)) {
    showToast('warning', 'Địa chỉ không hợp lệ', 'Vui lòng nhập địa chỉ ví Ethereum đúng định dạng (0x...).');
    return;
  }
  if (!contract) { showToast('error', 'Chưa kết nối ví', ''); return; }

  showTxModal('Đang cấp quyền bầu cử...', 'Vui lòng xác nhận trong MetaMask');
  try {
    const tx = await contract.whitelistVoter(addr);
    setTxModalDesc('Đang chờ xác nhận trên blockchain...');
    await tx.wait();
    hideTxModal();
    document.getElementById('inputVoterAddr').value = '';
    showToast('success', 'Cấp quyền thành công!', `${shortenAddr(addr)} đã được cấp quyền bầu cử.`);
  } catch (err) {
    hideTxModal();
    handleContractError(err);
  }
}

async function startElection() {
  if (!contract) { showToast('error', 'Chưa kết nối ví', ''); return; }

  showTxModal('Đang khởi động bầu cử...', 'Vui lòng xác nhận trong MetaMask');
  try {
    const tx = await contract.startElection();
    setTxModalDesc('Đang chờ xác nhận trên blockchain...');
    await tx.wait();
    hideTxModal();
    // Reload ngay — không chờ event handler (có thể delay tới 1s)
    await loadElectionInfo(contractRO);
    await loadCandidates(contractRO);
    if (currentAccount) await loadUserStatus();
    updateAdminButtons();
  } catch (err) {
    hideTxModal();
    handleContractError(err);
  }
}

async function endElection() {
  if (!contract) { showToast('error', 'Chưa kết nối ví', ''); return; }
  if (!confirm('Bạn có chắc muốn kết thúc cuộc bầu cử? Hành động này không thể hoàn tác.')) return;

  showTxModal('Đang kết thúc bầu cử...', 'Vui lòng xác nhận trong MetaMask');
  try {
    const tx = await contract.endElection();
    setTxModalDesc('Đang chờ xác nhận trên blockchain...');
    await tx.wait();
    hideTxModal();
    // Reload ngay — đảm bảo kết quả hiển thị ĐÚNG số phiếu từ blockchain
    await loadElectionInfo(contractRO);
    await loadCandidates(contractRO);
    if (currentAccount) await loadUserStatus();
    updateAdminButtons();
  } catch (err) {
    hideTxModal();
    handleContractError(err);
  }
}

// ================================================================
//  VOTER FUNCTIONS
// ================================================================
function openVoteConfirm(candidateId) {
  if (!currentAccount) {
    showToast('warning', 'Chưa kết nối ví', 'Vui lòng kết nối MetaMask trước.');
    return;
  }
  if (!userWhitelisted) {
    showToast('error', 'Chưa được cấp quyền', 'Tài khoản của bạn chưa trong danh sách được phép bầu cử.');
    return;
  }
  if (userHasVoted) {
    showToast('warning', 'Đã bỏ phiếu rồi', 'Mỗi cử tri chỉ được bỏ phiếu một lần.');
    return;
  }
  if (!electionActive) {
    showToast('warning', 'Bầu cử chưa bắt đầu', 'Chờ Admin khởi động bầu cử.');
    return;
  }

  const cand = candidatesData[candidateId];
  if (!cand) return;

  pendingVoteCandId = candidateId;

  document.getElementById('confirmCandidateBox').innerHTML = `
    <div class="cand-avatar theme-${candidateId % 6} me-1" style="width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800;color:#fff;flex-shrink:0;">
      ${getInitials(cand.name)}
    </div>
    <div>
      <div style="font-weight:700;font-size:1rem;">${escapeHtml(cand.name)}</div>
      <div style="font-size:0.82rem;color:var(--c-text-soft);">${escapeHtml(cand.description)}</div>
    </div>
  `;

  getVoteConfirmModal().show();
}

async function executeVote() {
  if (pendingVoteCandId === null || !contract) return;
  getVoteConfirmModal().hide();

  const cand = candidatesData[pendingVoteCandId];
  showTxModal('Đang ghi phiếu bầu lên blockchain...', 'Vui lòng xác nhận trong MetaMask');

  try {
    const tx = await contract.vote(pendingVoteCandId);
    setTxModalDesc('Đang chờ block xác nhận...');
    await tx.wait();
    hideTxModal();

    userHasVoted   = true;
    userVoteChoice = pendingVoteCandId;
    pendingVoteCandId = null;

    // Reload data từ blockchain TRƯỚC KHI render — đảm bảo số phiếu đúng
    await loadElectionInfo(contractRO);
    await loadCandidates(contractRO);
    updateVoterStatusBar();
    updateMyStatusStat();
    showToast('success', '🗳️ Bỏ phiếu thành công!', `Phiếu của bạn cho "${cand.name}" đã được ghi lên blockchain và không thể thay đổi.`);
  } catch (err) {
    hideTxModal();
    pendingVoteCandId = null;
    handleContractError(err);
  }
}

// ================================================================
//  RENDER FUNCTIONS
// ================================================================
function renderCandidates() {
  const grid = document.getElementById('candidatesGrid');
  if (!candidatesData || candidatesData.length === 0) {
    showEmptyCandidates();
    return;
  }

  const totalVotes = candidatesData.reduce((s, c) => s + c.voteCount, 0);
  const isConnected = !!currentAccount;
  const canVote = isConnected && userWhitelisted && !userHasVoted && electionActive;

  grid.innerHTML = candidatesData
    .map((cand, i) => buildCandidateCard(cand, i, totalVotes, canVote))
    .join('');
}

function buildCandidateCard(cand, i, totalVotes, canVote) {
  const pct = totalVotes > 0 ? ((cand.voteCount / totalVotes) * 100).toFixed(1) : '0.0';
  const isVotedThis  = userHasVoted && userVoteChoice === i;
  const isVotedOther = userHasVoted && userVoteChoice !== i;

  let btnHtml = '';
  if (!currentAccount) {
    btnHtml = `<button class="btn-vote" disabled><i class="fas fa-wallet me-2"></i>Kết nối ví để bỏ phiếu</button>`;
  } else if (!electionActive && !electionEnded) {
    btnHtml = `<button class="btn-vote" disabled><i class="fas fa-clock me-2"></i>Bầu cử chưa bắt đầu</button>`;
  } else if (electionEnded) {
    btnHtml = `<button class="btn-vote" disabled><i class="fas fa-flag-checkered me-2"></i>Bầu cử đã kết thúc</button>`;
  } else if (!userWhitelisted) {
    btnHtml = `<button class="btn-vote" disabled><i class="fas fa-lock me-2"></i>Chưa được cấp quyền</button>`;
  } else if (isVotedThis) {
    btnHtml = `<button class="btn-vote voted-this" disabled><i class="fas fa-check-circle me-2"></i>Bạn đã chọn ứng viên này ✓</button>`;
  } else if (isVotedOther) {
    btnHtml = `<button class="btn-vote voted-other" disabled><i class="fas fa-times me-2"></i>Đã bỏ phiếu rồi</button>`;
  } else {
    btnHtml = `<button class="btn-vote" onclick="openVoteConfirm(${i})"><i class="fas fa-vote-yea me-2"></i>Bỏ phiếu cho ${escapeHtml(cand.name.split(' ')[0])}</button>`;
  }

  return `
    <div class="col-xl-3 col-lg-4 col-md-6">
      <div class="candidate-card theme-${i % 6}${isVotedThis ? ' is-voted' : ''}">
        <div class="cand-color-bar"></div>
        <div class="cand-body">
          <div class="cand-top">
            <div class="cand-avatar">${getInitials(cand.name)}</div>
            <div class="cand-meta">
              <div class="cand-name">${escapeHtml(cand.name)}</div>
              <div class="cand-desc">${escapeHtml(cand.description)}</div>
            </div>
          </div>

          <div class="cand-votes-row">
            <div>
              <div class="cand-votes-num">${cand.voteCount}</div>
              <div style="font-size:0.72rem;color:var(--c-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.4px;">phiếu bầu</div>
            </div>
            <div class="cand-votes-pct">${pct}%</div>
          </div>

          <div class="cand-progress-wrap">
            <div class="cand-progress-fill" style="width:${pct}%"></div>
          </div>

          ${btnHtml}
        </div>
      </div>
    </div>
  `;
}

function showEmptyCandidates() {
  const grid = document.getElementById('candidatesGrid');
  grid.innerHTML = `
    <div class="col-12">
      <div style="text-align:center;padding:60px 20px;background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius-l);">
        <div style="font-size:3rem;margin-bottom:16px;opacity:.4;">🗳️</div>
        <h5 style="color:var(--c-text-soft);font-weight:600;">Chưa có ứng viên</h5>
        <p style="color:var(--c-text-muted);font-size:.88rem;">Admin cần thêm ứng viên trước khi bắt đầu bầu cử</p>
      </div>
    </div>
  `;
}

function renderResults() {
  if (!electionEnded || candidatesData.length === 0) return;

  document.getElementById('resultsSection').classList.remove('d-none');

  const sorted = [...candidatesData].sort((a, b) => b.voteCount - a.voteCount);
  const totalV = sorted.reduce((s, c) => s + c.voteCount, 0);
  const top    = sorted[0];
  const isTie  = sorted.length > 1 && sorted[0].voteCount === sorted[1].voteCount;

  // Winner box
  const winnerBox = document.getElementById('winnerBox');
  if (isTie) {
    winnerBox.innerHTML = `
      <span class="winner-trophy">🤝</span>
      <div class="winner-name">Hòa phiếu!</div>
      <p class="winner-votes-text">${sorted[0].voteCount} phiếu mỗi người · Tổng ${totalV} phiếu</p>
    `;
  } else {
    winnerBox.innerHTML = `
      <span class="winner-trophy">🏆</span>
      <div style="font-size:.82rem;font-weight:600;color:var(--c-text-muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;">Người chiến thắng</div>
      <div class="winner-name">${escapeHtml(top.name)}</div>
      <p class="winner-votes-text">${top.voteCount} phiếu bầu · ${totalV > 0 ? ((top.voteCount/totalV)*100).toFixed(1) : 0}% tổng phiếu · Tổng bầu cử: ${totalV} phiếu</p>
    `;
  }

  // Ranking list
  const listEl = document.getElementById('resultsList');
  const colors = ['var(--grd-primary)', 'var(--grd-success)', 'var(--grd-danger)', 'linear-gradient(135deg,#ec4899,#8b5cf6)', 'linear-gradient(135deg,#14b8a6,#6366f1)', 'linear-gradient(135deg,#f97316,#ec4899)'];

  listEl.innerHTML = sorted.map((cand, pos) => {
    const pct = totalV > 0 ? ((cand.voteCount / totalV) * 100).toFixed(1) : '0.0';
    const posClass = pos === 0 ? 'result-pos-1' : pos === 1 ? 'result-pos-2' : pos === 2 ? 'result-pos-3' : '';
    return `
      <div class="result-row">
        <div class="result-pos ${posClass}">${pos + 1}</div>
        <div class="result-name">${escapeHtml(cand.name)}</div>
        <div class="result-bar-wrap">
          <div class="result-bar-bg">
            <div class="result-bar-fill" style="width:${pct}%;background:${colors[pos % colors.length]}"></div>
          </div>
        </div>
        <div class="result-count">${cand.voteCount} phiếu (${pct}%)</div>
      </div>
    `;
  }).join('');
}

// ================================================================
//  UI HELPERS
// ================================================================
function updateNavbarAccount(account) {
  const short = shortenAddr(account);
  const avatar = document.getElementById('acctAvatar');
  // Color avatar based on addr
  const hue = parseInt(account.slice(2, 6), 16) % 360;
  avatar.style.background = `hsl(${hue},70%,55%)`;

  document.getElementById('acctAddr').textContent = short;
  document.getElementById('accountChip').classList.remove('d-none');
  document.getElementById('connectBtn').classList.add('d-none');
  document.getElementById('networkBadge').classList.remove('d-none');
  document.getElementById('networkName').textContent = 'Hardhat Local';
  document.getElementById('voterStatusBar').classList.remove('d-none');
}

function hideConnectNotice() {
  document.getElementById('connectNotice').classList.add('d-none');
}

function updateStatusPill(active, ended) {
  const pill = document.getElementById('statusPill');
  const txt  = document.getElementById('statusText');

  pill.className = 'status-pill';
  if (active) {
    pill.classList.add('pill-active');
    txt.textContent = 'Đang diễn ra';
  } else if (ended) {
    pill.classList.add('pill-ended');
    txt.textContent = 'Đã kết thúc';
  } else {
    pill.classList.add('pill-pending');
    txt.textContent = 'Chưa bắt đầu';
  }
}

function updateVoterStatusBar() {
  const bar = document.getElementById('voterStatusBar');
  bar.classList.remove('d-none');

  // Hide all items first
  ['vsNotWhitelisted','vsWhitelisted','vsAlreadyVoted','vsEnded'].forEach(id =>
    document.getElementById(id).classList.add('d-none')
  );

  if (electionEnded) {
    document.getElementById('vsEnded').classList.remove('d-none');
    return;
  }
  if (!userWhitelisted) {
    document.getElementById('vsNotWhitelisted').classList.remove('d-none');
    return;
  }
  if (userHasVoted) {
    const votedCand = candidatesData[userVoteChoice];
    document.getElementById('vsAlreadyVotedText').innerHTML =
      `Bạn đã bỏ phiếu cho <strong>${votedCand ? escapeHtml(votedCand.name) : '#' + userVoteChoice}</strong>. Cảm ơn bạn đã tham gia!`;
    document.getElementById('vsAlreadyVoted').classList.remove('d-none');
    return;
  }
  document.getElementById('vsWhitelisted').classList.remove('d-none');
}

function updateMyStatusStat() {
  const el = document.getElementById('statMyStatus');
  if (!currentAccount) { el.textContent = '—'; return; }
  if (userHasVoted) { el.textContent = '✓ Đã bầu'; el.style.color = '#6ee7b7'; return; }
  if (userWhitelisted) { el.textContent = 'Được phép'; el.style.color = '#379e33'; return; }
  el.textContent = 'Chưa được cấp'; el.style.color = '#f05151';
}

function updateAdminButtons() {
  const btnStart = document.getElementById('btnStartElection');
  const btnEnd   = document.getElementById('btnEndElection');
  if (!btnStart || !btnEnd) return;
  btnStart.disabled = electionActive || electionEnded;
  btnEnd.disabled   = !electionActive || electionEnded;

  // Disable "Thêm ứng viên" khi bầu cử đang hoặc đã diễn ra
  const inputName = document.getElementById('inputCandName');
  const inputDesc = document.getElementById('inputCandDesc');
  const btnAddCand = document.querySelector('[onclick="addCandidate()"]');
  let noticeEl = document.getElementById('addCandNotice');

  const locked = electionActive || electionEnded;
  if (inputName) inputName.disabled = locked;
  if (inputDesc) inputDesc.disabled = locked;
  if (btnAddCand) btnAddCand.disabled = locked;

  if (locked && !noticeEl) {
    // Tạo dòng chú thích ngay dưới textarea
    noticeEl = document.createElement('p');
    noticeEl.id = 'addCandNotice';
    noticeEl.className = 'text-warning small mb-0 mt-1';
    noticeEl.innerHTML = '<i class="fas fa-lock me-1"></i>Chỉ thêm ứng viên <strong>trước khi bắt đầu</strong> bầu cử.';
    if (inputDesc) inputDesc.after(noticeEl);
  } else if (!locked && noticeEl) {
    noticeEl.remove();
  }
}

function animateCounter(elemId, targetValue) {
  const el = document.getElementById(elemId);
  if (!el) return;
  // Cancel any running animation for this element first
  if (counterTimers[elemId]) {
    clearInterval(counterTimers[elemId]);
    delete counterTimers[elemId];
  }
  const start = parseInt(el.textContent) || 0;
  if (start === targetValue) return;
  const diff = targetValue - start;
  const steps = 20;
  let step = 0;
  counterTimers[elemId] = setInterval(() => {
    step++;
    el.textContent = Math.round(start + (diff * step / steps));
    if (step >= steps) {
      el.textContent = targetValue;
      clearInterval(counterTimers[elemId]);
      delete counterTimers[elemId];
    }
  }, 25);
}

// ================================================================
//  TOAST NOTIFICATIONS
// ================================================================
function showToast(type, title, message = '') {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const container = document.getElementById('toastContainer');

  const el = document.createElement('div');
  el.className = `toast-item t-${type}`;
  el.innerHTML = `
    <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-msg">${escapeHtml(message)}</div>` : ''}
    </div>
  `;
  el.addEventListener('click', () => dismissToast(el));
  container.appendChild(el);

  const timeout = (type === 'error') ? 7000 : 4500;
  setTimeout(() => dismissToast(el), timeout);
}

function dismissToast(el) {
  el.style.animation = 'slideOutRight 0.3s ease forwards';
  setTimeout(() => el.remove(), 300);
}

// ================================================================
//  TRANSACTION MODAL
// ================================================================
function showTxModal(title, desc) {
  document.getElementById('txModalTitle').textContent = title;
  document.getElementById('txModalDesc').textContent = desc;
  getTxModal().show();
}

function setTxModalDesc(desc) {
  document.getElementById('txModalDesc').textContent = desc;
}

function hideTxModal() {
  getTxModal().hide();
}

// ================================================================
//  ERROR HANDLING
// ================================================================
function handleContractError(err) {
  console.error('[BlockVote] Contract error:', err);

  if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
    showToast('warning', 'Giao dịch bị từ chối', 'Bạn đã hủy giao dịch trong MetaMask.');
    return;
  }

  // Decode revert reason
  const msg = err?.error?.message || err?.reason || err?.message || '';
  let userMsg = 'Giao dịch thất bại.';

  if (msg.includes('Chi Admin'))           userMsg = 'Chỉ Admin mới có quyền thực hiện thao tác này.';
  else if (msg.includes('khong co quyen') || msg.includes('not authorized'))
                                            userMsg = 'Bạn chưa được cấp quyền bầu cử. Liên hệ Admin.';
  else if (msg.includes('da bau') || msg.includes('already voted'))
                                            userMsg = 'Bạn đã bỏ phiếu rồi. Mỗi cử tri chỉ được bầu một lần.';
  else if (msg.includes('khong dang dien') || msg.includes('not currently active'))
                                            userMsg = 'Bầu cử hiện không đang diễn ra.';
  else if (msg.includes('Can it nhat') || msg.includes('at least 2'))
                                            userMsg = 'Cần ít nhất 2 ứng viên để bắt đầu bầu cử.';
  else if (msg.includes('da duoc cap quyen') || msg.includes('already whitelisted'))
                                            userMsg = 'Cử tri này đã được cấp quyền rồi.';
  else if (msg.includes('Cuoc bau cu da bat dau'))
                                            userMsg = 'Bầu cử đã bắt đầu, không thể thực hiện thao tác này.';
  else if (msg.length > 0)                  userMsg = msg.slice(0, 120);

  showToast('error', 'Lỗi giao dịch', userMsg);
}

// ================================================================
//  UTILITY FUNCTIONS
// ================================================================
function shortenAddr(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
