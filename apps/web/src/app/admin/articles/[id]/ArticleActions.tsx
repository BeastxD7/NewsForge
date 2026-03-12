"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateArticleStatus } from "@/app/admin/articles/actions"

interface ArticleActionsProps {
  id: string
  status: string
}

export function ArticleActions({ id, status }: ArticleActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleAction = (newStatus: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await updateArticleStatus(id, newStatus)
      if (result.success) {
        toast.success(`Article ${newStatus.toLowerCase()}`)
        router.refresh()
      } else {
        toast.error(result.error ?? "Something went wrong")
      }
    })
  }

  return (
    <div className="flex gap-2">
      {status !== "APPROVED" && (
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 hover:text-green-700"
          onClick={() => handleAction("APPROVED")}
          disabled={isPending}
        >
          <CheckCircle className="size-4" />
          Approve
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => handleAction("REJECTED")}
          disabled={isPending}
        >
          <XCircle className="size-4" />
          Reject
        </Button>
      )}
    </div>
  )
}
