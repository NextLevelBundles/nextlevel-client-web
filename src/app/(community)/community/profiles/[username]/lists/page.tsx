"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PlusIcon,
  ListIcon,
  LockIcon,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  useCustomerLists,
  useCreateCustomerList,
} from "@/hooks/queries/useCustomerLists";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { CustomerList } from "@/lib/api/types/customer-profile";

function ListCard({ list, username }: { list: CustomerList; username: string }) {
  const hasPreviews = list.previewCoverImageUrls?.length > 0;

  return (
    <Link href={`/community/profiles/${username}/lists/${list.id}`}>
      <div className="group flex gap-4 cursor-pointer rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors">
        {/* Cover Image Preview */}
        <div className="relative w-48 h-28 flex-shrink-0 rounded-md overflow-hidden bg-muted/50">
          {hasPreviews ? (
            <div className="flex h-full">
              {list.previewCoverImageUrls.slice(0, 4).map((url, idx) => (
                <div
                  key={idx}
                  className="relative flex-1 min-w-0 overflow-hidden"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>
        {/* List Info */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {list.systemName ? (
              <LockIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ListIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <p className="font-medium truncate">{list.name}</p>
          </div>
          {list.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {list.description}
            </p>
          )}
          <span className="text-xs text-muted-foreground mt-1">
            {list.itemCount} {list.itemCount === 1 ? "game" : "games"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ListsPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: customer } = useCustomer();
  const isOwnProfile = customer?.handle === username;
  const { data: lists, isLoading } = useCustomerLists(username);
  const createList = useCreateCustomerList();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;

    await createList.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
    });

    setName("");
    setDescription("");
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[7.75rem] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const allLists = lists ?? [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{isOwnProfile ? "My Lists" : "Lists"}</h2>
        {isOwnProfile && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="My awesome list"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={255}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this list about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim() || createList.isPending}
                >
                  {createList.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lists */}
      {allLists.length > 0 ? (
        <div className="grid gap-3">
          {allLists.map((list) => (
            <ListCard key={list.id} list={list} username={username} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <ListIcon className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isOwnProfile
              ? "No lists yet. Create your first list to get started."
              : "This user hasn't created any lists yet."}
          </p>
        </div>
      )}
    </div>
  );
}
