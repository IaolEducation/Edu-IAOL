export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
          <div className="animate-pulse mt-6">
            <div className="h-10 bg-blue-200 rounded dark:bg-blue-700"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

