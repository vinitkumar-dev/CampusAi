import { useState, useEffect } from "react";
import {
  Sparkles,
  Upload,
  Send,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

import "./ComplaintForm.css";

function ComplaintForm({
  onAnalyze,
  onUpload,
  onSubmit,
  initialData = null,
  buttonText = "Submit Complaint",
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
      });

      if (initialData.image_url) {
        setPreview(initialData.image_url);
      }
    }
  }, [initialData]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
    onUpload?.(file);

    // Clear input value so same image can be uploaded again if removed
    e.target.value = "";
  };

  const removeImage = (e) => {
    e.preventDefault();
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onUpload?.(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="ai-logo">
          <Sparkles size={24} />
        </div>
        <div>
          <h2>Create Complaint</h2>
          <p>AI will analyze and categorize your issue</p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="complaintTitle">Complaint Title</label>
        <input
          id="complaintTitle"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Eg. Hostel water problem"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="complaintDesc">Description</label>
        <textarea
          id="complaintDesc"
          name="description"
          rows="6"
          value={form.description}
          onChange={handleChange}
          placeholder="Explain your problem clearly..."
          required
        />
      </div>

      <button
        type="button"
        className="ai-btn"
        disabled={!form.title.trim() || !form.description.trim()}
        onClick={() => onAnalyze?.(form)}
      >
        <Sparkles size={18} />
        <span>Analyze with AI</span>
      </button>

      <div className="upload-box">
        <label htmlFor="imageUpload" className="upload-label">
          <Upload size={24} />
          <strong>
            {preview ? "Change Evidence Image" : "Upload Complaint Image"}
          </strong>
          <span>Attach photo proof (optional)</span>
        </label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
        />
      </div>

      {preview && (
        <div className="preview-card">
          <div className="preview-header">
            <div className="preview-title">
              <ImageIcon size={16} />
              <span>Evidence Preview</span>
            </div>
            <button
              type="button"
              className="remove-img-btn"
              onClick={removeImage}
              aria-label="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="img-container">
            <img src={preview} alt="Evidence preview" />
          </div>
        </div>
      )}

      <button className="submit-btn" type="submit">
        <Send size={18} />
        <span>{buttonText}</span>
      </button>
    </form>
  );
}

export default ComplaintForm;
