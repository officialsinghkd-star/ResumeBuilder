import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'

export default function ResumesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">{children}</main>
      </div>
    </>
  )
}
