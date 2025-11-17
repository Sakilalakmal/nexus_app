import arcjet, { detectBot, shield, slidingWindow } from "@/lib/arcjet";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { base } from "../base";
import { error } from "console";

const buildHeavySecurityAj = () =>
  arcjet.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 40,
    })
  );

export const writeSecurityMiddleware = base
  .$context<{ request: Request; user: KindeUser<Record<string, unknown>> }>()
  .middleware(async ({ context, next, errors }) => {
    const desicion = await buildHeavySecurityAj().protect(context.request, {
      userId: context.user.id,
    });

    if (desicion.isDenied()) {
      if (desicion.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "Too many requests. Please try again later.",
        });
      }

      throw errors.FORBIDDEN({
        message: "Access denied !.",
      });
    }

    return next();
  });
