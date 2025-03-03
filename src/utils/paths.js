/**
 * Constructs a URL path with the correct base path
 * @param {string} path - The path to append to the base path
 * @returns {string} The complete URL path
 */
export function getPath(path) {
  // Check if we're in development mode
  const isDev = import.meta.env.DEV;
  
  // Use different base paths for development and production
  let basePath;
  if (isDev == true){
     //console.log("dev");
     basePath = '';
  } else {
     //console.log("prod");
     basePath = '/astro_portfolio';
  }
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Return the combined path
  return `${basePath}/${cleanPath}`;
} 