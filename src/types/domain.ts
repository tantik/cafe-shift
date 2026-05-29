export type Role = "manager" | "worker";

export type ShiftCode =
  | "shift_1"
  | "shift_2"
  | "full_day"
  | "off"
  | "vacation"
  | "sick";

export type ShiftRequestStatus = "pending" | "reviewed" | "applied";

export type ShiftRequest = {
  id: string;
  employeeId: string;
  date: string;
  shiftCode: ShiftCode;
  note?: string;
  status: ShiftRequestStatus;
  createdAt: string;
};

export type OvertimeStatus = "reported" | "reviewed";

export type OvertimeEntry = {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: OvertimeStatus;
  createdAt: string;
};

export type Employee = {
  id: string;
  name: string;
  kana?: string;
  role: Role;
  avatarLabel: string;
  colorLabel?: string;
  isActive: boolean;
};

export type ShiftType = {
  code: ShiftCode;
  label: string;
  shortLabel: string;
  startTime: string | null;
  endTime: string | null;
  hours: number;
  isWorkingShift: boolean;
};
