"use client";
import { useState, useEffect } from "react";
import styles from "./PatientHome.module.scss";

const PatientHome = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [animatedMetrics, setAnimatedMetrics] = useState({
    bloodPressure: "0/0",
    heartRate: "0",
    weight: "0",
  });

  useEffect(() => {
    const animationTimer = setInterval(() => {
      setAnimatedMetrics({
        bloodPressure: `${Math.floor(Math.random() * 30) + 110}/${
          Math.floor(Math.random() * 20) + 70
        }`,
        heartRate: `${Math.floor(Math.random() * 20) + 65}`,
        weight: `${(Math.random() > 0.5 ? 69.8 : 70.2).toFixed(1)}`,
      });
    }, 3000);
    return () => clearInterval(animationTimer);
  }, []);

  const [upcomingAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Nguyễn Văn A",
      specialty: "Khám Tổng Quát",
      date: "2024-01-15",
      time: "09:00",
      status: "urgent",
    },
    {
      id: 2,
      doctor: "Dr. Trần Thị B",
      specialty: "Tim Mạch",
      date: "2024-01-20",
      time: "14:30",
      status: "confirmed",
    },
  ]);

  const medicalRecords = [
    {
      id: 1,
      type: "Xét Nghiệm Máu",
      date: "2024-01-10",
      status: "Hoàn thành",
      icon: "🩸",
    },
    {
      id: 2,
      type: "Siêu Âm Tim",
      date: "2024-01-08",
      status: "Hoàn thành",
      icon: "🫀",
    },
    {
      id: 3,
      type: "Chụp X-quang",
      date: "2024-01-05",
      status: "Chưa kiểm duyệt",
      icon: "🖼️",
    },
  ];

  const quickActions = [
    { id: 1, label: "Đặt Khám Mới", icon: "📅", color: "#0066CC" },
    { id: 2, label: "Hồ Sơ Bệnh Nhân", icon: "👤", color: "#0052A3" },
    { id: 3, label: "Kết Quả Xét Nghiệm", icon: "🔬", color: "#003D7A" },
    { id: 4, label: "Tài Liệu Y Tế", icon: "📄", color: "#002E5C" },
    { id: 5, label: "Lịch Sử Khám", icon: "📋", color: "#0066CC" },
    { id: 6, label: "Liên Hệ Bác Sĩ", icon: "💬", color: "#0052A3" },
  ];

  const newsItems = [
    {
      id: 1,
      title: "Cách Giữ Gìn Sức Khỏe Mùa Đông",
      description: "Tìm hiểu các cách hiệu quả để duy trì sức khỏe tốt...",
      date: "12/01/2024",
    },
    {
      id: 2,
      title: "Lợi Ích Của Tập Yoga Hàng Ngày",
      description: "Yoga giúp linh hoạt cơ thể và cải thiện tâm trạng...",
      date: "11/01/2024",
    },
  ];

  const nextNews = () => {
    setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
  };

  const prevNews = () => {
    setCurrentNewsIndex(
      (prev) => (prev - 1 + newsItems.length) % newsItems.length
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>NH</div>
            <div className={styles.greeting}>
              <h1>Xin chào, Nguyễn Hữu</h1>
              <p>Hôm nay, 15 Tháng 1, 2024</p>
            </div>
          </div>
          <div className={styles.headerIcons}>
            <button className={styles.notificationBtn}>
              🔔<span className={styles.badge}>3</span>
            </button>
            <button className={styles.settingsBtn}>⚙️</button>
          </div>
        </div>
      </header>

      {/* Health Metrics - Simplified */}
      <section className={styles.metricsSection}>
        <h2>Chỉ Số Sức Khỏe</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.icon}>🫀</span>
            <div className={styles.metricContent}>
              <p className={styles.label}>Huyết Áp</p>
              <p className={styles.value}>{animatedMetrics.bloodPressure}</p>
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.icon}>💓</span>
            <div className={styles.metricContent}>
              <p className={styles.label}>Nhịp Tim</p>
              <p className={styles.value}>{animatedMetrics.heartRate} bpm</p>
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.icon}>⚖️</span>
            <div className={styles.metricContent}>
              <p className={styles.label}>Cân Nặng</p>
              <p className={styles.value}>{animatedMetrics.weight} kg</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Appointments */}
      <section className={styles.appointmentsSection}>
        <div className={styles.sectionHeader}>
          <h2>Lịch Khám Sắp Tới</h2>
          <a href="#" className={styles.seeAll}>
            Xem tất cả →
          </a>
        </div>
        <div className={styles.appointmentsList}>
          {upcomingAppointments.map((apt) => (
            <div
              key={apt.id}
              className={`${styles.appointmentItem} ${styles[apt.status]}`}
            >
              <div className={styles.appointmentInfo}>
                <h3>{apt.doctor}</h3>
                <p className={styles.specialty}>{apt.specialty}</p>
                <p className={styles.datetime}>
                  📅 {apt.date} • 🕐 {apt.time}
                </p>
              </div>
              <button className={styles.detailBtn}>Chi tiết →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Medical Records */}
      <section className={styles.recordsSection}>
        <div className={styles.sectionHeader}>
          <h2>Hồ Sơ Y Tế</h2>
          <a href="#" className={styles.seeAll}>
            Xem tất cả →
          </a>
        </div>
        <div className={styles.recordsList}>
          {medicalRecords.map((record) => (
            <div key={record.id} className={styles.recordItem}>
              <span className={styles.recordIcon}>{record.icon}</span>
              <div className={styles.recordInfo}>
                <h4>{record.type}</h4>
                <p>{record.date}</p>
              </div>
              <span
                className={`${styles.recordStatus} ${
                  styles[record.status.replace(/\s/g, "").toLowerCase()]
                }`}
              >
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions - Spacious Grid */}
      <section className={styles.actionsSection}>
        <h2>Chức Năng Chính</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              className={styles.actionBtn}
              style={{ borderTopColor: action.color }}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionText}>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className={styles.newsSection}>
        <div className={styles.sectionHeader}>
          <h2>Tin Tức Y Tế</h2>
          <a href="#" className={styles.seeAll}>
            Xem thêm →
          </a>
        </div>
        <div className={styles.newsWrapper}>
          <div className={styles.newsCard}>
            <div className={styles.newsImage}></div>
            <div className={styles.newsBody}>
              <h3>{newsItems[currentNewsIndex].title}</h3>
              <p>{newsItems[currentNewsIndex].description}</p>
              <div className={styles.newsFooter}>
                <span className={styles.newsDate}>
                  {newsItems[currentNewsIndex].date}
                </span>
                <button className={styles.readBtn}>Đọc thêm →</button>
              </div>
            </div>
          </div>
          <div className={styles.newsControls}>
            <button onClick={prevNews} className={styles.navBtn}>
              ←
            </button>
            <div className={styles.dots}>
              {newsItems.map((_, idx) => (
                <span
                  key={idx}
                  className={`${styles.dot} ${
                    idx === currentNewsIndex ? styles.active : ""
                  }`}
                  onClick={() => setCurrentNewsIndex(idx)}
                ></span>
              ))}
            </div>
            <button onClick={nextNews} className={styles.navBtn}>
              →
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <button
          className={`${styles.navItem} ${
            activeTab === "home" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("home")}
        >
          <span className={styles.navIcon}>🏠</span>
          <span>Trang Chủ</span>
        </button>
        <button
          className={`${styles.navItem} ${
            activeTab === "appointments" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("appointments")}
        >
          <span className={styles.navIcon}>📅</span>
          <span>Lịch Khám</span>
        </button>
        <button
          className={`${styles.navItem} ${
            activeTab === "health" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("health")}
        >
          <span className={styles.navIcon}>❤️</span>
          <span>Sức Khỏe</span>
        </button>
        <button
          className={`${styles.navItem} ${
            activeTab === "profile" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <span className={styles.navIcon}>👤</span>
          <span>Hồ Sơ</span>
        </button>
      </nav>
    </div>
  );
};

export default PatientHome;
