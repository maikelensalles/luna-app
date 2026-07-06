export function groupCompletionByDate(rows: { check_date: string; completed: boolean }[]): Map<string, boolean> {
  const flagsByDate = new Map<string, boolean[]>();
  for (const row of rows) {
    const flags = flagsByDate.get(row.check_date) ?? [];
    flags.push(row.completed);
    flagsByDate.set(row.check_date, flags);
  }

  const completedByDate = new Map<string, boolean>();
  for (const [date, flags] of flagsByDate) {
    completedByDate.set(date, flags.length > 0 && flags.every(Boolean));
  }
  return completedByDate;
}
