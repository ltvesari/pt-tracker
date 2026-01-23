import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Shield, Save, FileText, Download, FileDown, Mail } from "lucide-react";

export default function Profile() {
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/me");
                setFormData({
                    first_name: res.data.first_name,
                    last_name: res.data.last_name,
                    email: res.data.email
                });
            } catch (err) {
                console.error("Profil yüklenemedi", err);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put("/profile/settings", formData);
            alert("Ayarlar güncellendi! ✅");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || "Güncelleme başarısız!";
            alert("❌ " + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            setLoading(true);
            const res = await api.get("/profile/export-pdf", { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pt_tracker_ders_raporu_${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("PDF indirilemedi", err);
            alert("Rapor oluşturulurken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadData = async () => {
        try {
            const res = await api.get("/profile/export-data", { responseType: 'blob' });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pt_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Download error", err);
            alert("Yedek indirilemedi.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User className="text-gold-500" />
                Profil ve Ayarlar
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Info Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6 md:col-span-2"
                >
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <h3 className="font-bold border-b border-gray-100 dark:border-white/10 pb-2 mb-4">Kişisel Bilgiler</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">İsim</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">Soyisim</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>




                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    className="input-field pl-10"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <button disabled={loading} className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2">
                            <Save size={18} />
                            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </button>
                    </form>
                </motion.div>

                {/* Actions Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="glass-card p-6 text-center">
                        <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-600 text-2xl font-bold">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <h2 className="text-xl font-bold">{user?.first_name} {user?.last_name}</h2>
                        <p className="text-gray-500 text-sm">@{user?.username}</p>

                        <button
                            onClick={logout}
                            className="mt-6 w-full py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                            Çıkış Yap
                        </button>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4">Veri Dışa Aktar</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Tüm ders geçmişinizi ve öğrenci verilerinizi anında indirin.
                        </p>
                        <button onClick={handleDownloadReport} className="w-full py-3 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all flex items-center justify-center gap-2">
                            <FileDown size={18} />
                            Ders Raporu İndir (PDF)
                        </button>
                        <button
                            onClick={handleDownloadData}
                            className="w-full mt-2 py-3 bg-gray-800 text-white dark:bg-white/10 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Verileri İndir (JSON)
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
