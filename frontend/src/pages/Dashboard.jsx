import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Plus, Minus, RotateCcw, Calendar, Cake, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function Dashboard() {
    const { user } = useAuth(); // Assuming user has name
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        try {
            const res = await api.get("/students/");
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDeduct = async (id) => {
        try {
            await api.post(`/students/${id}/deduct`);
            fetchStudents(); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    const handleUndo = async (id) => {
        try {
            await api.post(`/students/${id}/undo`);
            fetchStudents();
        } catch (err) {
            alert("Geri alınacak ders bulunamadı!");
        }
    };

    // Birthday Check
    const today = new Date();
    const birthdays = students.filter(s => {
        if (!s.birth_date) return false;
        const d = new Date(s.birth_date);
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold uppercase tracking-wide bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                        MERHABA {user?.first_name || "HOCA"}
                    </h1>
                </div>

                <div className="flex gap-2 text-sm font-medium px-4 py-2 bg-white/50 dark:bg-white/5 rounded-full backdrop-blur-sm border border-gold-500/20">
                    <Calendar className="text-gold-500" size={18} />
                    <span>{today.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </motion.div>

            {/* Birthday Card */}
            <AnimatePresence>
                {birthdays.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass-card p-6 border-l-4 border-l-gold-500 bg-gradient-to-r from-gold-500/10 to-transparent"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gold-100 dark:bg-gold-500/20 rounded-full text-gold-600">
                                <Cake size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">İyi ki Doğdun! 🎉</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Bugün {birthdays.map(s => s.first_name).join(", ")}'in doğum günü. Kutlamayı unutma!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Student List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {students.map((student, i) => (
                    <StudentCard
                        key={student.id}
                        student={student}
                        onDeduct={() => handleDeduct(student.id)}
                        onUndo={() => handleUndo(student.id)}
                        index={i}
                    />
                ))}

                {/* Empty State */}
                {students.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        <p>Henüz öğrenci eklenmedi.</p>
                        <a href="/students" className="text-gold-500 hover:underline">Yeni Öğrenci Ekle +</a>
                    </div>
                )}
            </div>
        </div>
    );
}

function StudentCard({ student, onDeduct, onUndo, index }) {
    const isLowBalance = student.package_remaining < 5;
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/students?edit=${student.id}`)}
            className="glass-card p-5 relative group overflow-hidden flex flex-col justify-between h-full cursor-pointer hover:border-gold-500/50 transition-colors"
        >
            {/* Low Balance Warning */}
            {isLowBalance && (
                <div className="absolute top-2 right-2 animate-pulse text-red-500">
                    <AlertTriangle size={20} />
                </div>
            )}

            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white truncate group-hover:text-gold-500 transition-colors uppercase">
                        {student.first_name} {student.last_name}
                    </h3>
                </div>

                <div className="flex items-baseline gap-1">
                    <span
                        className={clsx(
                            "text-4xl font-black transition-colors duration-500",
                            isLowBalance ? "text-red-500" : "text-gold-500"
                        )}
                    >
                        {student.package_remaining}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Ders Kaldı</span>
                </div>
            </div>

            <div className="space-y-3 mt-auto">
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeduct();
                        }}
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-sm z-10 relative"
                    >
                        <Minus size={18} />
                        DÜŞ
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUndo();
                        }}
                        className="px-3 py-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors z-10 relative"
                        title="Son dersi geri al"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center text-xs text-gray-400 h-8">
                    <span>Son Ders:</span>
                    <span className="font-mono font-bold text-gray-600 dark:text-gray-400">
                        {student.last_lesson_date
                            ? new Date(student.last_lesson_date).toLocaleDateString('tr-TR')
                            : "\u00A0"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
