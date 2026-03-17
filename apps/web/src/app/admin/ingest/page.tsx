import { IngestForm } from "@/components/admin/IngestForm"
import { JobsHistory } from "@/components/admin/JobsHistory"
import { getYoutubeJobs } from "./actions"

export default async function IngestPage() {
  const initialPage = await getYoutubeJobs(1, "ALL")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manual Ingest</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Submit content sources manually. The AI will generate an article and add it to the review queue.
        </p>
      </div>

      <div className="max-w-xl">
        <IngestForm />
      </div>

      <div className="max-w-3xl">
        <JobsHistory initialPage={initialPage} />
      </div>
    </div>
  )
}
