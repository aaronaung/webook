import { BUCKETS } from "@/src/consts/storage";
import { getClass } from "@/src/data/class";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { getAuthUser } from "@/src/data/user";
import { redirect } from "next/navigation";
import ClassView from "./_components/class";

export default async function ClassPage({
  params,
}: {
  params: {
    id: string;
    businessHandle: string;
  };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const user = await getAuthUser(supabaseOptions);
  if (!user) {
    redirect(
      `/login?return_path=${encodeURIComponent(
        `/${params.businessHandle}/classes/${params.id}`,
      )}`,
    );
  }

  const { danceClass, isUserOwner } = await getClass(
    { id: params.id, userId: user.id },
    supabaseOptions,
  );

  // TODO: if the user has the browser open for longer than 24 hours, the video will stop working.
  const { data: signedUrlData } = await supaServerComponentClient()
    .storage.from(BUCKETS.classes)
    .createSignedUrl(`${params.id}/class`, 24 * 3600); // 24 hours

  return (
    <div>
      {signedUrlData?.signedUrl && (
        <ClassView
          danceClass={danceClass}
          isUserOwner={isUserOwner}
          user={user}
          videoUrl={signedUrlData?.signedUrl}
        />
      )}
    </div>
  );
}
