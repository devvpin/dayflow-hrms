import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-9xl font-bold text-gray-200">403</h1>
        <h2 className="text-3xl font-semibold text-gray-800">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to perform this action or access this page.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
