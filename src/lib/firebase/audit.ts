import { db } from "./config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { UserProfile } from "@/types";

export type AuditSeverity = "info" | "warning" | "error";

export async function logAuditAction(
  action: string,
  user: UserProfile,
  details?: string,
  collectionName?: string,
  documentId?: string,
  severity: AuditSeverity = "info"
) {
  try {
    await addDoc(collection(db, "auditLogs"), {
      action,
      performedBy: user.uid,
      performedByName: user.name || user.email,
      details: details || null,
      collection: collectionName || null,
      documentId: documentId || null,
      severity,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Don't throw - audit logging shouldn't block the main action
  }
}
