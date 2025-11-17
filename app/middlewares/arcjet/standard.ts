import arcjet, { detectBot, shield } from "@/lib/arcjet";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { base } from "../base";
import { error } from "console";

const buildStandardAj = () =>
  arcjet
    .withRule(
      shield({
        mode: "LIVE",
      })
    )
    .withRule(
      detectBot({
        mode: "LIVE",
        allow: [
          "CATEGORY:SEARCH_ENGINE",
          "CATEGORY:MONITOR",
          "CATEGORY:PREVIEW",
        ],
      })
    );

export const standardSecurityMiddleware = base
  .$context<{ request: Request; user: KindeUser<Record<string, unknown>> }>()
  .middleware(async ({ context, next, errors }) => {
    const desicion = await buildStandardAj().protect(context.request, {
      userId: context.user.id,
    });

    if (desicion.isDenied()) {
      if (desicion.reason.isBot()) {
        throw errors.FORBIDDEN({
          message: "Access denied: Bot traffic detected.",
        });
      }

      if (desicion.reason.isShield()) {
        throw errors.FORBIDDEN({
          message: "Access denied: Suspicious activity detected(WAF.",
        });
      }

      throw errors.FORBIDDEN({
        message: "Access denied !.",
      });
    }

    return next();
  });
