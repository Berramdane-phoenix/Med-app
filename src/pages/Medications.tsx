import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pill, TestTube, FlaskConical } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  next_dose: string | null;
  created_at: string | null;
}


function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="medication-modal-backdrop" onClick={onClose}>
      <div
        className="medication-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="medication-modal-close-btn"
          aria-label="Close modal"
        >
          &times;
        </button>
        {title && <h2 className="medication-modal-title">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}



export default function Medications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reordering, setReordering] = useState(false);

  // New states for messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const icons = [Pill, TestTube, FlaskConical];
  useEffect(() => {
    const fetchMedications = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getUser();
        const user_id = sessionData?.user?.id;
        if (!user_id) throw new Error("User not authenticated");
        setUserId(user_id);

        const { data, error } = await supabase
          .from("medications")
          .select("*")
          .eq("user_id", user_id)
          .order("next_dose", { ascending: false });

        if (error) throw error;
        setMedications(data || []);
      } catch (err: any) {
        console.error("Failed to fetch medications:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  async function handleReorderConfirm() {
  if (!selectedMed || !userId) return;
  setReordering(true);
  setErrorMessage(null);
  setSuccessMessage(null);

  try {
    const now = new Date().toISOString();

    // 1. Update next_dose
    const { error } = await supabase
      .from("medications")
      .update({ next_dose: now })
      .eq("id", selectedMed.id)
      .eq("user_id", userId);

    if (error) throw error;

    // 2. Insert notification
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: userId,
      title: "Medication Reordered",
      message: `You have reordered "${selectedMed.name}". Next dose updated.`,
    });

    if (notifError) console.warn("Notification insert failed:", notifError);

    // 3. Update local state
    setMedications((prev) =>
      prev.map((med) =>
        med.id === selectedMed.id ? { ...med, next_dose: now } : med
      )
    );

    setSuccessMessage("Medication reorder requested successfully.");
    setConfirmOpen(false);
    setTimeout(() => setSuccessMessage(null), 5000);
  } catch (err: any) {
    console.error("Reorder failed:", err);
    setErrorMessage("Failed to reorder medication.");
  } finally {
    setReordering(false);
  }
}


  const iconClasses = [
    "icon--primary",
    "icon--secondary",
    "icon--accent",
  ];

  return (
    <div className="medication-page mx-auto">
      <div className="header">
        <h1 className="">My Medications</h1>
      </div>

      {loading && <div className="text-form">Loading medications...</div>}

      {error && (
        <div className="text-error">
          {error}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {/* Error message for reorder */}
      {errorMessage && (
        <div className="alert alert-error">
          {errorMessage}
        </div>
      )}

      {!loading && medications.length === 0 && !error && (
        <p className="form-text ml-5 text-center">You have no medications listed.</p>
      )}

      <ul className="space-y-4">
        {medications.map((med, index) => {
          const IconComponent = icons[index % icons.length];
          const iconClass = iconClasses[index % iconClasses.length];

          return (
            <li key={med.id} className="medication-card">
              <div className="medication-card__content">
                <div className="d-flex justify-content-between">
                  <h2 className="">{med.name}</h2>
                </div>
                <div className="detail-items">
                  <p className="item">
                    <strong className="label">Dosage:</strong>{" "}
                    <span className="value">{med.dosage || "N/A"}</span>
                  </p>
                  <p className="item">
                    <strong className="label">Frequency:</strong>{" "}
                    <span className="value">{med.frequency || "N/A"}</span>
                  </p>
                  <p className="item">
                    <strong className="label">Next Dose:</strong>{" "}
                    <span className="value">
                      {med.next_dose
                        ? new Date(med.next_dose).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not scheduled"}
                    </span>
                  </p>
                </div>

                <div
                  className="icon__container first "
                >
                  <IconComponent  className={`icon ${iconClass}`}/>
                </div>
                 <div
                  className="icon__container second"
                >
                  <IconComponent  className={`icon ${iconClass}`}/>
                </div>
                 <div
                  className="icon__container third"
                >
                  <IconComponent  className={`icon ${iconClass}`}/>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-sm btn--primary"
                  onClick={() => {
                    setSelectedMed(med);
                    setConfirmOpen(true);
                  }}
                  disabled={reordering}
                >
                  {reordering && selectedMed?.id === med.id
                    ? "Processing..."
                    : "Reorder"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Modal
        isOpen={confirmOpen}
        onClose={() => !reordering && setConfirmOpen(false)}
        title="Reorder Medication"
      >
        <div className="space-y-4">
          <p className="form-text">
            You are about to reorder:{" "}
            <strong className="text-success">{selectedMed?.name}</strong>
          </p>

          <div className="text-sm">
            <p><strong className="text-primary">Dosage:</strong> {selectedMed?.dosage || "N/A"}</p>
            <p><strong className="text-primary">Frequency:</strong> {selectedMed?.frequency || "N/A"}</p>
            <p>
              <strong className="text-primary">Current Next Dose:</strong>{" "}
              {selectedMed?.next_dose
                ? new Date(selectedMed.next_dose).toLocaleString()
                : "Not scheduled"}
            </p>
          </div>

          {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

          <div className="flex justify-end space-x-3 mt-2">
            <button
              className="btn btn-sm btn--primary mr-2"
              onClick={() => !reordering && setConfirmOpen(false)}
              disabled={reordering}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn--success"
              onClick={handleReorderConfirm}
              disabled={reordering}
            >
              {reordering ? "Reordering..." : "Confirm Reorder"}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
