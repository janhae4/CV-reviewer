export const getBackendUrl = () => {
  let url = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  
  // Ensure the URL has a protocol
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  
  // Remove trailing slash if exists
  return url.replace(/\/$/, "");
};
