/**
 * Utility functions for URL and image handling
 */

/**
 * Generate full URL for uploaded files
 * @param {Object} req - Express request object
 * @param {string} filename - The filename of the uploaded file
 * @returns {string} Full URL to the file
 */
export const generateImageUrl = (req, filename) => {
	// Use API_URL from environment if available (for production)
	// Otherwise construct URL from request (for development)
	const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
	return `${baseUrl}/uploads/${filename}`;
};

/**
 * Extract filename from full image URL
 * @param {string} imageUrl - Full URL to the image
 * @returns {string} Just the filename
 */
export const extractFilename = (imageUrl) => {
	if (!imageUrl) return null;
	return imageUrl.split('/').pop();
};

/**
 * Validate if URL is a full URL or relative path
 * @param {string} url - URL to validate
 * @returns {boolean} True if it's a full URL, false if relative
 */
export const isFullUrl = (url) => {
	if (!url) return false;
	return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Convert relative image paths to full URLs for existing data
 * @param {Object} req - Express request object
 * @param {string} imagePath - Image path (could be relative or full URL)
 * @returns {string} Full URL to the image
 */
export const convertToFullUrl = (req, imagePath) => {
	if (!imagePath) return null;

	// If it's already a full URL, return as is
	if (isFullUrl(imagePath)) {
		return imagePath;
	}

	// If it's a relative path, convert to full URL
	const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
	// Remove leading slash if present to avoid double slashes
	const cleanPath = imagePath.startsWith('/')
		? imagePath.substring(1)
		: imagePath;
	return `${baseUrl}/${cleanPath}`;
};
