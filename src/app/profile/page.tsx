"use client";

import { useState } from "react";
import AvatarUpload from "@/components/auth/AvatarUpload";
import { Save, User, Mail, MapPin } from "lucide-react";

export default function ProfilePage() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    bio: "",
  });

  const handleSave = () => {
    console.log("Saving profile:", { ...formData, avatar: avatarFile });
    // TODO: Implement actual save logic
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Profile Settings
          </h1>
          <p className="text-neutral-400">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
            <h2 className="text-xl font-bold mb-6">Profile Picture</h2>
            <AvatarUpload onAvatarChange={setAvatarFile} />
          </div>

          {/* Personal Information */}
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 mb-2">
                <User className="w-4 h-4" />
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="City, Country"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-neutral-400 mb-2 block">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
