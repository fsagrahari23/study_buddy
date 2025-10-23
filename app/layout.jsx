"use client"

import { Provider } from "react-redux"
import { SessionProvider } from "next-auth/react"
import { store } from "@/lib/store"
import { ThemeProvider } from "@/components/theme-provider"
import "@/app/globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <Provider store={store}>
            <ThemeProvider>{children}</ThemeProvider>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  )
}
