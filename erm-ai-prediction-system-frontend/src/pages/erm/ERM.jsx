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
                pid: `11405${10 + i}`,
                insuranceNumber: i % 3 === 0 ? "" : `DN479${10000 + i}`,
                gender: i % 2 === 0 ? "Nam" : "Nữ",
                dob: `${(i % 28) + 1}/0${(i % 9) + 1}/${1980 + (i % 20)}`,
                phone: `090${1000000 + i}`,
                country: "Việt Nam",
                province: selectedProv.name,
                district: selectedProv.districts[distIndex],

                ward: selectedProv.wards[distIndex],
                isLocked: false // <--- THÊM TRƯỜNG NÀY: Mặc định là chưa khóa
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
        { stt: 1, name: "PHIẾU KIỂM TRA BỆNH ÁN (SẢN PHỤ KHOA)", count: "1/1", signedBy: "Nguyễn Văn An (System)", progress: "Ký 1: Nguyễn Văn An (System)", status: "Đã ký", statusColor: "green" },
        { stt: 2, name: "BỆNH ÁN SẢN PHỤ KHOA", count: "0/2", signedBy: "", progress: "Ký 1: Đoàn Thành Đồng\nKý 2: Bs Trịnh Văn Tam", status: "Chưa ký", statusColor: "red" },
        { stt: 3, name: "A-BỆNH ÁN SẢN PHỤ KHOA (TỜ 2)", count: "0/1", signedBy: "", progress: "Ký 1: Nguyễn Văn An (System)", status: "Chưa ký", statusColor: "red" },
        { stt: 4, name: "PHIẾU KHAI THÁC TIỀN SỬ 2", count: "0/1", signedBy: "", progress: "Ký 1: Nguyễn Văn An (System)", status: "Chưa ký", statusColor: "red" },
        { stt: 5, name: "TÓM TẮT THÔNG QUA PHẪU THUẬT...", count: "0/2", signedBy: "", progress: "Ký 1: Nguyễn Văn An (System)\nKý 2: ...", status: "Chưa ký", statusColor: "red" },
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

    // --- STATE PHÂN TRANG CHO KÝ SỐ (MỚI) ---
    const [currentSignPage, setCurrentSignPage] = useState(1);
    const [signPerPage, setSignPerPage] = useState(10); // Mặc định 10 dòng/trang

    // Logic tính toán cắt dữ liệu cho Ký số (để chỉ hiện 10 dòng)
    const indexOfLastSign = currentSignPage * signPerPage;
    const indexOfFirstSign = indexOfLastSign - signPerPage;
    const currentSignList = digitalSignList.slice(indexOfFirstSign, indexOfLastSign);
    const totalSignPages = Math.ceil(digitalSignList.length / signPerPage);


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

    const handleRemoveStaff = (index) => {
        if (window.confirm("Bạn chắc chắn muốn xóa nhân viên này khỏi danh sách ký?")) {
            const newList = [...signStaffs];
            newList.splice(index, 1);
            setSignStaffs(newList);
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

    const handleNextStep = () => {
        let errors = {}
        let isValid = true
        if (!formInput.patientCode.trim()) { errors.patientCode = "Vui lòng nhập mã bệnh nhân"; isValid = false }
        else { const isExist = allRecords.some(r => r.pid === formInput.patientCode.trim()); if (!isExist) { errors.patientCode = "Mã bệnh nhân không tồn tại!"; isValid = false } }
        const currentYear = new Date().getFullYear();
        const inputYear = parseInt(formInput.year, 10);
        if (!formInput.year.trim()) { errors.year = "Vui lòng nhập năm"; isValid = false; }
        else if (!/^\d{4}$/.test(formInput.year)) { errors.year = "Năm không hợp lệ"; isValid = false; }
        else if (inputYear < currentYear) { errors.year = `Năm hồ sơ phải từ ${currentYear} trở đi (tạo mới)`; isValid = false; }
        if (!selectedTypeCode) { alert("Vui lòng chọn loại hồ sơ!"); isValid = false }
        setFormErrors(errors); if (isValid) setAddStep(2)
    }

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

    const handleRecordClick = (record) => {
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
            { id: 6, title: "XÉT NGHIỆM (2)", hasArrow: true },
            { id: 7, title: "PHỤ KHOA - TẾ BÀO ÂM ĐẠO (1)", hasArrow: true },
            // MỤC ĐIỆN TIM -> Có con là Điện tâm đồ-1
            {
                id: 8, title: "ĐIỆN TIM (4)", hasArrow: true, children: [ // Đổi số lượng thành 4
                    { id: 81, title: "Điện tâm đồ-1" },
                    { id: 82, title: "Điện tâm đồ-2" }, // Thêm mới
                    { id: 83, title: "Điện tâm đồ-3" }, // Thêm mới
                    { id: 84, title: "Điện tâm đồ-4" }  // Thêm mới
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
                {/* Sử dụng class ecgPaper mới định nghĩa */}
                <div className={`${styles.paper} ${styles.ecgPaper}`}>

                    {/* 1. HEADER: Tiêu đề + Mã số */}
                    <div className={styles.ecgHeader}>
                        <h2>PHIẾU ĐIỆN TÂM ĐỒ</h2>
                        <div className={styles.ecgIdBox}>Mã số: 1108657</div>
                    </div>

                    {/* 2. THÔNG TIN HÀNH CHÍNH (Layout giống Hình 2) */}
                    <div className={styles.ecgInfo}>
                        {/* Dòng 1: Họ tên - Ngày sinh - Giới tính */}
                        <div className={`${styles.ecgRow} ${styles.spaced}`}>
                            <div>
                                <span className={styles.label}>Họ tên người bệnh:</span>
                                <span className={`${styles.value} ${styles.upper}`}>{data.name}</span>
                            </div>
                            <div>
                                <span className={styles.label}>Ngày sinh:</span>
                                <span className={styles.value}>{data.dob} ({data.age} tuổi)</span>
                            </div>
                            <div>
                                <span className={styles.label}>Giới tính:</span>
                                <span className={styles.value}>{data.gender}</span>
                            </div>
                        </div>

                        {/* Dòng 2: Địa chỉ */}
                        <div className={styles.ecgRow}>
                            <span className={styles.label}>Địa chỉ:</span>
                            <span className={styles.value}>Số 15, Đường 3/2, Q.10, TP.HCM</span>
                        </div>

                        {/* Dòng 3: Chẩn đoán */}
                        <div className={styles.ecgRow}>
                            <span className={styles.label}>Chẩn đoán:</span>
                            <span className={styles.value}>N21 CKK</span>
                        </div>

                        {/* Dòng 4: Ghi chú (để trống như hình mẫu) */}
                        <div className={styles.ecgRow}>
                            <span className={styles.label}>Ghi chú:</span>
                            <span className={styles.value}></span>
                        </div>

                        {/* Dòng 5: Sinh hiệu (Mạch, Nhiệt, HA) */}
                        <div className={styles.vitalsRow}>
                            <div>
                                <span className={styles.label}>Mạch:</span>
                                <span className={styles.value}>100</span> lần/phút
                            </div>
                            <div>
                                <span className={styles.label}>Nhiệt độ:</span>
                                <span className={styles.value}>37</span> <sup>o</sup>C
                            </div>
                            <div>
                                <span className={styles.label}>Huyết áp:</span>
                                <span className={styles.value}>103/71</span> mmHg
                            </div>
                        </div>
                    </div>

                    {/* 3. KẾT QUẢ CẬN LÂM SÀNG */}
                    <div className={styles.ecgResultSection}>
                        <div className={styles.sectionTitle}>Yêu cầu cận lâm sàng:</div>

                        {/* Grid chia 2 cột như Hình 2 */}
                        <div className={styles.resultGrid}>
                            {/* Cột Trái */}
                            <div className={styles.leftCol}>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>Nhịp:</span> <span className={styles.gridValue}>Xoang</span></div>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>Trục:</span> <span className={styles.gridValue}>Trung gian</span></div>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>P:</span> <span className={styles.gridValue}>0.08 s</span></div>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>QRS:</span> <span className={styles.gridValue}>0.08 s</span></div>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>ST:</span> <span className={styles.gridValue}>Đẳng điện</span></div>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>QT:</span> <span className={styles.gridValue}>0.36 s</span></div>
                            </div>

                            {/* Cột Phải */}
                            <div className={styles.rightCol}>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>Tần số:</span> <span className={styles.gridValue}>86 ck/p</span></div>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>Góc alpha:</span> <span className={styles.gridValue}>60 độ</span></div>
                                <div className={styles.gridItem}><span className={styles.gridLabel}>PQ:</span> <span className={styles.gridValue}>0.14 s</span></div>
                                {/* Các dòng trống để cân đối layout nếu cần */}
                                <div className={styles.gridItem}></div>
                            </div>
                        </div>
                    </div>

                    {/* 4. KẾT LUẬN */}
                    <div className={styles.ecgConclusion}>
                        <span className={styles.conclLabel}>KẾT LUẬN:</span>
                        <div className={styles.conclContent}>HIỆN TẠI ĐIỆN TÂM ĐỒ BÌNH THƯỜNG</div>
                    </div>

                    {/* 5. CHỮ KÝ SỐ */}
                    {/* 5. CHỮ KÝ SỐ (Đã căn chỉnh ngang hàng) */}
                    <div className={styles.ecgFooter} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>

                        {/* --- KHỐI BÊN TRÁI --- */}
                        <div className={styles.signBlock} style={{ textAlign: 'center', minWidth: '250px' }}>
                            {/* QUAN TRỌNG: Thêm div rỗng này để chiếm chỗ, giúp dòng BÁC SĨ ĐIỀU TRỊ bị đẩy xuống ngang với bên phải */}
                            <div style={{ height: '24px', marginBottom: '5px' }}></div>

                            <div className={styles.roleTitle} style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px' }}>
                                BÁC SĨ ĐIỀU TRỊ
                            </div>

                            {/* Nút Ký số (1) */}
                            <div style={{ marginTop: '60px' }}> {/* Khoảng cách xuống nút ký */}
                                <button className={styles.signBtn} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                    Ký số (1) 🖋️
                                </button>
                            </div>
                        </div>

                        {/* --- KHỐI BÊN PHẢI --- */}
                        <div className={styles.signBlock} style={{ textAlign: 'center', minWidth: '250px' }}>
                            {/* Dòng Ngày tháng */}
                            <div className={styles.dateText} style={{ fontStyle: 'italic', marginBottom: '5px', height: '24px' }}>
                                Hà Nội, Ngày 01 tháng 02 năm 2026
                            </div>

                            <div className={styles.roleTitle} style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px' }}>
                                PHỤ TRÁCH PHÒNG ĐIỆN TIM
                            </div>

                            {/* Nút Ký số (2) - Ngang hàng với (1) */}
                            <div style={{ marginTop: '60px' }}>
                                <button className={styles.signBtn} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                    Ký số (2) 🖋️
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
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

                                                    display: 'flex',          // Dùng flex
                                                    justifyContent: 'flex-start', // Căn bắt đầu từ trái
                                                    alignItems: 'center',     // Căn giữa theo chiều dọc
                                                    width: '100%',            // Chiếm hết chiều rộng
                                                    textAlign: 'left'         // Text căn trái
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
                        {/* SWITCH GIỮA BÌA VÀ ĐIỆN TIM DỰA TRÊN ID */}
                        {[81, 82, 83, 84].includes(activeMenuId) ? renderECGForm() : renderCoverPaper()}
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
                                <div className={styles.tableContainer}>
                                    <table className={styles.dataTable}>
                                        {/* Header & Body Bệnh nhân giữ nguyên */}
                                        <thead><tr><th className={styles.textCenter} style={{ width: '50px' }}>STT</th><th>Họ và tên</th><th>Mã BN</th><th>Mã BHYT</th><th className={styles.textCenter}>Giới tính</th><th className={styles.textCenter}>Ngày sinh</th><th>SĐT</th><th>Tỉnh/TP</th><th>Phường/Xã</th><th className={styles.textCenter}>Tác vụ</th></tr></thead>
                                        <tbody>
                                            {currentPatients.map((p, index) => (
                                                <tr key={p.id} className={p.isLocked ? styles.lockedRow : ''}>
                                                    <td className={styles.textCenter}>{indexOfFirstPatient + index + 1}</td>
                                                    <td className={styles.blueText} style={{ fontWeight: '600' }}>{p.name}</td>
                                                    <td>{p.pid}</td>
                                                    <td style={{ color: p.insuranceNumber ? '#28a745' : '#999', fontWeight: p.insuranceNumber ? '600' : 'normal' }}>{p.insuranceNumber || "---"}</td>
                                                    <td className={styles.textCenter}>{p.gender}</td>
                                                    <td className={styles.textCenter}>{p.dob}</td>
                                                    <td>{p.phone}</td>
                                                    <td>{p.province}</td>
                                                    <td>{p.ward}</td>
                                                    <td className={styles.textCenter}>
                                                        <div className={styles.actionButtons}>
                                                            {!p.isLocked ? (<><button className={styles.editBtn} onClick={() => handleOpenEditModal(p)}>✏️</button><button className={styles.lockBtn} onClick={() => handleToggleLock(p.id, true)}>🔒</button></>) : (<button className={styles.restoreBtn} onClick={() => handleToggleLock(p.id, false)}>♻️</button>)}
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
                            // --- B. GIAO DIỆN KÝ SỐ (ĐÃ SỬA HEADER GIỐNG HỒ SƠ BỆNH ÁN) ---
                            <>
                                <div className={styles.controlPanel}>
                                    {/* 1. Hàng Tabs Chính (Màu Xanh - Giống HSBA) */}
                                    {/* Bỏ style background gradient cũ đi để nhận style mặc định từ file CSS */}
                                    <div className={styles.tabsRow}>
                                        {["Tất cả", "Đã ký", "Chưa ký", "Phiếu trình ký", "Phiếu trình ký đã ký"].map(tab => (
                                            <button
                                                key={tab}
                                                // Sử dụng class tabBtn chuẩn để có màu xanh/trắng khi active
                                                className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                                                onClick={() => setActiveTab(tab)}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {/* 2. Hàng Tabs Phụ (Màu Xám - Giống HSBA) */}
                                    {/* Thêm hàng này để cấu trúc giống hệt hình mẫu, có thể để trống hoặc thêm bộ lọc trạng thái phụ */}
                                    <div className={styles.processTabsRow}>
                                        {["Tất cả", "Cấp cứu", "Nội trú", "Ngoại trú"].map((tab) => (
                                            <button
                                                key={tab}
                                                className={`${styles.processBtn} ${processTab === tab ? styles.active : ''}`}
                                                onClick={() => setProcessTab(tab)}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {/* 3. Hàng Bộ lọc (Filter Row) */}
                                    <div className={styles.filterRow}>
                                        <div className={styles.filterGroup}>
                                            <label>Loại hồ sơ</label>
                                            <select><option>Tất cả</option></select>
                                        </div>
                                        <div className={styles.filterGroup}>
                                            <label>Người ký</label>
                                            <select><option>Tất cả</option></select>
                                        </div>
                                        <div className={styles.filterGroup}>
                                            <label>Ngày tạo</label>
                                            <select><option>Tất cả</option></select>
                                        </div>

                                        <div className={styles.spacer}></div>

                                        <div className={styles.actionGroup}>
                                            <input type="text" placeholder="Tìm kiếm..." className={styles.searchInput} />
                                            {/* Nút tìm kiếm hoặc hành động khác nếu cần */}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.tableContainer}>
                                    <table className={styles.dataTable}>
                                        <thead>
                                            <tr>
                                                <th className={styles.textCenter} style={{ width: '50px' }}>STT</th>
                                                <th>Họ tên BN</th>
                                                <th className={styles.textCenter}>Số hồ sơ</th>
                                                <th>Tên phiếu</th>
                                                <th className={styles.textCenter}>Ngày tạo</th>
                                                <th>Loại phiếu</th>
                                                <th className={styles.textCenter}>Số chữ ký</th>
                                                <th>Người ký</th>
                                                <th className={styles.textCenter}>Thời gian ký</th>
                                                <th className={styles.textCenter}>Trạng thái</th>
                                                <th className={styles.textCenter}>Chi tiết</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentSignList.map((row) => (
                                                <tr key={row.id}>
                                                    <td className={styles.textCenter}>{row.stt}</td>
                                                    <td className={styles.blueText}>{row.name}</td>
                                                    <td className={styles.textCenter}>{row.fileNo}</td>
                                                    <td style={{ color: '#0052cc', fontWeight: 500 }}>{row.docName}</td>
                                                    <td className={styles.textCenter}>{row.createdDate}</td>
                                                    <td>{row.type}</td>
                                                    <td className={styles.textCenter} style={{ color: row.status === 'Đã ký' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>{row.signCount}</td>
                                                    <td>
                                                        {row.signer ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontSize: '11px', color: '#0052cc' }}>{row.signer}</span>
                                                            </div>
                                                        ) : ''}
                                                    </td>
                                                    <td className={styles.textCenter}>{row.signTime}</td>
                                                    <td className={styles.textCenter}>
                                                        <span className={styles.statusBadge} style={{
                                                            color: row.status === 'Đã ký' ? '#28a745' : '#dc3545',
                                                            backgroundColor: row.status === 'Đã ký' ? '#e6f4ea' : '#fce8e6',
                                                            border: `1px solid ${row.status === 'Đã ký' ? '#ceead6' : '#fad2cf'}`
                                                        }}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className={styles.textCenter}>
                                                        <a href="#" style={{ color: '#0052cc', textDecoration: 'underline', fontSize: '12px' }}>Xem hồ sơ</a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* --- PHÂN TRANG KÝ SỐ --- */}
                                {digitalSignList.length > 0 && (
                                    <div className={styles.pagination}>
                                        <button
                                            className={styles.pageBtn}
                                            onClick={() => setCurrentSignPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentSignPage === 1}
                                        >
                                            &lt;
                                        </button>

                                        {getPaginationGroup(currentSignPage, totalSignPages).map((item, index) => (
                                            <button
                                                key={index}
                                                className={`${styles.pageBtn} ${currentSignPage === item ? styles.active : ''} ${item === '...' ? styles.dots : ''}`}
                                                onClick={() => typeof item === 'number' && setCurrentSignPage(item)}
                                                disabled={item === '...'}
                                            >
                                                {item}
                                            </button>
                                        ))}

                                        <button
                                            className={styles.pageBtn}
                                            onClick={() => setCurrentSignPage(prev => Math.min(prev + 1, totalSignPages))}
                                            disabled={currentSignPage === totalSignPages}
                                        >
                                            &gt;
                                        </button>

                                        <select
                                            className={styles.limitSelect}
                                            value={signPerPage}
                                            onChange={(e) => {
                                                setSignPerPage(Number(e.target.value));
                                                setCurrentSignPage(1);
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
                        ) : (
                            // --- C. MẶC ĐỊNH: HỒ SƠ BỆNH ÁN (HÌNH 1 - CODE CŨ CỦA BẠN) ---
                            <>
                                <div className={styles.controlPanel}>
                                    <div className={styles.tabsRow}>{tabs.map(tab => <button key={tab} className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
                                    <div className={styles.processTabsRow}>{["Tất cả", "Hồ sơ chờ", "Hồ sơ điều trị", "Hồ sơ hoàn thành"].map((tab) => <button key={tab} className={`${styles.processBtn} ${processTab === tab ? styles.active : ''}`} onClick={() => setProcessTab(tab)}>{tab}</button>)}</div>
                                    <div className={styles.filterRow}>
                                        <div className={styles.filterGroup}><label>Ngày tạo</label><select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}><option value="Tất cả">Tất cả</option>{uniqueDates.map(date => <option key={date} value={date}>{date}</option>)}</select></div>
                                        <div className={styles.actionGroup}><input type="text" placeholder="Tìm kiếm..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><button className={styles.addBtn} onClick={() => setShowAddModal(true)}><span>⊕</span> Thêm hồ sơ</button></div>
                                    </div>
                                </div>
                                <div className={styles.tableContainer}>
                                    <table className={styles.dataTable}>
                                        <thead>
                                            <tr><th style={{ width: '50px' }}>STT</th><th>Ghi chú</th><th>Trạng thái</th><th>Số hồ sơ</th><th>Loại hồ sơ</th><th>Năm</th><th>Mã BN</th><th>Họ tên</th><th>Giới tính</th><th>Ngày tạo</th><th>Người tạo</th><th>Ngày cập nhật</th><th>Người cập nhật</th><th>Tác vụ</th></tr>
                                        </thead>
                                        <tbody>
                                            {currentRecords.map((row, index) => (
                                                <tr key={row.id}>
                                                    <td className={styles.textCenter}>{index + 1}</td>
                                                    <td>{row.note}</td>
                                                    <td><span className={`${styles.statusBadge} ${row.status === 'Lưu kho' ? styles.red : styles.blue}`}>{row.status}</span></td>
                                                    <td className={styles.textCenter}>{row.fileNo}</td>
                                                    <td className={styles.blueText} style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleRecordClick(row)}>{row.type}</td>
                                                    <td className={styles.textCenter}>{row.year}</td><td>{row.pid}</td><td className={styles.boldText}>{row.name}</td>
                                                    <td className={styles.textCenter}>Nữ</td><td className={styles.textCenter}>{row.createdDate}</td><td>{row.creator}</td><td className={styles.textCenter}>{row.updatedDate}</td><td>{row.updater}</td>
                                                    <td className={styles.textCenter}><button className={styles.actionBtn}>...</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination (Giữ nguyên) */}
                                {filteredRecords.length > 0 && (
                                    <div className={styles.pagination}>
                                        <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
                                        {getPaginationGroup(currentPage, totalPages).map((item, index) => (
                                            <button key={index} className={`${styles.pageBtn} ${currentPage === item ? styles.active : ''} ${item === '...' ? styles.dots : ''}`} onClick={() => typeof item === 'number' && handlePageChange(item)} disabled={item === '...'}>{item}</button>
                                        ))}
                                        <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
                                        <select className={styles.limitSelect} value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}><option value={5}>5 / trang</option><option value={10}>10 / trang</option><option value={20}>20 / trang</option><option value={50}>50 / trang</option></select>
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
                                    <div className={styles.inputRow}>
                                        <div className={styles.inputGroup}><label>Mã bệnh nhân</label><input type="text" name="patientCode" value={formInput.patientCode} onChange={handleInputChange} /></div>
                                        <div className={styles.inputGroup}><label>Năm hồ sơ</label><input type="text" name="year" value={formInput.year} onChange={handleInputChange} /></div>
                                    </div>
                                    <table className={styles.typeTable}>
                                        <thead><tr><th>STT</th><th>Mã loại</th><th>Tên loại</th><th>Tác vụ</th></tr></thead>
                                        <tbody>{currentModalRecords.map((item) => (<tr key={item.stt}><td>{item.stt}</td><td>{item.code}</td><td>{item.name}</td><td><button className={styles.selectBtn} onClick={() => handleSelectType(item.code)}>Chọn</button></td></tr>))}</tbody>
                                    </table>
                                    <div className={styles.modalFooter}><button className={styles.cancelBtn} onClick={handleCloseModal}>Huỷ</button><button className={styles.saveBtn} onClick={handleNextStep}>Lưu</button></div>
                                </>
                            ) : (
                                <div className={styles.confirmStep}>
                                    <div className={styles.infoForm}><label>Họ tên:</label><input readOnly value="VŨ THỊ THẢO" /></div>
                                    <div className={styles.confirmFooter}><button className={styles.backBtnRed} onClick={handleBack}>Quay lại</button><button className={styles.addBtnBlue} onClick={handleFinalAdd}>Thêm</button></div>
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
                                        <button
                                            className={styles.blueBtn}
                                            onClick={() => setShowManageStaffModal(true)}
                                        >
                                            Thêm/xóa nhân viên
                                        </button>
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
        </div>
    )
}

export default ERM