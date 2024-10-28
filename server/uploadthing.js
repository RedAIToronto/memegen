import { createUploadthing } from "uploadthing/next-legacy";

const f = createUploadthing();

export const ourFileRouter = {
  modelTraining: f({
    "application/zip": { maxFileSize: "100MB" },
    "application/x-zip-compressed": { maxFileSize: "100MB" },
    "application/octet-stream": { maxFileSize: "100MB" },
  })
    .middleware(async () => {
      return { timestamp: Date.now() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }),
};

export default ourFileRouter;
