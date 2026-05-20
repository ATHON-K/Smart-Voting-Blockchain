const hre = require("hardhat");

/**
 * deploy.js — Script triển khai Voting Smart Contract
 *
 * Chức năng:
 * 1. Deploy contract lên mạng blockchain
 * 2. Thêm 4 ứng viên mẫu
 * 3. Cấp quyền bầu cử cho các tài khoản test (1–9)
 * 4. In ra CONTRACT_ADDRESS để copy vào app.js
 *
 * LƯU Ý: Admin phải nhấn "Bắt đầu bầu cử" trên giao diện web
 */
async function main() {
    const [deployer, ...voters] = await hre.ethers.getSigners();

    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║        BLOCKCHAIN VOTING SYSTEM - DEPLOY         ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log("");
    console.log("📋 Tài khoản Admin:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Số dư:", hre.ethers.formatEther(balance), "ETH");
    console.log("");

    // ── Bước 1: Deploy contract ──────────────────────────────────
    console.log("⏳ Đang deploy Smart Contract...");
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy("Hệ Thống Bầu Cử Blockchain");
    await voting.waitForDeployment();
    const contractAddress = await voting.getAddress();

    console.log("✅ Contract đã deploy thành công!");
    console.log("📍 Contract Address:", contractAddress);
    console.log("");

    // ── Bước 2: Thêm ứng viên ────────────────────────────────────
    console.log("👥 Đang thêm ứng viên...");
    const cadidates = [
        {
            name: "Nguyễn Văn An",
            desc: "Sinh viên xuất sắc khoa CNTT | GPA 3.95 | Đạt học bổng Nhật Bản"
        },
        {
            name: "Trần Thị Bình",
            desc: "Chủ tịch Hội Sinh viên | Dẫn đầu 5 dự án cộng đồng | Giải Nhất Hackathon 2024"
        },
        {
            name: "Lê Hoàng Minh",
            desc: "Founder startup EdTech | 5 bài báo khoa học quốc tế | Top 10 Forbes Under 25"
        },
        {
            name: "Phạm Thùy Dung",
            desc: "Nghiên cứu sinh AI & Machine Learning | Cộng tác viên Google | Mentor CLB lập trình"
        }
    ];

    for (let i = 0; i < cadidates.length; i++) {
        const tx = await voting.addCandidate(cadidates[i].name, cadidates[i].desc);
        await tx.wait();
        console.log(`  ✅ Thêm ứng viên #${i}: ${cadidates[i].name}`);
    }
    console.log("");

    // ── Bước 3: Cấp quyền cho tài khoản test ─────────────────────
    // LƯU Ý: Không tự động startElection() ở đây.
    // Admin sẽ nhấn "Bắt đầu bầu cử" từ giao diện web SAU KHI thêm
    // đủ ứng viên và cấp quyền cho tất cả cử tri cần thiết.
    console.log("🔑 Đang cấp quyền bầu cử cho tài khoản test...");
    const voterCount = Math.min(voters.length, 9);
    const voterAddresses = voters.slice(0, voterCount).map(v => v.address);

    const whitelistTx = await voting.whitelistMultipleVoters(voterAddresses);
    await whitelistTx.wait();

    for (let i = 0; i < voterCount; i++) {
        console.log(`  ✅ Cấp quyền tài khoản [${i + 1}]: ${voterAddresses[i]}`);
    }
    console.log("");

    // ── Kết quả ──────────────────────────────────────────────────
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║                   KẾT QUẢ DEPLOY                 ║");
    console.log("╠══════════════════════════════════════════════════╣");
    console.log(`║  Contract Address:                                ║`);
    console.log(`║  ${contractAddress}  ║`);
    console.log("╠══════════════════════════════════════════════════╣");
    console.log("║  ⚡ BƯỚC TIẾP THEO:                               ║");
    console.log("║  1. Mở frontend/js/app.js                        ║");
    console.log("║  2. Cập nhật biến CONTRACT_ADDRESS               ║");
    console.log("║  3. Mở giao diện → Admin Panel → Bắt đầu bầu cử ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log("");
    console.log("📂 Sau đó mở: frontend/index.html trong trình duyệt");
    console.log("🦊 Đảm bảo MetaMask kết nối mạng Hardhat Localhost (Chain ID: 31337)");
}

main().catch((error) => {
    console.error("❌ Lỗi deploy:", error);
    process.exitCode = 1;
});
