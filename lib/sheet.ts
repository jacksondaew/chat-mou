const SHEET_CSV_URL = process.env.SHEET_CSV_URL ?? '';

export async function fetchFAQ(): Promise<string> {
  if (!SHEET_CSV_URL) return '';
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) return '';
    return res.text();
  } catch {
    return '';
  }
}
