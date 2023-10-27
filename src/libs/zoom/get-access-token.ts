type GetAccessTokenInput = {
  accountId: string;
  clientId: string;
  clientSecret: string;
};

export default async function getZoomAccessToken({
  accountId,
  clientId,
  clientSecret,
}: GetAccessTokenInput) {
  const queryParams = new URLSearchParams({
    grant_type: "account_credentials",
    account_id: accountId,
  });

  const result = await fetch(
    `https://zoom.us/oauth/token?${queryParams.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`,
        ).toString("base64")}`,
      },
    },
  );

  return await result.json();
}
