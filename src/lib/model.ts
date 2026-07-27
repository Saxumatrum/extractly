import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

/**
 * Model id (without provider prefix) used for extraction. Chosen for
 * multimodal (vision + PDF) support. Kept in one place so upgrading the
 * model only requires a single edit.
 */
const MODEL_ID = "claude-sonnet-5";

/**
 * Resolves which model/provider path to use for `generateObject` calls.
 *
 * Preferred path: the Vercel AI Gateway, addressed with a plain
 * `"provider/model"` string (e.g. `"anthropic/claude-sonnet-5"`). The AI
 * SDK resolves this automatically as long as `AI_GATEWAY_API_KEY` is set
 * (or the app is running on Vercel, where OIDC covers it for free).
 *
 * Fallback path: if only `ANTHROPIC_API_KEY` is set (no gateway key),
 * call Anthropic directly via `@ai-sdk/anthropic` using the same model.
 * This keeps the app usable for anyone who already has an Anthropic key
 * without requiring a Vercel account.
 */
export function resolveModel(): LanguageModel {
  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    return `anthropic/${MODEL_ID}`;
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(MODEL_ID);
  }
  throw new Error(
    "No model credentials found. Set AI_GATEWAY_API_KEY (recommended, see https://vercel.com/docs/ai-gateway) or ANTHROPIC_API_KEY in your environment.",
  );
}
