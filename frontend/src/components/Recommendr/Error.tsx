export default function Error({ error }: { error: string | null }) {
  return (
    <div className="error">
      <p className="text-yellow-600 dark:text-yellow-400 text-center p-6 text-lg">{error}</p>
    </div>
  )
}
