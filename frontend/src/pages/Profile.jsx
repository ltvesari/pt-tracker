import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Shield, Save, FileText, Download } from "lucide-react";

export default function Profile() {
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        receive_daily_backup: false,
        receive_weekly_backup: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/profile/me");
                setFormData({
                    first_name: res.data.first_name,
                    last_name: res.data.last_name,
                    email: res.data.email,
                    receive_daily_backup: res.data.receive_daily_backup,
                    receive_weekly_backup: res.data.receive_weekly_backup
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
            await api.put("/profile/me", formData);
            alert("Ayarlar güncellendi! ✅");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || "Güncelleme başarısız!";
            alert("❌ " + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
        } finally {
            setLoading(false);
        }
    };

    const handleManualBackup = async () => {
        if (!confirm("Manuel yedek maili gönderilsin mi?")) return;

        try {
            alert("İşlem başlatıldı, lütfen bekleyin...");
            const res = await api.post("/profile/send-backup");
            if (res.data.error) {
                alert("Mail gönderilemedi: " + res.data.error);
            } else {
                alert("✅ " + (res.data.message || "Mail gönderildi!"));
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
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
                            <label className="text-sm text-gray-500">Email (Raporlar buraya gönderilir)</label>
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

                        <div className="pt-4">
                            <h3 className="font-bold border-b border-gray-100 dark:border-white/10 pb-2 mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-gold-500" />
                                Yedekleme Tercihleri
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500"
                                        checked={formData.receive_daily_backup}
                                        onChange={e => setFormData({ ...formData, receive_daily_backup: e.target.checked })}
                                    />
                                    <div>
                                        <p className="font-medium">Günlük Rapor Maili</p>
                                        <p className="text-xs text-gray-500">Her gün sonunda tüm öğrencilerin özetini içeren PDF al.</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500"
                                        checked={formData.receive_weekly_backup}
                                        onChange={e => setFormData({ ...formData, receive_weekly_backup: e.target.checked })}
                                    />
                                    <div>
                                        <p className="font-medium">Haftalık Rapor Maili</p>
                                        <p className="text-xs text-gray-500">Hafta sonu detaylı analiz ve grafik içeren PDF al.</p>
                                    </div>
                                </label>
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
                        <h3 className="font-bold mb-4">Manuel Yedek</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Anlık olarak veritabanı yedeğini mail adresinize gönderir.
                        </p>
                        <button onClick={handleManualBackup} className="w-full py-3 bg-gray-800 text-white dark:bg-white/10 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                            <FileText size={18} />
                            Raporu Şimda Al
                        </button>
                        <button className="w-full mt-2 py-3 bg-gray-800 text-white dark:bg-white/10 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                            <Download size={18} />
                            Verileri İndir (JSON)
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
