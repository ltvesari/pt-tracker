import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const success = await login(username, password);
        if (success) {
            navigate("/");
        } else {
            setError("Giriş başarısız. Bilgilerinizi kontrol edin.");
        }
    };

    return (
        <div className="min-h-screen flex text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-500 bg-[#eaf4ff] dark:bg-[#1a1a1a]">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Left Side - Visual & Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-50 dark:bg-black items-center justify-center overflow-hidden transition-colors duration-500">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent dark:from-gold-900/40 dark:via-black dark:to-black animate-spin-slow opacity-60" style={{ animationDuration: '60s' }} />
                </div>

                <div className="relative z-10 text-center p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gold-400 to-gold-600 mx-auto flex items-center justify-center shadow-2xl shadow-gold-500/30 mb-6 animate-float">
                            <span className="text-4xl font-bold text-black">PT</span>
                        </div>
                        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-b from-gray-800 to-gray-500 dark:from-white dark:to-gray-500 bg-clip-text text-transparent">
                            PT Tracker
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                            Öğrencilerini yönetmenin <span className="text-gold-600 dark:text-gold-500 font-semibold">en şık</span> ve <span className="text-gold-600 dark:text-gold-500 font-semibold">en güçlü</span> yolu.
                        </p>
                    </motion.div>
                </div>

                {/* Abstract Lines */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gold-500/5 to-transparent pointer-events-none" />
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative transition-colors duration-500">
                {/* Mobile Background (for small screens) */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <div className="absolute top-[-20%] right-[-20%] w-[100%] h-[100%] bg-gold-500/10 blur-[100px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="mb-10 text-center lg:text-left">
                        {/* Mobile Logo Only */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold-400 to-gold-600 flex lg:hidden items-center justify-center shadow-lg shadow-gold-500/30 mb-6 mx-auto">
                            <span className="text-2xl font-bold text-black">PT</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">Hoş Geldiniz</h2>
                        <p className="text-gray-500 dark:text-gray-400">Hesabınıza giriş yaparak devam edin.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center gap-3"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2 group"
                        >
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 group-focus-within:text-gold-600 dark:group-focus-within:text-gold-500 transition-colors">Kullanıcı Adı</label>
                            <div className="relative">
                                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-600 dark:group-focus-within:text-gold-500 transition-colors" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field pl-12 h-12 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
                                    placeholder="Kullanıcı adınız"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-2 group"
                        >
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 group-focus-within:text-gold-600 dark:group-focus-within:text-gold-500 transition-colors">Şifre</label>
                                <Link to="/forgot-password" className="text-xs text-gold-600 dark:text-gold-500 hover:text-gold-500 transition-colors">
                                    Şifremi Unuttum?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-600 dark:group-focus-within:text-gold-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-12 h-12 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn-primary w-full h-12 text-lg flex items-center justify-center gap-3 mt-8"
                        >
                            <span>Giriş Yap</span>
                            <ArrowRight size={20} />
                        </motion.button>
                    </form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center text-sm text-gray-500"
                    >
                        Hesabınız yok mu?{" "}
                        <Link to="/register" className="text-gold-600 dark:text-gold-500 hover:text-gold-500 font-bold transition-colors hover:underline underline-offset-4">
                            Hemen Kayıt Ol
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
