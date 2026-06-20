export type DemoEmployee = {
  id: string;
  name: string;
  initials: string;
  active: boolean;
  lineUserId: string;
  memo: string;
  hourlyWage: number;
};

export const demoEmployees: DemoEmployee[] = [
  { id: "manabu", name: "まなぶ", initials: "MA", active: true, lineUserId: "line_manabu", memo: "", hourlyWage: 1300 },
  { id: "ly", name: "LY", initials: "LY", active: true, lineUserId: "line_ly", memo: "", hourlyWage: 1250 },
  { id: "yuko", name: "ゆうこ", initials: "YK", active: true, lineUserId: "line_yuko", memo: "", hourlyWage: 1200 },
  { id: "seira", name: "せいら", initials: "SE", active: true, lineUserId: "", memo: "", hourlyWage: 1200 },
  { id: "asako", name: "あさこ", initials: "AS", active: true, lineUserId: "line_asako", memo: "", hourlyWage: 1250 },
  { id: "my_ha", name: "My Ha", initials: "MH", active: true, lineUserId: "", memo: "", hourlyWage: 1200 },
  { id: "hyori", name: "Hyori", initials: "HY", active: true, lineUserId: "line_hyori", memo: "", hourlyWage: 1200 },
  { id: "bui", name: "Bui", initials: "BU", active: true, lineUserId: "", memo: "", hourlyWage: 1200 },
  { id: "olha", name: "Olha", initials: "OL", active: true, lineUserId: "line_olha", memo: "", hourlyWage: 1250 },
  { id: "grace", name: "Grace", initials: "GR", active: true, lineUserId: "line_grace", memo: "", hourlyWage: 1200 },
  { id: "cons", name: "Cons", initials: "CO", active: true, lineUserId: "", memo: "3シフトのみ", hourlyWage: 1300 },
  { id: "bao", name: "Bao", initials: "BA", active: true, lineUserId: "line_bao", memo: "", hourlyWage: 1200 },
  { id: "gyu", name: "GYU", initials: "GY", active: true, lineUserId: "", memo: "", hourlyWage: 1250 },
  { id: "estany", name: "Estany", initials: "ES", active: true, lineUserId: "line_estany", memo: "", hourlyWage: 1200 },
  { id: "maria", name: "Maria", initials: "MR", active: true, lineUserId: "", memo: "", hourlyWage: 1200 },
];

// Demo current employee. In production this will be resolved from LINE LIFF userId.
export const currentDemoEmployeeName = "Cons";

export const currentDemoEmployee = demoEmployees.find((employee) => employee.name === currentDemoEmployeeName) ?? demoEmployees[0];
