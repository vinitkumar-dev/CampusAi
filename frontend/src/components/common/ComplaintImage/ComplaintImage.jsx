import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

import { resolveImageUrl } from "../../../utils/imageUtils";

// Shows the image if it exists and loads; otherwise a clean placeholder
// (never a broken-image icon).
function ComplaintImage({ src, alt = "Complaint evidence", className = "" }) {
  const url = resolveImageUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    return (
      <div
        className={`complaint-image-placeholder ${className}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "24px 16px",
          border: "1px dashed #cbd5e1",
          borderRadius: 12,
          color: "#64748b",
          fontSize: 14,
        }}
      >
        <ImageOff size={18} />
        <span>{url ? "Image unavailable" : "No image attached"}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{ maxWidth: "100%", height: "auto", borderRadius: 12 }}
    />
  );
}

export default ComplaintImage;
