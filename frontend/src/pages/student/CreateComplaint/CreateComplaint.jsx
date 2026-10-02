import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertCircle } from "lucide-react";

import ComplaintForm from "../../../components/complaint/ComplaintForm/ComplaintForm";
import AIPredictionCard from "../../../components/ai/AIPredictionCard/AIPredictionCard";
import Loader from "../../../components/common/Loader/Loader";

import { analyzeComplaint } from "../../../services/aiService";
import { uploadFile } from "../../../services/uploadService";
import { createComplaint } from "../../../services/complaintService";

import "./CreateComplaint.css";

function CreateComplaint() {
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     AI ANALYSIS
  ========================================================= */

  const handleAnalyze = async (form) => {
    if (!form) return;

    const title = form.title?.trim() || "";
    const description = form.description?.trim() || "";

    if (!title && !description) {
      setError("Please enter your complaint before using AI analysis.");
      return;
    }

    try {
      setError("");
      setIsAiAnalyzing(true);

      const complaintText = `${title} ${description}`.trim();

      const data = await analyzeComplaint(complaintText);

      console.log("AI Prediction:", data);

      setPrediction(data);
    } catch (error) {
      console.error("AI analysis failed:", error);

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "AI analysis failed. Please try again.",
      );

      setPrediction(null);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleUpload = async (file) => {
    if (!file) return;

    try {
      setError("");

      const url = await uploadFile(file);

      console.log("Uploaded image:", url);

      setImageUrl(url);
    } catch (error) {
      console.error("File upload failed:", error);

      setImageUrl("");

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Image upload failed. Please try again.",
      );
    }
  };

  /* =========================================================
     SUBMIT COMPLAINT
  ========================================================= */

  const handleSubmit = async (form) => {
    if (!form || isSubmitting) return;

    const title = form.title?.trim() || "";
    const description = form.description?.trim() || "";

    /* Validation */

    if (!title) {
      setError("Please enter a complaint title.");
      return;
    }

    if (!description) {
      setError("Please describe your complaint.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const payload = {
        title,
        description,

        image_url: imageUrl || null,

        predicted_category: prediction?.category || null,
        predicted_urgency: prediction?.urgency || null,
      };

      console.log("Submitting complaint:", payload);

      const response = await createComplaint(payload);

      console.log("Complaint created:", response);

      /*
       * Navigate only after successful API response.
       */

      navigate("/student/my-complaints", {
        replace: true,
      });
    } catch (error) {
      console.error("Complaint creation failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to submit complaint. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="create-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="create-header">
        <div>
          <h1>Create Complaint</h1>

          <p>Describe your issue and let CampusAI analyze it automatically.</p>
        </div>

        <div className="ai-status">
          <Sparkles size={14} className="sparkle-pulse" />
          <span>AI Powered</span>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="create-error-message" role="alert">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="create-complaint-page-layout">
        {/* LEFT - FORM */}

        <div className="left-section">
          <ComplaintForm
            onAnalyze={handleAnalyze}
            onUpload={handleUpload}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isAnalyzing={isAiAnalyzing}
          />
        </div>

        {/* RIGHT - AI */}

        <div className="right-section">
          {isAiAnalyzing ? (
            <Loader text="AI is analyzing your complaint..." />
          ) : prediction ? (
            <AIPredictionCard prediction={prediction} />
          ) : (
            <div className="ai-placeholder">
              <div className="placeholder-icon-wrap">
                <Sparkles size={28} />
              </div>

              <h3>CampusAI</h3>

              <p>
                Describe your complaint and click{" "}
                <strong>"Analyze with AI"</strong> to get an automatic category
                and urgency prediction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateComplaint;
