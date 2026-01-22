import { useState, useEffect } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { BarChart2, AlertCircle, Clock, History, FileText, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Reports() {
    const [stats, setStats] = useState({
        low_balance: [],
        absent_students: [],
        monthly_chart: []
    });
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, historyRes] = await Promise.all([
                api.get("/reports/dashboard-stats"),
                api.get("/reports/history")
            ]);
            setStats(statsRes.data);
            setHistory(historyRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart2 className="text-gold-500" />
                Raporlar & İstatistikler
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Monthly Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <h3 className="font-bold mb-6 text-lg">Aylık Ders Performansı</h3>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthly_chart}>
                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="lessons" radius={[4, 4, 0, 0]}>
                                    {stats.monthly_chart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#D4AF37' : '#E5C158'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Action Items Cards */}
                <div className="space-y-6">
                    {/* Low Balance */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 border-l-4 border-red-500"
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-red-500">
                            <AlertCircle size={20} />
                            Paket Yenilemesi Gerekenler ({stats.low_balance.length})
                        </h3>
                        <ul className="space-y-2 max-h-40 overflow-auto custom-scrollbar">
                            {stats.low_balance.map(s => (
                                <li key={s.id} className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded">
                                    <span className="font-medium">{s.first_name} {s.last_name}</span>
                                    <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold">
                                        {s.package_remaining} Ders Kaldı
                                    </span>
                                </li>
                            ))}
                            {stats.low_balance.length === 0 && <p className="text-gray-500 text-sm">Herkesin bakiyesi yeterli.</p>}
                        </ul>
                    </motion.div>

                    {/* Absents */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6 border-l-4 border-orange-500"
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-orange-500">
                            <Clock size={20} />
                            Gelmeyenler (&gt;7 Gün)
                        </h3>
                        <ul className="space-y-2 max-h-40 overflow-auto custom-scrollbar">
                            {stats.absent_students.map(s => (
                                <li key={s.id} className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded">
                                    <span className="font-medium">{s.first_name} {s.last_name}</span>
                                    <span className="text-gray-400 text-xs">
                                        {new Date(s.last_lesson_date).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                            {stats.absent_students.length === 0 && <p className="text-gray-500 text-sm">Devamsızlık yapan yok.</p>}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* History Log */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
            >
                <h3 className="font-bold mb-6 flex items-center gap-2">
                    <History className="text-gray-400" />
                    Son İşlem Geçmişi
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 border-b border-gray-200 dark:border-white/10 uppercase text-xs">
                            <tr>
                                <th className="py-3">Tarih</th>
                                <th className="py-3">Öğrenci</th>
                                <th className="py-3">İşlem</th>
                                <th className="py-3">Detay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(log => (
                                <tr key={log.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="py-3 text-gray-400">
                                        {new Date(log.date).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="py-3 font-medium">{log.student_name}</td>
                                    <td className="py-3">
                                        {log.type === 'deduct' && (
                                            <span className="flex items-center gap-1 text-gold-500">
                                                <FileText size={14} /> Ders İşlendi
                                            </span>
                                        )}
                                        {log.type === 'add' && (
                                            <span className="flex items-center gap-1 text-green-500 font-bold">
                                                <Plus size={14} /> Paket Eklendi
                                            </span>
                                        )}
                                        {log.type === 'undo' && (
                                            <span className="text-orange-500">İptal / Geri Alma</span>
                                        )}
                                    </td>
                                    <td className="py-3 font-medium text-gray-300">
                                        {log.type === 'deduct' ? `-${log.count} Ders` :
                                            log.type === 'add' ? `+${log.count} Ders` :
                                                `+${Math.abs(log.count)} İade`}
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-4 text-gray-500">Henüz işlem yok</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
