import { ImSpinner8 } from 'react-icons/im'

export default function LoadingRecommendations({ recommendationActiveLog }: { recommendationActiveLog: string | null }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 space-y-4 text-center text-gray-700 dark:text-gray-200"
      id="loading-recommendations"
    >
      <ImSpinner8 className="animate-spin text-4xl text-blue-500" />
      <p className="text-xl font-semibold">Curating the best recommendations for you...</p>
      <p className="text-sm text-gray-500">This might take a few seconds. Hang tight!</p>

      {recommendationActiveLog && (
        <div className="mt-10 p-4 bg-gray-100 rounded-md shadow-md">
          <p className="text-sm text-gray-600">{recommendationActiveLog}</p>
        </div>
      )}
    </div>
  )
}
