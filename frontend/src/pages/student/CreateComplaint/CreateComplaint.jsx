import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

import ComplaintForm from "../../../components/complaint/ComplaintForm/ComplaintForm";
import AIPredictionCard from "../../../components/ai/AIPredictionCard/AIPredictionCard";

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

  const handleAnalyze = async (form) => {
    if (!form) return;

    const title = form.title || "";
    const description = form.description || "";

    if (!title.trim() && !description.trim()) return;

    try {
      setIsAiAnalyzing(true);
      const data = await analyzeComplaint(`${title} ${description}`);
      setPrediction(data);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  const handleSubmit = async (form) => {
    try {
      setIsSubmitting(true);
      await createComplaint({
        title: form.title,
        description: form.description,
        image_url: imageUrl,
        // Pass prediction keys if backend captures explicit parameters directly
        predicted_category: prediction?.category,
        predicted_urgency: prediction?.urgency,
      });

      navigate("/student/my-complaints");
    } catch (err) {
      console.error("Complaint creation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-page">
      {/* Header Context Bar */}
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

      {/* Main Structural Page Body Split */}
      <div className="create-complaint-page-layout">
        <div className="left-section">
          <ComplaintForm
            onAnalyze={handleAnalyze}
            onUpload={handleUpload}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isAnalyzing={isAiAnalyzing}
          />
        </div>

        <div className="right-section">
          {isAiAnalyzing ? (
            <div className="prediction-loading" role="status">
              <div className="ai-loader-ring"></div>
              <p>AI is analyzing complaint data...</p>
            </div>
          ) : prediction ? (
            <AIPredictionCard prediction={prediction} />
          ) : (
            <div className="ai-placeholder">
              <div className="placeholder-icon-wrap">
                <Sparkles size={28} />
              </div>
              <h3>CampusAI Engine</h3>
              <p>
                Fill your description and click{" "}
                <strong>"Analyze with AI"</strong> to receive real-time category
                mapping, urgency scoping, and accurate routing assessments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateComplaint;
