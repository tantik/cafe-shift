import type { Employee, ShiftType } from "@/types/domain";

export const DEMO_START_DATE = "2026-06-01";
export const DEMO_TARGET_MONTH_LABEL = "2026年6月";

export const employees = [
  { id: "tanaka", name: "田中 優", role: "manager", avatarLabel: "TY", isActive: true },
  { id: "yamada", name: "山田 花子", role: "worker", avatarLabel: "YH", isActive: true },
  { id: "sato", name: "佐藤 健", role: "worker", avatarLabel: "SK", isActive: true },
  { id: "suzuki", name: "鈴木 愛", role: "worker", avatarLabel: "SA", isActive: true },
  { id: "ito", name: "伊藤 翔", role: "worker", avatarLabel: "IS", isActive: true },
  { id: "takahashi", name: "高橋 美咲", role: "worker", avatarLabel: "TM", isActive: false },
] satisfies Employee[];

export const shiftTypes = [
  {
    code: "shift_1",
    label: "1シフト",
    shortLabel: "①",
    startTime: "08:30",
    endTime: "13:00",
    hours: 4.5,
    isWorkingShift: true,
  },
  {
    code: "shift_2",
    label: "2シフト",
    shortLabel: "②",
    startTime: "13:00",
    endTime: "17:30",
    hours: 4.5,
    isWorkingShift: true,
  },
  {
    code: "full_day",
    label: "通しシフト",
    shortLabel: "通",
    startTime: "08:30",
    endTime: "17:30",
    hours: 9,
    isWorkingShift: true,
  },
  {
    code: "off",
    label: "休み",
    shortLabel: "休",
    startTime: null,
    endTime: null,
    hours: 0,
    isWorkingShift: false,
  },
  {
    code: "vacation",
    label: "休暇",
    shortLabel: "休暇",
    startTime: null,
    endTime: null,
    hours: 0,
    isWorkingShift: false,
  },
  {
    code: "sick",
    label: "病欠",
    shortLabel: "病欠",
    startTime: null,
    endTime: null,
    hours: 0,
    isWorkingShift: false,
  },
] satisfies ShiftType[];
