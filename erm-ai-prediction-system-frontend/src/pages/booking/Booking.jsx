"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./Booking.module.scss"

// --- DỮ LIỆU GIẢ LẬP (Mở rộng nhiều Tỉnh/Thành - Quận/Huyện - Phường/Xã) ---
const locations = {
  provinces: [
    { id: "01", name: "Thành phố Hà Nội" },
    { id: "79", name: "Thành phố Hồ Chí Minh" },
    { id: "48", name: "Thành phố Đà Nẵng" },
    { id: "31", name: "Thành phố Hải Phòng" },
    { id: "92", name: "Thành phố Cần Thơ" },
    { id: "61", name: "Tỉnh Bình Dương" },
    { id: "60", name: "Tỉnh Đồng Nai" },
    { id: "77", name: "Tỉnh Bà Rịa - Vũng Tàu" },
    { id: "56", name: "Tỉnh Khánh Hòa" },
    { id: "89", name: "Tỉnh An Giang" }
  ],
  districts: {
    // --- 1. HÀ NỘI (01) ---
    "01": [
      { id: "001", name: "Quận Ba Đình" },
      { id: "002", name: "Quận Hoàn Kiếm" },
      { id: "003", name: "Quận Tây Hồ" },
      { id: "004", name: "Quận Long Biên" },
      { id: "005", name: "Quận Cầu Giấy" },
      { id: "006", name: "Quận Đống Đa" },
      { id: "007", name: "Quận Hai Bà Trưng" },
      { id: "008", name: "Quận Hoàng Mai" },
      { id: "009", name: "Quận Thanh Xuân" }
    ],
    // --- 2. TP.HCM (79) ---
    "79": [
      { id: "760", name: "Quận 1" },
      { id: "770", name: "Quận 3" },
      { id: "773", name: "Quận 4" },
      { id: "774", name: "Quận 5" },
      { id: "775", name: "Quận 6" },
      { id: "778", name: "Quận 7" },
      { id: "771", name: "Quận 10" },
      { id: "765", name: "Quận Bình Thạnh" },
      { id: "766", name: "Quận Tân Bình" },
      { id: "768", name: "Quận Phú Nhuận" },
      { id: "769", name: "Thành phố Thủ Đức" }
    ],
    // --- 3. ĐÀ NẴNG (48) ---
    "48": [
      { id: "490", name: "Quận Hải Châu" },
      { id: "491", name: "Quận Thanh Khê" },
      { id: "492", name: "Quận Sơn Trà" },
      { id: "493", name: "Quận Ngũ Hành Sơn" },
      { id: "494", name: "Quận Liên Chiểu" }
    ],
    // --- 4. HẢI PHÒNG (31) ---
    "31": [
      { id: "303", name: "Quận Hồng Bàng" },
      { id: "304", name: "Quận Ngô Quyền" },
      { id: "305", name: "Quận Lê Chân" }
    ],
    // --- 5. CẦN THƠ (92) ---
    "92": [
      { id: "916", name: "Quận Ninh Kiều" },
      { id: "919", name: "Quận Cái Răng" }
    ],
    // --- 6. BÌNH DƯƠNG (61) ---
    "61": [
      { id: "611", name: "Thành phố Thủ Dầu Một" },
      { id: "612", name: "Thành phố Dĩ An" },
      { id: "613", name: "Thành phố Thuận An" }
    ],
    // --- 7. ĐỒNG NAI (60) ---
    "60": [
      { id: "583", name: "Thành phố Biên Hòa" },
      { id: "584", name: "Thành phố Long Khánh" }
    ],
    // --- 8. BÀ RỊA - VŨNG TÀU (77) ---
    "77": [
      { id: "747", name: "Thành phố Vũng Tàu" },
      { id: "748", name: "Thành phố Bà Rịa" }
    ],
    // --- 9. KHÁNH HÒA (56) ---
    "56": [
      { id: "568", name: "Thành phố Nha Trang" },
      { id: "569", name: "Thành phố Cam Ranh" }
    ],
    // --- 10. AN GIANG (89) ---
    "89": [
      { id: "883", name: "Thành phố Long Xuyên" },
      { id: "884", name: "Thành phố Châu Đốc" },
      { id: "892", name: "Huyện Châu Phú" }
    ]
  },
  wards: {
    // ================= HÀ NỘI =================
    "001": [ // Ba Đình
      { id: "00001", name: "Phường Phúc Xá" },
      { id: "00004", name: "Phường Trúc Bạch" },
      { id: "00006", name: "Phường Vĩnh Phúc" },
      { id: "00007", name: "Phường Cống Vị" },
      { id: "00008", name: "Phường Liễu Giai" },
      { id: "00031", name: "Phường Giảng Võ" }
    ],
    "002": [ // Hoàn Kiếm
      { id: "00037", name: "Phường Phúc Tân" },
      { id: "00040", name: "Phường Đồng Xuân" },
      { id: "00043", name: "Phường Hàng Mã" },
      { id: "00046", name: "Phường Hàng Buồm" },
      { id: "00049", name: "Phường Hàng Đào" },
      { id: "00052", name: "Phường Hàng Bồ" },
      { id: "00055", name: "Phường Cửa Đông" },
      { id: "00058", name: "Phường Lý Thái Tổ" },
      { id: "00061", name: "Phường Hàng Bạc" },
      { id: "00064", name: "Phường Hàng Gai" }
    ],
    "003": [ // Tây Hồ
      { id: "00115", name: "Phường Phú Thượng" },
      { id: "00118", name: "Phường Nhật Tân" },
      { id: "00121", name: "Phường Tứ Liên" },
      { id: "00124", name: "Phường Quảng An" },
      { id: "00127", name: "Phường Xuân La" }
    ],
    "006": [ // Đống Đa
      { id: "00223", name: "Phường Cát Linh" },
      { id: "00226", name: "Phường Văn Miếu" },
      { id: "00229", name: "Phường Quốc Tử Giám" },
      { id: "00232", name: "Phường Láng Thượng" },
      { id: "00235", name: "Phường Ô Chợ Dừa" },
      { id: "00238", name: "Phường Văn Chương" }
    ],
    "005": [ // Cầu Giấy
      { id: "00157", name: "Phường Nghĩa Đô" },
      { id: "00160", name: "Phường Nghĩa Tân" },
      { id: "00163", name: "Phường Mai Dịch" },
      { id: "00166", name: "Phường Dịch Vọng" },
      { id: "00167", name: "Phường Dịch Vọng Hậu" }
    ],

    // ================= TP.HCM =================
    "760": [ // Quận 1
      { id: "26734", name: "Phường Tân Định" },
      { id: "26737", name: "Phường Đa Kao" },
      { id: "26740", name: "Phường Bến Nghé" },
      { id: "26743", name: "Phường Bến Thành" },
      { id: "26746", name: "Phường Nguyễn Thái Bình" },
      { id: "26749", name: "Phường Phạm Ngũ Lão" },
      { id: "26752", name: "Phường Cầu Ông Lãnh" },
      { id: "26755", name: "Phường Cô Giang" },
      { id: "26758", name: "Phường Nguyễn Cư Trinh" },
      { id: "26761", name: "Phường Cầu Kho" }
    ],
    "770": [ // Quận 3
      { id: "27144", name: "Phường 1" },
      { id: "27147", name: "Phường 2" },
      { id: "27150", name: "Phường 3" },
      { id: "27153", name: "Phường 4" },
      { id: "27156", name: "Phường Võ Thị Sáu" },
      { id: "27159", name: "Phường 9" },
      { id: "27162", name: "Phường 10" }
    ],
    "778": [ // Quận 7
      { id: "27463", name: "Phường Tân Thuận Đông" },
      { id: "27466", name: "Phường Tân Thuận Tây" },
      { id: "27469", name: "Phường Tân Kiểng" },
      { id: "27472", name: "Phường Tân Hưng" },
      { id: "27475", name: "Phường Bình Thuận" },
      { id: "27478", name: "Phường Tân Quy" },
      { id: "27481", name: "Phường Phú Thuận" },
      { id: "27484", name: "Phường Tân Phú" },
      { id: "27487", name: "Phường Tân Phong" },
      { id: "27490", name: "Phường Phú Mỹ" }
    ],
    "769": [ // Thủ Đức
      { id: "26839", name: "Phường Linh Xuân" },
      { id: "26842", name: "Phường Bình Chiểu" },
      { id: "26845", name: "Phường Linh Trung" },
      { id: "26848", name: "Phường Tam Bình" },
      { id: "26851", name: "Phường Tam Phú" },
      { id: "26854", name: "Phường Hiệp Bình Phước" },
      { id: "26857", name: "Phường Hiệp Bình Chánh" },
      { id: "26860", name: "Phường Linh Chiểu" },
      { id: "26863", name: "Phường Linh Tây" },
      { id: "26866", name: "Phường Linh Đông" },
      { id: "26869", name: "Phường Trường Thọ" },
      { id: "26872", name: "Phường Bình Thọ" }
    ],
    
    // ================= ĐÀ NẴNG =================
    "490": [ // Hải Châu
      { id: "20194", name: "Phường Hải Châu I" },
      { id: "20197", name: "Phường Hải Châu II" },
      { id: "20200", name: "Phường Thạch Thang" },
      { id: "20203", name: "Phường Thuận Phước" },
      { id: "20206", name: "Phường Bình Hiên" },
      { id: "20209", name: "Phường Hòa Cường Bắc" },
      { id: "20212", name: "Phường Hòa Cường Nam" }
    ],
    "491": [ // Thanh Khê
      { id: "20257", name: "Phường Tam Thuận" },
      { id: "20260", name: "Phường Thanh Khê Tây" },
      { id: "20263", name: "Phường Thanh Khê Đông" },
      { id: "20266", name: "Phường Xuân Hà" },
      { id: "20269", name: "Phường Tân Chính" },
      { id: "20272", name: "Phường Chính Gián" }
    ],
    "492": [ // Sơn Trà
      { id: "20224", name: "Phường Thọ Quang" },
      { id: "20227", name: "Phường Nại Hiên Đông" },
      { id: "20230", name: "Phường Mân Thái" },
      { id: "20233", name: "Phường An Hải Bắc" },
      { id: "20236", name: "Phường Phước Mỹ" },
      { id: "20239", name: "Phường An Hải Tây" }
    ],

    // ================= HẢI PHÒNG =================
    "303": [ // Hồng Bàng
      { id: "10714", name: "Phường Quán Toan" },
      { id: "10717", name: "Phường Hùng Vương" },
      { id: "10720", name: "Phường Sở Dầu" },
      { id: "10723", name: "Phường Thượng Lý" }
    ],

    // ================= CẦN THƠ =================
    "916": [ // Ninh Kiều
      { id: "31093", name: "Phường Cái Khế" },
      { id: "31096", name: "Phường An Hòa" },
      { id: "31099", name: "Phường Thới Bình" },
      { id: "31102", name: "Phường An Nghiệp" },
      { id: "31105", name: "Phường An Cư" }
    ],

    // ================= BÌNH DƯƠNG =================
    "611": [ // Thủ Dầu Một
      { id: "24418", name: "Phường Hiệp Thành" },
      { id: "24421", name: "Phường Phú Lợi" },
      { id: "24424", name: "Phường Phú Cường" },
      { id: "24427", name: "Phường Phú Hòa" },
      { id: "24430", name: "Phường Phú Thọ" },
      { id: "24433", name: "Phường Chánh Nghĩa" }
    ],
    "612": [ // Dĩ An
      { id: "24610", name: "Phường Dĩ An" },
      { id: "24613", name: "Phường Tân Bình" },
      { id: "24616", name: "Phường Tân Đông Hiệp" },
      { id: "24619", name: "Phường Bình An" },
      { id: "24622", name: "Phường Bình Thắng" },
      { id: "24625", name: "Phường Đông Hòa" },
      { id: "24628", name: "Phường An Bình" }
    ],

    // ================= ĐỒNG NAI =================
    "583": [ // Biên Hòa
      { id: "23569", name: "Phường Trảng Dài" },
      { id: "23572", name: "Phường Tân Phong" },
      { id: "23575", name: "Phường Tân Biên" },
      { id: "23578", name: "Phường Hố Nai" }
    ],

    // ================= BÀ RỊA - VŨNG TÀU =================
    "747": [ // Vũng Tàu
      { id: "26470", name: "Phường 1" },
      { id: "26473", name: "Phường 2" },
      { id: "26476", name: "Phường 3" },
      { id: "26479", name: "Phường 4" },
      { id: "26482", name: "Phường 5" },
      { id: "26485", name: "Phường Thắng Nhì" }
    ],

    // ================= KHÁNH HÒA =================
    "568": [ // Nha Trang
      { id: "22345", name: "Phường Vĩnh Hải" },
      { id: "22348", name: "Phường Vĩnh Phước" },
      { id: "22351", name: "Phường Vĩnh Thọ" },
      { id: "22354", name: "Phường Xương Huân" },
      { id: "22357", name: "Phường Vạn Thắng" },
      { id: "22360", name: "Phường Vạn Thạnh" },
      { id: "22363", name: "Phường Phương Sài" },
      { id: "22366", name: "Phường Phương Sơn" },
      { id: "22369", name: "Phường Ngọc Hiệp" },
      { id: "22372", name: "Phường Phước Hòa" },
      { id: "22375", name: "Phường Phước Tân" },
      { id: "22378", name: "Phường Phước Tiến" },
      { id: "22381", name: "Phường Phước Hải" },
      { id: "22384", name: "Phường Lộc Thọ" },
      { id: "22387", name: "Phường Tân Lập" },
      { id: "22390", name: "Phường Xuan Huân" },
      { id: "22393", name: "Phường Vĩnh Trường" },
      { id: "22396", name: "Phường Phước Long" },
      { id: "22399", name: "Phường Vĩnh Nguyên" }
    ],

    // ================= AN GIANG =================
    "883": [ // Long Xuyên
      { id: "30280", name: "Phường Mỹ Bình" },
      { id: "30283", name: "Phường Mỹ Long" },
      { id: "30286", name: "Phường Đông Xuyên" },
      { id: "30289", name: "Phường Mỹ Xuyên" },
      { id: "30292", name: "Phường Bình Đức" },
      { id: "30295", name: "Phường Bình Khánh" },
      { id: "30298", name: "Phường Mỹ Phước" },
      { id: "30301", name: "Phường Mỹ Quý" },
      { id: "30304", name: "Phường Mỹ Thới" },
      { id: "30307", name: "Phường Mỹ Thạnh" },
      { id: "30310", name: "Phường Mỹ Hòa" }
    ],
    "892": [ // Châu Phú
      { id: "30520", name: "Thị trấn Cái Dầu" },
      { id: "30523", name: "Xã Khánh Hòa" },
      { id: "30526", name: "Xã Mỹ Đức" },
      { id: "30529", name: "Xã Mỹ Phú" },
      { id: "30532", name: "Xã Ô Long Vỹ" },
      { id: "30535", name: "Xã Vĩnh Thạnh Trung" },
      { id: "30538", name: "Xã Thạnh Mỹ Tây" },
      { id: "30541", name: "Xã Bình Long" },
      { id: "30544", name: "Xã Bình Mỹ" },
      { id: "30547", name: "Xã Bình Thủy" },
      { id: "30550", name: "Xã Bình Chánh" },
      { id: "30553", name: "Xã Bình Phú" },
      { id: "30556", name: "Xã Đào Hữu Cảnh" }
    ]
  }
}

const specialties = [
  { id: 1, name: "BỆNH LÝ CỘT SỐNG", price: "150.000đ", note: "" },
  { id: 2, name: "CHĂM SÓC GIẢM NHẸ", price: "150.000đ", note: "(Chỉ nhận người bệnh tái khám hoặc được giới thiệu khám bởi BS Chuyên khoa)" },
  { id: 3, name: "DA LIỄU", price: "150.000đ", note: "(Chỉ nhận người bệnh từ 3 tuổi)" },
  { id: 4, name: "ĐAU MẠN TÍNH", price: "150.000đ", note: "(Chỉ nhận người bệnh từ 15 tuổi)" },
  { id: 5, name: "DỊ ỨNG - MIỄN DỊCH LÂM SÀNG", price: "150.000đ", note: "" },
  { id: 6, name: "GHÉP GAN NHI", price: "150.000đ", note: "(Chỉ nhận người bệnh tái khám...)" }
]

const Booking = () => {
  const navigate = useNavigate()
  
  // --- STATE QUẢN LÝ ---
  const [step, setStep] = useState(1) // 1: List, 2: Create, 3: Specialty, 4: Date
  const [selectedSpecialty, setSelectedSpecialty] = useState(null) // State lưu chuyên khoa đã chọn
  const [selectedDate, setSelectedDate] = useState(null) // Lưu ngày đã chọn
  const [selectedTime, setSelectedTime] = useState(null) // Lưu giờ đã chọn
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showHistoryPopup, setShowHistoryPopup] = useState(false)
  const [showMethodPopup, setShowMethodPopup] = useState(false)
  const [isGuarantee, setIsGuarantee] = useState(false)
  const [bookingList, setBookingList] = useState([])
  /* --- XỬ LÝ XÓA ĐẶT KHÁM (CÓ XÁC NHẬN) --- */
  const handleDeleteBooking = () => {
    // 1. Hiện thông báo xác nhận
    const isConfirmed = window.confirm("Bạn có chắc muốn xóa Chuyên khoa đã đặt không?")

    // 2. Nếu người dùng bấm OK (True) thì mới thực hiện xóa
    if (isConfirmed) {
      // Reset toàn bộ dữ liệu về null/false
      setSelectedSpecialty(null)
      setSelectedDate(null)
      setSelectedTime(null)
      setSelectedDoctor(null)
      setIsGuarantee(false) // hoặc null tùy vào cách bạn khởi tạo lúc đầu

      // Quay về trang Menu tiến trình (Step 4)
      setStep(4)
    }
    // Nếu bấm Cancel thì không làm gì cả
  }
  /* --- THÊM HÀM NÀY VÀO --- */
  /* --- XỬ LÝ CHUYỂN BƯỚC TỪ 7 SANG 8 --- */
  const handleContinue = () => {
    // Kiểm tra logic bảo lãnh nếu cần
    if (isGuarantee === false || isGuarantee === true) {
       setStep(8) // Chuyển sang trang Kết quả (Step 8)
    } else {
       alert("Vui lòng chọn Bảo lãnh viện phí!")
    }
  }
  const [profiles, setProfiles] = useState([
    { id: 1, name: "Nguyễn Khánh Hà", code: "W25-0632960", phone: "084****368", avatar: "H" },
    { id: 2, name: "Trần Văn An", code: "W25-0632961", phone: "091****123", avatar: "A" }
  ])

const [formData, setFormData] = useState({
    fullName: "", // Thay lastName, firstName bằng fullName
    phone: "",
    email: "",
    // Đã xóa cccd
    dob: "",
    gender: "male",
    job: "",
    nation: "Kinh"
  })

  const [address, setAddress] = useState({
    province: "", district: "", ward: "", street: ""
  })

  // --- LOGIC XỬ LÝ ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // --- THÊM CODE MỚI TẠI ĐÂY ---
 const handleDateSelect = (dateString) => {
    // --- LOGIC MỚI: Nếu chọn ngày khác ngày đang lưu, thì reset giờ và bác sĩ
    if (selectedDate !== dateString) {
      setSelectedTime(null)   // Reset giờ
      setSelectedDoctor(null) // Reset bác sĩ
    }
    // --------------------------------------------------------------------

    setSelectedDate(dateString) // Lưu ngày mới
    setStep(6) // Chuyển sang bước 6: Chọn giờ
  }

  const handleAddressChange = (field, value) => {
    setAddress(prev => {
      const newAddr = { ...prev, [field]: value }
      if (field === 'province') { newAddr.district = ""; newAddr.ward = ""; }
      if (field === 'district') { newAddr.ward = ""; }
      return newAddr
    })
  }

  const handleAddNewProfile = () => setShowHistoryPopup(true)

  const handlePopupSelection = (type) => {
    setShowHistoryPopup(false)
if (type === 'new') {
      setStep(2)
      // SỬA: Reset theo state mới
      setFormData({ fullName: "", phone: "", email: "", dob: "", gender: "male", job: "", nation: "Kinh" })
      setAddress({ province: "", district: "", ward: "", street: "" })
    } else {
      alert("Chức năng nhập mã cũ đang phát triển")
    }
  }

const handleSaveProfile = () => {
    // SỬA: Kiểm tra fullName thay vì firstName
    if (!formData.fullName || !formData.phone) {
      alert("Vui lòng nhập họ tên và số điện thoại!");
      return;
    }
    const newProfile = {
      id: Date.now(),
      // SỬA: Dùng trực tiếp fullName
      name: formData.fullName, 
      code: `W25-${Math.floor(100000 + Math.random() * 900000)}`,
      phone: formData.phone,
      // SỬA: Lấy chữ cái đầu của fullName
      avatar: formData.fullName.charAt(0).toUpperCase()
    }
    setProfiles([...profiles, newProfile])
    setStep(1)
    alert("🎉 Tạo hồ sơ thành công! Vui lòng chọn hồ sơ vừa tạo để đặt khám.")
  }
  const handleSelectProfile = (profile) => {
    setShowMethodPopup(true)
  }

const handleMethodSelect = (type) => {
    setShowMethodPopup(false)
    
    // --- RESET DỮ LIỆU ---
    setSelectedSpecialty(null)
    setSelectedDate(null)
    setSelectedTime(null) 
    setSelectedDoctor(null)
    setIsGuarantee(false) // Reset bảo lãnh về "Không"
    // --------------------

    if (type === 'specialty') {
      setStep(3) 
    } else {
      alert("Chức năng đang phát triển")
    }
  }

const handleSpecialtySelect = (spec) => {
    // --- THÊM LOGIC KIỂM TRA VÀ RESET ---
    // Nếu chuyên khoa mới khác chuyên khoa đã chọn trước đó (dựa vào id)
    if (selectedSpecialty?.id !== spec.id) {
      setSelectedDate(null) // Reset ngày
      setSelectedTime(null) // Reset giờ
      setSelectedDoctor(null)
    }
    // ------------------------------------

    setSelectedSpecialty(spec)
    setStep(4) // Chuyển sang bước 4: Trang Tổng Quan
  }

  /* --- THÊM HÀM NÀY VÀO DƯỚI handleDateSelect --- */
/* --- SỬA HÀM NÀY --- */
  const handleTimeSelect = (time, doctorName) => {
    setSelectedTime(time)         
    setSelectedDoctor(doctorName) 
    setStep(7) // <--- ĐỔI TỪ 4 THÀNH 7 (Chuyển sang trang Xác nhận/Bảo hiểm)
  }

 /* --- 1. XỬ LÝ KHI BẤM "TIẾP TỤC" Ở STEP 7 (LƯU VÀO DANH SÁCH) --- */
  const handleConfirmBooking = () => {
    // 1. Kiểm tra Bảo lãnh viện phí (Bắt buộc chọn Có hoặc Không)
    if (isGuarantee !== true && isGuarantee !== false) {
       alert("Vui lòng chọn Bảo lãnh viện phí!")
       return;
    }

    // 2. CHECK TRÙNG CHUYÊN KHOA
    // Quét qua danh sách đã đặt (bookingList), xem có item nào trùng ID chuyên khoa với cái đang chọn không
    const isSpecialtyDuplicate = bookingList.some(
      item => item.specialty.id === selectedSpecialty.id
    );

    if (isSpecialtyDuplicate) {
      alert(`Bạn đã đặt chuyên khoa "${selectedSpecialty.name}" rồi. Vui lòng chọn chuyên khoa khác!`);
      // Sau khi báo lỗi, có thể chọn quay về bước chọn chuyên khoa để khách chọn lại ngay
      setStep(3); 
      return; // Dừng hàm, không thực hiện lưu
    }

    // 3. CHECK TRÙNG GIỜ KHÁM TRONG CÙNG NGÀY
    // Tìm xem có item nào trùng cả Ngày (date) VÀ Giờ (time) không
    // (Chấp nhận trùng ngày nhưng khác giờ, hoặc trùng giờ nhưng khác ngày)
    const isTimeDuplicate = bookingList.some(
      item => item.date === selectedDate && item.time === selectedTime
    );

    if (isTimeDuplicate) {
      alert(`Khung giờ ${selectedTime} ngày ${selectedDate} đã được đặt cho chuyên khoa khác. Vui lòng chọn giờ khác!`);
      // Quay về bước chọn giờ để khách chọn lại
      setStep(6);
      return; // Dừng hàm
    }

    // --- NẾU KHÔNG CÓ LỖI THÌ MỚI THỰC HIỆN THÊM MỚI ---

    // Tạo gói tin chứa thông tin vừa chọn
    const newBookingItem = {
      id: Date.now(),
      specialty: selectedSpecialty,
      date: selectedDate,
      time: selectedTime,
      doctor: selectedDoctor,
      guarantee: isGuarantee,
      price: 150000
    }

    // Thêm gói mới vào danh sách hiện có
    setBookingList([...bookingList, newBookingItem])

    // Reset dữ liệu tạm
    setSelectedSpecialty(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedDoctor(null)
    setIsGuarantee(false)

    // Chuyển sang trang Kết quả (Step 8)
    setStep(8)
  }

  const handleAddMore = () => {
    // Quay lại bước 3 để chọn cái mới
    // Vì ở hàm trên mình đã Reset dữ liệu rồi, nên quay lại nó sẽ trắng trơn
    setStep(3)
  }

  const handleRemoveItem = (idToRemove) => {
    const isConfirmed = window.confirm("Bạn có chắc muốn xóa chuyên khoa này không?")
    if (isConfirmed) {
      // Giữ lại những cái KHÔNG trùng ID (nghĩa là xóa cái trùng ID)
      const newList = bookingList.filter(item => item.id !== idToRemove)
      setBookingList(newList)

      // Nếu xóa hết sạch thì quay về màn hình chọn ban đầu (Step 4)
      if (newList.length === 0) {
        setStep(4)
      }
    }
  }
  // --- GIAO DIỆN JSX ---
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo} onClick={() => navigate("/patient")}>
              <div className={styles.logoIcon}><span className={styles.heartBeat}>❤️</span></div>
              <div className={styles.logoText}><h1>HealthCare</h1><p>Chăm sóc sức khỏe toàn diện</p></div>
            </div>
            <div className={styles.greeting}><h2>Xin chào, Kim Dung</h2><p>Hôm nay, 15 Tháng 1, 2024</p></div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notificationBtn}><span className={styles.icon}>🔔</span><span className={styles.badge}>3</span></button>
            <button className={styles.settingsBtn}><span className={styles.icon}>⚙️</span></button>
            <div className={styles.avatar}><span>KD</span></div>
          </div>
        </div>
      </header>

      <div className={styles.navigationBar}>
        <button className={styles.backLink} onClick={() => navigate("/patient")}>← Quay lại trang chủ</button>
      </div>

      <main className={styles.mainContent}>
{/* STEPPER */}
        <div className={styles.progressBar}>
          {/* Ô 1: Hồ sơ */}
          <div className={`${styles.step} ${step === 1 || step === 2 ? styles.active : ''}`}>
            <div className={styles.stepIcon}>👤</div><span>Hồ sơ</span>
          </div>
          <div className={styles.connector}></div>
          
          {/* Ô 2: Chọn thông tin khám */}
          <div className={`${styles.step} ${step >= 3 && step < 7 ? styles.active : ''}`}>
            <div className={styles.stepIcon}>🩺</div><span>Chọn thông tin khám</span>
          </div>
          <div className={styles.connector}></div>
          
          {/* Ô 3: Thông tin đặt khám */}
          {/* SỬA: Thêm step === 8 vào đây để ô này vẫn sáng khi ở trang Kết quả (Step 8) */}
          <div className={`${styles.step} ${step === 7 || step === 8 ? styles.active : ''}`}>
            <div className={styles.stepIcon}>📝</div><span>Thông tin đặt khám</span>
          </div>
          <div className={styles.connector}></div>

          {/* Ô 4: Kết quả đặt khám */}
          {/* SỬA: Chỉ sáng khi step > 8 (Ví dụ: sau khi bấm Thanh toán/Tiếp tục ở Step 8) */}
          <div className={`${styles.step} ${step === 9 ? styles.active : ''}`}>
             <div className={styles.stepIcon}>✅</div><span>Kết quả đặt khám</span>
          </div>
        </div>

        {/* STEP 1: DANH SÁCH HỒ SƠ */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.sectionHeader}>
              <h3>Chọn hồ sơ bệnh nhân</h3>
              <button className={styles.addProfileBtn} onClick={handleAddNewProfile}>+ Thêm mới hồ sơ</button>
            </div>
            <div className={styles.profileList}>
              {profiles.map(profile => (
                <div key={profile.id} className={styles.profileCard}>
                  <div className={styles.cardAvatar}>{profile.avatar}</div>
                  <div className={styles.cardInfo}>
                    <h4>{profile.name}</h4>
                    <p>Mã BN: {profile.code}</p>
                    <p>SĐT: {profile.phone}</p>
                  </div>
                  <button className={styles.selectBtn} onClick={() => handleSelectProfile(profile)}>Chọn</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: FORM TẠO HỒ SƠ */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.formHeader}>
              <button className={styles.backBtn} onClick={() => setStep(1)}>← Quay lại bước chọn hồ sơ</button>
              <h3>Tạo hồ sơ khám bệnh</h3>
            </div>
            <form className={styles.createForm}>
            <div className={styles.formGrid}>
                {/* 1. Ô Họ và tên (Gộp) */}
                <div className={styles.formGroup}>
                  <label>Họ và tên <span className={styles.red}>*</span></label>
                  <input type="text" name="fullName" placeholder="VD: Nguyễn Văn A..." value={formData.fullName} onChange={handleInputChange} />
                </div>

                {/* 2. Ô Số điện thoại */}
                <div className={styles.formGroup}>
                  <label>Số điện thoại <span className={styles.red}>*</span></label>
                  <input type="text" name="phone" placeholder="Nhập số điện thoại..." value={formData.phone} onChange={handleInputChange} />
                </div>

                {/* 3. Ô Email */}
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input type="email" name="email" placeholder="Nhập email..." value={formData.email} onChange={handleInputChange} />
                </div>

                {/* 4. Ô Ngày sinh (Đưa lên đây để thay chỗ CCCD đã xóa) */}
                <div className={styles.formGroup}>
                  <label>Ngày sinh <span className={styles.red}>*</span></label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
                </div>

                {/* 5. Giới tính (Cho nằm riêng 1 dòng hoặc giữ nguyên grid thì nó sẽ xuống dòng) */}
                <div className={styles.formGroup}>
                  <label>Giới tính <span className={styles.red}>*</span></label>
                  <div className={styles.radioGroup}>
                    <label><input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleInputChange} /> Nam</label>
                    <label><input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleInputChange} /> Nữ</label>
                  </div>
                </div>
                
                <div className={styles.fullWidth}>
                  <h4 className={styles.groupTitle}>Địa chỉ thường trú <span className={styles.red}>*</span></h4>
                  <div className={styles.addressContainer}>
                     <div className={styles.addressRow}>
                        <div className={styles.selectGroup}>
                          <label>Tỉnh/Thành phố</label>
                          <select value={address.province} onChange={(e) => handleAddressChange('province', e.target.value)}>
                            <option value="">-- Chọn --</option>
                            {locations.provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className={styles.selectGroup}>
                          <label>Quận/Huyện</label>
                          <select value={address.district} onChange={(e) => handleAddressChange('district', e.target.value)} disabled={!address.province}>
                             <option value="">-- Chọn --</option>
                             {locations.districts[address.province]?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                     </div>
                     <div className={styles.addressRow}>
                        <div className={styles.selectGroup}>
                          <label>Phường/Xã</label>
                          <select value={address.ward} onChange={(e) => handleAddressChange('ward', e.target.value)} disabled={!address.district}>
                            <option value="">-- Chọn --</option>
                            {locations.wards[address.district]?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Số nhà, tên đường</label>
                          <input type="text" value={address.street} onChange={(e) => handleAddressChange('street', e.target.value)} />
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.submitBtn} onClick={handleSaveProfile}>XÁC NHẬN TẠO HỒ SƠ</button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: CHỌN CHUYÊN KHOA */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.formHeader}>
              <button className={styles.backBtn} onClick={() => { setStep(1); setShowMethodPopup(true); }}>← Quay lại chọn hình thức</button>
              <h3 className={styles.centerTitle}>Chọn chuyên khoa</h3>
            </div>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input type="text" placeholder="Tìm nhanh chuyên khoa" />
            </div>
            <div className={styles.noteText}>Nhấn vào <span className={styles.infoIcon}>i</span> để xem chức năng chuyên khoa</div>
            <div className={styles.specialtyList}>
              {specialties.map(spec => (
                <div key={spec.id} className={styles.specialtyItem} onClick={() => handleSpecialtySelect(spec)}>
                  <div className={styles.specIcon}>i</div>
                  <div className={styles.specContent}>
                    <div className={styles.specHeader}><span className={styles.specName}>{spec.name}</span><span className={styles.specPrice}>{spec.price}</span></div>
                    {spec.note && <p className={styles.specNote}>{spec.note}</p>}
                  </div>
                  <div className={styles.arrowIcon}>›</div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* --- STEP 4: TRANG TỔNG QUAN (MENU DỌC) --- */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <div className={styles.formHeader}>
              <button className={styles.backBtn} onClick={() => setStep(3)}>← Chọn lại chuyên khoa</button>
              <h3>Chọn thông tin khám</h3>
            </div>

            <div className={styles.verticalMenu}>
              {/* Mục 1: Chuyên khoa - ĐÃ SỬA: Kiểm tra có dữ liệu mới hiện done */}
              <div 
                className={`${styles.menuItem} ${selectedSpecialty ? styles.done : styles.active}`} 
                onClick={() => setStep(3)}
              >
                <div className={styles.leftContent}>
                  <div className={styles.iconBox}>🩺</div>
                  <span className={styles.itemText}>{selectedSpecialty?.name || "Chuyên khoa"}</span>
                </div>
                {/* Nếu có chuyên khoa thì hiện check, chưa có thì hiện mũi tên */}
                {selectedSpecialty ? <span className={styles.checkIcon}>✅</span> : <span className={styles.arrowIcon}>›</span>}
              </div>

              {/* Mục 2: Ngày khám - ĐÃ SỬA: Chỉ active khi đã chọn chuyên khoa */}
              <div 
                className={`${styles.menuItem} ${selectedDate ? styles.done : (selectedSpecialty ? styles.active : '')}`} 
                onClick={() => selectedSpecialty && setStep(5)}
              >
                <div className={styles.leftContent}>
                   <div className={styles.iconBox}>📅</div>
                   <span className={styles.itemText}>
                     {selectedDate ? `Ngày: ${selectedDate}` : "Ngày khám"}
                   </span>
                </div>
                {selectedDate ? <span className={styles.checkIcon}>✅</span> : (selectedSpecialty && <span className={styles.arrowIcon}>›</span>)}
              </div>

              {/* Mục 3: Giờ khám */}
              <div 
                className={`${styles.menuItem} ${selectedTime ? styles.done : (selectedDate ? styles.active : '')}`} 
                onClick={() => selectedDate && setStep(6)}
              >
                <div className={styles.leftContent}>
                   <div className={styles.iconBox}>🕒</div>
                   <span className={styles.itemText}>{selectedTime || "Giờ khám"}</span>
                </div>
                {selectedDate && !selectedTime && <span className={styles.arrowIcon}>›</span>}
                {selectedTime && <span className={styles.checkIcon}>✅</span>}
              </div>

              {/* Mục 4: Bác sĩ */}
              <div className={`${styles.menuItem} ${selectedDoctor ? styles.done : ''}`}>
                <div className={styles.leftContent}>
                   <div className={styles.iconBox}>👨‍⚕️</div>
                   <span className={styles.itemText}>{selectedDoctor || "Bác sĩ"}</span>
                </div>
                {selectedDoctor && <span className={styles.checkIcon}>✅</span>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CHỌN NGÀY KHÁM */}
        {step === 5 && (
          <div className={styles.stepContent}>
            <div className={styles.formHeader}>
              <button className={styles.backBtn} onClick={() => setStep(4)}>← Quay lại Thanh tiến trình</button>
              <h3 className={styles.centerTitle}>Chọn ngày khám</h3>
            </div>
            <div className={styles.calendarContainer}>
              <div className={styles.calendarHeader}>
                <button className={styles.navBtn}>‹</button><h4>Tháng 02 - 2026</h4><button className={styles.navBtn}>›</button>
              </div>
              <div className={styles.weekDays}><span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span></div>
              
              <div className={styles.daysGrid}>
                {/* Demo Data */}
                <div className={`${styles.dayCell} ${styles.gray}`}>1</div>
                
                {/* Ngày 2 - Đã có */}
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('02/02/2026')}>2</div>
                
                {/* --- SỬA Ở ĐÂY: THÊM onClick CHO CÁC NGÀY TIẾP THEO --- */}
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('03/02/2026')}>3</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('04/02/2026')}>4</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('05/02/2026')}>5</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('06/02/2026')}>6</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('07/02/2026')}>7</div>
                {/* ------------------------------------------------------ */}

                <div className={`${styles.dayCell} ${styles.gray}`}>8</div>
                
                {/* Các ngày tuần sau cũng thêm onClick tương tự nếu cần */}
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('09/02/2026')}>9</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('10/02/2026')}>10</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('11/02/2026')}>11</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('12/02/2026')}>12</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('13/02/2026')}>13</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('14/02/2026')}>14</div>
                
                <div className={`${styles.dayCell} ${styles.gray} ${styles.holidayText}`}>15<br/><span>Ngày lễ</span></div>
                <div className={`${styles.dayCell} ${styles.orange}`}>16<br/><span>Ngày lễ</span></div>
                <div className={`${styles.dayCell} ${styles.orange}`}>17<br/><span>Ngày lễ</span></div>
                <div className={`${styles.dayCell} ${styles.orange}`}>18<br/><span>Ngày lễ</span></div>
                <div className={`${styles.dayCell} ${styles.orange}`}>19<br/><span>Ngày lễ</span></div>
                <div className={`${styles.dayCell} ${styles.orange}`}>20<br/><span>Ngày lễ</span></div>
                <div className={`${styles.dayCell} ${styles.orange}`}>21<br/><span>Ngày lễ</span></div>
                <div className={`${styles.dayCell} ${styles.gray} ${styles.holidayText}`}>22<br/><span>Ngày lễ</span></div>
                
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('23/02/2026')}>23</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('24/02/2026')}>24</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('25/02/2026')}>25</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('26/02/2026')}>26</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('27/02/2026')}>27</div>
                <div className={`${styles.dayCell} ${styles.blue}`} onClick={() => handleDateSelect('28/02/2026')}>28</div>
              </div>
              
              <div className={styles.guideText}>Vui lòng bấm chọn ngày có <span className={styles.blueText}>màu xanh dương</span> để đặt khám.</div>
              <div className={styles.legend}>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.blueDot}`}></span>Ngày có thể chọn</div>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.grayDot}`}></span>Ngày ngoài vùng đăng ký khám</div>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.orangeDot}`}></span>Ngày nghỉ, lễ, tết</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* POPUPS */}
      {showHistoryPopup && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <button className={styles.closePopup} onClick={() => setShowHistoryPopup(false)}>×</button>
            <h4>Bạn đã từng khám tại HealthCare?</h4>
            <p>Vui lòng chọn để hệ thống đồng bộ dữ liệu tốt nhất.</p>
            <button className={styles.btnPrimary} onClick={() => handlePopupSelection('old')}>ĐÃ TỪNG KHÁM, NHẬP MÃ NGƯỜI BỆNH</button>
            <button className={styles.btnOutline} onClick={() => handlePopupSelection('new')}>CHƯA TỪNG KHÁM, TẠO HỒ SƠ MỚI</button>
          </div>
        </div>
      )}

      {showMethodPopup && (
        <div className={styles.overlay}>
          <div className={styles.methodPopup}>
            <button className={styles.closePopup} onClick={() => setShowMethodPopup(false)}>×</button>
            <div className={styles.popupHeader}><h4>Chọn hình thức đặt khám</h4></div>
            <button className={styles.methodBtn} onClick={() => handleMethodSelect('specialty')}><span className={styles.icon}>🩺</span><span className={styles.text}>Khám chuyên khoa</span></button>
            <button className={styles.methodBtn}><span className={styles.icon}>📅</span><span className={styles.text}>Khám theo ngày</span></button>
            <button className={styles.methodBtn}><span className={styles.icon}>👨‍⚕️</span><span className={styles.text}>Khám theo bác sĩ</span></button>
          </div>
        </div>
      )}
        {/* --- STEP 6: CHỌN GIỜ KHÁM --- */}
        {step === 6 && (
          <div className={styles.stepContent}>
            <div className={styles.formHeader}>
              <button className={styles.backBtn} onClick={() => setStep(4)}>← Quay lại Thanh tiến trình</button>
              <h3 className={styles.centerTitle}>Chọn khung giờ khám</h3>
            </div>

            <div className={styles.timeSelectionContainer}>
              
              {/* 1. Carousel chọn ngày */}
              {/* LƯU Ý: Đã thêm logic check class 'selected' dựa trên state selectedDate */}
              <div className={styles.dateCarousel}>
                <div 
                  className={`${styles.dateCard} ${selectedDate === '26/01/2026' ? styles.selected : ''}`}
                  onClick={() => handleDateSelect('26/01/2026')}
                >
                  <span>26/01</span><span>2026</span>
                  {selectedDate === '26/01/2026' && <div className={styles.tickCorner}>✓</div>}
                </div>

                <div 
                  className={`${styles.dateCard} ${selectedDate === '02/02/2026' ? styles.selected : ''}`}
                  onClick={() => handleDateSelect('02/02/2026')}
                >
                  <span>02/02</span><span>2026</span>
                  {selectedDate === '02/02/2026' && <div className={styles.tickCorner}>✓</div>}
                </div>

                <div className={styles.dateCard}><span>09/02</span><span>2026</span></div>
                <div className={styles.dateCard}><span>23/02</span><span>2026</span></div>
              </div>

              {/* LOGIC HIỂN THỊ BÁC SĨ THEO NGÀY */}
              {(() => {
                // Giả lập: Ngày 26/01 là BS Vi, ngày khác là BS An
                const currentDoctorName = selectedDate === '26/01/2026' 
                  ? "ThS BS. Trương Hồ Tường Vi" 
                  : "BS. Chuyên Khoa I Nguyễn Văn An";

                return (
                  <>
                    {/* 2. Khu vực Buổi Sáng */}
                    <div className={styles.sessionBlock}>
                      <div className={styles.currentDateLabel}>
                        🌱 {selectedDate} - Buổi sáng (Thứ 2)
                      </div>
                      
                      <div className={styles.doctorTimeCard}>
                        <div className={styles.doctorHeader}>
                           <div className={styles.docIcon}>🩺</div>
                           <div className={styles.docInfo}>
                             <h4>{currentDoctorName}</h4>
                             <p>📍 Phòng 52A - Tầng Trệt Khu B - Buổi sáng</p>
                           </div>
                           <span className={styles.collapseIcon}>−</span>
                        </div>
                        
                        <div className={styles.timeGrid}>
                          {["06:30 - 07:30", "07:30 - 08:30", "08:30 - 09:30", "09:30 - 10:30", "10:30 - 11:30"].map((time, index) => (
                             <button 
                               key={index} 
                               className={styles.timeBtn} 
                               // TRUYỀN TÊN BÁC SĨ TƯƠNG ỨNG VÀO HÀM LƯU
                               onClick={() => handleTimeSelect(time, currentDoctorName)}
                             >
                               {time}
                             </button>
                          ))}
                        </div>
                      </div>
                    </div>

                     {/* 3. Khu vực Buổi Chiều */}
                     <div className={styles.sessionBlock}>
                       <div className={`${styles.currentDateLabel} ${styles.pmLabel}`}>
                         ☀️ {selectedDate} - Buổi chiều (Thứ 2)
                       </div>

                       <div className={styles.doctorTimeCard}>
                        <div className={styles.doctorHeader}>
                           <div className={styles.docIcon}>🩺</div>
                           <div className={styles.docInfo}>
                             <h4>{currentDoctorName}</h4>
                             <p>📍 Phòng 52A - Tầng Trệt Khu B - Buổi chiều</p>
                           </div>
                           <span className={styles.collapseIcon}>−</span>
                        </div>
                        
                        <div className={styles.timeGrid}>
                          {["13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"].map((time, index) => (
                             <button 
                               key={index} 
                               className={styles.timeBtn} 
                               // TRUYỀN TÊN BÁC SĨ TƯƠNG ỨNG VÀO HÀM LƯU
                               onClick={() => handleTimeSelect(time, currentDoctorName)}
                             >
                               {time}
                             </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}

            </div>
          </div>
        )}

        {/* --- STEP 7: XÁC NHẬN & BẢO HIỂM (MỚI) --- */}
        {step === 7 && (
          <div className={styles.stepContent}>
            {/* Header nhỏ */}
            <div className={styles.formHeader}>
               <button className={styles.backBtn} onClick={() => setStep(6)}>← Chọn lại giờ khám</button>
               {/* Tiêu đề vẫn nằm trong nhóm "Chọn thông tin khám" theo yêu cầu */}
               <h3 className={styles.centerTitle}>Xác nhận thông tin</h3>
            </div>

            <div className={styles.confirmationContainer}>
              
              {/* 1. Danh sách thông tin đã chọn (Cho phép click để sửa) */}
              <div className={styles.summaryList}>
                {/* Chuyên khoa */}
                <div className={styles.summaryItem} onClick={() => setStep(3)}>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryIcon}>🩺</span>
                    <span className={styles.summaryText}>{selectedSpecialty?.name}</span>
                  </div>
                  <span className={styles.checkIcon}>✅</span>
                </div>

                {/* Ngày khám */}
                <div className={styles.summaryItem} onClick={() => setStep(5)}>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryIcon}>📅</span>
                    <span className={styles.summaryText}>{selectedDate}</span>
                  </div>
                  <span className={styles.checkIcon}>✅</span>
                </div>

                {/* Giờ khám & Phòng */}
                <div className={styles.summaryItem} onClick={() => setStep(6)}>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryIcon}>🕒</span>
                    <span className={styles.summaryText}>{selectedTime} - Phòng 52A, Tầng Trệt Khu B</span>
                  </div>
                  <span className={styles.checkIcon}>✅</span>
                </div>

                {/* Bác sĩ */}
                <div className={styles.summaryItem} onClick={() => setStep(6)}>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryIcon}>👨‍⚕️</span>
                    <span className={styles.summaryText}>{selectedDoctor}</span>
                  </div>
                  <span className={styles.checkIcon}>✅</span>
                </div>
              </div>

              {/* 2. Phần chọn Bảo hiểm Y tế */}
              <div className={styles.insuranceSection}>
                <h4>Bảo hiểm Y tế <span className={styles.red}>*</span></h4>
                
                <div className={styles.radioOption}>
                  <input type="radio" id="bhyt1" name="bhyt" />
                  <label htmlFor="bhyt1">Có thẻ BHYT ĐK KCB BĐ tại BV ĐHYD</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="bhyt2" name="bhyt" />
                  <label htmlFor="bhyt2">Có tái khám theo hẹn trên đơn thuốc BHYT của BV ĐHYD</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="bhyt3" name="bhyt" />
                  <label htmlFor="bhyt3">Có giấy chuyển BHYT đúng tuyến BV ĐHYD</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="bhyt4" name="bhyt" defaultChecked />
                  <label htmlFor="bhyt4">Không phải 3 trường hợp trên</label>
                </div>
              </div>

              {/* 3. Checkbox Bảo lãnh */}
              {/* 3. Checkbox Bảo lãnh - ĐÃ SỬA LOGIC 1 TRONG 2 */}
              <div className={styles.guaranteeSection}>
                 <label className={styles.checkboxLabel}>
                    <span>Bảo lãnh viện phí <span className={styles.red}>*</span></span>
                    <div className={styles.checkboxGroup}>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={isGuarantee === true} 
                          onChange={() => setIsGuarantee(true)} 
                        /> 
                        Có
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={isGuarantee === false} 
                          onChange={() => setIsGuarantee(false)} 
                        /> 
                        Không
                      </label>
                    </div>
                 </label>
              </div>

            </div>

            {/* 4. Thanh thanh toán dính dưới đáy */}
            <div className={styles.bottomBar}>
               {/* THÊM THẺ WRAPPER NÀY ĐỂ CĂN GIỮA VÀ GIỚI HẠN CHIỀU RỘNG */}
               <div className={styles.bottomBarContent}> 
                   <div className={styles.priceInfo}>
                     <span>Tiền khám</span>
                     <span className={styles.priceValue}>150.000đ</span>
                   </div>
<button className={styles.continueBtn} onClick={handleConfirmBooking}>
          Tiếp tục
        </button>
               </div>
            </div>
          </div>
        )}
  {/* --- STEP 8: THÔNG TIN ĐẶT KHÁM (KẾT QUẢ) --- */}
        {step === 8 && (
          <div className={styles.stepContent}>
            <div className={styles.formHeader}>
              
               <h3 className={styles.centerTitle}>Thông tin đặt khám</h3>
            </div>

            <div className={styles.resultContainer}>
              <div className={styles.guideText}>
                Vui lòng kiểm tra thông tin đặt khám bên dưới.<br/>
                Hoặc "Thêm chuyên khoa" mới.
              </div>

              {/* 1. Thẻ Hồ sơ (Giữ nguyên) */}
              <div className={styles.infoCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconUser}>👤</div>
                  <h4>Hồ sơ đăng ký khám bệnh</h4>
                  <span className={styles.collapseIcon}>^</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.row}>
                    <span className={styles.label}>Họ tên:</span>
                    <span className={styles.valueName}>{formData.fullName || "HỒNG KIM DUNG"}</span>
                  </div>
                  {/* ... các thông tin khác ... */}
                   <div className={styles.row}><span className={styles.label}>Địa chỉ:</span><span className={styles.value}>Tiền Giang</span></div>
                </div>
              </div>

              {/* 2. DANH SÁCH CHUYÊN KHOA ĐỘNG */}
              
              {/* Tiêu đề tự động cập nhật số lượng (1), (2)... */}
              <div className={styles.sectionTitle}>
                  Chuyên khoa đã đặt ({bookingList.length})
              </div>
              
              {/* Vòng lặp in ra danh sách */}
              {bookingList.map((item, index) => (
                <div key={item.id} className={styles.bookingCard} style={{marginBottom: '16px'}}>
                  <div className={styles.row}>
                    <span className={styles.label}>Chuyên khoa:</span>
                    {/* Lấy tên chuyên khoa từ item */}
                    <span className={styles.valueBlue}>{item.specialty?.name}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>Ngày khám:</span>
                    <span className={styles.value}>{item.date}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>Phòng - Giờ:</span>
                    <span className={styles.value}>
                       {item.time}, Phòng 71 - Lầu 1 Khu B
                    </span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>Tiền khám:</span>
                    <span className={styles.value}>150.000đ</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>BHYT:</span>
                    <span className={styles.value}>Có tái khám theo hẹn trên đơn thuốc BHYT của BV ĐHYD</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>BLVP:</span>
                    <span className={styles.value}>{item.guarantee ? "Có" : "Không"}</span>
                  </div>
                  
                  {/* Nút xóa gọi hàm xóa với ID của item này */}
                  <div className={styles.deleteIcon} onClick={() => handleRemoveItem(item.id)}>🗑️</div>
                </div>
              ))}
            </div>

            {/* Bottom Bar: Tính tổng tiền */}
            <div className={styles.bottomBar}>
               <div className={styles.bottomBarContent}> 
                   <div className={styles.totalInfo}>
                     <span>Tổng tiền khám</span>
                     {/* Công thức: Số lượng * 150.000 */}
                     <span className={styles.totalPrice}>
                       {(bookingList.length * 150000).toLocaleString('vi-VN')}đ
                     </span>
                   </div>
                   <div className={styles.actionButtons}>
                     {/* Nút Thêm gọi hàm handleAddMore */}
                     <button className={styles.addMoreBtn} onClick={handleAddMore}>+ Thêm chuyên khoa</button>
                    <button className={styles.continueBtn} onClick={() => setStep(9)}>
    Tiếp tục
</button>
                   </div>
               </div>
            </div>
          </div>
        )}

        {/* --- STEP 9: KẾT QUẢ ĐẶT KHÁM (SUCCESS PAGE) --- */}
        {step === 9 && (
          <div className={styles.stepContent}>
            {/* Ẩn nút back, chỉ giữ nút Home */}
            <div className={styles.formHeader}>
               <div style={{flex: 1}}></div>
               <h3 className={styles.centerTitle}>Kết quả đặt khám</h3>
            </div>

            <div className={styles.resultContainer}>
              
              {/* 1. KHỐI THÔNG BÁO THÀNH CÔNG */}
              <div className={styles.successBanner}>
                <div className={styles.successIcon}>🎉</div>
                <h4>Đăng ký khám thành công!</h4>
                <p>Vui lòng đưa Mã QR bên dưới khi đến bệnh viện để check-in.</p>
              </div>

              {/* 2. KHỐI MÃ QR (VÉ ĐIỆN TỬ) */}
              <div className={styles.ticketCard}>
                <div className={styles.qrSection}>
                   {/* Giả lập QR Code bằng hình ảnh hoặc div */}
                   <img 
                     src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HealthCare-Booking-12345" 
                     alt="QR Code" 
                     className={styles.qrImage}
                   />
                   <p className={styles.bookingRef}>Mã phiếu: <strong>#BK-{Date.now().toString().slice(-6)}</strong></p>
                </div>
                
                <div className={styles.dashedLine}></div>

                {/* Thông tin bệnh nhân */}
                <div className={styles.patientSummary}>
                   <div className={styles.row}>
                      <span className={styles.label}>Họ tên:</span>
                      <span className={styles.valueName}>{formData.fullName || "HỒNG KIM DUNG"}</span>
                   </div>
                   <div className={styles.row}>
                      <span className={styles.label}>Mã BN:</span>
                      <span className={styles.value}>W25-0632960</span>
                   </div>
                </div>
              </div>

              {/* 3. DANH SÁCH DỊCH VỤ ĐÃ MUA */}
              <div className={styles.sectionTitle}>Chi tiết dịch vụ</div>
              
              <div className={styles.receiptList}>
                 {bookingList.map((item, index) => (
                    <div key={item.id} className={styles.receiptItem}>
                       <div className={styles.receiptHeader}>
                          <span className={styles.receiptIndex}>{index + 1}</span>
                          <span className={styles.receiptName}>{item.specialty?.name}</span>
                       </div>
                       <div className={styles.receiptBody}>
                          <p>📅 {item.date} | 🕒 {item.time}</p>
                          <p>📍 Phòng 71 - Lầu 1 Khu B</p>
                          <p>👨‍⚕️ {item.doctor}</p>
                       </div>
                    </div>
                 ))}
              </div>

              {/* 4. HƯỚNG DẪN */}
              <div className={styles.instructionBox}>
                 <h5>⚠️ Lưu ý quan trọng:</h5>
                 <ul>
                    <li>Vui lòng có mặt tại <strong>Quầy tiếp nhận (Kiosk)</strong> trước giờ khám <strong>15 phút</strong> để in phiếu số thứ tự.</li>
                    <li>Khi đi mang theo <strong>BHYT (bản chính)</strong> và <strong>CMND/CCCD</strong> để xác thực.</li>
                    <li>Nếu có triệu chứng sốt, ho, vui lòng báo ngay cho nhân viên y tế tại sảnh.</li>
                 </ul>
              </div>

            </div>

            {/* Bottom Bar: Về trang chủ */}
            <div className={styles.bottomBar}>
               <div className={styles.bottomBarContent} style={{justifyContent: 'center'}}> 
                   <button className={styles.continueBtn} onClick={() => navigate("/patient")}>
                      Về trang chủ
                   </button>
               </div>
            </div>
          </div>
        )}
    </div>
    
  )
}
export default Booking