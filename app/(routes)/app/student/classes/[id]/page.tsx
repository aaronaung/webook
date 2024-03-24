import { BUCKETS } from "@/src/consts/storage";
import { getClass } from "@/src/data/class";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { getAuthUser } from "@/src/data/user";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Alert } from "@/src/components/ui/alert";
import Link from "next/link";

// Disable ssr on VideoPlayer to avoid Hydration Error.
const VideoPlayer = dynamic(
  () => import("@/src/components/common/video-player/video-player"),
  { ssr: false },
);

export default async function ClassPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const user = await getAuthUser(supabaseOptions);
  if (!user) {
    redirect(
      `/login?return_path=${encodeURIComponent(
        `/student/app/classes/${params.id}`,
      )}`,
    );
  }

  const { danceClass, isUserOwner } = await getClass(
    { id: params.id, userId: user.id },
    supabaseOptions,
  );

  if (!isUserOwner) {
    redirect(`/app/student/classes`);
  }

  // TODO: if the user has the browser open for longer than 24 hours, the video will stop working.
  const { data: signedUrlData } = await supaServerComponentClient()
    .storage.from(BUCKETS.classes)
    .createSignedUrl(`${params.id}/class`, 24 * 3600); // 24 hours

  if (!signedUrlData?.signedUrl) {
    return (
      <Alert variant={"destructive"}>
        😞 We failed to load the video. Please reload to try again or contact us
        at support@moovn.com.
      </Alert>
    );
  }

  return (
    <div>
      {danceClass.business?.handle && (
        <span className="text-lg font-medium">
          {danceClass.title} -{" "}
          <Link href={`/${danceClass.business.handle}`}>
            <span className="cursor-pointer text-base font-medium text-primary hover:underline">
              {danceClass.business.title}
            </span>
          </Link>
        </span>
      )}
      <VideoPlayer
        urls={{
          auto: signedUrlData.signedUrl,
        }}
        sections={[]}
      />
    </div>
  );
}
