"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  SearchIcon,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  useCustomerListDetail,
  useDeleteCustomerList,
  useAddListItem,
  useRemoveListItem,
  useGameSearch,
} from "@/hooks/queries/useCustomerLists";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { GameSearchResult } from "@/lib/api/types/customer-profile";

function getIgdbCoverUrl(coverImageId: string | null, size = "cover_big") {
  if (!coverImageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${coverImageId}.jpg`;
}

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const listId = params.listId as string;

  const { data: customer } = useCustomer();
  const isOwnProfile = customer?.handle === username;
  const { data: list, isLoading } = useCustomerListDetail(listId, isOwnProfile ? undefined : username);
  const deleteList = useDeleteCustomerList();
  const addItem = useAddListItem(listId);
  const removeItem = useRemoveListItem(listId);

  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults } = useGameSearch(searchQuery);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const listsPath = `/community/profiles/${username}/lists`;

  const handleDelete = async () => {
    await deleteList.mutateAsync(listId);
    router.push(listsPath);
  };

  const handleAddGame = async (game: GameSearchResult) => {
    await addItem.mutateAsync({ gameId: game.igdbId });
    setSearchQuery("");
    setShowResults(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem.mutateAsync(itemId);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">List not found.</p>
        <Link
          href={listsPath}
          className="text-primary hover:underline mt-2 inline-block"
        >
          Back to lists
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={listsPath}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold">{list.name}</h2>
            {list.description && (
              <p className="text-sm text-muted-foreground">
                {list.description}
              </p>
            )}
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            {list.items.length}{" "}
            {list.items.length === 1 ? "Game" : "Games"}
          </span>
        </div>
        {isOwnProfile && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <PencilIcon className="mr-2 h-3.5 w-3.5" />
              {isEditing ? "Done" : "Edit"}
            </Button>
            {!list.systemName && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleteList.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2Icon className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete list</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{list.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>

      {/* Edit Mode: Game Search */}
      {isEditing && (
        <div ref={searchRef} className="relative">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for games to add..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="pl-10"
            />
          </div>
          {showResults && searchResults && searchResults.length > 0 && (
            <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto">
              {searchResults.map((game) => {
                const alreadyAdded = list.items.some(
                  (i) => i.gameId === game.igdbId
                );
                return (
                  <button
                    key={game.igdbId}
                    onClick={() => !alreadyAdded && handleAddGame(game)}
                    disabled={alreadyAdded || addItem.isPending}
                    className="flex items-center gap-3 w-full p-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="h-10 w-8 flex-shrink-0 rounded overflow-hidden bg-muted">
                      {game.coverImageId ? (
                        <Image
                          src={getIgdbCoverUrl(game.coverImageId, "thumb")!}
                          alt={game.name || ""}
                          width={32}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {game.name}
                      </p>
                      {game.releaseYear && (
                        <p className="text-xs text-muted-foreground">
                          ({game.releaseYear})
                        </p>
                      )}
                    </div>
                    {alreadyAdded && (
                      <span className="text-xs text-muted-foreground">
                        Added
                      </span>
                    )}
                  </button>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {/* Game Items */}
      {isEditing ? (
        /* Edit mode: list view with remove buttons */
        <div className="grid gap-2">
          {list.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <div className="h-12 w-9 flex-shrink-0 rounded overflow-hidden bg-muted">
                {item.coverImageId ? (
                  <Image
                    src={getIgdbCoverUrl(item.coverImageId, "thumb")!}
                    alt={item.title || ""}
                    width={36}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.releaseYear && (
                  <p className="text-xs text-muted-foreground">
                    ({item.releaseYear})
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveItem(item.id)}
                disabled={removeItem.isPending}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {list.items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Use the search above to add games to this list.
            </p>
          )}
        </div>
      ) : (
        /* View mode: grid of cover images */
        <>
          {list.items.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {list.items.map((item) => {
                const content = (
                  <div className="group relative">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      {item.coverImageId ? (
                        <Image
                          src={getIgdbCoverUrl(item.coverImageId)!}
                          alt={item.title || ""}
                          width={264}
                          height={352}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center gap-1">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground text-center px-2 truncate w-full">
                            {item.title}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs mt-1 truncate text-muted-foreground">
                      {item.title}
                    </p>
                  </div>
                );

                return item.slug ? (
                  <Link
                    key={item.id}
                    href={`/community/profiles/${username}/games/${item.slug}`}
                    className="hover:opacity-90 transition-opacity"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={item.id}>{content}</div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                {isOwnProfile
                  ? "No games in this list yet. Click Edit to add games."
                  : "No games in this list yet."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
