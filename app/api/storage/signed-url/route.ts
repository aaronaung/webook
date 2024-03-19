import { env } from "@/env.mjs";
import { Storage } from "@google-cloud/storage";

const getSignedUrl = async (storage: Storage): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    storage
      .bucket("lrn-test")
      .file("test")
      .getSignedUrl(
        {
          action: "resumable",
          expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
          contentType: "application/octet-stream",
        },
        (err, url) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(url);
        },
      );
  });
};

export async function GET() {
  const storage = new Storage({
    projectId: env.GCP_PROJECT,
    credentials: JSON.parse(decodeURIComponent(env.GCP_SERVICE_ACCOUNT_KEY)),
  });

  const signedUrl = await getSignedUrl(storage);
  return new Response(signedUrl);
}
