"use client";

import { useEffect, useMemo, useState } from "react";
import AvatarUpload from "@/components/auth/AvatarUpload";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useActivityFeed } from "@/context/ActivityFeedContext";
import { Info, Mail, Save, User } from "lucide-react";
import NotificationPreferencesCard from "@/components/profile/NotificationPreferencesCard";
import ActivityFeedPanel from "@/components/activity/ActivityFeedPanel";

type ProfileFormData = {
  displayName: string;
  bio: string;
};

function getDisplayName(email?: string) {
  const localPart = email?.split("@")[0]?.trim();
  if (!localPart) return "Guest user";

  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/w/g, (char) => char.toUpperCase());
}

export default function ProfilePage() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: "",
    bio: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const { recordActivity } = useActivityFeed();

  const email = user?.email ?? "";
  const defaultDisplayName = useMemo(() => getDisplayName(email), [email]);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      displayName: current.displayName || defaultDisplayName,
    }));
  }, [defaultDisplayName]);

  const handleSave = () => {
    const savedName = formData.displayName.trim() || defaultDisplayName;

    console.log("Saving profile:", {
      displayName: savedName,
      email,
      bio: formData.bio,
      avatar: avatarFile?.name ?? null,
    });

    recordActivity({
      type: "profile",
      severity: "info",
      title: "Profile updated",
      description: "You saved changes to your profile settings.",
      href: "/profile",
    });

    toast({
      title: "Profile saved",
      description: user
        ? "Saved local profile settings for " + savedName + "."
        : "Saved a local profile placeholder until you sign in.",
      variant: "success",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-20 pt-20 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6 py-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Account
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Profile Settings
          </h1>
          <p className="max-w-2xl text-sm text-gray-500">
            Manage your avatar, display name, read-only account email, bio, and notification preferences.
          </p>
        </div>

        {!user ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">Signed-out preview</p>
              <p className="mt-1 text-amber-700">
                The backend is not hosted yet, so this page shows editable local placeholders until a signed-in user is available.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-black text-gray-900">Profile Picture</h2>
            <div className="rounded-xl bg-gray-900 p-5">
              <AvatarUpload onAvatarChange={setAvatarFile} />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-black text-gray-900">Personal Information</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-gray-700">
                  <User className="h-4 w-4" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(event) =>
                    setFormData({ ...formData, displayName: event.target.value })
                  }
                  placeholder={defaultDisplayName}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-gray-700">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  placeholder="Sign in to show an email address"
                  aria-readonly="true"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Email comes from the signed-in account and cannot be edited here.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(event) =>
                    setFormData({ ...formData, bio: event.target.value })
                  }
                  placeholder="Tell buyers and sellers a little about yourself."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </section>
        </div>

        <NotificationPreferencesCard />
        <ActivityFeedPanel compact />

        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </main>
  );
}
