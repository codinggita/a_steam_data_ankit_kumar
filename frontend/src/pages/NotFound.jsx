import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-6xl font-extrabold text-cyan-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
      <Link to="/dashboard" className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors font-semibold">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
