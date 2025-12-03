"use client";

import { useState, useEffect } from "react";
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
  Alert,
  AlertDescription,
} from "@/shared/components/ui/alert";
import {
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
  Loader2Icon,
  SmartphoneIcon,
  CopyIcon,
  CheckIcon,
  AlertCircleIcon,
  FingerprintIcon,
  TrashIcon,
  MonitorSmartphoneIcon,
} from "lucide-react";
import { AuthService, validatePassword } from "@/lib/auth/auth-service";

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type MFAType = "TOTP";

export default function SecurityPage() {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<PasswordFormErrors>({});

  // MFA state
  const [isLoadingMFA, setIsLoadingMFA] = useState(true);
  const [enabledMFAMethods, setEnabledMFAMethods] = useState<MFAType[]>([]);

  // TOTP setup state
  const [isTOTPSetupOpen, setIsTOTPSetupOpen] = useState(false);
  const [totpSecret, setTotpSecret] = useState("");
  const [totpQRUri, setTotpQRUri] = useState("");
  const [totpVerifyCode, setTotpVerifyCode] = useState("");
  const [isSettingUpTOTP, setIsSettingUpTOTP] = useState(false);
  const [isVerifyingTOTP, setIsVerifyingTOTP] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Passkey state
  interface PasskeyCredential {
    credentialId: string;
    friendlyCredentialName: string;
    relyingPartyId: string;
    createdAt: Date;
  }
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(true);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null);

  // Remembered devices state
  interface RememberedDevice {
    id: string;
    name?: string;
    lastAuthenticatedDate?: Date;
    createDate?: Date;
  }
  const [rememberedDevices, setRememberedDevices] = useState<RememberedDevice[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [isForgettingDevice, setIsForgettingDevice] = useState(false);

  // Fetch MFA preferences, passkeys, and devices on mount
  useEffect(() => {
    fetchMFAPreferences();
    fetchPasskeys();
    fetchRememberedDevices();
  }, []);

  const fetchMFAPreferences = async () => {
    setIsLoadingMFA(true);
    try {
      const result = await AuthService.getMFAPreference();
      if (result.success) {
        const enabled: MFAType[] = [];
        if (result.enabled?.includes("TOTP")) enabled.push("TOTP");
        setEnabledMFAMethods(enabled);
      }
    } catch (error) {
      console.error("Failed to fetch MFA preferences:", error);
    } finally {
      setIsLoadingMFA(false);
    }
  };

  // Passkey functions
  const fetchPasskeys = async () => {
    setIsLoadingPasskeys(true);
    try {
      const result = await AuthService.listPasskeys();
      if (result.success && result.credentials) {
        setPasskeys(result.credentials as PasskeyCredential[]);
      }
    } catch (error) {
      console.error("Failed to fetch passkeys:", error);
    } finally {
      setIsLoadingPasskeys(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      const result = await AuthService.registerPasskey();
      if (result.success) {
        toast.success("Passkey registered successfully!");
        await fetchPasskeys();
      } else {
        toast.error(result.error || "Failed to register passkey");
      }
    } catch (error) {
      console.error("Register passkey error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    setDeletingPasskeyId(credentialId);
    try {
      const result = await AuthService.deletePasskey(credentialId);
      if (result.success) {
        toast.success("Passkey deleted successfully!");
        await fetchPasskeys();
      } else {
        toast.error(result.error || "Failed to delete passkey");
      }
    } catch (error) {
      console.error("Delete passkey error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setDeletingPasskeyId(null);
    }
  };

  // Remembered devices functions
  const fetchRememberedDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const result = await AuthService.listRememberedDevices();
      if (result.success && result.devices) {
        // Map the devices to our interface
        const devices = result.devices.map((device) => ({
          id: device.id,
          name: device.name,
          lastAuthenticatedDate: device.lastAuthenticatedDate,
          createDate: device.createDate,
        }));
        setRememberedDevices(devices);
      }
    } catch (error) {
      console.error("Failed to fetch remembered devices:", error);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleForgetCurrentDevice = async () => {
    setIsForgettingDevice(true);
    try {
      const result = await AuthService.forgetCurrentDevice();
      if (result.success) {
        toast.success("This device has been forgotten. You'll need to verify again on next login.");
        await fetchRememberedDevices();
      } else {
        toast.error(result.error || "Failed to forget device");
      }
    } catch (error) {
      console.error("Forget device error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsForgettingDevice(false);
    }
  };

  // Password functions
  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: PasswordFormErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.errors[0];
      }
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

    if (!validatePasswordForm()) {
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
        resetPasswordForm();
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

  const handlePasswordDialogChange = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      resetPasswordForm();
    }
  };

  const clearFieldError = (field: keyof PasswordFormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // TOTP functions
  const handleSetupTOTP = async () => {
    setIsSettingUpTOTP(true);
    try {
      // Get user's email for the authenticator app display
      const userResult = await AuthService.getCurrentUser();
      const userEmail = userResult.attributes?.email;
      
      const result = await AuthService.setupTOTP();
      if (result.success && result.totpSetupDetails) {
        setTotpSecret(result.sharedSecret || "");
        const qrUri = result.totpSetupDetails.getSetupUri("Digiphile", userEmail);
        setTotpQRUri(qrUri.toString());
        setIsTOTPSetupOpen(true);
      } else {
        toast.error(result.error || "Failed to setup authenticator");
      }
    } catch (error) {
      console.error("TOTP setup error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSettingUpTOTP(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (totpVerifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsVerifyingTOTP(true);
    try {
      const verifyResult = await AuthService.verifyTOTP(totpVerifyCode);
      if (verifyResult.success) {
        // Enable TOTP MFA
        const prefResult = await AuthService.setMFAPreference(
          undefined,
          "ENABLED"
        );
        if (prefResult.success) {
          toast.success("Authenticator app enabled successfully!");
          setIsTOTPSetupOpen(false);
          resetTOTPSetup();
          await fetchMFAPreferences();
        } else {
          toast.error(prefResult.error || "Failed to enable authenticator");
        }
      } else {
        toast.error(verifyResult.error || "Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("TOTP verify error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifyingTOTP(false);
    }
  };

  const handleDisableTOTP = async () => {
    setIsSettingUpTOTP(true);
    try {
      const result = await AuthService.setMFAPreference(
        undefined,
        "DISABLED"
      );
      if (result.success) {
        toast.success("Authenticator app disabled");
        await fetchMFAPreferences();
      } else {
        toast.error(result.error || "Failed to disable authenticator");
      }
    } catch (error) {
      console.error("Disable TOTP error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSettingUpTOTP(false);
    }
  };

  const resetTOTPSetup = () => {
    setTotpSecret("");
    setTotpQRUri("");
    setTotpVerifyCode("");
    setCopiedSecret(false);
  };

  const handleTOTPDialogChange = (open: boolean) => {
    setIsTOTPSetupOpen(open);
    if (!open) {
      resetTOTPSetup();
    }
  };

  const copySecretToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(totpSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const isTOTPEnabled = enabledMFAMethods.includes("TOTP");

  return (
    <div className="grid gap-6">
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
            Manage your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isPasswordDialogOpen} onOpenChange={handlePasswordDialogChange}>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
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

      {/* Two-Factor Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <ShieldCheckIcon className="h-5 w-5 text-primary" />
            </div>
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a verification code when signing in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingMFA ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Authenticator App (TOTP) */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-500/10 p-2">
                    <SmartphoneIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Authenticator App</h4>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app like Google Authenticator or Authy
                    </p>
                  </div>
                </div>
                {isTOTPEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisableTOTP}
                    disabled={isSettingUpTOTP}
                  >
                    {isSettingUpTOTP ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      "Disable"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetupTOTP}
                    disabled={isSettingUpTOTP}
                  >
                    {isSettingUpTOTP ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      "Setup"
                    )}
                  </Button>
                )}
              </div>

              {/* Info Alert */}
              {isTOTPEnabled && (
                <Alert>
                  <ShieldCheckIcon className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is enabled. You&apos;ll need to enter a verification code from your authenticator app when signing in.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Passkeys Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <FingerprintIcon className="h-5 w-5 text-primary" />
            </div>
            Passkeys
          </CardTitle>
          <CardDescription>
            Sign in securely using biometrics, hardware keys, or your device&apos;s screen lock.
            Passkeys are more secure than passwords and can&apos;t be phished.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPasskeys ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Registered Passkeys List */}
              {passkeys.length > 0 && (
                <div className="space-y-3">
                  {passkeys.map((passkey) => (
                    <div
                      key={passkey.credentialId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-purple-500/10 p-2">
                          <FingerprintIcon className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {passkey.friendlyCredentialName || "Passkey"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Added {new Date(passkey.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePasskey(passkey.credentialId)}
                        disabled={deletingPasskeyId === passkey.credentialId}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        {deletingPasskeyId === passkey.credentialId ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Passkey Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Button
                  onClick={handleRegisterPasskey}
                  disabled={isRegisteringPasskey}
                  variant={passkeys.length > 0 ? "outline" : "default"}
                  className="gap-2"
                >
                  {isRegisteringPasskey ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <FingerprintIcon className="h-4 w-4" />
                  )}
                  {isRegisteringPasskey ? "Registering..." : "Add Passkey"}
                </Button>
              </motion.div>

              {/* Info Alert */}
              {passkeys.length > 0 && (
                <Alert>
                  <FingerprintIcon className="h-4 w-4" />
                  <AlertDescription>
                    You can use your passkey to sign in without entering your password.
                    Just enter your email and use your device&apos;s biometrics or screen lock.
                  </AlertDescription>
                </Alert>
              )}

              {passkeys.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No passkeys registered yet. Add a passkey to enable passwordless sign-in.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Remembered Devices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <MonitorSmartphoneIcon className="h-5 w-5 text-primary" />
            </div>
            Remembered Devices
          </CardTitle>
          <CardDescription>
            Devices that are remembered won&apos;t require two-factor authentication for 30 days.
            You can forget a device to require verification again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingDevices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Remembered Devices List */}
              {rememberedDevices.length > 0 ? (
                <div className="space-y-3">
                  {rememberedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-500/10 p-2">
                          <MonitorSmartphoneIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {device.name || "Unknown Device"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {device.lastAuthenticatedDate
                              ? `Last used: ${new Date(device.lastAuthenticatedDate).toLocaleDateString()}`
                              : device.createDate
                                ? `Added: ${new Date(device.createDate).toLocaleDateString()}`
                                : "Recently added"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  No devices are currently remembered. When you sign in with two-factor authentication,
                  you can choose to remember the device for 30 days.
                </p>
              )}

              {/* Forget Current Device Button */}
              {rememberedDevices.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Button
                    onClick={handleForgetCurrentDevice}
                    disabled={isForgettingDevice}
                    variant="outline"
                    className="gap-2"
                  >
                    {isForgettingDevice ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                    {isForgettingDevice ? "Forgetting..." : "Forget This Device"}
                  </Button>
                </motion.div>
              )}

              {/* Info Alert */}
              {rememberedDevices.length > 0 && (
                <Alert>
                  <MonitorSmartphoneIcon className="h-4 w-4" />
                  <AlertDescription>
                    Remembered devices skip two-factor authentication for 30 days.
                    If you lose access to a device or suspect unauthorized access, forget the device immediately.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* TOTP Setup Dialog */}
      <Dialog open={isTOTPSetupOpen} onOpenChange={handleTOTPDialogChange}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Setup Authenticator App</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app or enter the secret key manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* QR Code */}
            {totpQRUri && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  {/* Using Google Charts API to generate QR code */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpQRUri)}`}
                    alt="TOTP QR Code"
                    width={200}
                    height={200}
                  />
                </div>
              </div>
            )}

            {/* Secret Key */}
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <div className="flex gap-2">
                <Input
                  value={totpSecret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copySecretToClipboard}
                >
                  {copiedSecret ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                If you can&apos;t scan the QR code, enter this key manually in your authenticator app.
              </p>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-2">
              <Label htmlFor="totpCode">Verification Code</Label>
              <Input
                id="totpCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={totpVerifyCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setTotpVerifyCode(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && totpVerifyCode.length === 6 && !isVerifyingTOTP) {
                    e.preventDefault();
                    handleVerifyTOTP();
                  }
                }}
                placeholder="Enter 6-digit code"
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app to verify setup.
              </p>
            </div>

            {/* Warning */}
            <Alert variant="default" className="bg-amber-500/10 border-amber-500/20">
              <AlertCircleIcon className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                Save your secret key in a secure location. You&apos;ll need it to recover your account if you lose access to your authenticator app.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleTOTPDialogChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyTOTP}
              disabled={isVerifyingTOTP || totpVerifyCode.length !== 6}
              className="gap-2"
            >
              {isVerifyingTOTP ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheckIcon className="h-4 w-4" />
              )}
              {isVerifyingTOTP ? "Verifying..." : "Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
