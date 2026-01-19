export const summaryKeys = {
  weekly: (weekStart: string) => ['summary', 'weekly', weekStart] as const,
  monthly: (month: string) => ['summary', 'monthly', month] as const,
}
