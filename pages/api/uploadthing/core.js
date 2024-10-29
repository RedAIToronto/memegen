import { createUploadthing } from "uploadthing/next"

const f = createUploadthing()

const auth = (req) => ({ id: "fakeId" }) // Add your auth logic here

export const ourFileRouter = {
  modelTraining: f({ image: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = auth(req)
      if (!user) throw new Error("Unauthorized")
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload complete for userId:", metadata.userId)
        console.log("File URL:", file.url)
        
        return { uploadedBy: metadata.userId }
      } catch (error) {
        console.error("Upload error:", error)
        throw new Error("Failed to process upload")
      }
    }),
} 