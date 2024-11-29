import { expectNonNull } from "./lib";

const APIQueryString = `query {
  viewer {
    accounts(filter: { accountTag: $accountId }) {
      r2StorageAdaptiveGroups(limit: 1, filter: { bucketName: $bucketName, datetime_geq: $datetimeMin, datetime_leq: $datetimeMax }, orderBy: [datetime_DESC]) {
        max {
          payloadSize
        }
        dimensions {
          datetime
        }
      }
    }
  }
}`;
export interface APIQueryVariables {
    readonly accountId: string;
    readonly bucketName: string;
    readonly datetimeMax: string;
    readonly datetimeMin: string;
}
export interface APIQueryResult {
    readonly viewer: {
        readonly accounts: {
            readonly r2StorageAdaptiveGroups: {
                readonly max: {
                    /** in bytes */
                    readonly payloadSize: number;
                };
                readonly dimensions: {
                    readonly datetime: string;
                };
            }[];
        }[];
    };
}

interface GraphQLResult<Data> {
    readonly data?: Data;
    readonly errors?: unknown;
}

export async function requestAPIQuery(
    variables: APIQueryVariables,
    apiToken: string
): Promise<APIQueryResult> {
    const req = new Request("https://api.cloudflare.com/client/v4/graphql", {
        headers: {
            authorization: `Bearer ${apiToken}`,
            accept: "application/graphql-response+json",
        },
        method: "POST",
        body: JSON.stringify({
            query: APIQueryString,
            variables,
        }),
    });

    const resp: GraphQLResult<APIQueryResult> = await (await fetch(req)).json();
    if (resp.errors !== undefined && resp.errors !== null) {
        throw new CloudflareGraphQLAPIError(resp.errors);
    }

    // エラーがないならdataはかならずあるはず
    return expectNonNull(resp.data, "GraphQLResult.data is null?");
}

export class CloudflareGraphQLAPIError extends Error {
    constructor(content: unknown) {
        super(
            `Cloudflare GraphQL API has returned some errors: ${JSON.stringify(
                content
            )}`
        );
    }
}
