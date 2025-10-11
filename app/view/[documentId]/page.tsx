import { getDocumentById, getCurrentUser } from "@/lib/actions"
import { DocumentViewer } from "@/components/document-viewer"
import { notFound } from "next/navigation"
import { AppHeader } from "@/components/app-header"

export default async function ViewPage({ params }: { params: { documentId: string } }) {
  const document = await getDocumentById(params.documentId)
  const user = await getCurrentUser()

  if (!document) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <AppHeader
        user={user}
        title={`${document.user_name}'s document`}
        subtitle={document.file_name.length > 50 ? `${document.file_name.substring(0, 50)}...` : document.file_name}
        showUserInfo={false}
      />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <DocumentViewer document={document} />
        </div>
      </div>
    </main>
  )
}
