const { getAvatarUrl, AVATAR_MAX_FILE_SIZE } = require("../../lib/avatar");

const mockClient = {
  storage: {
    from: () => ({
      getPublicUrl: () => ({
        data: { publicUrl: "https://example.com/avatar.jpg" },
      }),
    }),
  },
};

describe("getAvatarUrl", () => {
  it("正常なパスでアバターURL生成", () => {
    const result = getAvatarUrl(mockClient, "avatar/test.jpg");
    expect(typeof result).toBe("string");
  });

  it("空パスで空文字列返却", () => {
    const result = getAvatarUrl(mockClient, "");
    expect(result).toBe("");
  });
});

describe("AVATAR_MAX_FILE_SIZE", () => {
  it("最大ファイルサイズが定義されている", () => {
    expect(AVATAR_MAX_FILE_SIZE).toBeDefined();
    expect(typeof AVATAR_MAX_FILE_SIZE).toBe("number");
  });

  it("正の値である", () => {
    expect(AVATAR_MAX_FILE_SIZE).toBeGreaterThan(0);
  });
});
