"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./MedicalRecord.module.scss"

const MedicalRecord = () => {
  const navigate = useNavigate()
  // Mặc định mở tab 'visits' để bạn test tính năng click xem ảnh luôn
  const [activeTab, setActiveTab] = useState("visits") 

  const [expandedVisitId, setExpandedVisitId] = useState(1)
  const [filterDiagnosis, setFilterDiagnosis] = useState("Tất cả");

  // --- [MỚI 1] STATE & HÀM QUẢN LÝ MODAL ---
  const [selectedDocument, setSelectedDocument] = useState(null);

  const toggleVisit = (id) => {
    if (expandedVisitId === id) {
      setExpandedVisitId(null)
    } else {
      setExpandedVisitId(id)
      setFilterDiagnosis("Tất cả")
    }
  }

  const handleTagClick = (e, diseaseName) => {
    e.stopPropagation(); 
    setFilterDiagnosis(diseaseName);
  }

  // --- [MỚI 1] HÀM MỞ/ĐÓNG MODAL ---
  const openDocument = (url) => {
    if (url) setSelectedDocument(url);
    else alert("Chưa có bản scan phiếu khám cho ngày này!");
  }

  const closeDocument = () => {
    setSelectedDocument(null);
  }

  const medicalData = {
    patientName: "Phạm Thị Kim Dung",
    id: "BN-20248899",
    lastVisit: "15/01/2024",
    bloodType: "O+",
    allergies: ["Penicillin", "Hải sản"],
    
    visits: [
      { 
        id: 1, 
        date: "15/01/2024", 
        department: "Khoa Nội tổng hợp", 
        doctor: "BS.CKII Nguyễn Văn A", 
        // --- [MỚI 2] THÊM LINK ẢNH ---
        documentUrl: "https://imgv2-1-f.scribdassets.com/img/document/670463053/original/2e9057d70c/1?v=1",
        diagnosis: ["J00 - Viêm mũi họng cấp", "A97 - Sốt xuất huyết Dengue"], 
        notes: "Bệnh nhân ho nhiều, sốt cao liên tục.", 
        type: "Ngoại trú",
        vitalSigns: { bp: "110/70", pulse: "95", temp: "38.5", weight: "52", spO2: "98" },
        prescriptions: [
          { name: "Paracetamol 500mg", quantity: "15 viên", guide: "Uống 1 viên khi sốt > 38.5 độ", forDiagnosis: "A97 - Sốt xuất huyết Dengue" },
          { name: "Oresol 245", quantity: "5 gói", guide: "Pha 1 gói với 200ml nước uống", forDiagnosis: "A97 - Sốt xuất huyết Dengue" },
          { name: "Vitamin C 500mg", quantity: "10 viên", guide: "Uống 1 viên sau ăn sáng", forDiagnosis: "J00 - Viêm mũi họng cấp" },
          { name: "Alpha Choay", quantity: "20 viên", guide: "Ngậm dưới lưỡi 2 viên/lần", forDiagnosis: "J00 - Viêm mũi họng cấp" }
        ],
        labs: [
            { name: "Tiểu cầu (PLT)", value: "90", unit: "G/L", ref: "150 - 450", status: "low" },
            { name: "Bạch cầu (WBC)", value: "3.5", unit: "G/L", ref: "4.0 - 10.0", status: "low" },
            { name: "Hematocrit (HCT)", value: "45", unit: "%", ref: "37 - 42", status: "high" },
        ]
      },
      { 
        id: 2, 
        date: "10/11/2023", 
        department: "Khoa Tim mạch", 
        doctor: "ThS.BS Trần Thị B",
        // --- [MỚI 2] THÊM LINK ẢNH ---
        documentUrl: "https://marketplace.canva.com/EAFxxh8I5Hk/1/0/1131w/canva-blue-simple-medical-report-checklist-p3aZ_h8Cq88.jpg",
        diagnosis: ["I10 - Tăng huyết áp vô căn"], 
        notes: "Huyết áp 150/90, đau đầu nhẹ.", 
        type: "Tái khám",
        vitalSigns: { bp: "150/90", pulse: "88", temp: "37.0", weight: "53", spO2: "99" },
        prescriptions: [
             { name: "Amlodipin 5mg", quantity: "30 viên", guide: "Uống 1 viên vào buổi sáng", forDiagnosis: "I10 - Tăng huyết áp vô căn" }
        ],
        labs: [
             { name: "Cholesterol toàn phần", value: "6.2", unit: "mmol/l", ref: "< 5.2", status: "high" }
        ]
      },
      { 
        id: 3, 
        date: "05/06/2023", 
        department: "Khoa Cấp cứu", 
        doctor: "BS Trực", 
        diagnosis: "A09 - Tiêu chảy cấp", 
        notes: "Nhập viện do ngộ độc thực phẩm.", 
        type: "Cấp cứu",
        vitalSigns: { bp: "90/60", pulse: "100", temp: "37.2", weight: "51.5", spO2: "97" },
        prescriptions: [],
        labs: [
            { name: "Điện giải đồ (Na+)", value: "135", unit: "mmol/l", ref: "135 - 145", status: "normal" },
            { name: "Điện giải đồ (K+)", value: "3.0", unit: "mmol/l", ref: "3.5 - 5.0", status: "low" },
        ]
      }
    ]
  }

  return (
    <div className={styles.container}>
      
      {/* --- [MỚI 3] MODAL POPUP (Chèn ngay đầu container) --- */}
      {selectedDocument && (
        <div className={styles.modalOverlay} onClick={closeDocument}>
           <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={closeDocument}>×</button>
              <h3>Phiếu Khám Bệnh Chi Tiết</h3>
              <div className={styles.imageContainer}>
                  <img src={selectedDocument} alt="Phiếu khám bệnh" />
              </div>
              <div className={styles.modalFooter}>
                  <button className={styles.printBtn}>🖨️ In phiếu</button>
                  <button className={styles.downloadBtn}>⬇️ Tải về</button>
              </div>
           </div>
        </div>
      )}

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo} onClick={() => navigate("/patient")}>
              <div className={styles.logoIcon}><span className={styles.heartBeat}>❤️</span></div>
              <div className={styles.logoText}><h1>HealthCare</h1><p>Chăm sóc sức khỏe toàn diện</p></div>
            </div>
            <div className={styles.greeting}><h2>Hồ Sơ Bệnh Án</h2></div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.avatar}><span>KD</span></div>
          </div>
        </div>
      </header>

      <main className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <button className={styles.backLink} onClick={() => navigate("/patient")}>← Quay lại trang chủ</button>
          <div className={styles.vitalSummary}>
            <div className={styles.vitalItem}><small>Nhóm máu</small><strong>{medicalData.bloodType}</strong></div>
           
          </div>
          <nav className={styles.navMenu}>
            <button className={activeTab === "overview" ? styles.active : ""} onClick={() => setActiveTab("overview")}>📊 Tổng quan</button>
            <button className={activeTab === "visits" ? styles.active : ""} onClick={() => setActiveTab("visits")}>📅 Lịch sử khám</button>
            <button className={activeTab === "labs" ? styles.active : ""} onClick={() => setActiveTab("labs")}>🧪 Kết quả khám & XN</button>
            <button className={activeTab === "meds" ? styles.active : ""} onClick={() => setActiveTab("meds")}>💊 Đơn thuốc</button>
          </nav>
        </aside>

        <section className={styles.content}>
          {/* TAB: TỔNG QUAN */}
          {activeTab === "overview" && (
            <div className={styles.tabContent}>
              <h2 className={styles.pageTitle}>Tổng quan sức khỏe</h2>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3>Lần khám gần nhất</h3>
                  <div className={styles.bigData}>
                    <span className={styles.date}>{medicalData.lastVisit}</span>
                    <p>{Array.isArray(medicalData.visits[0].diagnosis) ? medicalData.visits[0].diagnosis[0] : medicalData.visits[0].diagnosis}</p>
                  </div>
                </div>
                <div className={styles.card}>
                  <h3>Cảnh báo sức khỏe</h3>
                  <ul className={styles.alertList}>
                    <li>⚠️ Chỉ số Cholesterol cao (6.2 mmol/l)</li>
                    <li>⚠️ Men gan ALT tăng nhẹ (42 U/L)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LỊCH SỬ KHÁM (CÓ SỰ KIỆN CLICK) */}
          {activeTab === "visits" && (
            <div className={styles.tabContent}>
              <h2 className={styles.pageTitle}>Lịch sử khám chữa bệnh</h2>
              <p className={styles.subTitle}>Click vào từng lượt khám để xem phiếu chi tiết</p>
              
              <div className={styles.timeline}>
                {medicalData.visits.map((visit) => (
                  <div key={visit.id} className={styles.timelineItem}>
                    <div className={styles.timelineDate}>
                      <span>{visit.date}</span>
                      <span className={styles.visitType}>{visit.type}</span>
                    </div>
                    
                    {/* --- [MỚI 4] CLICK VÀO ĐÂY ĐỂ MỞ MODAL --- */}
                    <div 
                        className={`${styles.timelineContent} ${styles.clickableCard}`}
                        onClick={() => openDocument(visit.documentUrl)}
                        title="Nhấn để xem phiếu khám chi tiết"
                    >
                      <div className={styles.cardHeader}>
                          <h4>
                            {Array.isArray(visit.diagnosis) 
                                ? visit.diagnosis.join(", ") 
                                : visit.diagnosis}
                          </h4>
                          <span className={styles.viewIcon}>👁️ Xem phiếu</span>
                      </div>
                      <p className={styles.dept}>🏥 {visit.department} - {visit.doctor}</p>
                      <p className={styles.notes}>📝 {visit.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: KẾT QUẢ XÉT NGHIỆM */}
          {activeTab === "labs" && (
            <div className={styles.tabContent}>
              <h2 className={styles.pageTitle}>Kết quả Khám & Xét nghiệm</h2>
              <div className={styles.prescriptionContainer}>
                {medicalData.visits.map((visit) => (
                  <div key={visit.id} className={`${styles.prescriptionGroup} ${expandedVisitId === visit.id ? styles.activeGroup : ''}`}>
                    <div className={styles.groupHeader} onClick={() => toggleVisit(visit.id)}>
                        <div className={styles.headerInfo}>
                            <span className={styles.visitDate}>📅 {visit.date}</span>
                            <div className={styles.diagnosisSimpleText}>
                                {Array.isArray(visit.diagnosis) ? visit.diagnosis.join(" • ") : visit.diagnosis}
                            </div>
                        </div>
                        <div className={styles.arrowIcon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                    </div>
                    {expandedVisitId === visit.id && (
                        <div className={styles.groupContent}>
                            {visit.vitalSigns && (
                                <>
                                    <h4 className={styles.sectionTitle}>1. Chỉ số sinh hiệu (Khám lâm sàng)</h4>
                                    <div className={styles.vitalSignsGrid}>
                                        <div className={styles.vitalBox}><span className={styles.vitalLabel}>Huyết áp</span><span className={`${styles.vitalValue} ${parseInt(visit.vitalSigns.bp) > 140 ? styles.textDanger : ''}`}>{visit.vitalSigns.bp}</span><span className={styles.vitalUnit}>mmHg</span></div>
                                        <div className={styles.vitalBox}><span className={styles.vitalLabel}>Mạch</span><span className={styles.vitalValue}>{visit.vitalSigns.pulse}</span><span className={styles.vitalUnit}>lần/phút</span></div>
                                        <div className={styles.vitalBox}><span className={styles.vitalLabel}>Nhiệt độ</span><span className={`${styles.vitalValue} ${parseFloat(visit.vitalSigns.temp) > 37.5 ? styles.textDanger : ''}`}>{visit.vitalSigns.temp}</span><span className={styles.vitalUnit}>°C</span></div>
                                        <div className={styles.vitalBox}><span className={styles.vitalLabel}>SpO2</span><span className={styles.vitalValue}>{visit.vitalSigns.spO2}</span><span className={styles.vitalUnit}>%</span></div>
                                        <div className={styles.vitalBox}><span className={styles.vitalLabel}>Cân nặng</span><span className={styles.vitalValue}>{visit.vitalSigns.weight}</span><span className={styles.vitalUnit}>kg</span></div>
                                    </div>
                                </>
                            )}
                            <h4 className={styles.sectionTitle} style={{marginTop: '24px'}}>2. Kết quả Xét nghiệm (Cận lâm sàng)</h4>
                            {visit.labs && visit.labs.length > 0 ? (
                                <div className={styles.tableWrapper}>
                                    <table className={styles.labTable}>
                                        <thead><tr><th>Tên chỉ số</th><th>Kết quả</th><th>Đơn vị</th><th>Tham chiếu</th><th>Đánh giá</th></tr></thead>
                                        <tbody>
                                            {visit.labs.map((lab, idx) => (
                                                <tr key={idx} className={lab.status !== "normal" ? styles.rowHigh : ""}>
                                                    <td>{lab.name}</td><td className={styles.valueCol}>{lab.value}</td><td>{lab.unit}</td><td>{lab.ref}</td>
                                                    <td>
                                                        {lab.status === "high" && <span className={styles.tagHigh}>Cao</span>}
                                                        {lab.status === "low" && <span className={styles.tagHigh}>Thấp</span>}
                                                        {lab.status === "normal" && <span className={styles.tagNormal}>Bình thường</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (<p className={styles.emptyText}>Không có chỉ định xét nghiệm trong lần khám này.</p>)}
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ĐƠN THUỐC */}
          {activeTab === "meds" && (
            <div className={styles.tabContent}>
              <h2 className={styles.pageTitle}>Đơn thuốc theo đợt khám</h2>
              <div className={styles.prescriptionContainer}>
                {medicalData.visits.map((visit) => (
                  <div key={visit.id} className={`${styles.prescriptionGroup} ${expandedVisitId === visit.id ? styles.activeGroup : ''}`}>
                    <div className={styles.groupHeader} onClick={() => toggleVisit(visit.id)}>
                        <div className={styles.headerInfo}>
                            <span className={styles.visitDate}>📅 {visit.date}</span>
                            <div className={styles.diagnosisTags}>
                                <span className={`${styles.tag} ${filterDiagnosis === "Tất cả" ? styles.activeTag : ""}`} onClick={(e) => handleTagClick(e, "Tất cả")}>Tất cả</span>
                                {Array.isArray(visit.diagnosis) ? (visit.diagnosis.map((disease, index) => (<span key={index} className={`${styles.tag} ${filterDiagnosis === disease ? styles.activeTag : ""}`} onClick={(e) => handleTagClick(e, disease)}>{disease}</span>))) : (<span className={`${styles.tag} ${styles.activeTag}`}>{visit.diagnosis}</span>)}
                            </div>
                        </div>
                        <div className={styles.arrowIcon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                    </div>
                    {expandedVisitId === visit.id && (
                        <div className={styles.groupContent}>
                            {visit.prescriptions && visit.prescriptions.length > 0 ? (
                                <div className={styles.medList}>
                                    {visit.prescriptions.filter(med => filterDiagnosis === "Tất cả" || med.forDiagnosis === filterDiagnosis).map((med, idx) => (
                                            <div key={idx} className={styles.medItem}>
                                                <div className={styles.medIcon}>💊</div>
                                                <div className={styles.medInfo}><h4>{med.name}</h4><p>Số lượng: <strong>{med.quantity}</strong></p><p className={styles.guide}>👉 {med.guide}</p>{filterDiagnosis === "Tất cả" && med.forDiagnosis && (<span className={styles.medBadge}>{med.forDiagnosis.split(" - ")[0]}</span>)}</div>
                                            </div>
                                    ))}
                                    {visit.prescriptions.filter(med => filterDiagnosis === "Tất cả" || med.forDiagnosis === filterDiagnosis).length === 0 && (<p className={styles.noMedsFound}>Không có thuốc riêng cho chẩn đoán này.</p>)}
                                </div>
                            ) : (<div className={styles.emptyPrescription}><p>🚫 Đợt khám này không có đơn thuốc uống.</p></div>)}
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
export default MedicalRecord