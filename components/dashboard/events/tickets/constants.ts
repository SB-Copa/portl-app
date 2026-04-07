export const kindLabels: Record<string, string> = {
  GENERAL: 'General Admission',
  TABLE: 'Table',
  SEAT: 'Seat',
};

export const kindColors: Record<string, string> = {
  GENERAL: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  TABLE: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  SEAT: 'bg-green-100 text-green-800 hover:bg-green-100',
};

export const kindOrder = ['GENERAL', 'TABLE', 'SEAT'] as const;
