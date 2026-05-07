/** Local / CI design & QA: bypass Clerk in middleware & resolve DB user without OAuth. Never enable in production. */
export const TESTING_MODE = process.env.TESTING_MODE === "true";

export const TEST_USER_ID = "test-user-id";
export const TEST_USER_EMAIL = "test@meetzy.ai";

export type MockSession = {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  };
  expires: string;
};

/** Shape compatible with common session consumers; Clerk does not use this type. */
export function getMockSession(): MockSession | null {
  if (!TESTING_MODE) return null;
  return {
    user: {
      id: TEST_USER_ID,
      email: TEST_USER_EMAIL,
      name: "Valentín Test",
      image: null,
    },
    expires: "2099-01-01",
  };
}
