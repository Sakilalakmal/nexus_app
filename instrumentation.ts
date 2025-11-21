export async function register() {
  // Conditionally import if facing runtime compatibility issues
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await import("@/lib/orpc.server");
    } catch (error) {
      console.error("Failed to load ORPC server:", error);
    }
  }
}