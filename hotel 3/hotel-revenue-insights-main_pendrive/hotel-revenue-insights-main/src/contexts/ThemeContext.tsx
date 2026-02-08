import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Theme = "dark" | "light-blue" | "light-pink";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get theme from localStorage or default to dark
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved || "dark";
  });

  // Update localStorage and DOM when theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("dark", "light-blue", "light-pink");
    
    // Add current theme class and data attribute
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light-blue") {
      root.classList.add("light-blue");
    } else if (theme === "light-pink") {
      root.classList.add("light-pink");
    }
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const themes: Theme[] = ["dark", "light-blue", "light-pink"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeState(themes[nextIndex]);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
