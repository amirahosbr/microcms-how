/**
 * Server API: contact.post.ts
 *
 * @file ./server/api/contact.post.ts
 * @description 求人応募フォームのテストAPIエンドポイントです。
 * @module API
 */

interface ContactBody {
    name: string;
    furigana: string;
    email: string;
    phone: string;
    birthday: string;
    qualifications: string[];
    otherQualification?: string;
    preferredWorkArea: string;
    jobTitle: string;
  }
  
  interface ContactResponse {
    success: boolean;
    message: string;
  }
  
  export default defineEventHandler(
    async (event): Promise<ContactResponse> => {
      const body = await readBody<ContactBody>(event);
  
      // Basic validation
      if (!body.name?.trim()) {
        throw createError({ statusCode: 400, message: "氏名は必須です" });
      }
      if (!body.furigana?.trim()) {
        throw createError({ statusCode: 400, message: "ふりがなは必須です" });
      }
      if (!body.email?.trim()) {
        throw createError({
          statusCode: 400,
          message: "メールアドレスは必須です",
        });
      }
      if (!body.phone?.trim()) {
        throw createError({ statusCode: 400, message: "電話番号は必須です" });
      }
      if (!body.birthday) {
        throw createError({ statusCode: 400, message: "生年月日は必須です" });
      }
      if (!body.qualifications || body.qualifications.length === 0) {
        throw createError({ statusCode: 400, message: "保有資格は必須です" });
      }
      if (!body.preferredWorkArea?.trim()) {
        throw createError({ statusCode: 400, message: "希望エリアは必須です" });
      }
      if (!body.jobTitle?.trim()) {
        throw createError({ statusCode: 400, message: "求人票名は必須です" });
      }
  
      // Log the received data for testing
      console.log("[Contact] Form submission received:", {
        name: body.name,
        furigana: body.furigana,
        email: body.email,
        phone: body.phone,
        birthday: body.birthday,
        qualifications: body.qualifications,
        otherQualification: body.otherQualification,
        preferredWorkArea: body.preferredWorkArea,
        jobTitle: body.jobTitle,
      });
  
      // Return success response
      return {
        success: true,
        message: "Test submission successful",
      };
    },
  );
  