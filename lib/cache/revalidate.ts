import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateByTag(tags: string[]) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

export function revalidateByPath(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}