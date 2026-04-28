const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function uploadPath(relativePath) {
	// Ensure relativePath starts with a slash
	if (!relativePath) return '';
	const p = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
	return API_BASE_URL ? `${API_BASE_URL}${p}` : p;
}

function resolveUrl(pathOrUrl) {
	if (!pathOrUrl) return '';
	// absolute URL -> return as-is
	if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
	// if already absolute path (/uploads/...), prefix with API_BASE_URL when available
	if (pathOrUrl.startsWith('/')) return API_BASE_URL ? `${API_BASE_URL}${pathOrUrl}` : pathOrUrl;
	// otherwise treat as relative path
	return API_BASE_URL ? `${API_BASE_URL}/${pathOrUrl}` : `/${pathOrUrl}`;
}

export default API_BASE_URL;
export { uploadPath, resolveUrl };