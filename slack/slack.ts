import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";

const webhookURL = secret("SlackWebhookURL");

export interface NotifyParams {
  text: string;
}

export const notify = api<NotifyParams>({}, async ({ text }) => {
  const url = webhookURL();

  if (!url) {
    log.info("no slack webhook url defined, skipping slack notification");
    return;
  }

  console.info(`sending slack notification: ${text}`);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (resp.status >= 400) {
    const body = await resp.text();
    throw new Error(`slack notification failed: ${resp.status}: ${body}`);
  }
});
