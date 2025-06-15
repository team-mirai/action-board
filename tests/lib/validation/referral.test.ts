const {
  isValidReferralCode,
  isEmailAlreadyUsedInReferral,
} = require("../../../lib/validation/referral");

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() =>
              Promise.resolve({ data: { user_id: "test" } }),
            ),
          })),
        })),
      })),
    })),
  })),
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [{ id: "test" }] })),
        })),
      })),
    })),
  })),
}));

describe("isValidReferralCode", () => {
  it("有効な紹介コード", async () => {
    const result = await isValidReferralCode("TESTCODE");
    expect(result).toBe(true);
  });

  it("空の紹介コード", async () => {
    const result = await isValidReferralCode("");
    expect(result).toBe(true);
  });
});

describe("isEmailAlreadyUsedInReferral", () => {
  it("使用済みメールアドレス", async () => {
    const result = await isEmailAlreadyUsedInReferral("test@example.com");
    expect(result).toBe(true);
  });

  it("空のメールアドレス", async () => {
    const result = await isEmailAlreadyUsedInReferral("");
    expect(result).toBe(true);
  });
});
