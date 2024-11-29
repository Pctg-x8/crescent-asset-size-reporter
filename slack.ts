export interface SlackChatPostMessageRequest {
    readonly channel: string;
    readonly text?: string;
}

export type SlackChatPostMessageResponse =
    | {
          readonly ok: true;
      }
    | {
          readonly ok: false;
          readonly error: unknown;
      };

export class SlackChatPostMessageError extends Error {
    constructor(error: unknown) {
        super(
            `Slack chat.postMessage has returned some errors: ${JSON.stringify(
                error
            )}`
        );
    }
}

export async function slackChatPostMessage(
    request: SlackChatPostMessageRequest,
    token: string
): Promise<void> {
    const req = new Request("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            accept: "application/json",
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });

    const resp: SlackChatPostMessageResponse = await (await fetch(req)).json();
    if (!resp.ok) {
        throw new SlackChatPostMessageError(resp.error);
    }
}
