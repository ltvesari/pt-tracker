import { useState, useEffect } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Ruler, Save, Trash2, TrendingUp, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Measurements() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [measurements, setMeasurements] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        weight: "",
        fat_ratio: "",
        muscle_ratio: "",
        circumference_waist: "",
        circumference_hip: "",
        date: new Date().toISOString().split('T')[0]
    });

    // Fetch Students on Mount
    useEffect(() => {
        api.get("/students/").then(res => setStudents(res.data));
    }, []);

    // Fetch Measurements when Student Selected
    useEffect(() => {
        if (selectedStudent) {
            fetchMeasurements();
        } else {
            setMeasurements([]);
        }
    }, [selectedStudent]);

    const fetchMeasurements = async () => {
        const res = await api.get(`/measurements/${selectedStudent}`);
        setMeasurements(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return alert("Lütfen bir öğrenci seçin!");

        try {
            await api.post("/measurements/", {
                student_id: selectedStudent,
                ...formData,
                // Convert empty strings to null for backend
                weight: formData.weight || null,
                fat_ratio: formData.fat_ratio || null,
                muscle_ratio: formData.muscle_ratio || null,
                circumference_waist: formData.circumference_waist || null,
                circumference_hip: formData.circumference_hip || null,
            });

            fetchMeasurements();
            // Clear form but keep date
            setFormData(prev => ({ ...prev, weight: "", fat_ratio: "", muscle_ratio: "", circumference_waist: "", circumference_hip: "" }));
            alert("Ölçüm kaydedildi! ✅");
        } catch (err) {
            console.error(err);
            alert("Kaydetme hatası!");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Bu ölçümü silmek istediğine emin misin?")) {
            await api.delete(`/measurements/${id}`);
            setMeasurements(prev => prev.filter(m => m.id !== id));
        }
    };

    // Chart Data Preparation (Reverse for chronological order)
    const chartData = [...measurements].reverse().map(m => ({
        name: new Date(m.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        Kilo: m.weight,
        Yağ: m.fat_ratio,
        Kas: m.muscle_ratio
    }));

    return (
        <div className="space-y-6">
            {/* Student Selector */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Ruler className="text-gold-500" />
                    Ölçüm Takibi
                </h2>

                <div className="relative">
                    <select
                        className="input-field appearance-none cursor-pointer"
                        value={selectedStudent}
                        onChange={e => setSelectedStudent(e.target.value)}
                    >
                        <option value="">Öğrenci Seçiniz...</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.first_name} {s.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedStudent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Measurement Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 lg:col-span-1"
                    >
                        <h3 className="font-bold mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Yeni Ölçüm Ekle</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Tarih</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Kilo (kg)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="input-field"
                                        placeholder="0.0"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Yağ (%)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="input-field"
                                        placeholder="%"
                                        value={formData.fat_ratio}
                                        onChange={e => setFormData({ ...formData, fat_ratio: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Kas (%)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="input-field"
                                        placeholder="%"
                                        value={formData.muscle_ratio}
                                        onChange={e => setFormData({ ...formData, muscle_ratio: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Bel (cm)</label>
                                    <input
                                        type="number" step="0.1"
                                        className="input-field"
                                        placeholder="cm"
                                        value={formData.circumference_waist}
                                        onChange={e => setFormData({ ...formData, circumference_waist: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                                <Save size={18} />
                                Kaydet
                            </button>
                        </form>
                    </motion.div>

                    {/* History & Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 lg:col-span-2 flex flex-col"
                    >
                        {/* Chart */}
                        <div className="h-64 mb-8 w-full">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-gold-500" />
                                Gelişim Grafiği
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                                    <YAxis stroke="#888" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                    />
                                    <Line type="monotone" dataKey="Kilo" stroke="#E5C158" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Yağ" stroke="#ef4444" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-white/10">
                                    <tr>
                                        <th className="py-2">Tarih</th>
                                        <th className="py-2">Kilo</th>
                                        <th className="py-2">Yağ %</th>
                                        <th className="py-2">Kas %</th>
                                        <th className="py-2">Bel</th>
                                        <th className="py-2">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {measurements.map(m => (
                                        <tr key={m.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-3 font-medium">{new Date(m.date).toLocaleDateString()}</td>
                                            <td className="py-3 font-bold text-gold-500">{m.weight}</td>
                                            <td className="py-3">{m.fat_ratio}</td>
                                            <td className="py-3">{m.muscle_ratio}</td>
                                            <td className="py-3">{m.circumference_waist} cm</td>
                                            <td className="py-3">
                                                <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
