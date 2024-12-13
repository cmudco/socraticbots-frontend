// src/layouts/RootLayout.tsx
import { ReactNode } from 'react'

type RootLayoutProps = {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <div className="root-layout">
      <header>
        <h1>SocraticBooks</h1>
      </header>
      <main>{children}</main>
    </div>
  )
}