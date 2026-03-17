import { IngestForm } from "@/components/admin/IngestForm"
import { getRecentYoutubeJobs } from "./actions"

export default async function IngestPage() {
  const initialJobs = await getRecentYoutubeJobs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manual Ingest</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Submit content sources manually. The AI will generate an article and add it to the review queue.
        </p>
      </div>

      <div className="max-w-xl">
        <IngestForm initialJobs={initialJobs} />
      </div>
    </div>
  )
}
