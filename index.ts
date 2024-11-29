import { requestAPIQuery } from "./graphql";
import { slackChatPostMessage } from "./slack";

// search up to before 1 hour
const SearchRangeMilliseconds = 60 * 60 * 1000;

export function formatLargeBytes(bytes: number): string {
    let shortBytes = bytes;
    let si = "";
    if (shortBytes >= 1000) {
        shortBytes /= 1024.0;
        si = "K";
    }
    if (shortBytes >= 1000) {
        shortBytes /= 1024.0;
        si = "M";
    }
    if (shortBytes >= 1000) {
        shortBytes /= 1024.0;
        si = "G";
    }
    if (shortBytes >= 1000) {
        shortBytes /= 1024.0;
        si = "T";
    }

    return `${shortBytes.toFixed(2)}${si}B (${bytes} bytes)`;
}

export default {
    async scheduled(
        controller: ScheduledController,
        env: Env,
        ctx: ExecutionContext
    ): Promise<void> {
        const nowtime = Date.now();
        const searchLimitDateTimeLow = nowtime - SearchRangeMilliseconds;

        const bucketState = await requestAPIQuery(
            {
                accountId: env.BUCKET_OWNER_ACCOUNT_ID,
                bucketName: env.BUCKET_NAME,
                datetimeMin: new Date(searchLimitDateTimeLow).toISOString(),
                datetimeMax: new Date(nowtime).toISOString(),
            },
            env.CLOUDFLARE_API_TOKEN
        );
        const bucketUsage =
            bucketState.viewer.accounts[0].r2StorageAdaptiveGroups[0].max
                .payloadSize;

        const introMessage = `いまの時点でのR2バケットの容量だよ`;
        const formattedContents = [
            `${env.BUCKET_NAME}: ${formatLargeBytes(bucketUsage)}`,
        ].join("\n");

        await slackChatPostMessage(
            {
                channel: env.SLACK_POST_CHANNEL_ID,
                text: introMessage + "\n```\n" + formattedContents + "\n```",
            },
            env.SLACK_BOT_TOKEN
        );
    },
} satisfies ExportedHandler<Env>;
