import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            onClick={toggleTheme}
            className={`relative w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${theme === "dark" ? "bg-gray-700" : "bg-gold-500"
                }`}
        >
            <motion.div
                layout
                className="bg-white w-6 h-6 rounded-full shadow-md flex items-center justify-center"
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                style={{
                    marginLeft: theme === "dark" ? "auto" : "0",
                    marginRight: theme === "dark" ? "0" : "auto"
                }}
            >
                {theme === "dark" ? (
                    <Moon size={14} className="text-gray-900" />
                ) : (
                    <Sun size={14} className="text-orange-500" />
                )}
            </motion.div>
        </div>
    );
};

export default ThemeToggle;
