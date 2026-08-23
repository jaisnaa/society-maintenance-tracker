import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as api from "../api/endpoints";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";

const CATEGORIES = ["Plumbing", "Electrical", "Security", "Housekeeping", "Parking", "Other"];

export default function RaiseComplaint() {
  const [category, setCategory] = useState("Plumbing");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description);
      if (photo) formData.append("photo", photo);

      await api.createComplaint(formData);
      toast.success("Complaint raised successfully");
      navigate("/resident");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to raise complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">
        Raise a Complaint
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Describe the issue and attach a photo if helpful
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-2 px-2 rounded-lg text-sm font-medium border transition-colors ${
                  category === cat
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail — location, what's wrong, since when..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Photo (optional)
          </label>
          {preview ? (
            <div className="relative w-40">
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 hover:bg-slate-700"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 w-40 h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-colors">
              <Upload size={22} className="text-slate-400" />
              <span className="text-xs text-slate-500">Upload photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/resident")}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
