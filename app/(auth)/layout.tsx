export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center text-white text-sm font-bold">M</div>
          <span className="text-lg font-semibold text-gray-900">Mirarch</span>
        </div>
        {children}
      </div>
    </div>
  )
}
