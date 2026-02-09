"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ListIcon,
  LockIcon,
  ImageIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCustomerLists } from "@/hooks/queries/useCustomerLists";
import { CustomerList } from "@/lib/api/types/customer-profile";

function getIgdbCoverUrl(coverImageId: string, size = "cover_big") {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${coverImageId}.jpg`;
}

function RecentListCard({
  list,
  username,
}: {
  list: CustomerList;
  username: string;
}) {
  const hasPreviews = list.previewCoverImageIds?.length > 0;

  return (
    <Link href={`/community/profiles/${username}/lists/${list.id}`}>
      <div className="group flex items-center gap-3 cursor-pointer rounded-md border bg-card p-2 hover:bg-muted/50 transition-colors">
        <div className="w-20 h-14 flex-shrink-0 rounded overflow-hidden bg-muted/50">
          {hasPreviews ? (
            <div className="flex h-full">
              {list.previewCoverImageIds.slice(0, 4).map((imageId) => (
                <Image
                  key={imageId}
                  src={getIgdbCoverUrl(imageId, "thumb")}
                  alt=""
                  width={40}
                  height={56}
                  className="h-full flex-1 min-w-0 object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <p className="text-sm font-medium truncate flex-1 min-w-0">{list.name}</p>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {list.itemCount}
        </span>
      </div>
    </Link>
  );
}

export default function ProfileOverviewPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: lists, isLoading } = useCustomerLists();

  const recentLists = (lists ?? [])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="grid gap-8">
      {/* About Me */}
      <section>
        <h3 className="text-lg font-semibold mb-3">About Me</h3>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">
            Nothing here yet. Details coming soon.
          </p>
        </Card>
      </section>

      {/* Recent Lists */}
      <section>
        <div className="flex items-center justify-between mb-3 max-w-md">
          <h3 className="text-lg font-semibold">Recent Lists</h3>
          {(lists?.length ?? 0) > 5 && (
            <Link href={`/community/profiles/${username}/lists`}>
              <Button variant="ghost" size="sm">
                More
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-2 max-w-md">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[4.5rem] rounded-md" />
            ))}
          </div>
        ) : recentLists.length > 0 ? (
          <div className="grid gap-2 max-w-md">
            {recentLists.map((list) => (
              <RecentListCard key={list.id} list={list} username={username} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground text-sm">No lists yet.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
