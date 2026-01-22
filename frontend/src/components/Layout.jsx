import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { LayoutDashboard, Users, Ruler, BarChart2, User, LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout({ children }) {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: "Panel", path: "/", icon: LayoutDashboard },
        { name: "Öğrenciler", path: "/students", icon: Users },
        { name: "Ölçümler", path: "/measurements", icon: Ruler },
        { name: "Raporlar", path: "/reports", icon: BarChart2 },
        { name: "Profilim", path: "/profile", icon: User },
    ];

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-30">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                    PT Tracker
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-lg"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobileMenu}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-64 z-50
                bg-white/95 dark:bg-black/95 backdrop-blur-xl md:backdrop-blur-none md:bg-white/80 md:dark:bg-black/40
                border-r border-gray-200 dark:border-white/10 flex flex-col p-4
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="hidden md:flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                        PT Tracker
                    </h1>
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Header (Logo inside side menu) */}
                <div className="md:hidden flex items-center justify-between mb-6">
                    <span className="text-lg font-bold text-gray-500">Menü</span>
                    <button onClick={closeMobileMenu}>
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeMobileMenu}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-medium"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <button
                    onClick={() => { logout(); closeMobileMenu(); }}
                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all mt-auto"
                >
                    <LogOut size={20} />
                    Çıkış Yap
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full">
                {children}
            </main>
        </div>
    );
}
