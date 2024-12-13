// src/components/layout/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 fixed bottom-0 left-0 right-0 z-40">
      <div className="flex items-center justify-center h-16 px-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Bigue Creation. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
