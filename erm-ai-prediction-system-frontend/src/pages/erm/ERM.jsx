"use client"
import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./ERM.module.scss"

const ERM = () => {
    const navigate = useNavigate()

    // --- 1. DATA KHỞI TẠO ---
    const [allRecords, setAllRecords] = useState(() => {
        const types = ["BỆNH ÁN IUI", "BỆNH ÁN IVF", "BỆNH ÁN NGOẠI KHOA", "BỆNH ÁN SẢN PHỤ KHOA", "HỒ SƠ QUẢN LÝ THAI KỲ"];
        return Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            note: i % 5 === 0 ? "Ưu tiên" : "",
            status: i % 2 === 0 ? "Lưu kho" : "Đang điều trị",
            fileNo: `${i + 1}/2024`,
            type: types[i % types.length],
            year: 2024 + (i % 2),
            pid: `1140${500 + i}`,
            name: `NGUYỄN VĂN ${String.fromCharCode(65 + (i % 26))}`,
            createdDate: `0${(i % 9) + 1}/09/2024`,
            creator: "Trương Thị Trà My",
            updatedDate: "05/09/2024",
            updater: "Trương Thị Anh"
        }))
    })

    // --- 1. SỬA LẠI KHAI BÁO STATE (Thêm setPatientList) ---
    // --- 1. SỬA LẠI KHAI BÁO STATE (SỬA DÒNG PID ĐỂ KHỚP DỮ LIỆU) ---
    const [patientList, setPatientList] = useState(() => {
        const provinces = [
            { name: "Thành phố Hà Nội", districts: ["Quận Cầu Giấy", "Huyện Chương Mỹ", "Quận Ba Đình"], wards: ["Phường Dịch Vọng", "Thị trấn Chúc Sơn", "Phường Kim Mã"] },
            { name: "TP Hồ Chí Minh", districts: ["Quận 1", "Quận Bình Thạnh", "TP Thủ Đức"], wards: ["Phường Bến Nghé", "Phường 25", "Phường Thảo Điền"] },
            { name: "Thành phố Đà Nẵng", districts: ["Quận Hải Châu", "Quận Sơn Trà"], wards: ["Phường Thạch Thang", "Phường An Hải Bắc"] }
        ];
        return Array.from({ length: 20 }, (_, i) => {
            const provIndex = i % provinces.length;
            const selectedProv = provinces[provIndex];
            const distIndex = i % selectedProv.districts.length;
            return {
                id: i + 1,
                name: `BỆNH NHÂN TEST ${String.fromCharCode(65 + i)}`,

                // --- SỬA DÒNG NÀY (Để mã bắt đầu từ 1140500 giống bảng hồ sơ) ---
                pid: `1140${500 + i}`,

                insuranceNumber: i % 3 === 0 ? "" : `DN479${10000 + i}`,
                gender: i % 2 === 0 ? "Nam" : "Nữ",
                dob: `${(i % 28) + 1}/0${(i % 9) + 1}/${1980 + (i % 20)}`,
                phone: `090${1000000 + i}`,
                country: "Việt Nam",
                province: selectedProv.name,
                district: selectedProv.districts[distIndex],
                ward: selectedProv.wards[distIndex],
                isLocked: false
            };
        });
    });

    // --- 2. THÊM HÀM XỬ LÝ KHÓA / KHÔI PHỤC ---
    const handleToggleLock = (id, status) => {
        const action = status ? "khóa" : "khôi phục";
        if (window.confirm(`Bạn có chắc muốn ${action} hồ sơ bệnh nhân này không?`)) {
            setPatientList(prevList =>
                prevList.map(item =>
                    item.id === id ? { ...item, isLocked: status } : item
                )
            );
        }
    };

    // --- 3. STATE & LOGIC CHO MODAL SỬA NHÂN VIÊN (MỚI) ---
    const [showEditEmpModal, setShowEditEmpModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);

    // Mở modal sửa
    const handleOpenEditEmp = (emp) => {
        setEditingEmp({ ...emp }); // Copy dữ liệu để sửa
        setShowEditEmpModal(true);
    };

    // Lưu thay đổi
    const handleSaveEmpChanges = () => {
        setEmployeeList(prev => prev.map(item =>
            item.stt === editingEmp.stt ? editingEmp : item
        ));
        alert("Cập nhật thông tin thành công!");
        setShowEditEmpModal(false);
    };



    // --- 2. STATE ---
    const [selectedRecord, setSelectedRecord] = useState(null); // NULL: Hiện bảng danh sách, CÓ DATA: Hiện chi tiết
    const [patientFilters, setPatientFilters] = useState({ year: "", province: "", district: "", ward: "", search: "" })
    const [currentNav, setCurrentNav] = useState("Hồ sơ bệnh án")
    const [currentPatientPage, setCurrentPatientPage] = useState(1)
    const [patientsPerPage, setPatientsPerPage] = useState(10)
    const [activeTab, setActiveTab] = useState("Tất cả")
    const [processTab, setProcessTab] = useState("Tất cả")
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("Tất cả")
    const [filterDate, setFilterDate] = useState("Tất cả")
    const [filterUpdatedDate, setFilterUpdatedDate] = useState("Tất cả")
    const [filterYear, setFilterYear] = useState("Tất cả")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [showAddModal, setShowAddModal] = useState(false)
    const [settingsTab, setSettingsTab] = useState("Quản lý nhân viên");
    const [empPage, setEmpPage] = useState(1);
    const [empPerPage, setEmpPerPage] = useState(10);
    const [empSearch, setEmpSearch] = useState("");
    // --- 1. STATE & DATA QUẢN LÝ NHÂN VIÊN ---
    const [employeeList, setEmployeeList] = useState([
        { stt: 1, name: "Nguyễn Thị Lan", email: "lanxuka98@gmail.com", phone: "0377757709", gender: "Nữ", dob: "15/05/1998", role: "Y tá", dept: "Khoa Nhi", status: "Đang hoạt động" },
        { stt: 2, name: "Trương Thị Anh", email: "anhht@athanoi.com", phone: "0964699399", gender: "Nữ", dob: "20/10/1995", role: "Điều dưỡng", dept: "Khoa Nội", status: "Đang hoạt động" },
        { stt: 3, name: "Phạm Văn Hùng", email: "hungpv@namhoc.com", phone: "0362526763", gender: "Nam", dob: "12/12/1990", role: "Bác sĩ", dept: "Khoa Ngoại", status: "Đang hoạt động" },
        { stt: 4, name: "Lê Thị Mai", email: "mailt@hospital.com", phone: "0362526761", gender: "Nữ", dob: "13/02/1992", role: "Kỹ thuật viên", dept: "Phòng X-Quang", status: "Đang hoạt động" },
        { stt: 5, name: "Đoàn Thành Đồng", email: "dongdt@elsaga.net", phone: "0353022931", gender: "Nam", dob: "25/09/1994", role: "Nhân viên", dept: "Phòng Hành chính", status: "Đang hoạt động" },
        { stt: 6, name: "TS.BS Nguyễn Văn Hùng", email: "bacsi@gmail.com", phone: "0378880598", gender: "Nam", dob: "26/06/1980", role: "Trưởng khoa", dept: "Khoa Sản", status: "Đang hoạt động" },
        { stt: 7, name: "Phùng Hoàng Nam", email: "NV.0106123@gmail.com", phone: "0999999999", gender: "Nam", dob: "10/01/1983", role: "Kỹ thuật viên", dept: "Phòng Xét nghiệm", status: "Đang hoạt động" },
        { stt: 8, name: "Nguyễn Xuân Giang", email: "NV.0038123@gmail.com", phone: "100000570", gender: "Nam", dob: "27/06/1986", role: "Kế toán", dept: "Phòng Tài chính", status: "Đang hoạt động" },
        { stt: 9, name: "Trần Văn Cường", email: "cuongtv@gmail.com", phone: "0912345678", gender: "Nam", dob: "01/01/1985", role: "Bác sĩ", dept: "Khoa Cấp Cứu", status: "Đang hoạt động" },
        { stt: 10, name: "Lý Thị Mận", email: "manlt@gmail.com", phone: "0987654321", gender: "Nữ", dob: "05/05/1993", role: "Y tá", dept: "Khoa Nhi", status: "Ngừng hoạt động" },
        { stt: 11, name: "Hoàng Văn Thái", email: "thaihv@gmail.com", phone: "0905555888", gender: "Nam", dob: "11/11/1988", role: "Phó khoa", dept: "Khoa Nội", status: "Đang hoạt động" },
        { stt: 12, name: "Ngô Thị Bích", email: "bichnt@gmail.com", phone: "0933444555", gender: "Nữ", dob: "09/09/1996", role: "Điều dưỡng", dept: "Khoa Hồi sức", status: "Đang hoạt động" },
    ]);

    // --- 2. THÊM STATE & LOGIC CHO MODAL THÊM NHÂN VIÊN MỚI ---
    const [showAddEmpModal, setShowAddEmpModal] = useState(false);
    const [searchUserId, setSearchUserId] = useState("");
    const [foundUser, setFoundUser] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null); // <--- State mới để lưu cảnh báo trùng
    const [newEmpDetails, setNewEmpDetails] = useState({ dept: "", role: "Bác sĩ" });

    // DỮ LIỆU GIẢ LẬP USER 
    const mockUserDatabase = [
        { id: "USER01", name: "Trần Văn Bình", email: "binhtv@gmail.com", phone: "0911222333", gender: "Nam", dob: "1995-08-15" },
        { id: "USER02", name: "Lê Thị Thu", email: "thule@yahoo.com", phone: "0988777666", gender: "Nữ", dob: "1998-11-20" },
        // ... (giữ nguyên data của bạn)
    ];

    // --- HÀM TÌM KIẾM CÓ KIỂM TRA TRÙNG LẶP ---
    const handleSearchUser = () => {
        if (!searchUserId.trim()) { alert("Vui lòng nhập ID User!"); return; }

        // 1. Tìm user trong database giả lập
        const user = mockUserDatabase.find(u => u.id.toLowerCase() === searchUserId.toLowerCase());

        if (user) {
            setFoundUser(user);

            // 2. KIỂM TRA TRÙNG: Xem email user này đã có trong danh sách nhân viên chưa
            const isExist = employeeList.some(emp => emp.email === user.email);

            if (isExist) {
                // Nếu trùng -> Hiện cảnh báo
                setDuplicateWarning(`Nhân viên "${user.name}" đã tồn tại trong danh sách!`);
            } else {
                // Nếu không trùng -> Reset cảnh báo, cho phép nhập liệu
                setDuplicateWarning(null);
                setNewEmpDetails({ dept: "Khoa Nội", role: "Bác sĩ" });
            }

        } else {
            alert("Không tìm thấy User với ID này trong hệ thống!");
            setFoundUser(null);
            setDuplicateWarning(null);
        }
    };

    // Hàm Lưu nhân viên mới
    const handleAddEmployeeToSystem = () => {
        if (!foundUser || duplicateWarning) return; // Chặn nếu trùng

        const newEmp = {
            stt: employeeList.length + 1,
            name: foundUser.name,
            email: foundUser.email,
            phone: foundUser.phone,
            gender: foundUser.gender,
            dob: formatDob(foundUser.dob),
            dept: newEmpDetails.dept,
            role: newEmpDetails.role,
            address: "--",
            status: "Đang hoạt động"
        };

        setEmployeeList(prev => [newEmp, ...prev]);
        alert(`Đã thêm nhân viên: ${newEmp.name}\nVai trò: ${newEmp.role}\nKhoa: ${newEmp.dept}`);

        // Reset modal
        setShowAddEmpModal(false);
        setSearchUserId("");
        setFoundUser(null);
        setDuplicateWarning(null);
    };

    // Helper format ngày
    const formatDob = (dateStr) => {
        if (!dateStr) return "--";
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }

    // --- STATE & DATA CHO TAB "QUẢN LÝ NGƯỜI KÝ" (MỚI THÊM) ---
    const [signerPage, setSignerPage] = useState(1);
    const [signerPerPage, setSignerPerPage] = useState(10);
    const [signerSearch, setSignerSearch] = useState("");
    const [signerStatusFilter, setSignerStatusFilter] = useState("Tất cả");

    const [manageSignerList, setManageSignerList] = useState([
        { id: 23, name: "Bs Nguyễn Anh Tú", dept: "", status: "Đang hoạt động" },
        { id: 24, name: "Bs Đào Văn Kiên", dept: "Khoa Nội", status: "Đang hoạt động" },
        { id: 25, name: "Ths.Bs Phạm Thị Mỹ", dept: "Khoa Sản", status: "Đang hoạt động" },
        { id: 26, name: "Ths.Bs Nguyễn Xuân Huyên", dept: "Khoa Nhi", status: "Đang hoạt động" },
        { id: 27, name: "Bs CKII Bùi Quốc Công", dept: "Khoa Cấp Cứu", status: "Đang hoạt động" },
        { id: 28, name: "Bs CKI Nguyễn Văn Chuyên", dept: "Khoa Hồi Sức", status: "Đang hoạt động" },
        { id: 29, name: "Bs Nguyễn Thành Trung", dept: "Khoa Tim Mạch", status: "Đang hoạt động" },
        { id: 30, name: "Ths.Bs. Đinh Hữu Việt", dept: "Khoa Nam Học", status: "Đang hoạt động" },
        { id: 31, name: "Bs Phạm Văn Hưởng", dept: "Khoa Chẩn Đoán HA", status: "Đang hoạt động" },
        { id: 32, name: "Ths.Bs Lê Thị Thu Hiền", dept: "Khoa Hỗ Trợ SS", status: "Đang hoạt động" },
        { id: 33, name: "BS Hồ Hữu Phúc", dept: "Khoa Xét Nghiệm", status: "Đang hoạt động" },
        { id: 34, name: "Bs CKI Nguyễn Liên Hiệp", dept: "Khoa Dược", status: "Đang hoạt động" },
        { id: 35, name: "Bs CKI Hoàng Đức Trung", dept: "Khoa Khám Bệnh", status: "Đang hoạt động" },
        { id: 36, name: "BS Nguyễn Trung Phương", dept: "", status: "Đang hoạt động" },
        { id: 37, name: "Bs. Trần Thị Khánh Huyền", dept: "", status: "Đang hoạt động" },
        { id: 38, name: "Bs Thiệu Đình Trọng", dept: "", status: "Đang hoạt động" },
    ]);
    // --- STATE CHO MODAL KÝ SỐ ---
    const [showSignModal, setShowSignModal] = useState(false);
    const [signTab, setSignTab] = useState("Danh sách ký phiếu"); // Tab trong Modal: "Danh sách ký phiếu" hoặc "Danh sách nhân viên"
    // --- LOGIC POPUP CHỌN NGƯỜI KÝ ---
    const [showSignerPopup, setShowSignerPopup] = useState(false);
    const [selectedSigner, setSelectedSigner] = useState("");
    const [currentDocIndex, setCurrentDocIndex] = useState(null); // Index của phiếu
    const [currentLineIndex, setCurrentLineIndex] = useState(null); // Index của dòng (Ký 1, Ký 2...)
    const [popupStep, setPopupStep] = useState(1);
    const [filterText, setFilterText] = useState(""); // State để lọc danh sách bác sĩ
    const [expandedIds, setExpandedIds] = useState([]); // Quản lý mở/đóng menu
    const [activeMenuId, setActiveMenuId] = useState(1); // Quản lý đang xem trang nào
    const doctorList = [
        "Bs CKI Hoàng Đức Trung", "Bs Đàm Đình Tâm", "Bs Đào Văn Kiên",
        "Bs Thiệu Đình Trọng", "Đoàn Thành Đồng", "Ths.Bs. Đinh Hữu Việt",
        "Nguyễn Văn An (System)", "Bs Trịnh Văn Tam"
    ];

    // --- STATE CHO MODAL LỰA CHỌN NGƯỜI KÝ (MỚI) ---
    const [showSelectSignerModal, setShowSelectSignerModal] = useState(false);
    const [tempSelectedIds, setTempSelectedIds] = useState([]); // Lưu các ID đang tick chọn trong modal
    const [sourceSearch, setSourceSearch] = useState(""); // Tìm kiếm trong modal

    // Dữ liệu giả lập: Tất cả nhân viên trong bệnh viện (Nguồn để chọn)
    const [allStaffSource] = useState([
        { id: 101, name: "TS.BS Nguyễn Văn A", dept: "Khoa Ngoại", role: "Trưởng khoa" },
        { id: 102, name: "ThS.BS Lê Thị B", dept: "Khoa Nội", role: "Bác sĩ" },
        { id: 103, name: "BS.CKII Trần Văn C", dept: "Khoa Sản", role: "Phó khoa" },
        { id: 104, name: "BS.CKI Phạm Thị D", dept: "Khoa Nhi", role: "Bác sĩ" },
        { id: 105, name: "BS Hồ Hữu Phúc", dept: "Khoa Xét Nghiệm", role: "Bác sĩ" },
        { id: 106, name: "KTV Lê Văn F", dept: "Chẩn đoán hình ảnh", role: "Kỹ thuật viên" },
        { id: 107, name: "BS Ngô Văn G", dept: "Khoa Cấp Cứu", role: "Bác sĩ" },
        { id: 108, name: "Điều dưỡng H", dept: "Khoa Hồi Sức", role: "Điều dưỡng trưởng" },
    ]);

    // --- LOGIC CHO MODAL LỰA CHỌN NGƯỜI KÝ ---

    // 1. Hàm mở modal và reset state tạm
    const handleOpenSelectSigner = () => {
        setTempSelectedIds([]); // Reset các ô đã tick
        setSourceSearch(""); // Reset ô tìm kiếm
        setShowSelectSignerModal(true);
    };

    // 2. Hàm tick/untick checkbox
    const handleToggleCandidate = (id) => {
        setTempSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // 3. Hàm Lưu: Chuyển từ danh sách nguồn sang danh sách quản lý
    const handleSaveSelectedSigners = () => {
        // Lọc ra các object nhân viên dựa trên ID đã chọn
        const selectedStaffs = allStaffSource.filter(s => tempSelectedIds.includes(s.id));

        // Map sang format của bảng manageSignerList (id, name, dept, status)
        const newSigners = selectedStaffs.map(s => ({
            id: s.id,
            name: s.name,
            dept: s.dept,
            status: "Đang hoạt động" // Mặc định là active
        }));

        // Cập nhật vào state chính (Chị nhớ sửa dòng khai báo manageSignerList có thêm setManageSignerList nhé)
        // setManageSignerList(prev => [...prev, ...newSigners]); 

        // Tạm thời alert để demo logic
        alert(`Đã thêm ${newSigners.length} người vào danh sách ký!`);

        setShowSelectSignerModal(false);
    };

    // Hàm lọc danh sách bác sĩ theo từ khóa nhập vào
    const filteredDoctors = doctorList.filter(doc =>
        doc.toLowerCase().includes(filterText.toLowerCase())
    );

    // Mở popup: Nhận vào index phiếu, index dòng, và nội dung dòng hiện tại
    const handleOpenSignerPopup = (docIndex, lineIndex, currentContent) => {
        setCurrentDocIndex(docIndex);
        setCurrentLineIndex(lineIndex);

        // Kiểm tra xem dòng này đã có người ký chưa hay là "..."
        const parts = currentContent.split(':');
        const currentName = parts.length > 1 ? parts[1].trim() : "";

        if (currentName && currentName !== "..." && currentName !== ".....") {
            // Nếu đã có tên -> Vào thẳng bước 2 (Xác nhận/Hủy)
            setSelectedSigner(currentName);
            setPopupStep(2);
        } else {
            // Nếu chưa có tên -> Vào bước 1 (Chọn người)
            setSelectedSigner("");
            setFilterText(""); // Reset bộ lọc
            setPopupStep(1);
        }
        setShowSignerPopup(true);
    };

    // Chọn người từ danh sách -> Sang bước 2
    const handleSelectSigner = (name) => {
        setSelectedSigner(name);
        setPopupStep(2);
    };

    // Bấm ĐỒNG Ý -> Cập nhật lại bảng
    const handleConfirmSigner = () => {
        if (!selectedSigner) return;

        // Copy mảng documents ra để sửa
        const newDocuments = [...signDocuments];
        const targetDoc = newDocuments[currentDocIndex];

        // Tách chuỗi progress thành mảng các dòng
        const lines = targetDoc.progress.split('\n');

        // Lấy prefix (VD: "Ký 2") của dòng đang sửa
        const currentLine = lines[currentLineIndex];
        const prefix = currentLine.split(':')[0];

        // Cập nhật dòng đó với tên mới
        lines[currentLineIndex] = `${prefix}: ${selectedSigner}`;

        // Gộp lại thành chuỗi và lưu
        targetDoc.progress = lines.join('\n');
        setSignDocuments(newDocuments);

        // Đóng popup
        setShowSignerPopup(false);
    };

    // Bấm HỦY TRÌNH KÝ -> Reset về "..."
    const handleCancelSignature = () => {
        const newDocuments = [...signDocuments];
        const targetDoc = newDocuments[currentDocIndex];
        const lines = targetDoc.progress.split('\n');
        const currentLine = lines[currentLineIndex];
        const prefix = currentLine.split(':')[0];

        // Reset về dấu ba chấm
        lines[currentLineIndex] = `${prefix}: ...`;

        targetDoc.progress = lines.join('\n');
        setSignDocuments(newDocuments);

        alert("Đã hủy trình ký cho vị trí này!");
        setShowSignerPopup(false);
    }
    // Dữ liệu giả lập cho bảng "Danh sách ký phiếu" (Hình 1)
    // --- STATE DỮ LIỆU KÝ PHIẾU (Chuyển thành State để có thể sửa đổi) ---
    const [signDocuments, setSignDocuments] = useState([
        { stt: 1, name: "PHIẾU ĐIỆN TÂM ĐỒ-1", count: "1/1", signedBy: "Nguyễn Văn An (System)", progress: "Ký 1: Nguyễn Văn An (System)", status: "Đã ký", statusColor: "green" },
        { stt: 2, name: "PHIẾU ĐIỆN TÂM ĐỒ-2", count: "0/2", signedBy: "", progress: "Ký 1: Đoàn Thành Đồng\nKý 2: Bs Trịnh Văn Tam", status: "Chưa ký", statusColor: "red" },
        { stt: 3, name: "PHIẾU ĐIỆN TÂM ĐỒ-3", count: "0/1", signedBy: "", progress: "Ký 1: Nguyễn Văn An (System)", status: "Chưa ký", statusColor: "red" },
        { stt: 4, name: "PHIẾU ĐIỆN TÂM ĐỒ-4", count: "0/1", signedBy: "", progress: "Ký 1: Nguyễn Văn An (System)", status: "Chưa ký", statusColor: "red" },

    ]);

    // --- 1. DỮ LIỆU GIẢ LẬP CHO TRANG "KÝ SỐ" (HÌNH 2) ---
    const [digitalSignList, setDigitalSignList] = useState([
        { id: 1, stt: 1, name: "LƯƠNG THỊ THI", fileNo: "1/1", docName: "BỆNH ÁN SẢN PHỤ KHOA", createdDate: "04/09/2024", type: "BỆNH ÁN SẢN PHỤ KHOA", signCount: "0/2", signer: "", signTime: "13:47 04/09/2024", status: "Chưa ký" },
        { id: 2, stt: 2, name: "LƯƠNG THỊ THI", fileNo: "1/1", docName: "A-BỆNH ÁN SẢN PHỤ KHOA (TỜ 2)", createdDate: "04/09/2024", type: "BỆNH ÁN SẢN PHỤ KHOA", signCount: "0/1", signer: "", signTime: "13:47 04/09/2024", status: "Chưa ký" },
        { id: 3, stt: 3, name: "LƯƠNG THỊ THI", fileNo: "1/1", docName: "PHIẾU KHAI THÁC TIỀN SỬ 2", createdDate: "04/09/2024", type: "BỆNH ÁN SẢN PHỤ KHOA", signCount: "0/1", signer: "", signTime: "13:47 04/09/2024", status: "Chưa ký" },
        { id: 4, stt: 4, name: "LƯƠNG THỊ THI", fileNo: "1/1", docName: "TÓM TẮT THÔNG QUA PHẪU THUẬT - THỦ THUẬT", createdDate: "04/09/2024", type: "BỆNH ÁN SẢN PHỤ KHOA", signCount: "0/2", signer: "", signTime: "13:47 04/09/2024", status: "Chưa ký" },
        { id: 5, stt: 5, name: "LƯƠNG THỊ THI", fileNo: "1/1", docName: "PHIẾU KHÁM TIỀN MÊ ( SẢN PHỤ KHOA )", createdDate: "04/09/2024", type: "BỆNH ÁN SẢN PHỤ KHOA", signCount: "0/1", signer: "", signTime: "13:47 04/09/2024", status: "Chưa ký" },
        { id: 6, stt: 6, name: "LƯƠNG THỊ THI", fileNo: "1/1", docName: "BẢNG KIỂM AN TOÀN PHẪU THUẬT", createdDate: "04/09/2024", type: "BỆNH ÁN SẢN PHỤ KHOA", signCount: "0/5", signer: "", signTime: "13:47 04/09/2024", status: "Chưa ký" },
        { id: 7, stt: 12, name: "LƯƠNG THỊ THI", fileNo: "1/1", docName: "XÉT NGHIỆM 10-06-2024-0", createdDate: "04/09/2024", type: "BỆNH ÁN SẢN PHỤ KHOA", signCount: "2/2", signer: "Phùng Hoàng Nam", signTime: "13:55 04/09/2024", status: "Đã ký" },
        { id: 8, stt: 13, name: "LƯƠNG THỊ THI", fileNo: "1/1", docName: "XÉT NGHIỆM 10-06-2024-0", createdDate: "04/09/2024", type: "BỆNH ÁN SẢN PHỤ KHOA", signCount: "2/2", signer: "Bs Nguyễn Trọng Hoàng Hiệp", signTime: "13:55 04/09/2024", status: "Đã ký" },
    ]);



    // --- 2. LOGIC LỌC & TÌM KIẾM CHO KÝ SỐ (CHÈN VÀO ĐÂY) ---

    // A. State lưu giá trị bộ lọc
    const [signFilters, setSignFilters] = useState({
        type: "Tất cả",
        signer: "Tất cả",
        date: "Tất cả",
        search: ""
    });

    // B. Tự động lấy danh sách không trùng lặp cho Dropdown
    const uniqueSignTypes = useMemo(() => ["Tất cả", ...new Set(digitalSignList.map(item => item.type))].sort(), [digitalSignList]);
    const uniqueSigners = useMemo(() => ["Tất cả", ...new Set(digitalSignList.map(item => item.signer).filter(Boolean))].sort(), [digitalSignList]);
    const uniqueSignDates = useMemo(() => ["Tất cả", ...new Set(digitalSignList.map(item => item.createdDate))].sort(), [digitalSignList]);

    // C. Hàm xử lý thay đổi bộ lọc
    const handleSignFilterChange = (field, value) => {
        setSignFilters(prev => ({ ...prev, [field]: value }));
        setCurrentSignPage(1); // Quan trọng: Reset về trang 1 khi lọc
    };

    // D. Logic Lọc dữ liệu (Core)
    const filteredSignList = useMemo(() => {
        return digitalSignList.filter(record => {
            if (signFilters.type !== "Tất cả" && record.type !== signFilters.type) return false;
            if (signFilters.signer !== "Tất cả" && record.signer !== signFilters.signer) return false;
            if (signFilters.date !== "Tất cả" && record.createdDate !== signFilters.date) return false;
            if (signFilters.search) {
                const s = signFilters.search.toLowerCase();
                return (
                    record.name.toLowerCase().includes(s) ||
                    record.docName.toLowerCase().includes(s) ||
                    record.fileNo.toLowerCase().includes(s)
                );
            }
            return true;
        });
    }, [digitalSignList, signFilters]);

    // E. Logic Phân trang (Dựa trên danh sách ĐÃ LỌC)
    const [currentSignPage, setCurrentSignPage] = useState(1);
    const [signPerPage, setSignPerPage] = useState(10);

    const indexOfLastSign = currentSignPage * signPerPage;
    const indexOfFirstSign = indexOfLastSign - signPerPage;
    // Cắt từ danh sách đã lọc (filteredSignList) thay vì danh sách gốc
    const currentSignList = filteredSignList.slice(indexOfFirstSign, indexOfLastSign);
    const totalSignPages = Math.ceil(filteredSignList.length / signPerPage);
    // --- 4. DATA & LOGIC CHO TAB "PHIẾU TRÌNH KÝ" ---

    // A. Dữ liệu giả lập (Theo Hình 2)
    const [submissionRecords] = useState([
        { id: 1, stt: 1, type: "A-BỆNH ÁN SẢN PHỤ KHOA (TỜ 2)", submitter: "Nguyễn Văn An (System)", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
        { id: 2, stt: 2, type: "PHIẾU KHÁM TIỀN MÊ ( SẢN PHỤ KHOA )", submitter: "Nguyễn Văn An (System)", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
        { id: 3, stt: 3, type: "PHIẾU KHAI THÁC TIỀN SỬ 2", submitter: "Nguyễn Văn An (System)", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
        { id: 4, stt: 4, type: "TÓM TẮT THÔNG QUA PHẪU THUẬT - THỦ THUẬT", submitter: "Nguyễn Văn An (System)", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
        { id: 5, stt: 5, type: "BẢNG KIỂM AN TOÀN PHẪU THUẬT", submitter: "Nguyễn Văn An (System)", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
        // ... thêm dữ liệu nếu cần để test phân trang
    ]);

    // B. State chọn checkbox (để thực hiện Ký lô)
    const [selectedSubmissions, setSelectedSubmissions] = useState([]);

    // C. Logic Phân trang cho Phiếu trình ký
    const [subPage, setSubPage] = useState(1);
    const [subPerPage, setSubPerPage] = useState(10);

    const indexOfLastSub = subPage * subPerPage;
    const indexOfFirstSub = indexOfLastSub - subPerPage;
    const currentSubmissions = submissionRecords.slice(indexOfFirstSub, indexOfLastSub);
    const totalSubPages = Math.ceil(submissionRecords.length / subPerPage);

    // Hàm xử lý checkbox
    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedSubmissions(currentSubmissions.map(i => i.id));
        else setSelectedSubmissions([]);
    };

    const handleSelectRow = (id) => {
        setSelectedSubmissions(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // --- STATE QUẢN LÝ NHÂN VIÊN KÝ SỐ ---
    // 1. Chuyển danh sách nhân viên thành State
    const [signStaffs, setSignStaffs] = useState([
        "Nguyễn Văn An (System)", "Bs Nguyễn Văn Kiên", "Bs Nguyễn Văn Quân", "Ths Bs Hoàng Tuấn Linh",
        "BS CKI Trịnh Văn Lọc", "Bs Hoàng Diệu Hoa", "BS CKI Nguyễn Văn Hướng", "Bs Nguyễn Việt Dũng"
    ]);



    // --- DATABASE BÁC SĨ GIẢ LẬP ---
    const allDoctorsDB = [
        "TS.BS Nguyễn Văn A", "ThS.BS Lê Thị B", "BS.CKII Trần Văn C", "BS.CKI Phạm Thị D",
        "Điều dưỡng trưởng Ngô Văn E", "Kỹ thuật viên Lê Văn F", "Bs Hoàng Diệu Hoa", "Bs Nguyễn Việt Dũng"
    ];
    // State cho ô tìm kiếm trong Modal Quản lý
    const [staffSearchTerm, setStaffSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Logic lọc danh sách
    const filteredCandidates = allDoctorsDB.filter(doc =>
        doc.toLowerCase().includes(staffSearchTerm.toLowerCase()) &&
        !signStaffs.includes(doc)
    );

    // Hàm xử lý chọn
    const handleSelectCandidate = (name) => {
        setSignStaffs([...signStaffs, name]);
        setStaffSearchTerm("");
        setShowSuggestions(false);
    };
    // 2. State cho Modal Quản lý (Thêm/Xóa)
    const [showManageStaffModal, setShowManageStaffModal] = useState(false);
    const [newStaffName, setNewStaffName] = useState("");

    // --- LOGIC THÊM / XÓA NHÂN VIÊN ---
    const handleAddStaff = () => {
        if (!newStaffName.trim()) return alert("Vui lòng nhập tên nhân viên!");
        setSignStaffs([...signStaffs, newStaffName]);
        setNewStaffName(""); // Reset ô nhập
    };

    // --- SỬA HÀM XÓA: Xóa theo ID từ danh sách manageSignerList ---
    // --- SỬA HÀM XÓA: Chỉ cho phép xóa nếu trạng thái là "Ngừng hoạt động" ---
    const handleRemoveStaff = (id) => {
        // 1. Tìm thông tin nhân viên trong danh sách hiện tại
        const staffToRemove = manageSignerList.find(s => s.id === id);

        if (!staffToRemove) return;

        // 2. Kiểm tra trạng thái
        if (staffToRemove.status === "Đang hoạt động") {
            alert(`Không thể xóa "${staffToRemove.name}" vì đang ở trạng thái 'Đang hoạt động'.\n\nVui lòng chuyển trạng thái sang 'Ngừng hoạt động' trước khi xóa!`);
            return; // Dừng lại, không xóa
        }

        // 3. Nếu hợp lệ (Ngừng hoạt động) thì mới hiện confirm xóa
        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn "${staffToRemove.name}" khỏi danh sách ký không?`)) {
            setManageSignerList(prevList => prevList.filter(staff => staff.id !== id));
        }
    };
    const [addStep, setAddStep] = useState(1)
    const [formInput, setFormInput] = useState({ patientCode: "", year: "2024" })
    const [formErrors, setFormErrors] = useState({ patientCode: "", year: "" })
    const [modalPage, setModalPage] = useState(1)
    const modalItemsPerPage = 5
    const [selectedTypeCode, setSelectedTypeCode] = useState(null)

    // --- 3. LOGIC ---
    const uniquePatientYears = useMemo(() => [...new Set(patientList.map(p => p.dob.split('/').pop()))].sort().reverse(), [patientList])
    const uniqueProvinces = useMemo(() => [...new Set(patientList.map(p => p.province))].sort(), [patientList])
    const uniqueDistricts = useMemo(() => [...new Set(patientList.map(p => p.district))].sort(), [patientList])
    const uniqueWards = useMemo(() => [...new Set(patientList.map(p => p.ward))].sort(), [patientList])

    const handleFilterChange = (field, value) => {
        setPatientFilters(prev => ({ ...prev, [field]: value }))
        setCurrentPatientPage(1)
    }

    const filteredPatients = useMemo(() => {
        return patientList.filter(p => {
            if (patientFilters.year && p.dob.split('/').pop() !== patientFilters.year) return false
            if (patientFilters.province && p.province !== patientFilters.province) return false
            if (patientFilters.district && p.district !== patientFilters.district) return false
            if (patientFilters.ward && p.ward !== patientFilters.ward) return false
            if (patientFilters.search) {
                const s = patientFilters.search.toLowerCase()
                return p.name.toLowerCase().includes(s) || p.pid.toLowerCase().includes(s) || p.phone.includes(s)
            }
            return true
        })
    }, [patientList, patientFilters])

    const indexOfLastPatient = currentPatientPage * patientsPerPage
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient)
    const totalPatientPages = Math.ceil(filteredPatients.length / patientsPerPage)

    // --- THÊM VÀO PHẦN KHAI BÁO STATE (ĐẦU FILE) ---
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editingStatusRecord, setEditingStatusRecord] = useState(null);
    const [tempStatus, setTempStatus] = useState("");

    // Hàm mở modal sửa trạng thái
    const handleOpenStatusEdit = (record) => {
        setEditingStatusRecord(record);
        setTempStatus(record.status);
        setShowStatusModal(true);
    };

    // Hàm lưu trạng thái mới
    const handleSaveStatusChange = () => {
        if (!editingStatusRecord) return;

        // Cập nhật vào danh sách dữ liệu gốc
        setAllRecords(prev => prev.map(item =>
            item.id === editingStatusRecord.id ? { ...item, status: tempStatus } : item
        ));

        alert(`Đã cập nhật trạng thái hồ sơ ${editingStatusRecord.name} thành: ${tempStatus}`);
        setShowStatusModal(false);
    };

    const filteredRecords = useMemo(() => {
        return allRecords.filter(record => {
            if (activeTab !== "Tất cả" && record.type !== activeTab) return false
            if (processTab !== "Tất cả") {
                if (processTab === "Hồ sơ chờ" && record.status !== "Lưu kho" && record.status !== "Hồ sơ chờ") return false
                if (processTab === "Hồ sơ điều trị" && record.status !== "Đang điều trị") return false
                if (processTab === "Hồ sơ hoàn thành" && record.status !== "Hoàn thành") return false
            }
            if (filterStatus !== "Tất cả" && record.status !== filterStatus) return false
            if (filterDate !== "Tất cả" && record.createdDate !== filterDate) return false
            if (filterUpdatedDate !== "Tất cả" && record.updatedDate !== filterUpdatedDate) return false
            if (filterYear !== "Tất cả" && record.year.toString() !== filterYear) return false
            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase()
                const match = record.name.toLowerCase().includes(lowerSearch) || record.pid.includes(lowerSearch) || record.fileNo.includes(lowerSearch)
                if (!match) return false
            }
            return true
        })
    }, [allRecords, activeTab, processTab, searchTerm, filterStatus, filterDate, filterUpdatedDate, filterYear])

    useEffect(() => { setCurrentPage(1) }, [activeTab, searchTerm, filterStatus, filterDate, itemsPerPage])

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem)
    const uniqueDates = [...new Set(allRecords.map(item => item.createdDate))].sort()
    const uniqueUpdatedDates = [...new Set(allRecords.map(item => item.updatedDate))].sort()
    const uniqueYears = [...new Set(allRecords.map(item => item.year))].sort()

    // --- 4. HANDLERS ---
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber)

    // --- STATE CHO POPUP XEM GIẤY (PREVIEW) ---
    const [previewRecord, setPreviewRecord] = useState(null); // Lưu thông tin phiếu đang xem

    const getPaginationGroup = (curr, total) => {
        if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
        const pages = [1]
        if (curr > 3) pages.push("...")
        let start = Math.max(2, curr - 1)
        let end = Math.min(total - 1, curr + 1)
        if (curr <= 3) end = 4
        if (curr >= total - 2) start = total - 3
        for (let i = start; i <= end; i++) pages.push(i)
        if (curr < total - 2) pages.push("...")
        if (total > 1) pages.push(total)
        return [...new Set(pages)]
    }

    const handleSelectType = (typeCode) => setSelectedTypeCode(typeCode)
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormInput(prev => ({ ...prev, [name]: value }))
        setFormErrors(prev => ({ ...prev, [name]: "" }))
    }

    // --- 1. LOGIC VALIDATE (KIỂM TRA DỮ LIỆU) ---
    // --- HÀM XỬ LÝ CHUYỂN BƯỚC (VALIDATE CHUẨN) ---
    const handleNextStep = () => {
        let errors = {};
        let isValid = true;
        const currentYear = new Date().getFullYear();

        // 1. Kiểm tra Mã bệnh nhân
        if (!formInput.patientCode.trim()) {
            errors.patientCode = "Vui lòng nhập mã bệnh nhân";
            isValid = false;
        } else {
            // Chuyển cả 2 về String để so sánh (tránh lỗi số vs chữ)
            const inputPid = String(formInput.patientCode).trim();
            const isPatientExist = patientList.some(p => String(p.pid) === inputPid);

            if (!isPatientExist) {
                // Gợi ý mã đúng đầu tiên để anh test
                errors.patientCode = `Mã BN không tồn tại! (Thử mã: ${patientList[0].pid})`;
                isValid = false;
            }
        }

        // 2. Kiểm tra Năm hồ sơ (>= Năm hiện tại)
        if (!formInput.year.trim()) {
            errors.year = "Vui lòng nhập năm";
            isValid = false;
        } else {
            const inputYear = parseInt(formInput.year, 10);
            if (isNaN(inputYear) || inputYear < currentYear) {
                errors.year = `Năm hồ sơ phải từ ${currentYear} trở về sau!`;
                isValid = false;
            }
        }

        // 3. Kiểm tra Loại bệnh án
        if (!selectedTypeCode) {
            alert("Vui lòng chọn 1 loại hồ sơ bệnh án!");
            isValid = false;
        }

        setFormErrors(errors);

        if (isValid) {
            setAddStep(2);
        }
    };
    const handleBack = () => setAddStep(1)
    const handleCloseModal = () => {
        setShowAddModal(false); setAddStep(1); setSelectedTypeCode(null);
        setFormInput({ patientCode: "", year: "2024" }); setFormErrors({}); setModalPage(1)
    }

    const handleFinalAdd = () => {
        const selectedType = recordTypes.find(t => t.code === selectedTypeCode);
        const newRecord = {
            id: allRecords.length + 1, note: "Mới", status: "Đang điều trị",
            fileNo: `${allRecords.length + 1}/${formInput.year}`,
            type: selectedType ? selectedType.name : "KHÁC",
            year: parseInt(formInput.year), pid: formInput.patientCode, name: "VŨ THỊ THẢO",
            createdDate: new Date().toLocaleDateString('en-GB'), creator: "Admin",
            updatedDate: new Date().toLocaleDateString('en-GB'), updater: "Trương Thị Anh"
        };
        setAllRecords([newRecord, ...allRecords]);
        handleCloseModal(); setCurrentPage(1); setActiveTab("Tất cả");
    }

    // --- STATE CHO MODAL SỬA BỆNH NHÂN ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null); // Lưu thông tin bệnh nhân đang sửa

    // Hàm mở Modal Sửa và fill dữ liệu
    const handleOpenEditModal = (patient) => {
        setEditingPatient({
            ...patient,
            // Map dữ liệu từ bảng vào form (nếu cần xử lý thêm ngày tháng thì làm ở đây)
            dob: patient.dob.split('/').reverse().join('-') // Chuyển dd/mm/yyyy -> yyyy-mm-dd cho input date
        });
        setShowEditModal(true);
    };

    // Hàm xử lý nhập liệu khi Sửa (tương tự tạo mới nhưng update vào editingPatient)
    const handleEditInput = (e) => {
        const { name, value } = e.target;
        setEditingPatient(prev => ({ ...prev, [name]: value }));
    };

    // Hàm Lưu sau khi Sửa
    const handleUpdatePatient = () => {
        // Validation cơ bản (giống tạo mới)
        if (!editingPatient.name.trim()) { alert("Tên không được để trống"); return; }
        if (!editingPatient.phone.trim()) { alert("SĐT không được để trống"); return; }

        // Logic cập nhật vào list (Giả lập)
        // Trong thực tế: Gọi API PUT /api/patients/{id}
        alert(`Đã cập nhật thông tin bệnh nhân: ${editingPatient.name}`);
        setShowEditModal(false);
        setEditingPatient(null);
    };

    // --- (MỚI) STATE & LOGIC CHO MODAL SỬA TRẠNG THÁI NGƯỜI KÝ ---
    const [showEditSignerModal, setShowEditSignerModal] = useState(false);
    const [editingSigner, setEditingSigner] = useState(null);

    // Hàm mở modal và lấy thông tin người cần sửa
    const handleOpenEditSigner = (signer) => {
        setEditingSigner({ ...signer }); // Copy object để không sửa trực tiếp vào state gốc
        setShowEditSignerModal(true);
    };

    // Hàm lưu trạng thái mới
    const handleSaveSignerStatus = () => {
        if (!editingSigner) return;

        // Cập nhật vào danh sách manageSignerList
        setManageSignerList(prev => prev.map(s =>
            s.id === editingSigner.id ? { ...s, status: editingSigner.status } : s
        ));

        alert(`Đã cập nhật trạng thái cho: ${editingSigner.name}`);
        setShowEditSignerModal(false);
        setEditingSigner(null);
    };

    // --- STATE CHO MODAL TẠO MỚI BỆNH NHÂN ---
    const [showPatientModal, setShowPatientModal] = useState(false);

    // Dữ liệu form
    const [newPatient, setNewPatient] = useState({
        fullName: "",
        dob: "",
        gender: "1", // 1: Nam, 0: Nữ (Theo bit trong SQL)
        phone: "",
        email: "",
        insuranceNumber: "",
        province: "",
        district: "",
        ward: "",
        address: "" // Số nhà/Đường
    });

    // State lưu lỗi validation
    const [patientErrors, setPatientErrors] = useState({});

    // Hàm reset form
    const resetPatientForm = () => {
        setNewPatient({ fullName: "", dob: "", gender: "1", phone: "", email: "", insuranceNumber: "", province: "", district: "", ward: "", address: "" });
        setPatientErrors({});
    };

    // Hàm xử lý nhập liệu
    const handlePatientInput = (e) => {
        const { name, value } = e.target;
        setNewPatient(prev => ({ ...prev, [name]: value }));
        // Xóa lỗi khi người dùng gõ
        if (patientErrors[name]) {
            setPatientErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    // Hàm Validate và Lưu
    const handleCreatePatient = () => {
        let errors = {};
        let isValid = true;

        // 1. Validate Họ tên
        if (!newPatient.fullName.trim()) {
            errors.fullName = "Vui lòng nhập họ và tên";
            isValid = false;
        }

        // 2. Validate SĐT (VN Phone regex)
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!newPatient.phone.trim()) {
            errors.phone = "Vui lòng nhập số điện thoại";
            isValid = false;
        } else if (!phoneRegex.test(newPatient.phone)) {
            errors.phone = "Số điện thoại không hợp lệ";
            isValid = false;
        }

        // 3. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (newPatient.email && !emailRegex.test(newPatient.email)) {
            errors.email = "Email không đúng định dạng";
            isValid = false;
        }

        // 4. Validate Ngày sinh
        if (!newPatient.dob) {
            errors.dob = "Vui lòng chọn ngày sinh";
            isValid = false;
        }

        // 5. Validate BHYT (Nếu nhập thì phải đủ 10-15 số)
        if (newPatient.insuranceNumber && newPatient.insuranceNumber.length < 10) {
            errors.insuranceNumber = "Số BHYT chưa chính xác";
            isValid = false;
        }

        setPatientErrors(errors);

        if (isValid) {
            // --- LOGIC LƯU VÀO DATABASE (SAU NÀY GỌI API Ở ĐÂY) ---
            alert("Thêm bệnh nhân thành công! (Dữ liệu đã sẵn sàng gửi Backend)");

            // Giả lập thêm vào danh sách hiển thị
            const newId = patientList.length + 1;
            // ... Logic cập nhật state patientList ở đây nếu muốn hiển thị ngay ...

            setShowPatientModal(false);
            resetPatientForm();
        }
    };

    // --- DATA MENU ---
    const tabs = ["Tất cả", "BỆNH ÁN IUI", "BỆNH ÁN IVF", "BỆNH ÁN NGOẠI KHOA", "BỆNH ÁN SẢN PHỤ KHOA", "HỒ SƠ QUẢN LÝ THAI KỲ"]
    const navItems = ["Danh sách bệnh nhân", "Hồ sơ bệnh án", "Lưu trữ hồ sơ", "Lịch sử hồ sơ", "Thiết lập hồ sơ", "Ký số", "Thống kê", "Cài đặt"]
    const recordTypes = [
        { stt: 1, code: "IUI", name: "BỆNH ÁN IUI" }, { stt: 2, code: "IVF", name: "BỆNH ÁN IVF" },
        { stt: 3, code: "NK", name: "BỆNH ÁN NGOẠI KHOA" }, { stt: 4, code: "SPK", name: "BỆNH ÁN SẢN PHỤ KHOA" },
        { stt: 5, code: "HSQLTK", name: "HỒ SƠ QUẢN LÝ THAI KỲ" }, { stt: 6, code: "NHI", name: "BỆNH ÁN NHI KHOA" },
        { stt: 7, code: "MAT", name: "BỆNH ÁN MẮT" }, { stt: 8, code: "RHM", name: "BỆNH ÁN RĂNG HÀM MẶT" },
    ]
    const totalModalPages = Math.ceil(recordTypes.length / modalItemsPerPage)
    const currentModalRecords = recordTypes.slice((modalPage - 1) * modalItemsPerPage, modalPage * modalItemsPerPage)

    // --- XỬ LÝ CHUYỂN TRANG ---
    // Khi bấm vào tên hồ sơ -> Lưu vào state selectedRecord
    // --- XỬ LÝ MENU SIDEBAR & CHỌN HỒ SƠ (MỚI) ---
    const handleMenuClick = (item) => {
        if (item.children) {
            // Nếu có con thì đóng/mở
            if (expandedIds.includes(item.id)) {
                setExpandedIds(expandedIds.filter(id => id !== item.id));
            } else {
                setExpandedIds([...expandedIds, item.id]);
            }
        } else {
            // Không có con thì active luôn
            setActiveMenuId(item.id);
        }
    };

    // --- XỬ LÝ CHUYỂN TRANG (LOGIC MỚI: CHẶN TRẠNG THÁI LƯU KHO) ---
    const handleRecordClick = (record) => {
        // Kiểm tra nếu trạng thái là "Lưu kho" thì không cho vào
        if (record.status === "Lưu kho") {
            alert("Hồ sơ này đang lưu kho, không thể xem chi tiết!");
            return;
        }

        setSelectedRecord(record);
        setActiveMenuId(1); // Reset về trang bìa khi chọn bệnh nhân mới
        setExpandedIds([]); // Thu gọn sidebar
    };

    // Khi bấm vào Menu trắng -> Đổi Tab, nếu đang ở chi tiết thì thoát ra
    const handleNavClick = (item) => {
        setCurrentNav(item);
        if (selectedRecord) {
            setSelectedRecord(null); // Thoát khỏi màn hình chi tiết
        }
    }

    // Hàm quay lại danh sách
    const handleBackToList = () => {
        setSelectedRecord(null);
    }

    // --- 1. HÀM VẼ GIẤY DÙNG CHUNG (Dán trên renderDetailView) ---
    // --- 1. HÀM VẼ GIẤY (ĐÃ THÊM NGƯỜI KÝ BÊN TRÁI CHO CÂN ĐỐI) ---
    const renderCommonECG = (data) => {
        // Dữ liệu giả lập
        const vitalSigns = {
            bp: "110/70",
            pulse: "95",
            temp: "38.5",
            spo2: "98",
            weight: "52",
            height: "160"
        };

        const labResults = [
            { id: 1, name: "Tiểu cầu (PLT)", result: "90", unit: "G/L", ref: "150 - 450", eval: "Thấp", highlight: true },
            { id: 2, name: "Bạch cầu (WBC)", result: "3.5", unit: "G/L", ref: "4.0 - 10.0", eval: "Thấp", highlight: true },
            { id: 3, name: "Hematocrit (HCT)", result: "45", unit: "%", ref: "37 - 42", eval: "Cao", highlight: true },
            { id: 4, name: "Hồng cầu (RBC)", result: "4.5", unit: "T/L", ref: "3.8 - 5.3", eval: "Bình thường", highlight: false },
        ];

        return (
            <div className={`${styles.paper} ${styles.ecgPaper}`} style={{
                width: '210mm', minHeight: '297mm', margin: 0, transform: 'scale(0.85)', transformOrigin: 'top center',
                boxShadow: '0 0 15px rgba(0,0,0,0.15)', background: 'white', padding: '40px 50px',
                fontFamily: '"Times New Roman", Times, serif', color: '#000', textAlign: 'left'
            }}>

                {/* --- HEADER --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '11pt', textTransform: 'uppercase', fontWeight: 'bold' }}>SỞ Y TẾ TP. HỒ CHÍ MINH</div>
                        <div style={{ fontSize: '11pt', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>BỆNH VIỆN ĐẠI HỌC Y DƯỢC</div>
                        <div style={{ fontSize: '10pt' }}>Khoa: Khám bệnh</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '10pt' }}>Mã BN: <b>{data.pid}</b></div>
                        <div style={{ fontSize: '10pt' }}>Số hồ sơ: {data.fileNo}</div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                        PHIẾU KẾT QUẢ XÉT NGHIỆM
                    </h1>
                    <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>(Ngày khám: 15/01/2024)</div>
                </div>

                {/* --- PHẦN 1: THÔNG TIN HÀNH CHÍNH --- */}
                <div style={{ marginBottom: '25px' }}>
                    <table style={{ width: '100%', fontSize: '12pt', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '160px', paddingBottom: '8px', verticalAlign: 'top' }}>Họ tên người bệnh:</td>
                                <td style={{ paddingBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>{data.name}</td>
                                <td style={{ width: '60px', paddingBottom: '8px' }}>Tuổi:</td>
                                <td style={{ width: '60px', paddingBottom: '8px' }}>{data.age}</td>
                                <td style={{ width: '60px', paddingBottom: '8px' }}>Giới:</td>
                                <td style={{ width: '60px', paddingBottom: '8px' }}>{data.gender}</td>
                            </tr>
                            <tr>
                                <td style={{ paddingBottom: '8px', verticalAlign: 'top' }}>Địa chỉ:</td>
                                <td colSpan="5" style={{ paddingBottom: '8px' }}>{data.address}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>

                {/* --- PHẦN 2: CHỈ SỐ SINH HIỆU --- */}
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '15px', textTransform: 'uppercase', textAlign: 'left' }}>I. CHỈ SỐ SINH HIỆU:</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px 30px', fontSize: '12pt', textAlign: 'left' }}>
                        <div>Mạch: <b>{vitalSigns.pulse}</b> lần/phút</div>
                        <div>Nhiệt độ: <b style={{ color: '#dc3545' }}>{vitalSigns.temp}</b> °C</div>
                        <div>Huyết áp: <b>{vitalSigns.bp}</b> mmHg</div>
                        <div>Nhịp thở/SpO2: <b>{vitalSigns.spo2}</b> %</div>
                        <div>Cân nặng: <b>{vitalSigns.weight}</b> kg</div>
                        <div>Chiều cao: <b>{vitalSigns.height}</b> cm</div>
                    </div>
                </div>

                {/* --- PHẦN 3: CHẨN ĐOÁN --- */}
                <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', textTransform: 'uppercase' }}>II. CHẨN ĐOÁN:</h3>
                    <div style={{ fontSize: '12pt', paddingLeft: '15px' }}>
                        <p style={{ margin: '5px 0' }}>• {data.diagnosis || "J00 - Viêm mũi họng cấp"}</p>
                        <p style={{ margin: '5px 0' }}>• A97 - Sốt xuất huyết Dengue</p>
                    </div>
                </div>

                {/* --- PHẦN 4: KẾT QUẢ XÉT NGHIỆM --- */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', textTransform: 'uppercase', textAlign: 'left' }}>III. KẾT QUẢ CẬN LÂM SÀNG:</h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
                                <th style={{ padding: '8px', textAlign: 'left', width: '50px' }}>STT</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Tên chỉ số</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>Kết quả</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>Đơn vị</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>CS Tham chiếu</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>Đánh giá</th>
                            </tr>
                        </thead>
                        <tbody>
                            {labResults.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px', textAlign: 'left' }}>{idx + 1}</td>
                                    <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>{item.name}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: item.highlight ? 'bold' : 'normal', color: item.highlight ? '#d32f2f' : 'inherit' }}>
                                        {item.result}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.ref}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        {item.highlight ? (
                                            <span style={{ border: '1px solid #d32f2f', color: '#d32f2f', padding: '1px 5px', fontSize: '10pt', borderRadius: '3px' }}>
                                                {item.eval}
                                            </span>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- PHẦN 5: CHÂN TRANG & KÝ SỐ (2 BÊN) --- */}
                <div style={{ flex: 1 }}></div>

                <div className={styles.ecgFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '40px' }}>

                    {/* KHỐI BÊN TRÁI: KỸ THUẬT VIÊN */}
                    <div className={styles.signBlock} style={{ textAlign: 'center', minWidth: '250px' }}>
                        {/* Placeholder cho ngày tháng để 2 bên cân nhau */}
                        <div style={{ height: '24px', marginBottom: '5px' }}></div>

                        <div className={styles.roleTitle} style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12pt', marginBottom: '60px' }}>
                            KỸ THUẬT VIÊN
                        </div>

                        {/* Nút ký số bên trái */}
                        <div>
                            <button className={styles.signBtn} style={{ fontSize: '11px', padding: '4px 8px' }}>Ký số 🖊️</button>
                        </div>

                        <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '12pt' }}>
                            KTV Nguyễn Văn B
                        </div>
                    </div>

                    {/* KHỐI BÊN PHẢI: BÁC SĨ (GIỮ NGUYÊN) */}
                    <div className={styles.signBlock} style={{ textAlign: 'center', minWidth: '250px' }}>
                        <div className={styles.dateText} style={{ fontStyle: 'italic', marginBottom: '5px', fontSize: '12pt' }}>
                            Hà Nội, Ngày 03 tháng 02 năm 2026
                        </div>

                        <div className={styles.roleTitle} style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12pt', marginBottom: '60px' }}>
                            BÁC SĨ ĐIỀU TRỊ
                        </div>

                        {(data.status === "Đã ký" || data.status === "Hoàn thành") ? (
                            <div style={{ color: '#0052cc', border: '2px solid #0052cc', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block', transform: 'rotate(-5deg)' }}>
                                Đã ký bởi:<br /> {data.signer || "BS Nguyễn Văn A"}
                            </div>
                        ) : (
                            <div>
                                <button className={styles.signBtn} style={{ fontSize: '11px', padding: '4px 8px' }}>Ký số 🖊️</button>
                            </div>
                        )}
                        <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '12pt' }}>
                            {data.signer || "BS Nguyễn Văn A"}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- HÀM VẼ PHIẾU KHÁM LÂM SÀNG (MỚI) ---
    const renderClinicalExam = (data) => {
        // Dữ liệu sinh hiệu giả lập (Giữ nguyên)
        const vitalSigns = { bp: "110/70", pulse: "95", temp: "38.5", spo2: "98", weight: "52", height: "160" };

        return (
            <div className={`${styles.paper} ${styles.ecgPaper}`} style={{
                width: '210mm', minHeight: '297mm', margin: 0, transform: 'scale(0.85)', transformOrigin: 'top center',
                boxShadow: '0 0 15px rgba(0,0,0,0.15)', background: 'white', padding: '40px 50px',
                fontFamily: '"Times New Roman", Times, serif', color: '#000', textAlign: 'left'
            }}>
                {/* HEADER (Giữ nguyên) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '11pt', textTransform: 'uppercase', fontWeight: 'bold' }}>SỞ Y TẾ TP. HỒ CHÍ MINH</div>
                        <div style={{ fontSize: '11pt', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>BỆNH VIỆN ĐẠI HỌC Y DƯỢC</div>
                        <div style={{ fontSize: '10pt' }}>Khoa: Khám bệnh</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '10pt' }}>Mã BN: <b>{data.pid}</b></div>
                        <div style={{ fontSize: '10pt' }}>Số hồ sơ: {data.fileNo}</div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                        PHIẾU KHÁM BỆNH
                    </h1>
                    <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>(Ngày khám: {data.createdDate})</div>
                </div>

                {/* THÔNG TIN HÀNH CHÍNH (Giữ nguyên) */}
                <div style={{ marginBottom: '25px' }}>
                    <table style={{ width: '100%', fontSize: '12pt', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '160px', paddingBottom: '8px', verticalAlign: 'top' }}>Họ tên người bệnh:</td>
                                <td style={{ paddingBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>{data.name}</td>
                                <td style={{ width: '60px', paddingBottom: '8px' }}>Tuổi:</td>
                                <td style={{ width: '60px', paddingBottom: '8px' }}>{data.age}</td>
                                <td style={{ width: '60px', paddingBottom: '8px' }}>Giới:</td>
                                <td style={{ width: '60px', paddingBottom: '8px' }}>{data.gender}</td>
                            </tr>
                            <tr>
                                <td style={{ paddingBottom: '8px', verticalAlign: 'top' }}>Địa chỉ:</td>
                                <td colSpan="5" style={{ paddingBottom: '8px' }}>{data.address || "Số 15, Đường 3/2, Q.10, TP.HCM"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* I. CHỈ SỐ SINH HIỆU (Giữ nguyên) */}
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '15px', textTransform: 'uppercase', textAlign: 'left' }}>I. CHỈ SỐ SINH HIỆU:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px 30px', fontSize: '12pt', textAlign: 'left' }}>
                        <div>Mạch: <b>{vitalSigns.pulse}</b> lần/phút</div>
                        <div>Nhiệt độ: <b style={{ color: '#dc3545' }}>{vitalSigns.temp}</b> °C</div>
                        <div>Huyết áp: <b>{vitalSigns.bp}</b> mmHg</div>
                        <div>Nhịp thở/SpO2: <b>{vitalSigns.spo2}</b> %</div>
                        <div>Cân nặng: <b>{vitalSigns.weight}</b> kg</div>
                        <div>Chiều cao: <b>{vitalSigns.height}</b> cm</div>
                    </div>
                </div>

                {/* II. CHẨN ĐOÁN (Giữ nguyên) */}
                <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', textTransform: 'uppercase' }}>II. CHẨN ĐOÁN:</h3>
                    <div style={{ fontSize: '12pt', paddingLeft: '15px' }}>
                        <p style={{ margin: '5px 0' }}>• {data.diagnosis || "J00 - Viêm mũi họng cấp"}</p>
                    </div>
                </div>

                {/* --- PHẦN THAY ĐỔI: Thay bảng III bằng Text --- */}

                {/* III. CÁC TRIỆU CHỨNG GHI NHẬN */}
                <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', textTransform: 'uppercase' }}>III. CÁC TRIỆU CHỨNG GHI NHẬN:</h3>
                    <div style={{ fontSize: '12pt', padding: '10px', border: '1px dashed #ccc', minHeight: '80px', background: '#fafafa', lineHeight: '1.5' }}>
                        - Bệnh nhân khai đau đầu âm ỉ vùng trán 2 ngày nay.<br />
                        - Có kèm theo sốt nhẹ về chiều.<br />
                        - Ăn uống kém, buồn nôn nhưng không nôn.<br />
                        - Không ho, không khó thở.
                    </div>
                </div>

                {/* IV. KHÁM LÂM SÀNG */}
                <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', textTransform: 'uppercase' }}>IV. KHÁM LÂM SÀNG:</h3>
                    <div style={{ fontSize: '12pt', padding: '10px', border: '1px dashed #ccc', minHeight: '120px', background: '#fafafa', lineHeight: '1.5' }}>
                        <b>1. Toàn thân:</b> Tỉnh táo, tiếp xúc tốt. Da niêm mạc hồng.<br />
                        <b>2. Tim mạch:</b> T1, T2 đều rõ, không nghe tiếng tim bệnh lý.<br />
                        <b>3. Hô hấp:</b> Lồng ngực cân đối, rì rào phế nang êm dịu, không rale.<br />
                        <b>4. Tiêu hóa:</b> Bụng mềm, không chướng, gan lách không sờ thấy.<br />
                        <b>5. Các cơ quan khác:</b> Chưa phát hiện bất thường.
                    </div>
                </div>
                {/* ----------------------------------------------- */}

                {/* FOOTER KÝ SỐ (Giữ nguyên) */}
                <div style={{ flex: 1 }}></div>
                <div className={styles.ecgFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '40px' }}>
                    {/* KHỐI TRÁI */}
                    <div className={styles.signBlock} style={{ textAlign: 'center', minWidth: '250px' }}>
                        <div style={{ height: '24px', marginBottom: '5px' }}></div>
                        <div className={styles.roleTitle} style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12pt', marginBottom: '60px' }}>KỸ THUẬT VIÊN</div>
                        <div><button className={styles.signBtn} style={{ fontSize: '11px', padding: '4px 8px' }}>Ký số 🖊️</button></div>
                        <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '12pt' }}>KTV Nguyễn Văn B</div>
                    </div>
                    {/* KHỐI PHẢI */}
                    <div className={styles.signBlock} style={{ textAlign: 'center', minWidth: '250px' }}>
                        <div className={styles.dateText} style={{ fontStyle: 'italic', marginBottom: '5px', fontSize: '12pt' }}>Hà Nội, Ngày 03 tháng 02 năm 2026</div>
                        <div className={styles.roleTitle} style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12pt', marginBottom: '60px' }}>BÁC SĨ ĐIỀU TRỊ</div>
                        <div><button className={styles.signBtn} style={{ fontSize: '11px', padding: '4px 8px' }}>Ký số 🖊️</button></div>
                        <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '12pt' }}>{data.signer || "BS Nguyễn Văn A"}</div>
                    </div>
                </div>
            </div>
        );
    };
    // --- HÀM RENDER CHI TIẾT (CHUẨN FORM) ---
    const renderDetailView = () => {
        if (!selectedRecord) return null;

        const data = {
            ...selectedRecord, dob: '09/04/1995', age: 29, job: 'Giáo viên', nation: 'Kinh', country: 'Việt Nam',
            workplace: 'Trường THPT Nguyễn Khuyến', insuranceType: 'BHYT', bhyt_exp: '31/12/2026', relative_info: 'Chồng - Nguyễn Văn A (0909999888)',
            admission_date: '01/09/2024', admission_type: 'KKB', referral_source: 'CoQuanYTe', diagnosis_kkb: 'Đau bụng vùng hạ vị',
            diagnosis_dept: 'Thai 38 tuần / Con so', diagnosis_main: 'BỆNH ÁN IUI', diagnosis_sub: 'Thiếu máu nhẹ', icd: 'O60.0',
            result: 'DoGiam', discharge_date: '04/02/2026', days: 5
        };

        // --- MENU SIDEBAR ---
        const sidebarMenu = [
            { id: 1, title: `BÌA ${selectedRecord.type}` }, // Mục bìa
            { id: 2, title: "QUY CHẾ HỒ SƠ" },
            { id: 3, title: selectedRecord.type },
            { id: 4, title: "A-BỆNH ÁN SẢN PHỤ KHOA (TỜ 1)" },
            { id: 5, title: "A-BỆNH ÁN SẢN PHỤ KHOA (TỜ 2)" },
            { id: 6, title: "A-BỆNH ÁN SẢN PHỤ KHOA (TỜ 3)", hasArrow: true },
            // --- SỬA ĐOẠN NÀY: Thêm 3 phiếu con vào mục KHÁM LÂM SÀNG ---
            {
                id: 7, title: "KHÁM LÂM SÀN(3)", hasArrow: true,
                children: [
                    { id: 71, title: "Phiếu khám lâm sàng 1" },
                    { id: 72, title: "Phiếu khám lâm sàng 2" },
                    { id: 73, title: "Phiếu khám lâm sàng 3" }
                ]
            },
            // MỤC ĐIỆN TIM -> Có con là Điện tâm đồ-1
            {
                id: 8, title: "XÉT NGHIỆM(4)", hasArrow: true, children: [ // Đổi số lượng thành 4
                    { id: 81, title: "Xét nghiệm huyết học – Công thức máu-1" },
                    { id: 82, title: "Xét nghiệm huyết học – Công thức máu-2" }, // Thêm mới
                    { id: 83, title: "Xét nghiệm huyết học – Công thức máu-3" }, // Thêm mới
                    { id: 84, title: "Xét nghiệm huyết học – Công thức máu-4" }  // Thêm mới
                ]
            },
            { id: 9, title: "MONITOR SẢN KHOA (1)", hasArrow: true },
            { id: 10, title: "X-QUANG TIM PHỔI (0)" },
            { id: 11, title: "SIÊU ÂM (0)" },
            { id: 12, title: "PHIẾU KHAI THÁC TIỀN SỬ 1" },
            { id: 13, title: "PHIẾU KHAI THÁC TIỀN SỬ 2" },
            { id: 16, title: "PHIẾU TIỀN MÊ (1)", hasArrow: true },
        ];

        // --- VIEW 1: BÌA HỒ SƠ (CODE CŨ CỦA BẠN - GIỮ NGUYÊN) ---
        const renderCoverPaper = () => (
            <div className={styles.paper}>
                {/* HEADER */}
                <div className={styles.formHeaderRow}>
                    <div className={styles.leftInfo}><p className={styles.upper}>SỞ Y TẾ TP. HỒ CHÍ MINH</p><p className={styles.bold}>BỆNH VIỆN ĐẠI HỌC Y DƯỢC</p><p>Khoa: <b>Sản Phụ Khoa</b></p></div>
                    <div className={styles.centerTitle}><h1 className={styles.mainTitle}>{selectedRecord.type}</h1></div>
                    <div className={styles.rightInfo}><p>Số lưu trữ: <b>1</b></p><p>Mã YT: <b>{data.pid}</b></p></div>
                </div>

                {/* I. HÀNH CHÍNH */}
                <div className={styles.sectionTitle}>I. HÀNH CHÍNH</div>
                <div className={styles.gridSection}>
                    <div className={styles.row}>
                        <div className={styles.col50}><div className={`${styles.label} ${styles.fixedLabel}`}>1. Họ và tên:</div><div className={`${styles.content} ${styles.upperBlue}`}>{data.name}</div></div>
                        <div className={styles.col25}><div className={styles.label}>2. Sinh ngày:</div><div className={styles.content}>{data.dob}</div></div>
                        <div className={styles.col25} style={{ display: 'flex', gap: '10px', padding: 0 }}><div style={{ flex: 1, display: 'flex' }}><div className={styles.label}>Tuổi:</div><div className={styles.content}>{data.age}</div></div><div style={{ flex: 1, display: 'flex' }}><div className={styles.label}>Giới:</div><div className={styles.content}>Nữ</div></div></div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col33}><div className={styles.label}>3. Nghề nghiệp:</div><div className={styles.content}>{data.job}</div></div>
                        <div className={styles.col33}><div className={styles.label}>4. Dân tộc:</div><div className={styles.content}>{data.nation}</div></div>
                        <div className={styles.col33}><div className={styles.label}>5. Quốc tịch:</div><div className={styles.content}>{data.country}</div></div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col50}><div className={`${styles.label} ${styles.fixedLabel}`}>6. Địa chỉ:</div><div className={styles.content}>Số 15, Đường 3/2, Q.10, TP.HCM</div></div>
                        <div className={styles.col50}><div className={styles.label}>7. Nơi làm việc:</div><div className={styles.content}>{data.workplace}</div></div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col50}>
                            <div className={styles.label}>8. Đối tượng:</div>
                            <div className={styles.checkboxGroup}><span className={styles.boxSquare}>x</span> BHYT<span className={styles.boxSquare}> </span> Thu phí<span className={styles.boxSquare}> </span> Miễn</div>
                        </div>
                        <div className={styles.col50}><div className={styles.label}>9. BHYT giá trị đến:</div><div className={styles.content}>{data.bhyt_exp}</div></div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col100}><div className={styles.label}>10. Số thẻ BHYT:</div><div className={styles.boxNumberContainer}><span className={styles.boxNumber}>DN</span><span className={styles.boxNumber}>4</span><span className={styles.boxNumber}>79</span><span className={styles.boxNumber}>0123456789</span></div></div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col100}><div className={styles.label}>11. Họ tên, địa chỉ người nhà khi cần báo tin:</div><div className={styles.content}>{data.relative_info}</div></div>
                    </div>
                </div>

                {/* II. QUẢN LÝ NGƯỜI BỆNH */}
                <div className={styles.sectionTitle}>II. QUẢN LÝ NGƯỜI BỆNH</div>
                <div className={styles.gridSection}>
                    <div className={styles.row}><div className={styles.col50}><div className={styles.label}>12. Vào viện:</div><div className={styles.content}>{data.admission_date}</div></div><div className={styles.col50}><div className={styles.label}>13. Trực tiếp vào:</div><div className={styles.checkboxGroup}><span className={styles.boxSquare}> </span> Cấp cứu<span className={styles.boxSquare}>x</span> KKB<span className={styles.boxSquare}> </span> Khoa điều trị</div></div></div>
                    <div className={styles.row}><div className={styles.col50}><div className={styles.label}>14. Nơi giới thiệu:</div><div className={styles.checkboxGroup}><span className={styles.boxSquare}>x</span> Cơ quan y tế<span className={styles.boxSquare}> </span> Tự đến</div></div><div className={styles.col50}><div className={styles.label}>15. Vào khoa:</div><div className={styles.content}>Sản Phụ Khoa</div></div></div>
                    <div className={styles.row}><div className={styles.col100}><div className={styles.label}>16. Chẩn đoán nơi chuyển đến:</div><div className={styles.content}>-</div></div></div>
                    <div className={styles.row}><div className={styles.col100}><div className={styles.label}>17. Chẩn đoán KKB, Cấp cứu:</div><div className={styles.content}>{data.diagnosis_kkb}</div></div></div>
                    <div className={styles.row}><div className={styles.col100}><div className={styles.label}>18. Chẩn đoán vào khoa điều trị:</div><div className={styles.content}>{data.diagnosis_dept}</div></div></div>

                    <div style={{ margin: '10px 0', borderTop: '1px dashed #ccc' }}></div>

                    <div className={styles.row}><div className={styles.col100}><div className={styles.label}>19. Chẩn đoán ra viện:</div></div></div>
                    <div className={styles.row}><div className={styles.col75}><div className={styles.label} style={{ marginLeft: '20px' }}>a. Bệnh chính:</div><div className={styles.content} style={{ fontWeight: '900' }}>{data.diagnosis_main}</div></div><div className={styles.col25}><div className={styles.label}>Mã ICD:</div><div className={styles.boxNumberContainer}><span className={styles.boxNumber}>{data.icd}</span></div></div></div>
                    <div className={styles.row}><div className={styles.col75}><div className={styles.label} style={{ marginLeft: '20px' }}>b. Bệnh kèm theo:</div><div className={styles.content}>{data.diagnosis_sub}</div></div><div className={styles.col25}><div className={styles.label}>Mã ICD:</div><div className={styles.boxNumberContainer}><span className={styles.boxNumber}>-</span></div></div></div>
                    <div className={styles.row}><div className={styles.col50}><div className={styles.label}>20. Kết quả điều trị:</div><div className={styles.checkboxGroup}><span className={styles.boxSquare}> </span> Khỏi<span className={styles.boxSquare}>x</span> Đỡ/Giảm</div></div><div className={styles.col50}><div className={styles.label}>21. Ra viện:</div><div className={styles.content}>{data.discharge_date}</div></div></div>
                    <div className={styles.row}><div className={styles.col50} style={{ marginLeft: '50%' }}><div className={styles.label}>22. Tổng số ngày điều trị:</div><div className={styles.content} style={{ maxWidth: '50px', textAlign: 'center' }}>{data.days}</div></div></div>
                </div>

                {/* FOOTER */}
                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', textAlign: 'center', padding: '0 20px' }}>
                    <div><p className={styles.upper}>Người lập bệnh án</p><br /><br /><br /><b>BS. {data.creator}</b></div>
                    <div><p className={styles.upper}>Trưởng khoa</p><br /><br /><br /><b>TS. BS. Trần Văn B</b></div>
                    <div><p className={styles.upper}>Giám đốc bệnh viện</p><br /><br /><br /><b><i>(Ký tên, đóng dấu)</i></b></div>
                </div>
            </div>
        );

        // --- VIEW 2: PHIẾU ĐIỆN TÂM ĐỒ (MỚI) ---
        // --- VIEW 2: PHIẾU ĐIỆN TÂM ĐỒ (ĐÃ CHỈNH SỬA THEO HÌNH 2) ---
        const renderECGForm = () => (
            <div className={styles.paperContainer}>
                {renderCommonECG(data)}
            </div>
        );

        return (
            <div className={styles.detailContainer}>
                {/* SIDEBAR */}
                <div className={styles.detailSidebar}>
                    <div style={{ background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '12px 16px', fontWeight: 'bold' }}>☰ Hồ sơ</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {sidebarMenu.map(item => (
                            <div key={item.id}>
                                {/* Item Cha */}
                                <div
                                    className={`${styles.sidebarItem} ${activeMenuId === item.id ? styles.active : ''}`}
                                    onClick={() => handleMenuClick(item)}
                                    style={{
                                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                                        backgroundColor: activeMenuId === item.id ? '#e6f7ff' : 'transparent', textAlign: 'left',
                                        padding: '12px 15px', borderBottom: '1px solid #eee'
                                    }}
                                >
                                    <span>{item.title}</span>
                                    {item.hasArrow && <span>{expandedIds.includes(item.id) ? '▲' : '▼'}</span>}
                                </div>

                                {/* Item Con (Điện tim) */}
                                {item.children && expandedIds.includes(item.id) && (
                                    <div style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                        {item.children.map(child => (
                                            <div
                                                key={child.id}
                                                style={{
                                                    /* SỬA LẠI CSS ĐỂ CĂN TRÁI CHUẨN */
                                                    padding: '10px 10px 10px 35px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: activeMenuId === child.id ? '#0052cc' : '#666',
                                                    fontWeight: activeMenuId === child.id ? 'bold' : 'normal',
                                                    backgroundColor: activeMenuId === child.id ? '#e6f0ff' : 'transparent',

                                                    display: 'flex',          // Dùng flex
                                                    justifyContent: 'flex-start', // Căn bắt đầu từ trái
                                                    alignItems: 'center',     // Căn giữa theo chiều dọc
                                                    width: '100%',            // Chiếm hết chiều rộng
                                                    textAlign: 'left'         // Text căn trái
                                                }}
                                                onClick={() => setActiveMenuId(child.id)}
                                            >
                                                • {child.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTENT */}
                <div className={styles.detailContentWrapper}>
                    <div className={styles.detailToolbar}>
                        <div className={styles.toolbarLeft}><button className={styles.backBtn} onClick={handleBackToList}>⬅ Quay lại danh sách</button></div>
                        <div className={styles.toolbarRight}>
                            <button className={styles.iconBtn}>💾 Lưu</button>
                            <button className={styles.iconBtn}>🖨️ In</button>
                            <button className={styles.signBtn} onClick={() => setShowSignModal(true)}>Ký số 🖊️</button>
                        </div>
                    </div>

                    <div className={styles.paperContainer}>
                        {/* SWITCH GIỮA CÁC LOẠI PHIẾU */}
                        {(() => {
                            // Nhóm phiếu Khám lâm sàng (71, 72, 73)
                            if ([71, 72, 73].includes(activeMenuId)) return renderClinicalExam(data);

                            // Nhóm phiếu Điện tim / Xét nghiệm (81, 82, 83, 84)
                            if ([81, 82, 83, 84].includes(activeMenuId)) return renderECGForm();

                            // Mặc định: Bìa hồ sơ
                            return renderCoverPaper();
                        })()}
                    </div>
                </div>
            </div>
        );
    };
    // --- MAIN RENDER (CẤU TRÚC CHUẨN) ---
    return (
        <div className={styles.container}>
            {/* 1. HEADER XANH (LUÔN HIỂN THỊ) */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <div className={styles.logo} onClick={() => { setSelectedRecord(null); setCurrentNav("Danh sách bệnh nhân"); }} style={{ cursor: 'pointer' }}>
                            <div className={styles.logoIcon}><span className={styles.heartBeat}>❤️</span></div>
                            <div className={styles.logoText}><h1>HealthCare ERM</h1><p>Hệ thống quản lý bệnh án điện tử</p></div>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.userInfo}><span className={styles.role}>System Admin</span><span className={styles.userName}>Nguyễn Văn An</span></div>
                        <button className={styles.notificationBtn}><span className={styles.icon}>🔔</span><span className={styles.badge}>9+</span></button>
                        <div className={styles.avatar}>NA</div>
                    </div>
                </div>
            </header>

            {/* 2. THANH ĐIỀU HƯỚNG TRẮNG (LUÔN HIỂN THỊ) - ĐÂY LÀ CÁI BẠN CẦN */}
            <div className={styles.navBar}>
                {navItems.map((item, index) => (
                    <div
                        key={index}
                        className={`${styles.navItem} ${currentNav === item ? styles.active : ''}`}
                        onClick={() => handleNavClick(item)}
                    >
                        {item}
                    </div>
                ))}
            </div>

            {/* 3. NỘI DUNG CHÍNH (THAY ĐỔI THEO NGỮ CẢNH) */}
            {/* 3. NỘI DUNG CHÍNH (THAY ĐỔI THEO NGỮ CẢNH) */}
            <main className={styles.mainContent} style={{ padding: 0 }}>

                {/* LOGIC: NẾU CÓ CHỌN HỒ SƠ -> HIỆN CHI TIẾT, NẾU KHÔNG -> HIỆN DANH SÁCH */}
                {selectedRecord ? (
                    // === TRƯỜNG HỢP 1: GIAO DIỆN CHI TIẾT ===
                    renderDetailView()
                ) : (
                    // === TRƯỜNG HỢP 2: GIAO DIỆN DANH SÁCH ===
                    <div style={{ padding: '16px 24px' }}>

                        {/* --- A. NẾU LÀ DANH SÁCH BỆNH NHÂN --- */}
                        {currentNav === "Danh sách bệnh nhân" ? (
                            <>
                                {/* ... (Giữ nguyên code phần Danh sách bệnh nhân cũ của bạn ở đây) ... */}
                                <div className={styles.controlPanel}>
                                    {/* ... Control Panel Bệnh nhân ... */}
                                    <div className={styles.filterRow}>
                                        <div className={styles.filterGroup}><label>Năm sinh</label><select value={patientFilters.year} onChange={(e) => handleFilterChange('year', e.target.value)}><option value="">Tất cả</option>{uniquePatientYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                                        <div className={styles.filterGroup}><label>Tỉnh/Thành</label><select value={patientFilters.province} onChange={(e) => handleFilterChange('province', e.target.value)}><option value="">Tất cả</option>{uniqueProvinces.map(item => <option key={item} value={item}>{item}</option>)}</select></div>
                                        <div className={styles.filterGroup}><label>Phường/Xã</label><select value={patientFilters.ward} onChange={(e) => handleFilterChange('ward', e.target.value)}><option value="">Tất cả</option>{uniqueWards.map(item => <option key={item} value={item}>{item}</option>)}</select></div>
                                        <div className={styles.spacer}></div>
                                        <button className={styles.addBtn} onClick={() => setShowPatientModal(true)}><span>⊕</span> TẠO MỚI</button>
                                    </div>
                                </div>
                                {/* ... Table Bệnh nhân (Code cũ) ... */}
                                {/* 2. BẢNG DANH SÁCH BỆNH NHÂN (ĐÃ CĂN TRÁI) */}
                                <div className={styles.tableContainer}>
                                    <table className={styles.dataTable}>
                                        <thead>
                                            <tr>
                                                <th className={styles.textCenter} style={{ width: '50px' }}>STT</th>

                                                {/* Căn trái Header Họ tên */}
                                                <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Họ và tên</th>

                                                <th style={{ textAlign: 'left' }}>Mã BN</th>
                                                <th style={{ textAlign: 'left' }}>Mã BHYT</th>
                                                <th className={styles.textCenter}>Giới tính</th>
                                                <th className={styles.textCenter}>Ngày sinh</th>
                                                <th style={{ textAlign: 'left' }}>SĐT</th>

                                                {/* Căn trái Tỉnh/TP & Phường/Xã */}
                                                <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Tỉnh/TP</th>
                                                <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Phường/Xã</th>

                                                <th className={styles.textCenter}>Tác vụ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentPatients.map((p, index) => (
                                                <tr key={p.id} className={p.isLocked ? styles.lockedRow : ''}>
                                                    <td className={styles.textCenter}>{indexOfFirstPatient + index + 1}</td>

                                                    {/* Căn trái Body Họ tên */}
                                                    <td className={styles.blueText} style={{ fontWeight: '600', textAlign: 'left', paddingLeft: '10px' }}>{p.name}</td>

                                                    <td style={{ textAlign: 'left' }}>{p.pid}</td>

                                                    <td style={{
                                                        color: p.insuranceNumber ? '#28a745' : '#999',
                                                        fontWeight: p.insuranceNumber ? '600' : 'normal',
                                                        textAlign: 'left'
                                                    }}>
                                                        {p.insuranceNumber || "---"}
                                                    </td>

                                                    <td className={styles.textCenter}>{p.gender}</td>
                                                    <td className={styles.textCenter}>{p.dob}</td>
                                                    <td style={{ textAlign: 'left' }}>{p.phone}</td>

                                                    {/* Căn trái Body Tỉnh/TP & Phường/Xã */}
                                                    <td style={{ textAlign: 'left', paddingLeft: '10px' }}>{p.province}</td>
                                                    <td style={{ textAlign: 'left', paddingLeft: '10px' }}>{p.ward}</td>

                                                    <td className={styles.textCenter}>
                                                        <div className={styles.actionButtons}>
                                                            {!p.isLocked ? (
                                                                <>
                                                                    <button className={styles.editBtn} onClick={() => handleOpenEditModal(p)}>✏️</button>
                                                                    <button className={styles.lockBtn} onClick={() => handleToggleLock(p.id, true)}>🔒</button>
                                                                </>
                                                            ) : (
                                                                <button className={styles.restoreBtn} onClick={() => handleToggleLock(p.id, false)}>♻️</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Bệnh nhân (Giữ nguyên) */}
                                {/* --- PHÂN TRANG DANH SÁCH BỆNH NHÂN (CHUẨN HÓA THEO HÌNH 3) --- */}
                                {filteredPatients.length > 0 && (
                                    <div className={styles.pagination}>
                                        {/* Nút Previous */}
                                        <button
                                            className={styles.pageBtn}
                                            onClick={() => setCurrentPatientPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPatientPage === 1}
                                        >
                                            &lt;
                                        </button>

                                        {/* Danh sách các số trang (1, 2, ..., N) */}
                                        {getPaginationGroup(currentPatientPage, totalPatientPages).map((item, index) => (
                                            <button
                                                key={index}
                                                className={`${styles.pageBtn} ${currentPatientPage === item ? styles.active : ''} ${item === '...' ? styles.dots : ''}`}
                                                onClick={() => typeof item === 'number' && setCurrentPatientPage(item)}
                                                disabled={item === '...'}
                                            >
                                                {item}
                                            </button>
                                        ))}

                                        {/* Nút Next */}
                                        <button
                                            className={styles.pageBtn}
                                            onClick={() => setCurrentPatientPage(prev => Math.min(prev + 1, totalPatientPages))}
                                            disabled={currentPatientPage === totalPatientPages}
                                        >
                                            &gt;
                                        </button>

                                        {/* Dropdown chọn số dòng/trang */}
                                        <select
                                            className={styles.limitSelect}
                                            value={patientsPerPage}
                                            onChange={(e) => {
                                                setPatientsPerPage(Number(e.target.value));
                                                setCurrentPatientPage(1); // Reset về trang 1 khi đổi số dòng
                                            }}
                                        >
                                            <option value={5}>5 / trang</option>
                                            <option value={10}>10 / trang</option>
                                            <option value={20}>20 / trang</option>
                                            <option value={50}>50 / trang</option>
                                        </select>
                                    </div>
                                )}
                            </>

                        ) : currentNav === "Ký số" ? (
                            <>
                                {/* --- KHỐI XỬ LÝ DỮ LIỆU CỤC BỘ CHO TAB "ĐÃ KÝ" & "CHƯA KÝ" --- */}
                                {(() => {
                                    // 1. DATA GIẢ LẬP "PHIẾU TRÌNH KÝ" (CHƯA KÝ) - Sửa lại submitter thành tên Bác sĩ để hiện trong Dropdown
                                    // (Lưu ý: submissionRecords gốc ở trên state đang là "System", ở đây em tạo đè biến cục bộ để demo dropdown bác sĩ)
                                    const localSubmissionRecords = [
                                        { id: 1, stt: 1, type: "A-BỆNH ÁN SẢN PHỤ KHOA (TỜ 2)", submitter: "Bs Nguyễn Văn A", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
                                        { id: 2, stt: 2, type: "PHIẾU KHÁM TIỀN MÊ ( SẢN PHỤ KHOA )", submitter: "Ths Bs Lê Thị B", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
                                        { id: 3, stt: 3, type: "PHIẾU KHAI THÁC TIỀN SỬ 2", submitter: "Bs CKI Trần Văn C", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
                                        { id: 4, stt: 4, type: "TÓM TẮT THÔNG QUA PHẪU THUẬT - THỦ THUẬT", submitter: "Bs Nguyễn Văn A", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
                                        { id: 5, stt: 5, type: "BẢNG KIỂM AN TOÀN PHẪU THUẬT", submitter: "Bs Phạm Thị D", submitTime: "11/09/2024", signTime: "", status: "Chưa ký" },
                                    ];

                                    // 2. DATA GIẢ LẬP "PHIẾU TRÌNH KÝ ĐÃ KÝ" (Người gửi là Bác sĩ)
                                    const signedSubmissionRecords = [
                                        { id: 901, stt: 1, type: "BỆNH ÁN NỘI KHOA", submitter: "Bs Nguyễn Văn A", submitTime: "01/02/2026", signTime: "01/02/2026", status: "Đã ký" },
                                        { id: 902, stt: 2, type: "PHIẾU HỘI CHẨN", submitter: "Ths Bs Lê Thị B", submitTime: "01/02/2026", signTime: "02/02/2026", status: "Đã ký" },
                                        { id: 903, stt: 3, type: "GIẤY RA VIỆN", submitter: "Bs CKI Trần Văn C", submitTime: "02/02/2026", signTime: "02/02/2026", status: "Đã ký" },
                                        { id: 904, stt: 4, type: "ĐƠN THUỐC", submitter: "Bs Nguyễn Văn A", submitTime: "03/02/2026", signTime: "03/02/2026", status: "Đã ký" },
                                        { id: 905, stt: 5, type: "BỆNH ÁN NHI KHOA", submitter: "Bs Phạm Thị D", submitTime: "03/02/2026", signTime: "03/02/2026", status: "Đã ký" },
                                        { id: 906, stt: 6, type: "PHIẾU XÉT NGHIỆM", submitter: "KTV Hoàng Văn E", submitTime: "04/02/2026", signTime: "04/02/2026", status: "Đã ký" },
                                    ];

                                    // 3. Lấy danh sách Bác sĩ để nạp vào Dropdown
                                    const submitterListUnsigned = ["Tất cả", ...new Set(localSubmissionRecords.map(r => r.submitter))].sort();
                                    const submitterListSigned = ["Tất cả", ...new Set(signedSubmissionRecords.map(r => r.submitter))].sort();

                                    // 4. Logic Lọc
                                    // Lọc tab "Đã ký"
                                    const filteredSigned = signedSubmissionRecords.filter(item => {
                                        if (signFilters.signer !== "Tất cả" && item.submitter !== signFilters.signer) return false;
                                        if (signFilters.search) {
                                            const s = signFilters.search.toLowerCase();
                                            return item.type.toLowerCase().includes(s) || item.submitter.toLowerCase().includes(s);
                                        }
                                        return true;
                                    });

                                    // Lọc tab "Chưa ký"
                                    const filteredUnsigned = localSubmissionRecords.filter(item => {
                                        if (signFilters.signer !== "Tất cả" && item.submitter !== signFilters.signer) return false;
                                        if (signFilters.search) {
                                            const s = signFilters.search.toLowerCase();
                                            return item.type.toLowerCase().includes(s) || item.submitter.toLowerCase().includes(s);
                                        }
                                        return true;
                                    })

                                    // 5. Phân trang
                                    const totalSignedPages = Math.ceil(filteredSigned.length / signPerPage);
                                    const lastIndexSigned = currentSignPage * signPerPage;
                                    const firstIndexSigned = lastIndexSigned - signPerPage;
                                    const currentSignedPageData = filteredSigned.slice(firstIndexSigned, lastIndexSigned);

                                    const totalSubPagesFiltered = Math.ceil(filteredUnsigned.length / subPerPage);
                                    const lastIndexSub = subPage * subPerPage;
                                    const firstIndexSub = lastIndexSub - subPerPage;
                                    const currentSubmissionsPageData = filteredUnsigned.slice(firstIndexSub, lastIndexSub);

                                    return (
                                        <>
                                            <div className={styles.controlPanel}>
                                                {/* 1. TABS */}
                                                <div className={styles.tabsRow}>
                                                    {["Tất cả", "Phiếu trình ký", "Phiếu trình ký đã ký"].map(tab => (
                                                        <button
                                                            key={tab}
                                                            className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                                                            onClick={() => {
                                                                setActiveTab(tab);
                                                                setCurrentSignPage(1);
                                                                setSubPage(1);
                                                                handleSignFilterChange('signer', 'Tất cả');
                                                            }}
                                                        >
                                                            {tab}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className={styles.filterRow}>
                                                    {/* --- LOGIC HIỂN THỊ BỘ LỌC --- */}

                                                    {(activeTab === "Phiếu trình ký" || activeTab === "Phiếu trình ký đã ký") ? (
                                                        <div className={styles.filterGroup}>
                                                            {/* YÊU CẦU: Label là "Người gửi" */}
                                                            <label>Người gửi</label>
                                                            <select
                                                                value={signFilters.signer}
                                                                onChange={(e) => handleSignFilterChange('signer', e.target.value)}
                                                            >
                                                                {/* YÊU CẦU: Dropdown là tên Bác sĩ */}
                                                                {(activeTab === "Phiếu trình ký" ? submitterListUnsigned : submitterListSigned).map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        // TAB TẤT CẢ (Giữ nguyên)
                                                        <>
                                                            <div className={styles.filterGroup}><label>Loại hồ sơ</label><select><option>Tất cả</option></select></div>
                                                            <div className={styles.filterGroup}><label>Người ký</label><select><option>Tất cả</option></select></div>
                                                            <div className={styles.filterGroup}><label>Ngày tạo</label><select><option>Tất cả</option></select></div>
                                                        </>
                                                    )}

                                                    <div className={styles.spacer}></div>

                                                    {/* Nút Ký lô: CHỈ HIỆN Ở "PHIẾU TRÌNH KÝ" (CHƯA KÝ) */}
                                                    {activeTab === "Phiếu trình ký" && (
                                                        <button className={styles.addBtn} style={{ marginRight: '10px' }} onClick={() => alert(`Ký lô cho ${selectedSubmissions.length} phiếu!`)}>
                                                            <span>✍️</span> Ký lô ({selectedSubmissions.length})
                                                        </button>
                                                    )}

                                                    <div className={styles.actionGroup}>
                                                        <input
                                                            type="text"
                                                            placeholder="Tìm kiếm..."
                                                            className={styles.searchInput}
                                                            value={signFilters.search}
                                                            onChange={(e) => handleSignFilterChange('search', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* --- BẢNG KÝ SỐ (ĐÃ SỬA HIỂN THỊ DANH SÁCH NGƯỜI KÝ Ở TAB TẤT CẢ) --- */}
                                            <div className={styles.tableContainer} style={{ marginTop: '15px' }}>
                                                <table className={styles.dataTable}>
                                                    <thead>
                                                        <tr>
                                                            {/* Checkbox chỉ hiện ở Phiếu trình ký */}
                                                            {activeTab === "Phiếu trình ký" && (
                                                                <th className={styles.textCenter} style={{ width: '40px' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        onChange={handleSelectAll}
                                                                        checked={currentSubmissionsPageData.length > 0 && selectedSubmissions.length === currentSubmissionsPageData.length}
                                                                    />
                                                                </th>
                                                            )}

                                                            <th className={styles.textCenter} style={{ width: '50px' }}>STT</th>

                                                            {activeTab === "Tất cả" && <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Họ tên BN</th>}

                                                            <th style={{ textAlign: 'left', paddingLeft: '15px' }}>
                                                                {activeTab === "Tất cả" ? "Tên phiếu" : "Tên phiếu"}
                                                            </th>


                                                            {activeTab === "Tất cả" && <th style={{ textAlign: 'left', paddingLeft: '15px' }}>Loại hồ sơ</th>}
                                                            {activeTab === "Tất cả" && <th className={styles.textCenter}>Số chữ ký</th>}

                                                            <th style={{ textAlign: 'left', paddingLeft: '10px' }}>
                                                                {activeTab === "Tất cả" ? "Người ký" : "Người trình ký"}
                                                            </th>

                                                            <th className={styles.textCenter}>
                                                                {activeTab === "Tất cả" ? "Thời gian ký" : "Thời gian trình ký"}
                                                            </th>

                                                            {activeTab !== "Tất cả" && <th className={styles.textCenter}>Thời gian ký</th>}

                                                            <th className={styles.textCenter}>Trạng thái</th>
                                                            <th className={styles.textCenter}>
                                                                {activeTab === "Tất cả" ? "Chi tiết" : "Xem chi tiết"}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(() => {
                                                            // Xác định data nguồn
                                                            let dataMap = [];
                                                            if (activeTab === "Phiếu trình ký") dataMap = currentSubmissionsPageData;
                                                            else if (activeTab === "Phiếu trình ký đã ký") dataMap = currentSignedPageData;
                                                            else dataMap = currentSignList;

                                                            if (dataMap.length === 0) return <tr><td colSpan="12" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy dữ liệu</td></tr>;

                                                            return dataMap.map((row, index) => (
                                                                <tr key={row.id} style={{ verticalAlign: 'top' }}> {/* Căn lề trên để danh sách tên đẹp hơn */}

                                                                    {activeTab === "Phiếu trình ký" && (
                                                                        <td className={styles.textCenter} style={{ paddingTop: '12px' }}>
                                                                            <input type="checkbox" checked={selectedSubmissions.includes(row.id)} onChange={() => handleSelectRow(row.id)} />
                                                                        </td>
                                                                    )}

                                                                    <td className={styles.textCenter} style={{ paddingTop: '12px' }}>{row.stt || index + 1}</td>

                                                                    {activeTab === "Tất cả" && (
                                                                        <td className={styles.blueText} style={{ textAlign: 'left', paddingLeft: '10px', paddingTop: '12px' }}>
                                                                            {row.name}
                                                                        </td>
                                                                    )}

                                                                    {/* Tên phiếu */}
                                                                    {/* --- CỘT TÊN PHIẾU --- */}
                                                                    <td
                                                                        style={{ textAlign: 'left', paddingLeft: '15px', paddingTop: '12px', color: '#0052cc', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                                                        onClick={() => setPreviewRecord(row)}
                                                                    >
                                                                        {/* SỬA: Luôn hiển thị 2 loại phiếu này cho TOÀN BỘ các tab trong mục Ký số */}
                                                                        {/* SỬA THÀNH: Hiển thị tên phiếu cụ thể theo yêu cầu */}
                                                                        {row.id % 2 === 0 ? "Phiếu khám lâm sàng 1" : "Phiếu xét nghiệm công thức máu"}
                                                                    </td>


                                                                    {activeTab === "Tất cả" && <td style={{ textAlign: 'left', paddingLeft: '15px', paddingTop: '12px' }}>{row.type}</td>}
                                                                    {activeTab === "Tất cả" && <td className={styles.textCenter} style={{ fontWeight: 'bold', paddingTop: '12px' }}>{row.signCount}</td>}

                                                                    {/* --- CỘT NGƯỜI KÝ (SỬA Ở ĐÂY) --- */}
                                                                    <td style={{ textAlign: 'left', paddingLeft: '10px', paddingTop: '12px' }}>
                                                                        {activeTab === "Tất cả" ? (
                                                                            // LOGIC TỰ ĐỘNG SINH TÊN DỰA VÀO SỐ LƯỢNG CHỮ KÝ (Vd: 0/2 -> 2 tên)
                                                                            (() => {
                                                                                const totalSign = parseInt(row.signCount?.split('/')[1] || 1);
                                                                                const names = ["Nguyễn Văn An (System)"]; // Người đầu tiên luôn có

                                                                                if (totalSign >= 2) names.push("Bs Trịnh Văn Tam");
                                                                                if (totalSign >= 3) names.push("Bs CKI Hoàng Đức Trung");
                                                                                if (totalSign >= 4) names.push("Ths.Bs. Đinh Hữu Việt");
                                                                                if (totalSign >= 5) names.push("Bs Đào Văn Kiên");

                                                                                return names.map((n, i) => (
                                                                                    <div key={i} style={{ color: '#0052cc', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                                                                                        • {n}
                                                                                    </div>
                                                                                ))
                                                                            })()
                                                                        ) : (
                                                                            <span className={styles.blueText}>{row.submitter || row.signer || "Nguyễn Văn An (System)"}</span>
                                                                        )}
                                                                    </td>

                                                                    {/* Thời gian */}
                                                                    <td className={styles.textCenter} style={{ paddingTop: '12px' }}>{row.submitTime || row.signTime || "-"}</td>
                                                                    {activeTab !== "Tất cả" && <td className={styles.textCenter} style={{ paddingTop: '12px' }}>{row.signTime || "-"}</td>}

                                                                    {/* Trạng thái */}
                                                                    <td className={styles.textCenter} style={{ paddingTop: '12px' }}>
                                                                        <span className={styles.statusBadge} style={{
                                                                            color: (row.status === 'Đã ký' || row.status === 'Hoàn thành') ? '#28a745' : '#dc3545',
                                                                            background: (row.status === 'Đã ký' || row.status === 'Hoàn thành') ? '#e6f4ea' : '#fce4e4',
                                                                            border: `1px solid ${(row.status === 'Đã ký' || row.status === 'Hoàn thành') ? '#ceead6' : '#fad2cf'}`
                                                                        }}>
                                                                            {row.status}
                                                                        </span>
                                                                    </td>

                                                                    {/* --- CỘT TÁC VỤ (Xem chi tiết) --- */}
                                                                    <td className={styles.textCenter} style={{ paddingTop: '12px' }}>
                                                                        <a href="#" className={styles.blueText} style={{ textDecoration: 'underline', fontSize: '12px' }}


                                                                            onClick={(e) => { e.preventDefault(); setPreviewRecord(row); }}
                                                                        >
                                                                            {activeTab === "Tất cả" ? "Xem chi tiết" : "Xem chi tiết"}
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            ));
                                                        })()}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* 3. PHÂN TRANG */}
                                            <div className={styles.pagination}>
                                                <span style={{ fontSize: '12px', color: '#666', marginRight: 'auto' }}>
                                                    Tổng: <b>{
                                                        activeTab === "Phiếu trình ký đã ký" ? filteredSigned.length :
                                                            activeTab === "Phiếu trình ký" ? filteredUnsigned.length :
                                                                filteredSignList.length
                                                    }</b> bản ghi
                                                </span>

                                                <button
                                                    className={styles.pageBtn}
                                                    onClick={() => {
                                                        if (activeTab === "Phiếu trình ký đã ký") setCurrentSignPage(prev => Math.max(prev - 1, 1));
                                                        else if (activeTab === "Phiếu trình ký") setSubPage(prev => Math.max(prev - 1, 1));
                                                        else setCurrentSignPage(prev => Math.max(prev - 1, 1));
                                                    }}
                                                    disabled={(activeTab === "Phiếu trình ký đã ký" ? currentSignPage : activeTab === "Phiếu trình ký" ? subPage : currentSignPage) === 1}
                                                >
                                                    &lt;
                                                </button>

                                                {getPaginationGroup(
                                                    activeTab === "Phiếu trình ký đã ký" ? currentSignPage : (activeTab === "Phiếu trình ký" ? subPage : currentSignPage),
                                                    activeTab === "Phiếu trình ký đã ký" ? totalSignedPages : (activeTab === "Phiếu trình ký" ? totalSubPagesFiltered : totalSignPages)
                                                ).map((item, index) => (
                                                    <button
                                                        key={index}
                                                        className={`${styles.pageBtn} ${(activeTab === "Phiếu trình ký đã ký" ? currentSignPage : (activeTab === "Phiếu trình ký" ? subPage : currentSignPage)) === item ? styles.active : ''} ${item === '...' ? styles.dots : ''}`}
                                                        onClick={() => {
                                                            if (typeof item === 'number') {
                                                                if (activeTab === "Phiếu trình ký đã ký") setCurrentSignPage(item);
                                                                else if (activeTab === "Phiếu trình ký") setSubPage(item);
                                                                else setCurrentSignPage(item);
                                                            }
                                                        }}
                                                        disabled={item === '...'}
                                                    >
                                                        {item}
                                                    </button>
                                                ))}

                                                <button
                                                    className={styles.pageBtn}
                                                    onClick={() => {
                                                        if (activeTab === "Phiếu trình ký đã ký") setCurrentSignPage(prev => Math.min(prev + 1, totalSignedPages));
                                                        else if (activeTab === "Phiếu trình ký") setSubPage(prev => Math.min(prev + 1, totalSubPagesFiltered));
                                                        else setCurrentSignPage(prev => Math.min(prev + 1, totalSignPages));
                                                    }}
                                                    disabled={(activeTab === "Phiếu trình ký đã ký" ? currentSignPage : (activeTab === "Phiếu trình ký" ? subPage : currentSignPage)) === (activeTab === "Phiếu trình ký đã ký" ? totalSignedPages : (activeTab === "Phiếu trình ký" ? totalSubPagesFiltered : totalSignPages))}
                                                >
                                                    &gt;
                                                </button>

                                                <select
                                                    className={styles.limitSelect}
                                                    value={activeTab.includes("trình") ? (activeTab === "Phiếu trình ký" ? subPerPage : signPerPage) : signPerPage}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (activeTab === "Phiếu trình ký") { setSubPerPage(val); setSubPage(1); }
                                                        else { setSignPerPage(val); setCurrentSignPage(1); }
                                                    }}
                                                >
                                                    <option value={5}>5 / trang</option>
                                                    <option value={10}>10 / trang</option>
                                                    <option value={20}>20 / trang</option>
                                                    <option value={50}>50 / trang</option>
                                                </select>
                                            </div>
                                        </>
                                    );
                                })()}
                            </>
                        ) : currentNav === "Cài đặt" ? (
                            <>
                                {/* === GIAO DIỆN CÀI ĐẶT === */}
                                <div className={styles.controlPanel}>
                                    {/* 1. THANH MENU TAB CON CỦA CÀI ĐẶT */}
                                    <div className={styles.tabsRow} style={{ marginBottom: '15px' }}>
                                        {["Quản lý nhân viên", "Quản lý nhóm quyền", "Quản lý quyền phiếu", "Quản lý lưu trữ", "Quản lý khung phiếu", "Quản lý người ký", "Quản lý phiếu in", "Cài đặt chung"].map(tab => (
                                            <button
                                                key={tab}
                                                className={`${styles.tabBtn} ${settingsTab === tab ? styles.active : ''}`}
                                                onClick={() => {
                                                    setSettingsTab(tab);
                                                    // Reset trang khi chuyển tab
                                                    setEmpPage(1);
                                                    setSignerPage(1);
                                                }}
                                                style={{ fontSize: '13px', padding: '8px 12px' }}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ================================================================================= */}
                                    {/* CASE 1: TAB QUẢN LÝ NHÂN VIÊN */}
                                    {/* ================================================================================= */}
                                    {settingsTab === "Quản lý nhân viên" && (() => {
                                        // Logic lọc & phân trang Nhân viên
                                        const filteredEmployees = employeeList.filter(emp =>
                                            emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
                                            emp.email.toLowerCase().includes(empSearch.toLowerCase()) ||
                                            emp.phone.includes(empSearch)
                                        );
                                        const indexOfLastEmp = empPage * empPerPage;
                                        const indexOfFirstEmp = indexOfLastEmp - empPerPage;
                                        const currentEmployees = filteredEmployees.slice(indexOfFirstEmp, indexOfLastEmp);
                                        const totalEmpPages = Math.ceil(filteredEmployees.length / empPerPage);

                                        return (
                                            <>
                                                {/* Khung thống kê & Tìm kiếm */}
                                                <div className={styles.filterRow} style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e6f4ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '15px' }}>
                                                        <div style={{ background: 'white', padding: '8px 16px', borderRadius: '6px', border: '1px solid #91d5ff', color: '#0052cc', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Tổng số: {filteredEmployees.length}</div>
                                                        <div style={{ background: 'white', padding: '8px 16px', borderRadius: '6px', border: '1px solid #91d5ff', color: '#28a745', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Hoạt động: {filteredEmployees.filter(e => e.status === "Đang hoạt động").length}</div>
                                                        <div style={{ background: 'white', padding: '8px 16px', borderRadius: '6px', border: '1px solid #91d5ff', color: '#666', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Dừng: {filteredEmployees.filter(e => e.status !== "Đang hoạt động").length}</div>
                                                    </div>
                                                    <div className={styles.actionGroup}>
                                                        <input type="text" placeholder="Tìm kiếm nhân viên..." className={styles.searchInput} style={{ width: '250px' }} value={empSearch} onChange={(e) => { setEmpSearch(e.target.value); setEmpPage(1); }} />
                                                        <button className={styles.addBtn} style={{ marginLeft: '10px' }} onClick={() => setShowAddEmpModal(true)}>Thêm nhân viên</button>
                                                    </div>
                                                </div>

                                                {/* Bảng Nhân viên */}
                                                <div className={styles.tableContainer} style={{ marginTop: '15px' }}>
                                                    <table className={styles.dataTable}>
                                                        <thead>
                                                            <tr>
                                                                <th className={styles.textCenter} style={{ width: '50px' }}>STT</th>
                                                                <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Họ và tên</th>
                                                                <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Email</th>
                                                                <th style={{ textAlign: 'left' }}>SĐT</th>
                                                                <th className={styles.textCenter}>Giới tính</th>
                                                                <th className={styles.textCenter}>Ngày sinh</th>

                                                                {/* --- (MỚI) CỘT VAI TRÒ --- */}
                                                                <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Vai trò</th>

                                                                <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Khoa</th>
                                                                <th className={styles.textCenter}>Trạng thái</th>
                                                                <th className={styles.textCenter}>Tác vụ</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentEmployees.length > 0 ? (
                                                                currentEmployees.map((emp, index) => (
                                                                    <tr key={index}>
                                                                        <td className={styles.textCenter}>{indexOfFirstEmp + index + 1}</td>
                                                                        <td className={styles.blueText} style={{ textAlign: 'left', paddingLeft: '10px', fontWeight: '500' }}>{emp.name}</td>
                                                                        <td style={{ textAlign: 'left', paddingLeft: '10px' }}>{emp.email}</td>
                                                                        <td style={{ textAlign: 'left' }}>{emp.phone}</td>
                                                                        <td className={styles.textCenter}>{emp.gender}</td>
                                                                        <td className={styles.textCenter}>{emp.dob}</td>

                                                                        {/* CỘT VAI TRÒ */}
                                                                        <td style={{ textAlign: 'left', paddingLeft: '10px' }}>
                                                                            <span style={{ backgroundColor: '#f0f5ff', color: '#0052cc', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                                                {emp.role}
                                                                            </span>
                                                                        </td>

                                                                        <td style={{ textAlign: 'left', paddingLeft: '10px' }}>{emp.dept}</td>

                                                                        {/* TRẠNG THÁI */}
                                                                        <td className={styles.textCenter}>
                                                                            <span style={{ color: emp.status === 'Đang hoạt động' ? '#28a745' : '#dc3545', fontWeight: '500' }}>
                                                                                {emp.status}
                                                                            </span>
                                                                        </td>

                                                                        {/* TÁC VỤ: CHỈ CÒN NÚT SỬA */}
                                                                        <td className={styles.textCenter}>
                                                                            <div className={styles.actionButtons}>
                                                                                <button
                                                                                    className={styles.editBtn}
                                                                                    title="Sửa thông tin"
                                                                                    onClick={() => handleOpenEditEmp(emp)}
                                                                                >
                                                                                    ✏️
                                                                                </button>
                                                                                {/* Đã xóa nút Delete ở đây */}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (<tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy nhân viên</td></tr>)}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Phân trang Nhân viên */}
                                                {filteredEmployees.length > 0 && (
                                                    <div className={styles.pagination}>
                                                        <span style={{ fontSize: '12px', color: '#666', marginRight: 'auto' }}>Tổng: <b>{filteredEmployees.length}</b></span>
                                                        <button className={styles.pageBtn} onClick={() => setEmpPage(prev => Math.max(prev - 1, 1))} disabled={empPage === 1}>&lt;</button>
                                                        {getPaginationGroup(empPage, totalEmpPages).map((item, index) => (
                                                            <button key={index} className={`${styles.pageBtn} ${empPage === item ? styles.active : ''} ${item === '...' ? styles.dots : ''}`} onClick={() => typeof item === 'number' && setEmpPage(item)} disabled={item === '...'}>{item}</button>
                                                        ))}
                                                        <button className={styles.pageBtn} onClick={() => setEmpPage(prev => Math.min(prev + 1, totalEmpPages))} disabled={empPage === totalEmpPages}>&gt;</button>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}

                                    {/* ================================================================================= */}
                                    {/* CASE 2: TAB QUẢN LÝ NGƯỜI KÝ (CODE CŨ CỦA ANH ĐÂY) */}
                                    {/* ================================================================================= */}
                                    {settingsTab === "Quản lý người ký" && (() => {
                                        // Logic lọc Người ký
                                        const filteredSigners = manageSignerList.filter(s => {
                                            const matchName = s.name.toLowerCase().includes(signerSearch.toLowerCase());
                                            const matchStatus = signerStatusFilter === "Tất cả" || s.status === signerStatusFilter;
                                            return matchName && matchStatus;
                                        });
                                        const indexOfLastSigner = signerPage * signerPerPage;
                                        const indexOfFirstSigner = indexOfLastSigner - signerPerPage;
                                        const currentSigners = filteredSigners.slice(indexOfFirstSigner, indexOfLastSigner);
                                        const totalSignerPages = Math.ceil(filteredSigners.length / signerPerPage);

                                        return (
                                            <>
                                                {/* Bộ lọc Người ký */}
                                                <div className={styles.filterRow} style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e6f4ff', borderRadius: '8px' }}>
                                                    <div className={styles.filterGroup}>
                                                        <label style={{ fontWeight: 'bold', color: '#333' }}>Tìm kiếm</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Tìm tên bác sĩ..."
                                                            className={styles.searchInput}
                                                            style={{ width: '300px', backgroundColor: 'white' }}
                                                            value={signerSearch}
                                                            onChange={(e) => { setSignerSearch(e.target.value); setSignerPage(1); }}
                                                        />
                                                    </div>
                                                    <div className={styles.filterGroup} style={{ marginLeft: '20px' }}>
                                                        <label style={{ fontWeight: 'bold', color: '#333' }}>Trạng thái</label>
                                                        <select
                                                            style={{ height: '36px', borderRadius: '4px', borderColor: '#ccc', padding: '0 10px' }}
                                                            value={signerStatusFilter}
                                                            onChange={(e) => { setSignerStatusFilter(e.target.value); setSignerPage(1); }}
                                                        >
                                                            <option value="Tất cả">Tất cả</option>
                                                            <option value="Đang hoạt động">Đang hoạt động</option>
                                                            <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                                                        </select>
                                                    </div>
                                                    <div className={styles.spacer}></div>
                                                    <button className={styles.addBtn} style={{ backgroundColor: '#0052cc', color: 'white' }} onClick={handleOpenSelectSigner}>Lựa chọn người ký</button>
                                                </div>

                                                {/* Bảng Người ký */}
                                                <div className={styles.tableContainer} style={{ marginTop: '15px' }}>
                                                    <table className={styles.dataTable}>
                                                        <thead>
                                                            <tr>
                                                                <th className={styles.textCenter} style={{ width: '50px' }}>STT</th>
                                                                <th style={{ textAlign: 'left', paddingLeft: '20px' }}>Tên bác sĩ</th>
                                                                <th style={{ textAlign: 'left', paddingLeft: '20px' }}>Khoa</th>
                                                                <th className={styles.textCenter}>Trạng thái</th>
                                                                <th className={styles.textCenter}>Tác vụ</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentSigners.length > 0 ? (
                                                                currentSigners.map((s, index) => (
                                                                    <tr key={s.id}>
                                                                        <td className={styles.textCenter}>{indexOfFirstSigner + index + 1}</td>
                                                                        <td className={styles.blueText} style={{ textAlign: 'left', paddingLeft: '20px', fontWeight: '500' }}>{s.name}</td>
                                                                        <td style={{ textAlign: 'left', paddingLeft: '20px' }}>{s.dept}</td>
                                                                        <td className={styles.textCenter}>
                                                                            <span style={{ color: s.status === 'Đang hoạt động' ? '#28a745' : '#dc3545', fontSize: '13px' }}>{s.status}</span>
                                                                        </td>
                                                                        <td className={styles.textCenter}>
                                                                            {/* --- (MỚI) NÚT SỬA TRẠNG THÁI --- */}
                                                                            <button
                                                                                className={styles.editBtn}
                                                                                style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', marginRight: '10px' }}
                                                                                onClick={() => handleOpenEditSigner(s)}
                                                                                title="Sửa trạng thái"
                                                                            >
                                                                                ✏️
                                                                            </button>


                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (<tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy dữ liệu</td></tr>)}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Phân trang Người ký */}
                                                {filteredSigners.length > 0 && (
                                                    <div className={styles.pagination}>
                                                        <span style={{ fontSize: '12px', color: '#666', marginRight: 'auto' }}>Tổng: <b>{filteredSigners.length}</b> bản ghi</span>
                                                        <button className={styles.pageBtn} onClick={() => setSignerPage(prev => Math.max(prev - 1, 1))} disabled={signerPage === 1}>&lt;</button>
                                                        {getPaginationGroup(signerPage, totalSignerPages).map((item, index) => (
                                                            <button key={index} className={`${styles.pageBtn} ${signerPage === item ? styles.active : ''} ${item === '...' ? styles.dots : ''}`} onClick={() => typeof item === 'number' && setSignerPage(item)} disabled={item === '...'}>{item}</button>
                                                        ))}
                                                        <button className={styles.pageBtn} onClick={() => setSignerPage(prev => Math.min(prev + 1, totalSignerPages))} disabled={signerPage === totalSignerPages}>&gt;</button>
                                                        <select className={styles.limitSelect} value={signerPerPage} onChange={(e) => { setSignerPerPage(Number(e.target.value)); setSignerPage(1); }}>
                                                            <option value={5}>5 / trang</option><option value={10}>10 / trang</option><option value={20}>20 / trang</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </>
                        ) :
                            (
                                // --- C. MẶC ĐỊNH: HỒ SƠ BỆNH ÁN (ĐÃ FIX CĂN TRÁI & GIỮ BỘ LỌC) ---
                                <>
                                    <div className={styles.controlPanel}>
                                        <div className={styles.tabsRow}>
                                            {tabs.map(tab => (
                                                <button
                                                    key={tab}
                                                    className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                                                    onClick={() => setActiveTab(tab)}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                        <div className={styles.processTabsRow}>
                                            {["Tất cả", "Hồ sơ chờ", "Hồ sơ điều trị", "Hồ sơ hoàn thành"].map((tab) => (
                                                <button
                                                    key={tab}
                                                    className={`${styles.processBtn} ${processTab === tab ? styles.active : ''}`}
                                                    onClick={() => setProcessTab(tab)}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>

                                        {/* --- BỘ LỌC (GIỮ NGUYÊN NHƯ CŨ) --- */}
                                        {/* --- BỘ LỌC (ĐÃ THÊM: TRẠNG THÁI & NĂM) --- */}
                                        <div className={styles.filterRow}>

                                            {/* 1. Lọc Ngày tạo (Cũ) */}
                                            <div className={styles.filterGroup}>
                                                <label>Ngày tạo</label>
                                                <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                                                    <option value="Tất cả">Tất cả</option>
                                                    {uniqueDates.map(date => <option key={date} value={date}>{date}</option>)}
                                                </select>
                                            </div>

                                            {/* 2. Lọc Trạng thái (MỚI) */}
                                            <div className={styles.filterGroup} style={{ marginLeft: '15px' }}>
                                                <label>Trạng thái</label>
                                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                                    <option value="Tất cả">Tất cả</option>
                                                    <option value="Lưu kho">Lưu kho</option>
                                                    <option value="Đang điều trị">Đang điều trị</option>
                                                    <option value="Hoàn thành">Hoàn thành</option>
                                                </select>
                                            </div>

                                            {/* 3. Lọc Năm (MỚI) */}
                                            <div className={styles.filterGroup} style={{ marginLeft: '15px' }}>
                                                <label>Năm</label>
                                                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                                    <option value="Tất cả">Tất cả</option>
                                                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>

                                            <div className={styles.spacer}></div>

                                            <div className={styles.actionGroup}>
                                                <input
                                                    type="text"
                                                    placeholder="Tìm kiếm..."
                                                    className={styles.searchInput}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <button className={styles.addBtn} onClick={() => setShowAddModal(true)}><span>⊕</span> Thêm hồ sơ</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- BẢNG DỮ LIỆU --- */}
                                    {/* --- BẢNG HỒ SƠ BỆNH ÁN (ĐÃ XÓA CỘT: Ghi chú, Số hồ sơ, Ngày/Người cập nhật) --- */}
                                    <div className={styles.tableContainer}>
                                        <table className={styles.dataTable}>
                                            <thead>
                                                <tr>
                                                    <th className={styles.textCenter} style={{ width: '50px' }}>STT</th>
                                                    <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Trạng thái</th>
                                                    <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Loại hồ sơ</th>
                                                    <th className={styles.textCenter}>Năm</th>
                                                    <th>Mã BN</th>
                                                    <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Họ tên</th>
                                                    <th className={styles.textCenter}>Giới tính</th>
                                                    <th className={styles.textCenter}>Ngày tạo</th>
                                                    <th>Người tạo</th>
                                                    <th className={styles.textCenter}>Tác vụ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentRecords.length > 0 ? (
                                                    currentRecords.map((row, index) => (
                                                        <tr key={row.id}>
                                                            <td className={styles.textCenter}>{index + 1}</td>

                                                            <td style={{ textAlign: 'left', paddingLeft: '10px' }}>
                                                                <span className={`${styles.statusBadge} ${row.status === 'Lưu kho' ? styles.red : styles.blue}`}>
                                                                    {row.status}
                                                                </span>
                                                            </td>

                                                            <td
                                                                className={styles.blueText}
                                                                style={{ cursor: 'pointer', textDecoration: 'underline', textAlign: 'left', paddingLeft: '10px' }}
                                                                onClick={() => handleRecordClick(row)}
                                                            >
                                                                {row.type}
                                                            </td>

                                                            <td className={styles.textCenter}>{row.year}</td>
                                                            <td>{row.pid}</td>
                                                            <td className={styles.boldText} style={{ textAlign: 'left', paddingLeft: '10px' }}>{row.name}</td>
                                                            <td className={styles.textCenter}>Nữ</td>
                                                            <td className={styles.textCenter}>{row.createdDate}</td>
                                                            <td>{row.creator}</td>
                                                            <td className={styles.textCenter}><button
                                                                className={styles.editBtn}
                                                                onClick={() => handleOpenStatusEdit(row)}
                                                                title="Sửa trạng thái"
                                                            >
                                                                ✏️
                                                            </button></td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy hồ sơ phù hợp</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination (GIỮ NGUYÊN) */}
                                    {filteredRecords.length > 0 && (
                                        <div className={styles.pagination}>
                                            <span style={{ fontSize: '12px', color: '#666', marginRight: 'auto' }}>
                                                Tổng: <b>{filteredRecords.length}</b> bản ghi
                                            </span>
                                            <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
                                            {getPaginationGroup(currentPage, totalPages).map((item, index) => (
                                                <button key={index} className={`${styles.pageBtn} ${currentPage === item ? styles.active : ''} ${item === '...' ? styles.dots : ''}`} onClick={() => typeof item === 'number' && handlePageChange(item)} disabled={item === '...'}>{item}</button>
                                            ))}
                                            <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
                                            <select className={styles.limitSelect} value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                                                <option value={5}>5 / trang</option>
                                                <option value={10}>10 / trang</option>
                                                <option value={20}>20 / trang</option>
                                                <option value={50}>50 / trang</option>
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}
                    </div>
                )}
            </main>

            {/* MODAL GIỮ NGUYÊN */}
            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.addModal}>
                        <div className={styles.modalHeader}><h3>{addStep === 1 ? "Thêm mới hồ sơ bệnh án" : "Xác nhận thông tin"}</h3></div>
                        <div className={styles.modalBody}>
                            {addStep === 1 ? (
                                <>
                                    {/* --- 2. GIAO DIỆN MODAL (ĐÃ THÊM HIỂN THỊ LỖI MÀU ĐỎ) --- */}
                                    <div className={styles.inputRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Mã bệnh nhân</label>
                                            <input
                                                type="text"
                                                name="patientCode"
                                                value={formInput.patientCode}
                                                onChange={handleInputChange}
                                                style={{ borderColor: formErrors.patientCode ? 'red' : '#ccc' }}
                                            />
                                            {/* Dòng này để hiện lỗi Mã BN */}
                                            {formErrors.patientCode && <span style={{ color: 'red', fontSize: '12px', fontStyle: 'italic' }}>{formErrors.patientCode}</span>}
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label>Năm hồ sơ</label>
                                            <input
                                                type="text"
                                                name="year"
                                                value={formInput.year}
                                                onChange={handleInputChange}
                                                style={{ borderColor: formErrors.year ? 'red' : '#ccc' }}
                                            />
                                            {/* Dòng này để hiện lỗi Năm */}
                                            {formErrors.year && <span style={{ color: 'red', fontSize: '12px', fontStyle: 'italic' }}>{formErrors.year}</span>}
                                        </div>
                                    </div>
                                    <table className={styles.typeTable}>
                                        <thead><tr><th>STT</th><th>Mã loại</th><th>Tên loại</th><th>Tác vụ</th></tr></thead>
                                        <tbody>{currentModalRecords.map((item) => (<tr key={item.stt}><td>{item.stt}</td><td>{item.code}</td><td>{item.name}</td><td><button className={styles.selectBtn} onClick={() => handleSelectType(item.code)}>Chọn</button></td></tr>))}</tbody>
                                    </table>
                                    <div className={styles.modalFooter}><button className={styles.cancelBtn} onClick={handleCloseModal}>Huỷ</button><button className={styles.saveBtn} onClick={handleNextStep}>Lưu</button></div>
                                </>
                            ) : (
                                // --- GIAO DIỆN BƯỚC 2: XÁC NHẬN (STYLE NGANG GIỐNG HÌNH 2) ---
                                <div className={styles.confirmStep} style={{ padding: '0 20px' }}>

                                    {/* 1. Logic tìm thông tin */}
                                    {(() => {
                                        const foundPatient = patientList.find(p => String(p.pid) === String(formInput.patientCode).trim()) || {
                                            name: "Không tìm thấy", pid: formInput.patientCode, gender: "", dob: "", phone: ""
                                        };

                                        return (
                                            <>
                                                {/* 2. Avatar tròn ở giữa */}
                                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '5px' }}>
                                                    <div style={{
                                                        width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: '2px solid white'
                                                    }}>
                                                        {/* Ảnh placeholder nữ bác sĩ/bệnh nhân */}
                                                        <img src="https://cdn-icons-png.flaticon.com/512/4228/4228721.png" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                </div>

                                                {/* 3. Form thông tin (Label trái - Input phải) */}
                                                <div className={styles.infoForm}>
                                                    {[
                                                        { label: "Mã bệnh nhân", value: foundPatient.pid },
                                                        { label: "Họ và tên", value: foundPatient.name },
                                                        { label: "Giới tính", value: foundPatient.gender },
                                                        { label: "Ngày sinh", value: foundPatient.dob },
                                                        { label: "Số điện thoại", value: foundPatient.phone }
                                                    ].map((field, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                            <label style={{
                                                                width: '130px', // Cố định chiều rộng nhãn
                                                                fontWeight: '500',
                                                                color: '#333',
                                                                fontSize: '14px',
                                                                textAlign: 'left'
                                                            }}>
                                                                {field.label}:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={field.value}
                                                                readOnly
                                                                style={{
                                                                    flex: 1, // Input chiếm phần còn lại
                                                                    padding: '8px 12px',
                                                                    backgroundColor: '#f5f5f5', // Màu nền xám nhạt như hình
                                                                    border: '1px solid #e0e0e0',
                                                                    borderRadius: '4px',
                                                                    color: '#555',
                                                                    fontSize: '14px',
                                                                    outline: 'none'
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* 4. Footer Buttons (Căn giữa) */}
                                                <div className={styles.confirmFooter} style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', marginBottom: '10px' }}>
                                                    <button
                                                        className={styles.backBtnRed}
                                                        onClick={handleBack}
                                                        style={{
                                                            backgroundColor: '#ff4d4f', color: 'white',
                                                            padding: '8px 30px', border: 'none', borderRadius: '4px',
                                                            fontWeight: '600', cursor: 'pointer', fontSize: '14px'
                                                        }}
                                                    >
                                                        Quay lại
                                                    </button>
                                                    <button
                                                        className={styles.addBtnBlue}
                                                        onClick={handleFinalAdd}
                                                        style={{
                                                            backgroundColor: '#1890ff', color: 'white',
                                                            padding: '8px 30px', border: 'none', borderRadius: '4px',
                                                            fontWeight: '600', cursor: 'pointer', fontSize: '14px'
                                                        }}
                                                    >
                                                        Thêm
                                                    </button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL KÝ SỐ (MỚI THÊM) --- */}
            {showSignModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.signModalContent}> {/* Class mới cho modal to hơn */}

                        {/* Header Modal */}
                        <div className={styles.signModalHeader}>
                            <div className={styles.signTabs}>
                                <div
                                    className={`${styles.signTabItem} ${signTab === "Danh sách ký phiếu" ? styles.active : ''}`}
                                    onClick={() => setSignTab("Danh sách ký phiếu")}
                                >
                                    Danh sách ký phiếu
                                </div>
                                <div
                                    className={`${styles.signTabItem} ${signTab === "Danh sách nhân viên" ? styles.active : ''}`}
                                    onClick={() => setSignTab("Danh sách nhân viên")}
                                >
                                    Danh sách nhân viên ký số
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setShowSignModal(false)}>×</button>
                        </div>

                        {/* Body Modal */}
                        <div className={styles.signModalBody}>

                            {/* TAB 1: DANH SÁCH KÝ PHIẾU */}
                            {signTab === "Danh sách ký phiếu" && (
                                <>
                                    <div className={styles.filterBar}>
                                        <h3>Danh sách bác sĩ ký phiếu</h3>
                                        <div className={styles.rightFilter}>
                                            <input type="text" placeholder="Tìm kiếm..." />
                                            <button className={styles.blueBtn}>Làm mới</button>
                                        </div>
                                    </div>
                                    <table className={styles.signTable}>
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Tên phiếu</th>
                                                <th>Số chữ ký</th>
                                                <th>Người đã ký</th>
                                                <th>Trình ký</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {signDocuments.map((doc, index) => (
                                                <tr key={index}>
                                                    <td style={{ textAlign: 'center' }}>{doc.stt}</td>
                                                    <td style={{ color: '#0052cc', fontWeight: 500 }}>{doc.name}</td>
                                                    <td style={{ textAlign: 'center' }}>{doc.count}</td>
                                                    <td>{doc.signedBy}</td>

                                                    {/* SỬA CỘT TRÌNH KÝ: Xử lý click vào "..." */}
                                                    {/* CỘT TRÌNH KÝ */}
                                                    <td style={{ whiteSpace: 'pre-line' }}>
                                                        {doc.progress.split('\n').map((line, lineIndex) => (
                                                            <div key={lineIndex} style={{ marginBottom: '4px' }}>
                                                                {/* Kiểm tra: Nếu dòng bắt đầu bằng "Ký", cho phép bấm vào để mở popup */}
                                                                {line.trim().startsWith("Ký") ? (
                                                                    <span
                                                                        className={styles.clickableLink}
                                                                        // Truyền đủ 3 tham số: index phiếu, index dòng, nội dung dòng
                                                                        onClick={() => handleOpenSignerPopup(index, lineIndex, line)}
                                                                        title="Bấm để chọn hoặc thay đổi người ký"
                                                                    >
                                                                        {line}
                                                                    </span>
                                                                ) : (
                                                                    line
                                                                )}
                                                            </div>
                                                        ))}
                                                    </td>

                                                    <td style={{ color: doc.statusColor === 'green' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                                        {doc.status}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* TAB 2: DANH SÁCH NHÂN VIÊN */}
                            {signTab === "Danh sách nhân viên" && (
                                <>
                                    <div className={styles.filterBar}>
                                        <h3>Danh sách nhân viên ký số</h3>
                                        {/* GẮN SỰ KIỆN MỞ MODAL QUẢN LÝ TẠI ĐÂY */}

                                    </div>
                                    <div className={styles.staffGrid}>
                                        {signStaffs.map((staff, idx) => (
                                            <div key={idx} className={styles.staffItem}>
                                                <div className={styles.avatarCircle}>👤</div>
                                                <span>{staff}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* --- POPUP LỰA CHỌN NGƯỜI KÝ (NẰM ĐÈ LÊN MODAL) --- */}
                    {/* --- POPUP LỰA CHỌN NGƯỜI KÝ --- */}
                    {showSignerPopup && (
                        <div className={styles.popupOverlay}>
                            <div className={styles.signerPopup}>
                                <div className={styles.popupHeader}>
                                    <h4>Lựa chọn người ký</h4>
                                    <button onClick={() => setShowSignerPopup(false)}>×</button>
                                </div>
                                <div className={styles.popupBody}>

                                    {/* BƯỚC 1: TÌM KIẾM & CHỌN (Hình 1 của yêu cầu mới) */}
                                    {popupStep === 1 && (
                                        <div className={styles.searchBox}>
                                            {/* INPUT LỌC */}
                                            <input
                                                type="text"
                                                placeholder="Nhập tên bác sĩ để tìm..."
                                                autoFocus
                                                value={filterText}
                                                onChange={(e) => setFilterText(e.target.value)}
                                            />
                                            <div className={styles.dropdownList}>
                                                {filteredDoctors.length > 0 ? (
                                                    filteredDoctors.map((doc, i) => (
                                                        <div
                                                            key={i}
                                                            className={styles.dropdownItem}
                                                            onClick={() => handleSelectSigner(doc)}
                                                        >
                                                            <div className={styles.avatarSmall}>👤</div>
                                                            <span>{doc}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ padding: '10px', color: '#999', textAlign: 'center' }}>Không tìm thấy bác sĩ</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* BƯỚC 2: XÁC NHẬN (Hình 3) */}
                                    {popupStep === 2 && (
                                        <div className={styles.confirmStep}>
                                            <div className={styles.selectedUser}>
                                                <input type="text" value={selectedSigner} readOnly />
                                                {/* Bấm X để quay lại bước 1 chọn người khác */}
                                                <span
                                                    className={styles.removeIcon}
                                                    onClick={() => { setPopupStep(1); setFilterText(""); }}
                                                    title="Chọn lại người khác"
                                                >
                                                    ✖
                                                </span>
                                            </div>

                                            <div className={styles.actionButtonsRow}>
                                                <button className={styles.btnRed} onClick={handleCancelSignature}>
                                                    Hủy trình ký
                                                </button>

                                                <button className={styles.btnWhite} onClick={() => setShowSignerPopup(false)}>
                                                    Huỷ (Thoát)
                                                </button>

                                                {/* NÚT ĐỒNG Ý: GỌI HÀM CẬP NHẬT */}
                                                <button className={styles.btnBlue} onClick={handleConfirmSigner}>
                                                    Đồng ý
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- MODAL QUẢN LÝ NHÂN VIÊN (THÊM/XÓA) --- */}
            {/* --- MODAL QUẢN LÝ NHÂN VIÊN (ĐÃ NÂNG CẤP DROPDOWN) --- */}
            {showManageStaffModal && (
                <div className={styles.modalOverlay} style={{ zIndex: 3000 }}>
                    <div className={styles.manageStaffModal}>
                        <div className={styles.modalHeader}>
                            <h3>QUẢN LÝ DANH SÁCH KÝ</h3>
                            <button className={styles.closeBtn} onClick={() => setShowManageStaffModal(false)}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* KHU VỰC TÌM VÀ THÊM (AUTOCOMPLETE) */}
                            <div className={styles.addStaffSection}>
                                <div className={styles.autocompleteWrapper}>
                                    <input
                                        type="text"
                                        placeholder="Nhập tên bác sĩ để tìm..."
                                        value={staffSearchTerm}
                                        onChange={(e) => {
                                            setStaffSearchTerm(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        // Xử lý khi bấm Enter thì chọn người đầu tiên
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && filteredCandidates.length > 0) {
                                                handleSelectCandidate(filteredCandidates[0]);
                                            }
                                        }}
                                    />

                                    {/* DROPDOWN GỢI Ý */}
                                    {showSuggestions && staffSearchTerm && (
                                        <div className={styles.suggestionsList}>
                                            {filteredCandidates.length > 0 ? (
                                                filteredCandidates.map((doc, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={styles.suggestionItem}
                                                        onClick={() => handleSelectCandidate(doc)}
                                                    >
                                                        <span className={styles.plusIcon}>+</span> {doc}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={styles.noResult}>Không tìm thấy nhân viên</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Nút thêm thủ công (Disable vì bắt buộc chọn từ list) */}
                                <button className={styles.btnAddSmall} disabled>Tìm & Chọn</button>
                            </div>

                            <div className={styles.divider}></div>

                            {/* DANH SÁCH ĐANG CÓ (GIỮ NGUYÊN) */}
                            <div className={styles.staffListScroll}>
                                {signStaffs.length > 0 ? (
                                    signStaffs.map((staff, index) => (
                                        <div key={index} className={styles.staffRowItem}>
                                            <div className={styles.staffInfo}>
                                                <div className={styles.avatarMini}>👤</div>
                                                <span>{staff}</span>
                                            </div>
                                            <button
                                                className={styles.btnDeleteIcon}
                                                onClick={() => handleRemoveStaff(index)}
                                                title="Xóa nhân viên này"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#999' }}>Danh sách trống</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.saveBtn} onClick={() => setShowManageStaffModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL THÊM BỆNH NHÂN MỚI (ĐÃ CHỈNH SỬA) --- */}
            {showPatientModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.patientModalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Thêm mới hồ sơ bệnh nhân</h3>
                            <button className={styles.closeBtn} onClick={() => setShowPatientModal(false)}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* Form chia 2 cột */}
                            <div className={styles.patientFormGrid}>

                                {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN (Bắt buộc để định danh) */}
                                <div className={styles.formSection}>
                                    <h4 className={styles.subTitle}>1. Thông tin cá nhân</h4>

                                    <div className={styles.formGroup}>
                                        <label>Họ và tên <span className={styles.req}>*</span></label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={newPatient.fullName}
                                            onChange={handlePatientInput}
                                            placeholder="VD: NGUYỄN VĂN A"
                                            className={patientErrors.fullName ? styles.inputError : ''}
                                            autoFocus
                                        />
                                        {patientErrors.fullName && <span className={styles.errMsg}>{patientErrors.fullName}</span>}
                                    </div>

                                    <div className={styles.row2}>
                                        <div className={styles.formGroup}>
                                            <label>Ngày sinh <span className={styles.req}>*</span></label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={newPatient.dob}
                                                onChange={handlePatientInput}
                                                className={patientErrors.dob ? styles.inputError : ''}
                                            />
                                            {patientErrors.dob && <span className={styles.errMsg}>{patientErrors.dob}</span>}
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Giới tính</label>
                                            <select name="gender" value={newPatient.gender} onChange={handlePatientInput}>
                                                <option value="1">Nam</option>
                                                <option value="0">Nữ</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Số điện thoại <span className={styles.req}>*</span></label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={newPatient.phone}
                                            onChange={handlePatientInput}
                                            placeholder="09xxxxxxx"
                                            className={patientErrors.phone ? styles.inputError : ''}
                                        />
                                        {patientErrors.phone && <span className={styles.errMsg}>{patientErrors.phone}</span>}
                                    </div>
                                </div>

                                {/* CỘT PHẢI: BẢO HIỂM & ĐỊA CHỈ (Thông tin bổ sung) */}
                                <div className={styles.formSection}>
                                    <h4 className={styles.subTitle}>2. Bảo hiểm & Liên hệ</h4>

                                    <div className={styles.formGroup}>
                                        <label>Số thẻ BHYT (Nếu có)</label>
                                        <input
                                            type="text"
                                            name="insuranceNumber"
                                            value={newPatient.insuranceNumber}
                                            onChange={handlePatientInput}
                                            placeholder="Mã thẻ BHYT..."
                                            className={patientErrors.insuranceNumber ? styles.inputError : ''}
                                        />
                                        {patientErrors.insuranceNumber && <span className={styles.errMsg}>{patientErrors.insuranceNumber}</span>}
                                    </div>

                                    {/* CHỈ GIỮ LẠI TỈNH/THÀNH PHỐ */}
                                    <div className={styles.formGroup}>
                                        <label>Tỉnh/Thành phố</label>
                                        <select
                                            name="province"
                                            value={newPatient.province}
                                            onChange={handlePatientInput}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">-- Chọn Tỉnh/Thành --</option>
                                            <option value="Hà Nội">Hà Nội</option>
                                            <option value="TP.HCM">TP.HCM</option>
                                            {uniqueProvinces.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phường/Xã</label>
                                        <select name="ward" value={newPatient.ward} onChange={handlePatientInput} style={{ width: '100%' }}>
                                            <option value="">-- Chọn Phường --</option>
                                            <option value="Phường 1">Phường 1</option>
                                            <option value="Phường 2">Phường 2</option>
                                        </select>
                                    </div>


                                </div>
                            </div>

                            {/* Ghi chú nhỏ bên dưới */}
                            <div className={styles.formNote}>
                                * Mã bệnh nhân sẽ được hệ thống tự động sinh sau khi lưu.
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowPatientModal(false)}>Hủy bỏ</button>
                            <button className={styles.saveBtn} onClick={handleCreatePatient}>
                                <span>💾</span> Lưu hồ sơ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL SỬA BỆNH NHÂN (EDIT) --- */}
            {showEditModal && editingPatient && (
                <div className={styles.modalOverlay}>
                    <div className={styles.patientModalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Cập nhật thông tin bệnh nhân</h3>
                            <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.patientFormGrid}>

                                {/* CỘT 1: THÔNG TIN ĐỊNH DANH (Khóa các trường không được sửa) */}
                                <div className={styles.formSection}>
                                    <h4 className={styles.subTitle}>1. Thông tin định danh</h4>

                                    <div className={styles.formGroup}>
                                        <label>Mã Bệnh Nhân (Không thể sửa)</label>
                                        <input type="text" value={editingPatient.pid} disabled className={styles.disabledInput} />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Họ và tên <span className={styles.req}>*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editingPatient.name}
                                            onChange={handleEditInput}
                                        />
                                    </div>

                                    <div className={styles.row2}>
                                        <div className={styles.formGroup}>
                                            <label>Ngày sinh (Không thể sửa)</label>
                                            <input type="date" value={editingPatient.dob} disabled className={styles.disabledInput} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Giới tính (Không thể sửa)</label>
                                            <select value={editingPatient.gender === "Nam" ? "1" : "0"} disabled className={styles.disabledInput}>
                                                <option value="1">Nam</option>
                                                <option value="0">Nữ</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Số điện thoại <span className={styles.req}>*</span></label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editingPatient.phone}
                                            onChange={handleEditInput}
                                        />
                                    </div>
                                </div>

                                {/* CỘT 2: ĐỊA CHỈ & KHÁC */}
                                <div className={styles.formSection}>
                                    <h4 className={styles.subTitle}>2. Địa chỉ & Liên hệ</h4>

                                    <div className={styles.formGroup}>
                                        <label>Email (Tùy chọn)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editingPatient.email || ""}
                                            onChange={handleEditInput}
                                            placeholder="example@gmail.com"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Tỉnh/Thành phố</label>
                                        <select name="province" value={editingPatient.province} onChange={handleEditInput} style={{ width: '100%' }}>
                                            <option value="Hà Nội">Hà Nội</option>
                                            <option value="TP.HCM">TP.HCM</option>
                                        </select>
                                    </div>

                                    {/* --- THÊM SELECT PHƯỜNG --- */}
                                    <div className={styles.formGroup}>
                                        <label>Phường/Xã</label>
                                        <select name="ward" value={editingPatient.ward} onChange={handleEditInput} style={{ width: '100%' }}>
                                            <option value="Phường 1">Phường 1</option>
                                            <option value="Phường 2">Phường 2</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Hủy bỏ</button>
                            <button className={styles.saveBtn} onClick={handleUpdatePatient}>
                                <span>💾</span> Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- POPUP HIỂN THỊ TỜ GIẤY (ĐÃ SỬA LOGIC HIỂN THỊ ĐÚNG LOẠI PHIẾU) --- */}
            {previewRecord && (() => {
                // 1. Xác định loại phiếu dựa trên ID (giống logic hiển thị ở bảng)
                const isClinicalExam = previewRecord.id % 2 === 0; // Chẵn là Phiếu khám bệnh
                const docTypeName = isClinicalExam ? "PHIẾU KHÁM LÂM SÀNG 1" : "PHIẾU XÉT NGHIỆM CÔNG THỨC MÁU";

                // 2. Chuẩn bị dữ liệu hiển thị (Mapping đầy đủ)
                const data = {
                    ...previewRecord, // Lấy tất cả thuộc tính có sẵn
                    name: previewRecord.name || "NGUYỄN VĂN A",
                    pid: previewRecord.pid || "1108657",
                    dob: previewRecord.dob || "01/01/1990",
                    age: previewRecord.age || 34,
                    gender: previewRecord.gender || "Nữ",
                    address: previewRecord.address || "Số 15, Đường 3/2, Q.10, TP.HCM",
                    diagnosis: previewRecord.diagnosis || "N21 CKK",

                    // Cập nhật tên loại phiếu để hiển thị trên Header Modal
                    type: docTypeName,

                    signer: previewRecord.signer || "Nguyễn Văn An",
                    signTime: previewRecord.signTime || "03/02/2026",
                    status: previewRecord.status || "Chưa ký"
                };

                return (
                    <div className={styles.modalOverlay} style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}>

                        {/* Khung ngoài Modal */}
                        <div style={{ width: '1000px', height: '95vh', background: '#525659', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                            {/* Header Modal */}
                            <div style={{ padding: '12px 20px', background: '#323639', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000' }}>
                                <div style={{ fontSize: '14px' }}>Đang xem: <b>{data.type}</b></div>
                                <button
                                    onClick={() => setPreviewRecord(null)}
                                    style={{ background: '#d63031', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ĐÓNG ✕
                                </button>
                            </div>

                            {/* Body Modal (Có thanh cuộn) */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', justifyContent: 'center', background: '#525659' }}>

                                {/* SỬA Ở ĐÂY: CHECK ĐIỀU KIỆN ĐỂ RENDER ĐÚNG FORM */}
                                {isClinicalExam ? renderClinicalExam(data) : renderCommonECG(data)}

                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* --- MODAL SỬA TRẠNG THÁI (CHỈ SỬA ĐƯỢC TRẠNG THÁI) --- */}
            {showStatusModal && editingStatusRecord && (
                <div className={styles.modalOverlay} style={{ zIndex: 4000 }}>
                    <div className={styles.addModal} style={{ width: '400px' }}> {/* Modal nhỏ */}
                        <div className={styles.modalHeader}>
                            <h3>Cập nhật trạng thái</h3>
                        </div>
                        <div className={styles.modalBody} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hồ sơ:</label>
                                <input type="text" value={editingStatusRecord.name} disabled style={{ width: '100%', background: '#f5f5f5', border: '1px solid #ddd', padding: '8px' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Trạng thái mới:</label>
                                <select
                                    value={tempStatus}
                                    onChange={(e) => setTempStatus(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Lưu kho">Lưu kho</option>
                                    <option value="Đang điều trị">Đang điều trị</option>
                                    <option value="Hoàn thành">Hoàn thành</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowStatusModal(false)}>Hủy bỏ</button>
                            <button className={styles.saveBtn} onClick={handleSaveStatusChange}>Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL LỰA CHỌN NGƯỜI KÝ (MỚI) --- */}
            {/* --- MODAL LỰA CHỌN NGƯỜI KÝ (ĐÃ SỬA: NHỎ HƠN, CĂN TRÁI, BỎ CỘT CHỨC VỤ, BỎ NÚT X) --- */}
            {showSelectSignerModal && (
                <div className={styles.modalOverlay} style={{ zIndex: 5000 }}>
                    {/* 1. Giảm width xuống 500px */}
                    <div className={styles.addModal} style={{ width: '500px', maxWidth: '90vw' }}>

                        <div className={styles.modalHeader}>
                            <h3>Thêm người ký vào danh sách</h3>
                            {/* 2. Đã xóa nút X ở đây */}
                        </div>

                        <div className={styles.modalBody} style={{ padding: '20px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>

                            {/* Thanh tìm kiếm */}
                            <div style={{ marginBottom: '15px', display: 'flex' }}>
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc khoa phòng..."
                                    className={styles.searchInput}
                                    style={{ width: '100%' }}
                                    value={sourceSearch}
                                    onChange={(e) => setSourceSearch(e.target.value)}
                                />
                            </div>

                            {/* Bảng danh sách nguồn */}
                            <div className={styles.tableContainer} style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee' }}>
                                <table className={styles.dataTable}>
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                        <tr>
                                            {/* Căn trái checkbox cho thẳng hàng nếu cần, hoặc để giữa cho đẹp */}
                                            <th style={{ width: '40px', textAlign: 'left', paddingLeft: '15px' }}>#</th>
                                            <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Họ tên nhân viên</th>
                                            <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Khoa/Phòng</th>
                                            {/* 3. Đã xóa cột Chức vụ */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            let candidates = allStaffSource.filter(s =>
                                                s.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
                                                s.dept.toLowerCase().includes(sourceSearch.toLowerCase())
                                            );

                                            if (candidates.length === 0) {
                                                // Sửa colSpan thành 3 vì bỏ 1 cột
                                                return <tr><td colSpan="3" style={{ textAlign: 'left', padding: '20px', paddingLeft: '15px', color: '#999' }}>Không tìm thấy nhân viên phù hợp</td></tr>
                                            }

                                            return candidates.map(staff => (
                                                <tr key={staff.id}
                                                    style={{ cursor: 'pointer', backgroundColor: tempSelectedIds.includes(staff.id) ? '#e6f7ff' : 'white' }}
                                                    onClick={() => handleToggleCandidate(staff.id)}
                                                >
                                                    <td style={{ textAlign: 'left', paddingLeft: '15px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={tempSelectedIds.includes(staff.id)}
                                                            onChange={() => handleToggleCandidate(staff.id)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                    <td style={{ fontWeight: '500', textAlign: 'left', paddingLeft: '10px' }}>{staff.name}</td>
                                                    <td style={{ textAlign: 'left', paddingLeft: '10px', color: '#666' }}>{staff.dept}</td>
                                                    {/* Đã xóa dòng render Chức vụ */}
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: '10px', fontSize: '13px', fontStyle: 'italic', color: '#666', textAlign: 'left' }}>
                                Đã chọn: <b>{tempSelectedIds.length}</b> nhân viên
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowSelectSignerModal(false)}>Hủy bỏ</button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleSaveSelectedSigners}
                                disabled={tempSelectedIds.length === 0}
                                style={{ opacity: tempSelectedIds.length === 0 ? 0.6 : 1 }}
                            >
                                <span style={{ marginRight: '5px' }}>⬇</span>
                                Thêm vào danh sách
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- (MỚI) MODAL SỬA TRẠNG THÁI NGƯỜI KÝ --- */}
            {showEditSignerModal && editingSigner && (
                <div className={styles.modalOverlay} style={{ zIndex: 6000 }}>
                    <div className={styles.addModal} style={{ width: '400px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Cập nhật trạng thái người ký</h3>

                        </div>
                        <div className={styles.modalBody} style={{ padding: '20px' }}>
                            {/* Hiển thị tên (Disable) */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', textAlign: 'left' }}>Tên bác sĩ:</label>
                                <input
                                    type="text"
                                    value={editingSigner.name}
                                    disabled
                                    style={{ width: '100%', background: '#f5f5f5', border: '1px solid #ddd', padding: '8px', color: '#666' }}
                                />
                            </div>

                            {/* Hiển thị khoa (Disable) */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', textAlign: 'left' }}>Khoa:</label>
                                <input
                                    type="text"
                                    value={editingSigner.dept || "---"}
                                    disabled
                                    style={{ width: '100%', background: '#f5f5f5', border: '1px solid #ddd', padding: '8px', color: '#666' }}
                                />
                            </div>

                            {/* Dropdown chọn trạng thái (Cho phép sửa) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Trạng thái:</label>
                                <select
                                    value={editingSigner.status}
                                    onChange={(e) => setEditingSigner({ ...editingSigner, status: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Đang hoạt động">Đang hoạt động</option>
                                    <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowEditSignerModal(false)}>Hủy bỏ</button>
                            <button className={styles.saveBtn} onClick={handleSaveSignerStatus}>Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL THÊM NHÂN VIÊN MỚI (CÓ CẢNH BÁO TRÙNG LẶP) --- */}
            {showAddEmpModal && (
                <div className={styles.modalOverlay} style={{ zIndex: 7000 }}>
                    <div className={styles.addModal} style={{ width: '850px', maxWidth: '95vw', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>

                        {/* Header */}
                        <div className={styles.modalHeader} style={{ background: '#0052cc', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', textTransform: 'uppercase', color: '#ffffff', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                Tiếp nhận nhân viên mới
                            </h3>
                            <button onClick={() => setShowAddEmpModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '24px', cursor: 'pointer', lineHeight: '1', opacity: 0.8 }}>×</button>
                        </div>

                        <div className={styles.modalBody} style={{ padding: '20px', backgroundColor: '#f5f7fa' }}>

                            {/* 1. KHUNG TÌM KIẾM */}
                            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e1e4e8' }}>
                                <label style={{ fontWeight: '600', color: '#333', fontSize: '14px', whiteSpace: 'nowrap' }}>ID Tài khoản:</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                    <input
                                        type="text"
                                        style={{ width: '550px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' }}
                                        placeholder="Nhập ID (VD: USER01)..."
                                        value={searchUserId}
                                        onChange={(e) => setSearchUserId(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSearchUser}
                                        style={{ background: '#0052cc', color: 'white', border: 'none', padding: '8px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' }}
                                    >
                                        Kiểm tra
                                    </button>
                                </div>
                            </div>

                            {/* 2. KẾT QUẢ TÌM KIẾM */}
                            {foundUser && (
                                <div className={styles.fadeIn}>

                                    {/* --- CẢNH BÁO TRÙNG LẶP (NẾU CÓ) --- */}
                                    {duplicateWarning && (
                                        <div style={{
                                            backgroundColor: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322',
                                            padding: '10px 15px', borderRadius: '6px', marginBottom: '15px',
                                            display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '14px'
                                        }}>
                                            <span>⚠️</span> {duplicateWarning}
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '15px', opacity: duplicateWarning ? 0.6 : 1, pointerEvents: duplicateWarning ? 'none' : 'auto' }}>

                                        {/* CỘT 1: THÔNG TIN CÁ NHÂN */}
                                        <div style={{ background: 'white', padding: '20px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e1e4e8' }}>
                                            <h4 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                                                👤 Thông tin cá nhân
                                            </h4>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
                                                {/* Sub-col Trái */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                        <span style={{ width: '100px', fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px', textAlign: 'left' }}>Họ và tên:</span>
                                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0052cc', textTransform: 'uppercase', flex: 1 }}>{foundUser.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                        <span style={{ width: '100px', fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px', textAlign: 'left' }}>Email:</span>
                                                        <span style={{ fontSize: '14px', color: '#333', flex: 1, wordBreak: 'break-all' }}>{foundUser.email}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                        <span style={{ width: '100px', fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px', textAlign: 'left' }}>SĐT:</span>
                                                        <span style={{ fontSize: '14px', color: '#333', flex: 1 }}>{foundUser.phone}</span>
                                                    </div>
                                                </div>

                                                {/* Sub-col Phải */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                        <span style={{ width: '90px', fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px' }}>Giới tính:</span>
                                                        <span style={{ fontSize: '14px', color: '#333', flex: 1 }}>{foundUser.gender}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                        <span style={{ width: '90px', fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px' }}>Ngày sinh:</span>
                                                        <span style={{ fontSize: '14px', color: '#333', flex: 1 }}>{formatDob(foundUser.dob)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CỘT 2: PHÂN CÔNG */}
                                        <div style={{ background: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e1e4e8', display: 'flex', flexDirection: 'column' }}>
                                            <h4 style={{ margin: '0 0 15px 0', color: '#0052cc', borderBottom: '1px solid #eee', paddingBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                                                ⚙️ Phân công công tác
                                            </h4>

                                            <div style={{ marginBottom: '15px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '5px', display: 'block', color: '#555' }}>Vai trò / Chức vụ <span style={{ color: 'red' }}>*</span></label>
                                                <select
                                                    disabled={!!duplicateWarning}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', fontSize: '13px', outline: 'none', color: '#333' }}
                                                    value={newEmpDetails.role}
                                                    onChange={(e) => setNewEmpDetails({ ...newEmpDetails, role: e.target.value })}
                                                >
                                                    <option value="Bác sĩ">Bác sĩ</option>
                                                    <option value="Y tá">Y tá</option>
                                                    <option value="Điều dưỡng">Điều dưỡng</option>
                                                    <option value="Trưởng khoa">Trưởng khoa</option>
                                                    <option value="Phó khoa">Phó khoa</option>
                                                    <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                                                    <option value="Kế toán">Kế toán</option>
                                                    <option value="Nhân viên">Nhân viên hành chính</option>
                                                </select>
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '5px', display: 'block', color: '#555' }}>Khoa / Phòng ban <span style={{ color: 'red' }}>*</span></label>
                                                <select
                                                    disabled={!!duplicateWarning}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', fontSize: '13px', outline: 'none', color: '#333' }}
                                                    value={newEmpDetails.dept}
                                                    onChange={(e) => setNewEmpDetails({ ...newEmpDetails, dept: e.target.value })}
                                                >
                                                    <option value="">-- Chọn Đơn vị --</option>
                                                    <option value="Khoa Nội">Khoa Nội</option>
                                                    <option value="Khoa Ngoại">Khoa Ngoại</option>
                                                    <option value="Khoa Sản">Khoa Sản</option>
                                                    <option value="Khoa Nhi">Khoa Nhi</option>
                                                    <option value="Khoa Cấp Cứu">Khoa Cấp Cứu</option>
                                                    <option value="Phòng Xét Nghiệm">Phòng Xét Nghiệm</option>
                                                    <option value="Phòng X-Quang">Phòng X-Quang</option>
                                                    <option value="Phòng Tài chính">Phòng Tài chính</option>
                                                    <option value="Phòng Hành chính">Phòng Hành chính</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className={styles.modalFooter} style={{ padding: '12px 20px', background: 'white', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setShowAddEmpModal(false)}
                                style={{ padding: '8px 25px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontWeight: '500', color: '#555', fontSize: '13px' }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleAddEmployeeToSystem}
                                disabled={!foundUser || !newEmpDetails.dept || !!duplicateWarning} // Disable nếu trùng
                                style={{
                                    padding: '8px 25px', borderRadius: '4px', border: 'none',
                                    background: (!foundUser || !newEmpDetails.dept || duplicateWarning) ? '#ccc' : '#0052cc',
                                    color: 'white', fontWeight: '600',
                                    cursor: (!foundUser || !newEmpDetails.dept || duplicateWarning) ? 'not-allowed' : 'pointer',
                                    fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px'
                                }}
                            >
                                <span>✔</span> Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL SỬA NHÂN VIÊN (CHỈ HIỆN VAI TRÒ - KHOA - TRẠNG THÁI) --- */}
            {showEditEmpModal && editingEmp && (
                <div className={styles.modalOverlay} style={{ zIndex: 8000 }}>
                    <div className={styles.addModal} style={{ width: '450px', borderRadius: '8px', overflow:'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                        
                        <div className={styles.modalHeader} style={{ background: '#0052cc', color: 'white', padding: '15px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', textTransform: 'uppercase', color:'white' }}>Cập nhật nhân viên</h3>
                            <button onClick={() => setShowEditEmpModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>

                        <div className={styles.modalBody} style={{ padding: '25px' }}>
                            
                            {/* Tiêu đề tên nhân viên (Để biết đang sửa ai) */}
                            <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px',textAlign:'left' }}>Đang chỉnh sửa cho:</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0052cc', textTransform: 'uppercase', textAlign:'left' }}>{editingEmp.name}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                
                                {/* 1. Sửa Vai trò */}
                                <div>
                                    <label style={{ fontWeight: '600', fontSize: '13px', display: 'block', marginBottom: '8px', color: '#333', textAlign:'left' }}>Vai trò / Chức vụ:</label>
                                    <select 
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                                        value={editingEmp.role}
                                        onChange={(e) => setEditingEmp({...editingEmp, role: e.target.value})}
                                    >
                                        <option value="Bác sĩ">Bác sĩ</option>
                                        <option value="Y tá">Y tá</option>
                                        <option value="Điều dưỡng">Điều dưỡng</option>
                                        <option value="Trưởng khoa">Trưởng khoa</option>
                                        <option value="Phó khoa">Phó khoa</option>
                                        <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                                        <option value="Kế toán">Kế toán</option>
                                        <option value="Nhân viên">Nhân viên hành chính</option>
                                    </select>
                                </div>

                                {/* 2. Sửa Khoa */}
                                <div>
                                    <label style={{ fontWeight: '600', fontSize: '13px', display: 'block', marginBottom: '8px', color: '#333', textAlign:'left' }}>Khoa / Phòng ban:</label>
                                    <select 
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                                        value={editingEmp.dept}
                                        onChange={(e) => setEditingEmp({...editingEmp, dept: e.target.value})}
                                    >
                                        <option value="Khoa Nội">Khoa Nội</option>
                                        <option value="Khoa Ngoại">Khoa Ngoại</option>
                                        <option value="Khoa Sản">Khoa Sản</option>
                                        <option value="Khoa Nhi">Khoa Nhi</option>
                                        <option value="Khoa Cấp Cứu">Khoa Cấp Cứu</option>
                                        <option value="Phòng Xét Nghiệm">Phòng Xét Nghiệm</option>
                                        <option value="Phòng X-Quang">Phòng X-Quang</option>
                                        <option value="Phòng Tài chính">Phòng Tài chính</option>
                                        <option value="Phòng Hành chính">Phòng Hành chính</option>
                                    </select>
                                </div>

                                {/* 3. Sửa Trạng thái */}
                                <div>
                                    <label style={{ fontWeight: '600', fontSize: '13px', display: 'block', marginBottom: '8px', color: '#333', textAlign:'left' }}>Trạng thái hoạt động:</label>
                                    <select 
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                                        value={editingEmp.status}
                                        onChange={(e) => setEditingEmp({...editingEmp, status: e.target.value})}
                                    >
                                        <option value="Đang hoạt động">Đang hoạt động</option>
                                        <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div className={styles.modalFooter} style={{ padding: '15px 25px', background: 'white', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button 
                                onClick={() => setShowEditEmpModal(false)}
                                style={{ padding: '8px 25px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', color: '#555', fontWeight:'500' }}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleSaveEmpChanges}
                                style={{ padding: '8px 25px', borderRadius: '4px', border: 'none', background: '#0052cc', color: 'white', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px' }}
                            >
                                <span>💾</span> Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ERM