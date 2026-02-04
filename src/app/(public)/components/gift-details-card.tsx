"use client";

import Image from "next/image";
import { Gift, Calendar, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface GiftDetailsCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  bundleName?: string;
  giftedByName: string;
  giftMessage?: string;
  createdAt: string;
  expiresAt?: string;
  status: "Pending" | "Accepted" | "Returned" | "Declined";
  additionalInfo?: React.ReactNode;
}

export function GiftDetailsCard({
  title,
  description,
  imageUrl,
  bundleName,
  giftedByName,
  giftMessage,
  createdAt,
  expiresAt,
  status,
  additionalInfo,
}: GiftDetailsCardProps) {
  const isExpired =
    status === "Returned" || (expiresAt && dayjs(expiresAt).isBefore(dayjs()));
  const daysUntilExpiry = expiresAt
    ? dayjs(expiresAt).diff(dayjs(), "day")
    : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-background p-3 shadow-sm">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              You&apos;ve received a gift!
            </h2>
            <p className="text-sm text-muted-foreground">
              From {giftedByName} • {dayjs(createdAt).fromNow()}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Gift Item Preview */}
        <div className="flex gap-4 mb-6">
          {imageUrl && (
            <div className="relative w-32 aspect-[2/3] overflow-hidden rounded-lg shadow-sm flex-shrink-0">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Gift Message */}
        {giftMessage && (
          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Personal Message</span>
            </div>
            <p className="text-sm">{giftMessage}</p>
          </div>
        )}

        {/* Status and Expiry */}
        <div className="flex items-center gap-4 mb-6">
          {isExpired ? (
            <Badge variant="destructive">Returned</Badge>
          ) : status === "Accepted" ? (
            <Badge variant="secondary">Accepted</Badge>
          ) : (
            <>
              <Badge variant="default">Pending Acceptance</Badge>
              {expiresAt && daysUntilExpiry !== null && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {daysUntilExpiry === 0
                      ? "Expires today"
                      : daysUntilExpiry === 1
                        ? "Expires tomorrow"
                        : `Expires in ${daysUntilExpiry} days`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Info */}
        {additionalInfo && <div className="mb-6">{additionalInfo}</div>}

        {/* Returned Alert */}
        {isExpired && (
          <Alert variant="destructive">
            <AlertDescription>
              This gift has been returned and can no longer be accepted.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
