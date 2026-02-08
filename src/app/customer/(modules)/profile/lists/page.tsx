"use client";

import { useState } from "react";
import { PlusIcon, ListIcon, LockIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
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
import { useCustomerLists, useCreateCustomerList } from "@/hooks/queries/useCustomerLists";

export default function ListsPage() {
  const { data: lists, isLoading } = useCustomerLists();
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
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const systemLists = lists?.filter((l) => l.systemName) ?? [];
  const customLists = lists?.filter((l) => !l.systemName) ?? [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Lists</h2>
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
      </div>

      {/* System Lists */}
      {systemLists.length > 0 && (
        <div className="grid gap-3">
          {systemLists.map((list) => (
            <Card
              key={list.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <LockIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{list.name}</p>
                  {list.description && (
                    <p className="text-sm text-muted-foreground">
                      {list.description}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
              </span>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Lists */}
      {customLists.length > 0 && (
        <div className="grid gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Custom Lists
          </h3>
          {customLists.map((list) => (
            <Card
              key={list.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <ListIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{list.name}</p>
                  {list.description && (
                    <p className="text-sm text-muted-foreground">
                      {list.description}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
              </span>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {lists?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <ListIcon className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No lists yet. Create your first list to get started.
          </p>
        </div>
      )}
    </div>
  );
}
