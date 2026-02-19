import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl font-bold text-dash-blue">404</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn-primary inline-block text-center px-8">
        Back to Home
      </Link>
    </div>
  );
}
