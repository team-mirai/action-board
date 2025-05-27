import {
  passwordSchema,
  signInAndLoginFormSchema,
  signUpAndLoginFormSchema,
} from "@/lib/validation/auth";

describe("パスワードバリデーション", () => {
  describe("passwordSchema", () => {
    describe("正常なパスワード", () => {
      test("8文字の英数字組み合わせ", () => {
        const result = passwordSchema.safeParse("abc123de");
        expect(result.success).toBe(true);
      });

      test("許可された記号を含む", () => {
        const validPasswords = [
          "pass123@",
          "test123+",
          "user123-",
          "data123*",
          "code123/",
          "app1234#",
          "web1234$",
          "api1234%",
          "dev1234&",
          "pwd1234!",
        ];

        for (const password of validPasswords) {
          const result = passwordSchema.safeParse(password);
          if (!result.success) {
            console.log(
              `Failed password: "${password}", errors:`,
              result.error?.issues,
            );
          }
          expect(result.success).toBe(true);
        }
      });

      test("32文字ちょうどのパスワード", () => {
        const result = passwordSchema.safeParse(
          "abcdefghijklmnopqrstuvwxyz123456",
        ); // 32文字
        expect(result.success).toBe(true);
      });

      test("大文字小文字数字の組み合わせ", () => {
        const result = passwordSchema.safeParse("AbC123dE");
        expect(result.success).toBe(true);
      });
    });

    describe("無効なパスワード", () => {
      test("空文字", () => {
        const result = passwordSchema.safeParse("");
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "パスワードを入力してください",
        );
      });

      test("7文字以下", () => {
        const result = passwordSchema.safeParse("abc123");
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "パスワードは8文字以上で入力してください",
        );
      });

      test("33文字以上", () => {
        const result = passwordSchema.safeParse(
          "abcdefghijklmnopqrstuvwxyz1234567",
        ); // 33文字
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "パスワードは32文字以下で入力してください",
        );
      });

      test("英字のみ", () => {
        const result = passwordSchema.safeParse("abcdefgh");
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "パスワードには英字と数字の両方を含めてください",
        );
      });

      test("数字のみ", () => {
        const result = passwordSchema.safeParse("12345678");
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "パスワードには英字と数字の両方を含めてください",
        );
      });

      test("許可されていない記号を含む", () => {
        const invalidPasswords = [
          "pass123.",
          "test123,",
          "user123;",
          "data123:",
          "code123?",
          "app1234<",
          "web1234>",
          "api1234=",
          "dev1234[",
          "pwd1234]",
          "abc1234{",
          "def1234}",
          "ghi1234|",
          "jkl1234\\",
          "mno1234'",
          'pqr1234"',
          "stu1234~",
          "vwx1234`",
        ];

        for (const password of invalidPasswords) {
          const result = passwordSchema.safeParse(password);
          expect(result.success).toBe(false);
          expect(result.error?.issues[0].message).toBe(
            "パスワードに無効な文字が含まれています",
          );
        }
      });

      test("日本語を含む", () => {
        const result = passwordSchema.safeParse("パスワード123");
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "パスワードに無効な文字が含まれています",
        );
      });

      test("スペースを含む", () => {
        const result = passwordSchema.safeParse("pass 123");
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          "パスワードに無効な文字が含まれています",
        );
      });
    });
  });

  describe("signUpAndLoginFormSchema", () => {
    const validBaseData = {
      email: "test@example.com",
      password: "password123",
      date_of_birth: "1990-01-01",
    };

    test("正常なデータでサインアップ成功", () => {
      const result = signUpAndLoginFormSchema.safeParse(validBaseData);
      expect(result.success).toBe(true);
    });

    test("無効なパスワードでサインアップ失敗", () => {
      const invalidData = {
        ...validBaseData,
        password: "short",
      };
      const result = signUpAndLoginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("無効なメールアドレスでサインアップ失敗", () => {
      const invalidData = {
        ...validBaseData,
        email: "invalid-email",
      };
      const result = signUpAndLoginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("18歳未満でサインアップ失敗", () => {
      const currentYear = new Date().getFullYear();
      const invalidData = {
        ...validBaseData,
        date_of_birth: `${currentYear - 17}-01-01`,
      };
      const result = signUpAndLoginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("signInAndLoginFormSchema", () => {
    const validBaseData = {
      email: "test@example.com",
      password: "password123",
    };

    test("正常なデータでサインイン成功", () => {
      const result = signInAndLoginFormSchema.safeParse(validBaseData);
      expect(result.success).toBe(true);
    });

    test("無効なパスワードでサインイン失敗", () => {
      const invalidData = {
        ...validBaseData,
        password: "123",
      };
      const result = signInAndLoginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("無効なメールアドレスでサインイン失敗", () => {
      const invalidData = {
        ...validBaseData,
        email: "not-an-email",
      };
      const result = signInAndLoginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("パスワード要件の詳細テスト", () => {
    test("許可される文字セットの境界値テスト", () => {
      // 英小文字の境界
      expect(passwordSchema.safeParse("abcdefg1").success).toBe(true);
      expect(passwordSchema.safeParse("zzzzzzz1").success).toBe(true);

      // 英大文字の境界
      expect(passwordSchema.safeParse("ABCDEFG1").success).toBe(true);
      expect(passwordSchema.safeParse("ZZZZZZZ1").success).toBe(true);

      // 数字の境界
      expect(passwordSchema.safeParse("abcdefg0").success).toBe(true);
      expect(passwordSchema.safeParse("abcdefg9").success).toBe(true);

      // 許可される記号の全種類
      const allowedSymbols = "@+-*/#$%&!";
      for (const symbol of allowedSymbols) {
        expect(passwordSchema.safeParse(`abc123${symbol}d`).success).toBe(true);
      }
    });

    test("最小長ちょうどのパスワード", () => {
      expect(passwordSchema.safeParse("abcd1234").success).toBe(true); // 8文字ちょうど
      expect(passwordSchema.safeParse("abcd123").success).toBe(false); // 7文字
    });

    test("英数字の組み合わせパターン", () => {
      // 英字1文字 + 数字7文字
      expect(passwordSchema.safeParse("a1234567").success).toBe(true);

      // 英字7文字 + 数字1文字
      expect(passwordSchema.safeParse("abcdefg1").success).toBe(true);

      // 交互パターン
      expect(passwordSchema.safeParse("a1b2c3d4").success).toBe(true);
    });
  });
});
