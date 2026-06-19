export const managerAuthCookieName = "cafe_shift_manager_session";
export const managerAuthCookieValue = "manager-demo-session";

export function getManagerPassword() {
  return process.env.MANAGER_PASSWORD ?? "333";
}
