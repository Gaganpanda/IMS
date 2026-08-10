// Base URL of the API (e.g. "http://localhost:8080/api")
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Spring Boot runs under the context-path "/api", so static resources registered
// via WebMvcConfigurer are also served under "/api/uploads/**".
// Stored imageUrl values look like "/uploads/filename.jpg", so we prepend
// the full API base (which already includes "/api") to get the correct URL:
// → "http://localhost:8080/api" + "/uploads/filename.jpg"
// → "http://localhost:8080/api/uploads/filename.jpg"  ✅

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  // Already an absolute URL — return as-is
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // Relative path from backend (e.g. "/uploads/abc123.jpg")
  return `${API_BASE_URL}${imageUrl}`;
};