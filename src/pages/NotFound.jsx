import { Link, useLocation } from 'react-router-dom'
import { Home as HomeIcon, SearchX } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function NotFound() {
  const location = useLocation()
  const page = location.pathname.replace('/', '') || 'Home'

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-slate-500" />
        </div>
        <p className="text-5xl font-extrabold grad-text">404</p>
        <h1 className="text-2xl font-bold text-white mt-3">Page Not Found</h1>
        <p className="text-slate-400 mt-3">
          The page <span className="text-slate-300 font-medium">“{page}”</span> could not be found in this application.
        </p>
        <Button asChild className="mt-7">
          <Link to="/Home">
            <HomeIcon className="w-4 h-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
