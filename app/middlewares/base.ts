import { os } from "@orpc/server";

export const base = os.$context<{ request: Request }>().errors({
  RATE_LIMITED: {
    message: "You have exceeded your request limit. Please try again later.",
  },
  BAD_REQUEST: {
    message: "The request was invalid or cannot be served.",
  },
  NOT_FOUND: {
    message: "The requested resource could not be found.",
  },
  UNAUTHORIZED: {
    message: "You are not authorized to access this resource.",
  },
  INTERNAL_SERVER_ERROR: {
    message: "An unexpected error occurred on the server.",
  },
  FORBIDDEN: {
    message: "You do not have permission to access this resource.",
  },
});
