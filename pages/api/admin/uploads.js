export default async function handler(req, res) {
  // Here you would fetch uploads from your storage (e.g., UploadThing)
  // For now, returning mock data
  res.status(200).json({
    uploads: [
      {
        id: 1,
        name: 'training-data.zip',
        url: 'https://utfs.io/f/...',
        timestamp: new Date().toISOString()
      }
    ]
  });
}
