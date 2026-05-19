import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.status === 403) { navigate("/dashboard"); return; }
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      setError("Veri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id, role) => {
    await fetch(`${API}/api/admin/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    fetchData();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;
    await fetch(`${API}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  if (loading) return <div style={styles.center}>Yükleniyor...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ Admin Paneli</h1>

      {/* Stats */}
      {stats && (
        <div style={styles.grid}>
          {[
            { label: "Toplam Kullanıcı", value: stats.totalUsers, color: "#6c63ff" },
            { label: "Toplam Kurs", value: stats.totalCourses, color: "#43b89c" },
            { label: "Toplam Görev", value: stats.totalTasks, color: "#f7a440" },
            { label: "Tamamlanma %", value: `%${stats.completionRate}`, color: "#e05c5c" },
          ].map((s) => (
            <div key={s.label} style={{ ...styles.card, borderTop: `4px solid ${s.color}` }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ color: "#aaa", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users Table */}
      <h2 style={{ color: "#fff", marginTop: 32 }}>Kullanıcılar</h2>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: "#1e1e2e" }}>
              <th style={styles.th}>İsim</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Kayıt Tarihi</th>
              <th style={styles.th}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="student">student</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
                <td style={styles.td}>
                  <button onClick={() => deleteUser(u.id)} style={styles.deleteBtn}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "32px", background: "#13131f", minHeight: "100vh" },
  title: { color: "#fff", fontSize: 28, marginBottom: 24 },
  center: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 },
  card: { background: "#1e1e2e", borderRadius: 12, padding: "20px 24px" },
  tableWrap: { overflowX: "auto", borderRadius: 12, background: "#1e1e2e" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 16px", color: "#aaa", textAlign: "left", fontSize: 13 },
  tr: { borderBottom: "1px solid #2a2a3e" },
  td: { padding: "12px 16px", color: "#fff", fontSize: 14 },
  select: { background: "#2a2a3e", color: "#fff", border: "1px solid #444", borderRadius: 6, padding: "4px 8px" },
  deleteBtn: { background: "#e05c5c22", color: "#e05c5c", border: "1px solid #e05c5c", borderRadius: 6, padding: "4px 12px", cursor: "pointer" },
};
