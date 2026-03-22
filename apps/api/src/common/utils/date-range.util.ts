const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getKstDayRange(now: Date) {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const startMs =
    Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate(),
    ) - KST_OFFSET_MS;

  return {
    start: new Date(startMs),
    end: new Date(startMs + ONE_DAY_MS),
  };
}
