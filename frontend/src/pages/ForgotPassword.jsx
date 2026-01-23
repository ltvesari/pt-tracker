import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ChevronLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/auth/forgot-password", { email });
            setMessage(res.data.message);
        } catch (err) {
            console.error(err);
            setError("İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
            {/* Background Decorative Elements (Same as Register) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[30%] right-[10%] w-[50%] h-[50%] bg-gold-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card w-full max-w-md p-8 relative z-10 mx-4"
            >
                <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gold-500 mb-6 transition-colors">
                    <ChevronLeft size={20} />
                    Giriş'e Dön
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Şifre Sıfırlama
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Email adresinizi girin, size yeni bir şifre gönderelim.
                    </p>
                </div>

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
                        <CheckCircle size={20} />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Adresi</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-10"
                                placeholder="ornek@mail.com"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? "Gönderiliyor..." : "Şifre Gönder"}
                        {!loading && <ArrowRight size={18} />}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
