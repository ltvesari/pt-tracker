import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { LayoutDashboard, Users, Ruler, BarChart2, User, LogOut } from "lucide-react";

export default function Layout({ children }) {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: "Panel", path: "/", icon: LayoutDashboard },
        { name: "Öğrenciler", path: "/students", icon: Users },
        { name: "Ölçümler", path: "/measurements", icon: Ruler },
        { name: "Raporlar", path: "/reports", icon: BarChart2 },
        { name: "Profilim", path: "/profile", icon: User },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar / Navbar */}
            <aside className="w-full md:w-64 bg-white/80 dark:bg-black/40 backdrop-blur-md border-r border-gray-200 dark:border-white/10 flex flex-col p-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                        PT Tracker
                    </h1>
                    <ThemeToggle />
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
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
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all mt-auto"
                >
                    <LogOut size={20} />
                    Çıkış Yap
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
