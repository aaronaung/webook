import { useEffect, useState } from "react";
import { supaClientComponentClient } from "../data/clients/browser";

export const useSignedUrl = ({
  bucket,
  objectPath,
  initialUrl,
}: {
  bucket: string;
  objectPath: string;
  initialUrl?: string;
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(initialUrl ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    sign();
  }, [bucket, objectPath]);

  useEffect(() => {
    if (!signedUrl) {
      sign();
    }
  }, [signedUrl]);

  const sign = async () => {
    if (signedUrl) {
      const resp = await fetch(signedUrl, { method: "GET" });
      if (resp.ok) {
        return;
      }
    }

    setLoading(true);
    const { data } = await supaClientComponentClient.storage
      .from(bucket)
      .createSignedUrl(objectPath, 24 * 3600);
    if (!data?.signedUrl) {
      setError(new Error("Failed to sign URL"));
      return;
    }
    setLoading(false);
    setSignedUrl(data.signedUrl);
  };

  return { signedUrl, loading, error, refresh: sign };
};
