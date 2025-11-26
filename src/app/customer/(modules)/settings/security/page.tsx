"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
  Loader2Icon,
} from "lucide-react";
import { AuthService } from "@/lib/auth/auth-service";

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<PasswordFormErrors>({});

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: PasswordFormErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain a lowercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain a number";
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain a special character";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);

    try {
      const result = await AuthService.updatePassword(
        currentPassword,
        newPassword
      );

      if (result.success) {
        toast.success("Password updated successfully!");
        setIsPasswordDialogOpen(false);
        resetForm();
      } else {
        toast.error(result.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const clearFieldError = (field: keyof PasswordFormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <KeyIcon className="h-5 w-5 text-primary" />
              </div>
              Password
            </CardTitle>
            <CardDescription>
              Manage your account password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isPasswordDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="gap-2">Change Password</Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change your password</DialogTitle>
                  <DialogDescription>
                    Make sure to use a strong, unique password that you
                    don&apos;t use elsewhere.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handlePasswordUpdate}
                  className="space-y-4 py-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          clearFieldError("currentPassword");
                        }}
                        className={`pr-10 ${errors.currentPassword ? "border-red-500" : ""}`}
                        disabled={isUpdating}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500">{errors.currentPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          clearFieldError("newPassword");
                        }}
                        className={`pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
                        disabled={isUpdating}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-500">{errors.newPassword}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          clearFieldError("confirmPassword");
                        }}
                        className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        disabled={isUpdating}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="gap-2" disabled={isUpdating}>
                      {isUpdating ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheckIcon className="h-4 w-4" />
                      )}
                      {isUpdating ? "Updating..." : "Update Password"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 2FA Section - Coming Soon
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <ShieldIcon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Two-Factor Authentication
                  <Badge variant="secondary" className="ml-2">
                    MVP+
                  </Badge>
                </CardTitle>
              </div>
              <Switch
                checked={is2FAEnabled}
                onCheckedChange={handle2FAToggle}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
            <Alert className="bg-card">
              <ShieldCheckIcon className="h-4 w-4" />
              <AlertTitle>Enhanced Security</AlertTitle>
              <AlertDescription>
                Protect your account with an additional verification step using
                an authenticator app.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        */}
      </div>

      {/* Login Activity Section - Coming Soon
      <Card className="bg-linear-to-br from-card to-card/95 dark:from-[#1a1d2e] dark:to-[#1a1d2e]/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <ClockIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="flex items-center gap-2">
                Login Activity
                <Badge>Coming Soon</Badge>
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Monitor your account&apos;s recent login activity
          </CardDescription>
          <div className="space-y-4">
            <div className="divide-y rounded-lg border bg-card/30 dark:bg-card/20">
              <div className="flex items-center gap-4 p-4 text-muted-foreground/60 hover:bg-muted/5 dark:hover:bg-[#1d2233]/60">
                <LaptopIcon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">MacBook Pro - Chrome</p>
                  <p className="text-sm">
                    San Francisco, CA • Last active 2 hours ago
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-100/10 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  <CheckIcon className="mr-1 h-3 w-3" />
                  Current
                </Badge>
              </div>
              <div className="flex items-center gap-4 p-4 text-muted-foreground/60 hover:bg-muted/5 dark:hover:bg-[#1d2233]/60">
                <SmartphoneIcon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">iPhone 14 Pro - Mobile App</p>
                  <p className="text-sm">
                    New York, NY • Last active yesterday
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 text-muted-foreground/60 hover:bg-muted/5 dark:hover:bg-[#1d2233]/60">
                <MonitorIcon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">Windows PC - Firefox</p>
                  <p className="text-sm">London, UK • Last active 3 days ago</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Full login activity tracking coming soon
            </p>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
