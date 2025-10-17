import { Lock } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="bg-red-100 p-4 rounded-full mb-6 animate-pulse">
              <Lock className="w-12 h-12 text-red-600 animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 animate-slide-up">
            404 Page Not Found
          </h2>
          {/* <span className="text-3xl font-bold text-center text-gray-900 animate-slide-up">
            Access
          </span> */}
        </div>

        <div className="space-y-4 animate-fade-in-up">
          <p className="text-center text-gray-600">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-center text-gray-500 text-sm">
            It might have been moved, deleted, or you may have typed the URL
            incorrectly.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transform transition-all hover:scale-105 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
