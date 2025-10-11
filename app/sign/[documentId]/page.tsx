import { getDocumentById } from "@/lib/actions"
import { SignerComponent } from "@/components/signer-component"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer" // Import Footer
import { AppHeader } from "@/components/app-header"

export default async function SignPage({ params }: { params: { documentId: string } }) {
  const document = await getDocumentById(params.documentId)

  if (!document) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader
        title={`${document.user_name} requests you to sign`}
        subtitle={document.file_name.length > 40 ? `${document.file_name.substring(0, 40)}...` : document.file_name}
        showUserInfo={false}
      />
      <main className="flex-grow p-4 sm:p-6">
        {" "}
        {/* Added flex-grow */}
        <div className="max-w-7xl mx-auto">
          <SignerComponent document={document} />
        </div>
      </main>
      <Footer /> {/* Add Footer */}
    </div>
  )
}
