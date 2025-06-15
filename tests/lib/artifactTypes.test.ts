const {
  ARTIFACT_TYPES,
  getArtifactConfig,
} = require("../../lib/artifactTypes");

describe("ARTIFACT_TYPES", () => {
  it("アーティファクトタイプが定義されている", () => {
    expect(ARTIFACT_TYPES).toBeDefined();
    expect(typeof ARTIFACT_TYPES).toBe("object");
  });

  it("LINKタイプが存在する", () => {
    expect(ARTIFACT_TYPES.LINK).toBeDefined();
    expect(ARTIFACT_TYPES.LINK.key).toBe("LINK");
  });
});

describe("getArtifactConfig", () => {
  it("正常なタイプでコンフィグ取得", () => {
    const result = getArtifactConfig("LINK");
    expect(result).toBeDefined();
  });

  it("無効なタイプでNONE返却", () => {
    const result = getArtifactConfig("INVALID");
    expect(result.key).toBe("NONE");
  });
});
