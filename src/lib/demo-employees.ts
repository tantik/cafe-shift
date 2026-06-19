export type DemoEmployee = {
  id: string;
  name: string;
  initials: string;
  active: boolean;
  lineUserId: string;
  memo: string;
};

export const demoEmployees: DemoEmployee[] = [
  { id: "manabu", name: "まなぶ", initials: "MA", active: true, lineUserId: "line_manabu", memo: "" },
  { id: "ly", name: "LY", initials: "LY", active: true, lineUserId: "line_ly", memo: "" },
  { id: "yuko", name: "ゆうこ", initials: "YK", active: true, lineUserId: "line_yuko", memo: "" },
  { id: "seira", name: "せいら", initials: "SE", active: true, lineUserId: "", memo: "" },
  { id: "asako", name: "あさこ", initials: "AS", active: true, lineUserId: "line_asako", memo: "" },
  { id: "my_ha", name: "My Ha", initials: "MH", active: true, lineUserId: "", memo: "" },
  { id: "hyori", name: "Hyori", initials: "HY", active: true, lineUserId: "line_hyori", memo: "" },
  { id: "bui", name: "Bui", initials: "BU", active: true, lineUserId: "", memo: "" },
  { id: "olha", name: "Olha", initials: "OL", active: true, lineUserId: "line_olha", memo: "" },
  { id: "grace", name: "Grace", initials: "GR", active: true, lineUserId: "line_grace", memo: "" },
  { id: "cons", name: "Cons", initials: "CO", active: true, lineUserId: "", memo: "3シフトのみ" },
  { id: "bao", name: "Bao", initials: "BA", active: true, lineUserId: "line_bao", memo: "" },
  { id: "gyu", name: "GYU", initials: "GY", active: true, lineUserId: "", memo: "" },
  { id: "estany", name: "Estany", initials: "ES", active: true, lineUserId: "line_estany", memo: "" },
  { id: "maria", name: "Maria", initials: "MR", active: true, lineUserId: "", memo: "" },
];

// Demo current employee. In production this will be resolved from LINE LIFF userId.
export const currentDemoEmployeeName = "Cons";

export const currentDemoEmployee = demoEmployees.find((employee) => employee.name === currentDemoEmployeeName) ?? demoEmployees[0];
