const { hasFeaturedMissions } = require("../../../lib/services/missions");

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ count: 1 })),
      })),
    })),
  })),
}));

describe("hasFeaturedMissions", () => {
  it("フィーチャーミッションが存在する場合", async () => {
    const result = await hasFeaturedMissions();
    expect(result).toBe(true);
  });

  it("フィーチャーミッションが存在しない場合", async () => {
    const mockClient = require("../../../lib/supabase/server").createClient;
    mockClient.mockReturnValueOnce({
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ count: 0 }),
        }),
      }),
    });
    const result = await hasFeaturedMissions();
    expect(result).toBe(false);
  });
});
