"use client";

import { useState } from "react";
import AvatarUpload from "@/components/auth/AvatarUpload";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useActivityFeed } from "@/context/ActivityFeedContext";
import { Save, User, Mail, MapPin } from "lucide-react";
import NotificationPreferencesCard from "@/components/profile/NotificationPreferencesCard";
import ActivityFeedPanel from "@/components/activity/ActivityFeedPanel";

function ProfileSkeleton() {
  return (
    <main className="min-h-screen pt-14 pb-20 px-6 bg-surface-2">
      <div className="max-w-3xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-3 rounded-lg" />
        <div className="h-4 w-72 bg-surface-2 rounded" />
        <div className="p-6 bg-surface border border-line rounded-2xl space-y-4">
          <div className="h-20 w-20 bg-surface-3 rounded-full" />
        </div>
        <div className="p-6 bg-surface border border-line rounded-2xl space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-surface-2 rounded-lg" />
          ))}
        </div>
        <div className="h-40 bg-surface border border-line rounded-2xl" />
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
  });
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { recordActivity } = useActivityFeed();

  // Graceful fallback — backend not hosted yet
  if (isLoading || !user) return <ProfileSkeleton />;

  const handleSave = () => {
    console.log("Saving profile:", { ...formData, avatar: avatarFile });
    recordActivity({
      type: "profile",
      severity: "info",
      title: "Profile updated",
      description: "You saved changes to your profile settings.",
      href: "/profile",
    });
    toast({
      title: "Profile saved",
      description: "Your settings were updated locally in this demo build.",
      variant: "success",
    });
  };

  return (
    <main className="min-h-screen pt-14 pb-20 px-6 bg-surface-2">
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-ink mb-1">
            Profile Settings
          </h1>
          <p className="text-ink-faint">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="p-6 bg-surface border border-line rounded-2xl">
            <h2 className="text-base font-black text-ink mb-4">Profile Picture</h2>
            <AvatarUpload onAvatarChange={setAvatarFile} />
          </div>

          {/* Personal Information */}
          <div className="p-6 bg-surface border border-line rounded-2xl space-y-4">
            <h2 className="text-base font-black text-ink">Personal Information</h2>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-ink-muted mb-1.5">
                <User className="w-4 h-4" />
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-3 py-2.5 bg-surface border border-line rounded-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent text-sm"
              />
            </div>

            {/* Email — read-only, sourced from JWT */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-ink-muted mb-1.5">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-3 py-2.5 bg-surface-2 border border-line rounded-lg text-ink-faint text-sm cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-ink-faint">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-ink-muted mb-1.5">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-3 py-2.5 bg-surface border border-line rounded-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-muted mb-1.5 block">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-3 py-2.5 bg-surface border border-line rounded-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent text-sm resize-none"
              />
            </div>
          </div>

          <NotificationPreferencesCard />

          <ActivityFeedPanel compact />

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-on-accent rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
