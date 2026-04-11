/**
 * Fungsi utilitas global
 */

/**
 * Format string tanggal menjadi format ID (Indonesia)
 * @param {string} dateString 
 * @returns {string} Tanggal terformat: 11 Apr 2026, 14:00
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

/**
 * Mendapatkan URL Avatar default dari DiceBear
 * @param {string} seed - Seed unik (biasanya username)
 * @returns {string} URL Gambar
 */
export const defaultAvatar = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || "default"}`;
