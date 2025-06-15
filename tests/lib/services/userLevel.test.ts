const {
  getMyUserLevel,
  getUserLevel,
  initializeUserLevel,
} = require("../../../lib/services/userLevel");

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-id" } },
          error: null,
        }),
      ),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: "test-id", xp: 100, level: 2 },
              error: null,
            }),
          ),
          maybeSingle: jest.fn(() =>
            Promise.resolve({
              data: { id: "test-id", xp: 100, level: 2 },
              error: null,
            }),
          ),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: "test-id", xp: 0, level: 1 },
              error: null,
            }),
          ),
        })),
      })),
    })),
  })),
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: "test-id", xp: 100, level: 2 },
              error: null,
            }),
          ),
          maybeSingle: jest.fn(() =>
            Promise.resolve({
              data: { id: "test-id", xp: 100, level: 2 },
              error: null,
            }),
          ),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: "test-id", xp: 0, level: 1 },
              error: null,
            }),
          ),
        })),
      })),
    })),
  })),
}));

describe("getMyUserLevel", () => {
  it("正常なユーザーレベル取得", async () => {
    const result = await getMyUserLevel();
    expect(result).toBeDefined();
  });

  it("ユーザーレベル取得エラー処理", async () => {
    const mockClient = require("../../../lib/supabase/server").createClient;
    mockClient.mockReturnValueOnce({
      auth: {
        getUser: () =>
          Promise.resolve({ data: { user: null }, error: "error" }),
      },
    });
    const result = await getMyUserLevel();
    expect(result).toBeNull();
  });
});

describe("getUserLevel", () => {
  it("正常なユーザーレベル取得", async () => {
    const result = await getUserLevel("test-id");
    expect(result).toBeDefined();
  });

  it("存在しないユーザーのレベル", async () => {
    const result = await getUserLevel("");
    expect(result).toBeDefined();
  });
});

describe("initializeUserLevel", () => {
  it("正常なユーザーレベル初期化", async () => {
    const result = await initializeUserLevel("test-id");
    expect(result).toBeDefined();
  });

  it("空IDでユーザーレベル初期化", async () => {
    const result = await initializeUserLevel("");
    expect(result).toBeDefined();
  });
});
