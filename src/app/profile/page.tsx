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
    <main className="min-h-screen pt-14 pb-20 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-4 w-72 bg-gray-100 rounded" />
        <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4">
          <div className="h-20 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
        <div className="h-40 bg-white border border-gray-200 rounded-2xl" />
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
    <main className="min-h-screen pt-14 pb-20 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">
            Profile Settings
          </h1>
          <p className="text-gray-500">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="p-6 bg-white border border-gray-200 rounded-2xl">
            <h2 className="text-base font-black text-gray-900 mb-4">Profile Picture</h2>
            <AvatarUpload onAvatarChange={setAvatarFile} />
          </div>

          {/* Personal Information */}
          <div className="p-6 bg-white border border-gray-200 rounded-2xl space-y-4">
            <h2 className="text-base font-black text-gray-900">Personal Information</h2>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                <User className="w-4 h-4" />
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Email — read-only, sourced from JWT */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 text-sm resize-none"
              />
            </div>
          </div>

          <NotificationPreferencesCard />

          <ActivityFeedPanel compact />

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
