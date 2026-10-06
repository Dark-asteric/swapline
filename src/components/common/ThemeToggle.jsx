import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
const LIGHT = "light";
const DARK = "dark";
const STORAGE_KEY = "swapline-theme";

const getInitialTheme = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === LIGHT || saved === DARK) return saved;
    } catch {
        // storage blocked: fall through to the system setting
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
};

const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
};

applyTheme(getInitialTheme());

const ThemeToggle = ({ withLabel = false, className = "" }) => {
    const [theme, setTheme] = useState(
        () => document.documentElement.getAttribute("data-theme") || getInitialTheme()
    );

    useEffect(() => {
        const sync = () =>
            setTheme(document.documentElement.getAttribute("data-theme") || LIGHT);
        window.addEventListener("themechange", sync);
        return () => window.removeEventListener("themechange", sync);
    }, []);

    const isDark = theme === DARK;

    const toggle = () => {
        const next = isDark ? LIGHT : DARK;
        applyTheme(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // the choice still applies for this visit
        }
        window.dispatchEvent(new Event("themechange"));
    };

    const label = isDark ? "Switch to light mode" : "Switch to dark mode";
    const icon = isDark ? <Sun size={20} /> : <Moon size={20} />;

    if (withLabel) {
        return (
            <button
                type="button"
                onClick={toggle}
                aria-label={label}
                className={`flex items-center gap-2 w-full ${className}`}
            >
                {icon}
                {isDark ? "Light mode" : "Dark mode"}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={label}
            title={label}
            className={`btn btn-ghost btn-circle ${className}`}
        >
            {icon}
        </button>
    );
};

export default ThemeToggle;