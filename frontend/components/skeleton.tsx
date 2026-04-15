import React from "react";

const SkeletonResult = () => {
  return (
    <div className="max-h-screen">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl overflow-hidden h-full">
        {/* Skeleton Header */}
        <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/20 px-8 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-4 bg-gray-500/20 rounded-2xl mr-6 shadow-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-400/30 rounded" />
              </div>
              <div>
                <div className="h-8 bg-gray-400/30 rounded-lg mb-2 w-48 animate-pulse" />
                <div className="h-4 bg-gray-400/20 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-6 py-3 bg-gray-500/20 rounded-full border border-gray-500/30 animate-pulse">
                <div className="h-6 bg-gray-400/30 rounded w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Content */}
        <div className="p-8">
          {/* Skeleton Overview */}
          <div className="mb-8">
            <div className="h-8 bg-gray-400/30 rounded-lg mb-6 w-32 animate-pulse" />
            <div className="p-6 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/30">
              <div className="space-y-3">
                <div className="h-4 bg-gray-400/20 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-400/20 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-400/20 rounded w-4/6 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Skeleton Analysis Sections */}
          <div className="space-y-6">
            {/* Skeleton Strengths */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/20 rounded-2xl border border-gray-700/30 shadow-lg animate-pulse">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gray-500/20 rounded-xl mr-5 shadow-md">
                    <div className="w-8 h-8 bg-gray-400/30 rounded" />
                  </div>
                  <div>
                    <div className="h-6 bg-gray-400/30 rounded w-24 mb-2" />
                    <div className="h-4 bg-gray-400/20 rounded w-32" />
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-400/30 rounded" />
              </div>
            </div>

            {/* Skeleton Weaknesses */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/20 rounded-2xl border border-gray-700/30 shadow-lg animate-pulse">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gray-500/20 rounded-xl mr-5 shadow-md">
                    <div className="w-8 h-8 bg-gray-400/30 rounded" />
                  </div>
                  <div>
                    <div className="h-6 bg-gray-400/30 rounded w-24 mb-2" />
                    <div className="h-4 bg-gray-400/20 rounded w-32" />
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-400/30 rounded" />
              </div>
            </div>

            {/* Skeleton Improvements */}
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/20 rounded-2xl border border-gray-700/30 shadow-lg animate-pulse">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gray-500/20 rounded-xl mr-5 shadow-md">
                    <div className="w-8 h-8 bg-gray-400/30 rounded" />
                  </div>
                  <div>
                    <div className="h-6 bg-gray-400/30 rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-400/20 rounded w-36" />
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-400/30 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Action Footer */}
        <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 px-8 py-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="px-6 py-3 bg-gray-500/20 rounded-xl animate-pulse">
                <div className="h-6 bg-gray-400/30 rounded w-24" />
              </div>
              <div className="px-6 py-3 bg-gray-500/20 rounded-xl animate-pulse">
                <div className="h-6 bg-gray-400/30 rounded w-16" />
              </div>
            </div>
            <div className="h-4 bg-gray-400/20 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonResult;
