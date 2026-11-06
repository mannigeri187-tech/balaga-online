import React, { useState } from "react";
import { SocialProfile } from "@platform/shared-types";
import { X, Save, Tag, MapPin, Shield, Check } from "lucide-react";

interface SocialProfileEditorProps {
  profile: SocialProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<SocialProfile>) => void;
}

export const SocialProfileEditor: React.FC<SocialProfileEditorProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [pronouns, setPronouns] = useState(profile.pronouns || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [city, setCity] = useState(profile.city || "Bengaluru");
  const [state, setState] = useState(profile.state || "Karnataka");
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  const [hobbyInput, setHobbyInput] = useState("");
  const [hobbies, setHobbies] = useState<string[]>(profile.hobbies || []);
  const [allowDmsFrom, setAllowDmsFrom] = useState<"everyone" | "connections" | "none">(
    profile.allowDmsFrom || "everyone"
  );
  const [showActivityStatus, setShowActivityStatus] = useState(
    profile.showActivityStatus !== false
  );
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleAddHobby = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (hobbyInput.trim() && !hobbies.includes(hobbyInput.trim())) {
      setHobbies([...hobbies, hobbyInput.trim()]);
      setHobbyInput("");
    }
  };

  const handleRemoveHobby = (item: string) => {
    setHobbies(hobbies.filter((h) => h !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<SocialProfile> = {
      displayName,
      pronouns,
      bio,
      city,
      state,
      broadLocation: `${city}, ${state}`,
      interests,
      hobbies,
      allowDmsFrom,
      showActivityStatus,
    };
    onSave(updated);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400">
              <Tag className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-slate-100">
              Customize Social Profile (@{profile.username})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Display Name & Pronouns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pronouns (Optional)
              </label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="e.g. they/them, she/her, he/him"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Social Bio</label>
              <span className="text-[10px] text-slate-500">{bio.length}/300</span>
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="What gets you excited on weekends? Books, trails, photography, indie cinema..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Broad Location (Privacy preserving - No GPS) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-violet-400" />
              <span>Broad Location (Region Only — No Exact GPS)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Bengaluru)"
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State (e.g. Karnataka)"
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Interests Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Interests & Passions
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleAddInterest}
                placeholder="Add interest (e.g. Filter Coffee, Hiking)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-violet-500/15 text-violet-300 border border-violet-500/30"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(item)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Hobbies Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hobbies</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={hobbyInput}
                onChange={(e) => setHobbyInput(e.target.value)}
                onKeyDown={handleAddHobby}
                placeholder="Add hobby (e.g. Badminton, Baking)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddHobby}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hobbies.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveHobby(item)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Social Privacy Controls */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Shield className="w-3.5 h-3.5 text-violet-400" />
              <span>Social Privacy Preferences</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Direct Message Requests</label>
                <select
                  value={allowDmsFrom}
                  onChange={(e) =>
                    setAllowDmsFrom(e.target.value as "everyone" | "connections" | "none")
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                >
                  <option value="everyone">Allow message requests from everyone</option>
                  <option value="connections">Allow direct messages from connections only</option>
                  <option value="none">Disable new message requests</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={showActivityStatus}
                  onChange={(e) => setShowActivityStatus(e.target.checked)}
                  className="rounded border-slate-800 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-slate-300 text-xs">Show active status when online</span>
              </label>
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-900/30"
            >
              {isSavedNotice ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              {isSavedNotice ? "Saved!" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
