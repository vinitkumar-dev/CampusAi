import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles, ArrowLeft, LoaderCircle } from "lucide-react";

import ComplaintForm from "../../../components/complaint/ComplaintForm/ComplaintForm";
import AIPredictionCard from "../../../components/ai/AIPredictionCard/AIPredictionCard";

import {
  getComplaintById,
  updateComplaint,
} from "../../../services/complaintService";
import { analyzeComplaint } from "../../../services/aiService";
import { uploadFile } from "../../../services/uploadService";

import "./EditComplaint.css";

function EditComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadComplaint = async () => {
      try {
        setLoadingPage(true);
        const data = await getComplaintById(id);
        if (isMounted) {
          setInitialData(data);
          setImageUrl(data.image_url || "");
          // Pre-populate prediction card if data has already been analyzed historically
          if (data.predicted_category || data.predicted_urgency) {
            setPrediction({
              category: data.category,
              urgency: data.urgency,
              categoryConfidence: data.category_confidence || 0.95,
              urgencyConfidence: data.urgency_confidence || 0.9,
              department: data.department || "General Administration",
              resolutionTime: data.resolution_time || "Pending Review",
            });
          }
        }
      } catch (err) {
        console.error("Error loading component resource:", err);
      } finally {
        if (isMounted) setLoadingPage(false);
      }
    };

    loadComplaint();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAnalyze = async (form) => {
    if (!form) return;
    const title = form.title || "";
    const description = form.description || "";
    if (!title.trim() && !description.trim()) return;

    try {
      setAnalyzing(true);
      const result = await analyzeComplaint(`${title} ${description}`);
      setPrediction(result);
    } catch (err) {
      console.error("AI engine routing parse exception:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
    } catch (err) {
      console.error("Asset cloud upload exception:", err);
    }
  };

  const handleSubmit = async (form) => {
    try {
      setSaving(true);
      await updateComplaint(id, {
        title: form.title,
        description: form.description,
        image_url: imageUrl,
        category: prediction?.category || initialData?.category,
        urgency: prediction?.urgency || initialData?.urgency,
        predicted_category:
          prediction?.category || initialData?.predicted_category,
        predicted_urgency:
          prediction?.urgency || initialData?.predicted_urgency,
      });

      navigate("/student/my-complaints");
    } catch (err) {
      console.error("Entity persistent mutation failure:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="edit-loading" role="status">
        <LoaderCircle className="spin" size={36} />
        <h2>Loading Complaint Data...</h2>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="edit-error-fallback">
        <h2>Complaint Not Found</h2>
        <p>
          The ticket ID could be cached stale or was dropped from DB records.
        </p>
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="edit-page">
      {/* Top Banner Identity Controller */}
      <div className="page-header">
        <div>
          <h1>Edit Complaint #{initialData.id}</h1>
          <p>
            Update your complaint details and let the neural engine sync
            context.
          </p>
        </div>

        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Grid Layout Core Partition Split */}
      <div className="edit-complaint-page-layout">
        <div className="left-section">
          <ComplaintForm
            initialData={initialData}
            buttonText={saving ? "Saving Changes..." : "Update Complaint"}
            onAnalyze={handleAnalyze}
            onUpload={handleUpload}
            onSubmit={handleSubmit}
            isSubmitting={saving}
            isAnalyzing={analyzing}
          />
        </div>

        <div className="right-section">
          {analyzing ? (
            <div className="prediction-loading" role="status">
              <div className="sparkle-loader-container">
                <Sparkles size={28} className="sparkle-pulse" />
              </div>
              <h3>Analyzing System Logs...</h3>
              <p>CampusAI is predicting category weighting structures.</p>
            </div>
          ) : prediction ? (
            <AIPredictionCard prediction={prediction} />
          ) : (
            <div className="prediction-placeholder">
              <div className="placeholder-icon-wrap">
                <Sparkles size={24} />
              </div>
              <h3>AI Assist Core</h3>
              <p>
                Click <strong>"Analyze with AI"</strong> to refresh automatic
                context routing matrices based on new structural shifts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditComplaint;
