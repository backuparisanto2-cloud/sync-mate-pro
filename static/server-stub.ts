/**
 * Pengganti modul *.server.* pada build statis.
 *
 * Handler API hanya berjalan di backend, jadi pada bundel browser modulnya
 * cukup diganti stub yang melempar bila (secara tidak sengaja) dipanggil.
 */
function unavailable(): never {
  throw new Error("Modul server tidak tersedia pada build statis.");
}

export const corsHeaders = unavailable;
export const requireUser = unavailable;
export const sendReminder = unavailable;
export const supabaseAdmin = new Proxy({}, { get: unavailable });

export default new Proxy({}, { get: () => unavailable });
