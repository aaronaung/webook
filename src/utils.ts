import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supaClientComponentClient } from "./data/clients/browser";
import crypto from "crypto";
import { BUCKETS, STORAGE_DIR_PATHS } from "./consts/storage";
import { Message } from "./components/ui/chat/chat";
import { Tables } from "@/types/db.extension";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuthCallbackUrl() {
  let url =
    process?.env?.NEXT_PUBLIC_APP_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  url = url.concat("/api/auth/callback");
  return url;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 3,
  timeout = 1500,
) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`[${response.status}]: ${response.statusText}`);
    }
    return response;
  } catch (err) {
    if (retries === 0) {
      throw err;
    }
    await sleep(timeout);
    return fetchWithRetry(url, options, retries - 1, timeout);
  }
}

// NOTE: This function does something very specific. It constructs a supabase storage object url with the timestamp as the version attached to the url as query param. This is usually used to bust the cache on the image url.
export const getTimestampedObjUrl = (
  bucket: string,
  path: string,
  timestamp?: string | null,
): string => {
  const { data } = supaClientComponentClient()
    .storage.from(bucket)
    .getPublicUrl(path);

  if (!timestamp) {
    return data.publicUrl;
  }

  const imgVersion = new Date(timestamp).getTime();
  const url = new URL(data.publicUrl);
  url.searchParams.set("version", imgVersion.toString());
  return url.toString();
};

export const getServiceImgUrl = (serviceId: string, timestamp?: string) => {
  return getTimestampedObjUrl(
    BUCKETS.publicBusinessAssets,
    `${STORAGE_DIR_PATHS.services}/${serviceId}`,
    timestamp,
  );
};

export const getStaffHeadshotUrl = (
  staffId: string,
  timestamp?: string | null,
) => {
  return getTimestampedObjUrl(
    BUCKETS.publicBusinessAssets,
    `${STORAGE_DIR_PATHS.staffHeadshots}/${staffId}`,
    timestamp,
  );
};

export const getBusinessLogoUrl = (
  handle: string,
  timestamp?: string | null,
) => {
  return getTimestampedObjUrl(
    BUCKETS.publicBusinessAssets,
    `${STORAGE_DIR_PATHS.businessLogos}/${handle}`,
    timestamp,
  );
};
export const getBusinessCoverPhotoUrl = (
  handle: string,
  timestamp?: string | null,
) => {
  return getTimestampedObjUrl(
    BUCKETS.publicBusinessAssets,
    `${STORAGE_DIR_PATHS.businessCoverPhotos}/${handle}`,
    timestamp,
  );
};

export const generatePassword = (
  length = 20,
  characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$",
) =>
  Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((x) => characters[x % characters.length])
    .join("");

export const strListDiff = (originalList: string[], newList: string[]) => {
  const added = newList.filter((id) => !originalList.find((i) => i === id));
  const removed = originalList.filter((id) => !newList.find((i) => i === id));
  return {
    added,
    removed,
  };
};

export const userFriendlyDate = (date: Date | number | string) => {
  if (typeof date === "string") {
    return `${format(new Date(date), "MMM dd yyyy h:mm a")}`;
  }
  return `${format(date, "MMM dd yyyy h:mm a")}`;
};

export const chatMessagesToChatRoomMessages = (
  messages: Partial<Tables<"chat_messages">>[],
  selfId: string,
): Message[] => {
  let lastKnownPosition: "top" | "middle" | "bottom" = "top";
  let lastKnownSender = "";
  const chatRoomMessages: Message[] = [];
  for (const msg of messages) {
    if (!msg.content) {
      continue;
    }
    const senderId = msg.sender_user_id || msg.sender_business_id;

    if (lastKnownSender !== senderId) {
      if (lastKnownPosition === "middle") {
        chatRoomMessages[chatRoomMessages.length - 1].position = "bottom";
      }
      lastKnownPosition = "top";
      lastKnownSender = senderId as string;
    } else {
      lastKnownPosition = "middle";
    }

    chatRoomMessages.push({
      content: msg.content,
      position: lastKnownPosition,
      side: senderId === selfId ? "right" : "left",
    });
  }
  if (lastKnownPosition === "middle") {
    chatRoomMessages[chatRoomMessages.length - 1].position = "bottom";
  }

  return chatRoomMessages;
};

// console.log(
//   chatMessagesToChatRoomMessages(
//     [
//       {
//         content: "test",
//         sender_user_id: "1",
//       },
//       {
//         content: "test",
//         sender_user_id: "2",
//       },
//       {
//         content: "test",
//         sender_user_id: "2",
//       },
//       {
//         content: "test",
//         sender_user_id: "2",
//       },
//       // {
//       //   content: "test",
//       //   sender_user_id: "2",
//       // },
//       // {
//       //   content: "test",
//       //   sender_user_id: "1",
//       // },
//       // {
//       //   content: "test",
//       //   sender_user_id: "1",
//       // },
//       // {
//       //   content: "test",
//       //   sender_user_id: "1",
//       // },
//       // {
//       //   content: "test",
//       //   sender_user_id: "1",
//       // },
//     ],
//     "1",
//   ),
// );
