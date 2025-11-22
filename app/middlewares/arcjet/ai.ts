import aj, {
  detectBot,
  sensitiveInfo,
  shield,
  slidingWindow,
} from "@/lib/arcjet";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

const buildAiAj = () =>
  aj
    .withRule(
      shield({
        mode: "LIVE",
      })
    )
    .withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: 3,
      })
    )
    .withRule(
      detectBot({
        mode: "LIVE",
        allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
      })
    )
    .withRule(
      sensitiveInfo({
        mode: "LIVE",
        deny: ["PHONE_NUMBER", "CREDIT_CARD_NUMBER", "IP_ADDRESS"],
      })
    );

export const aiSecurityMiddleware = base
  .$context<{ request: Request; user: KindeUser<Record<string, unknown>> }>()
  .middleware(async ({ context, next, errors }) => {
    const desicion = await buildAiAj().protect(context.request, {
      userId: context.user.id,
    });

    if (desicion.isDenied()) {
      if (desicion.reason.isSensitiveInfo()) {
        throw errors.BAD_REQUEST({
          message:
            "sensitive information detected remove PII(eg: phone number , credit card numbers)",
        });
      }

      if (desicion.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "too may requests",
        });
      }

      if (desicion.reason.isBot()) {
        throw errors.FORBIDDEN({
          message: "look like a bot",
        });
      }

      if (desicion.reason.isShield()) {
        throw errors.FORBIDDEN({
          message: "look like a malicious",
        });
      }

      throw errors.FORBIDDEN({
        message: "Access denied !.",
      });
    }

    return next();
  });
