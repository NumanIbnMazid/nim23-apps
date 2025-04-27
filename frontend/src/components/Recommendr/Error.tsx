export default function Error({ error }: { error: string | null }) {
  return (
    <div className="error">
      <p className="text-yellow-700 dark:text-yellow-600 text-center p-6 text-lg">{error}</p>
    </div>
  )
}
