'use client'

import { useState } from 'react'
import styles from './AdminHome.module.scss'
import { useNavigate } from 'react-router-dom' // Import hook

export default function AdminHome() {
  const navigate = useNavigate() // <--- KHỞI TẠO BIẾN NAVIGATE

  const [notifications] = useState(3)
  const today = new Date()
  const dateStr = `${today.getDate()} Tháng ${today.getMonth() + 1}, ${today.getFullYear()}`

  const settingsModules = [
    { id: 1, icon: '⚙️', title: 'QUẢN LÝ THÔNG TIN', action: () => navigate('/admin-profile') },
    { id: 2, icon: '📊', title: 'THỐNG KÊ VÀ BÁO CÁO' },
    { id: 3, icon: '👥', title: 'QUẢN LÝ BỘ PHẬN' },
    { id: 4, icon: '👤', title: 'QUẢN LÝ NHÂN VIÊN' },
    { id: 5, icon: '🔔', title: 'QUẢN LÝ THÔNG BÁO' },
    { id: 6, icon: '🔗', title: 'QUẢN LÝ TÍCH HỢP' },
    { id: 7, icon: '🔐', title: 'QUẢN LÝ PHÂN QUYỀN' },
  ]

  const clinicModules = [
    { id: 8, icon: '🏠', title: 'ĐẶT KHÁM TẠI NHÀ' },
    { id: 9, icon: '🏥', title: 'ĐẶT KHÁM TẠI VIỆN' },
    { id: 10, icon: '💰', title: 'QUẢN LÝ THANH TOÁN' },
    { id: 11, icon: '👥', title: 'QUẢN LÝ KHÁCH HÀNG' },
    { id: 12, icon: '📋', title: 'BỆNH ÁN ĐIỆN TỬ' },
    { id: 13, icon: '🔬', title: 'XÁC THỰC IUI IVF' },
  ]

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <span className={styles.heartBeat}>❤️</span>
              </div>
              <div className={styles.logoText}>
                <h1>HealthCare</h1>
                <p>Chăm sóc sức khỏe toàn diện</p>
              </div>
            </div>
            <div className={styles.greeting}>
              <h2>Xin chào, Admin</h2>
              <p>{dateStr}</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notificationBtn}>
              <span className={styles.icon}>🔔</span>
              <span className={styles.badge}>{notifications}</span>
            </button>
            <button className={styles.settingsBtn}>
              <span className={styles.icon}>⚙️</span>
            </button>
            <div className={styles.avatar}>
              <span>AD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Settings Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Thông tin và cài đặt</h2>
          <div className={styles.modulesGrid}>
            {settingsModules.map((module, idx) => (
              <div
                key={module.id}
                className={`${styles.moduleCard} ${styles.cardHover}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={module.action} // <--- ĐÃ THÊM SỰ KIỆN CLICK Ở ĐÂY
              >
                <div className={styles.moduleIcon}>{module.icon}</div>
                <div className={styles.moduleTitle}>{module.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Clinic Management Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quản lý khám chữa bệnh</h2>
          <div className={styles.modulesGrid}>
            {clinicModules.map((module, idx) => (
              <div
                key={module.id}
                className={`${styles.moduleCard} ${styles.cardHover}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={module.action} // Thêm luôn để sau này các mục dưới có link cũng chạy được
              >
                <div className={styles.moduleIcon}>{module.icon}</div>
                <div className={styles.moduleTitle}>{module.title}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}