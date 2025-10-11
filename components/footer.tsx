import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full py-8 mt-16 border-t border-gray-200">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-gray-500">
        <Link
          href="https://v0.dev/community/minisign-ivcuZjJQPoD"
          target="_blank"
          className="hover:text-gray-700 transition-colors duration-200"
        >
          Built with v0.dev
        </Link>
        <span className="hidden sm:inline text-gray-300">•</span>
        <Link
          href="https://x.com/EstebanSuarez"
          target="_blank"
          className="hover:text-gray-700 transition-colors duration-200"
        >
          @estebansuarez
        </Link>
      </div>
    </footer>
  )
}
