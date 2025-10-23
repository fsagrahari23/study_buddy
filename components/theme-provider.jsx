"use client"

import { useEffect, useState } from "react"

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    document.documentElement.setAttribute("data-theme", newTheme)
    if (newTheme === "dark") {
      document.documentElement.style.colorScheme = "dark"
    } else {
      document.documentElement.style.colorScheme = "light"
    }
  }

  return (
    <div data-theme={theme} className={theme === "dark" ? "dark" : ""}>
      {children}
    </div>
  )
}
