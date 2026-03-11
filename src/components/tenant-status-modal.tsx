"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, UserX, Users } from "lucide-react";

export type TenantStatus = "prospective" | "active" | "inactive" | "blacklisted";

export interface TenantStatusOption {
  value: TenantStatus;
  label: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const tenantStatusOptions: TenantStatusOption[] = [
  {
    value: "prospective",
    label: "Prospective",
    description: "Application received, not yet leased",
    color: "orange",
    icon: Clock,
  },
  {
    value: "active",
    label: "Active",
    description: "Currently renting and paying rent",
    color: "green",
    icon: CheckCircle,
  },
  {
    value: "inactive",
    label: "Inactive",
    description: "Moved out, good standing",
    color: "gray",
    icon: Users,
  },
  {
    value: "blacklisted",
    label: "Blacklisted",
    description: "Banned from future rentals",
    color: "red",
    icon: UserX,
  },
];

interface TenantStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
  currentStatus?: TenantStatus;
  currentUnitId?: string;
  onStatusChange: (tenantId: string, status: TenantStatus, notes?: string) => Promise<void>;
  hasManageTenantsPermission: boolean;
}

export function TenantStatusModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  currentStatus,
  currentUnitId,
  onStatusChange,
  hasManageTenantsPermission,
}: TenantStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<TenantStatus | "">("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentStatusOption = tenantStatusOptions.find(opt => opt.value === currentStatus);
  const selectedStatusOption = tenantStatusOptions.find(opt => opt.value === selectedStatus);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus || "");
      setNotes("");
      setError(null);
      setShowConfirmation(false);
    }
  }, [isOpen, currentStatus]);

  const validateStatus = (): string | null => {
    if (!selectedStatus) {
      return "Please select a status";
    }

    if (selectedStatus === "blacklisted" && !notes.trim()) {
      return "Notes are required when blacklisting a tenant";
    }

    if (selectedStatus === "active" && !currentUnitId) {
      return "Please assign a unit before setting tenant to active status";
    }

    if (selectedStatus === "prospective" && currentUnitId && currentStatus === "active") {
      return "Changing from active to prospective will unassign the tenant's unit. Please confirm this action.";
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!hasManageTenantsPermission) {
      setError("You don't have permission to manage tenant statuses");
      return;
    }

    const validationError = validateStatus();
    if (validationError) {
      if (validationError.includes("confirm this action")) {
        setShowConfirmation(true);
        return;
      }
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onStatusChange(tenantId, selectedStatus as TenantStatus, notes.trim() || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tenant status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "orange":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
      case "gray":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      case "red":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const StatusIcon = selectedStatusOption?.icon || Clock;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Tenant Status</DialogTitle>
          <DialogDescription>
            Update the status for {tenantName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status Display */}
          {currentStatusOption && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <Badge
                className={`${getStatusColorClasses(currentStatusOption.color)} flex items-center gap-2 w-fit`}
              >
                <currentStatusOption.icon className="h-3 w-3" />
                {currentStatusOption.label}
              </Badge>
            </div>
          )}

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label htmlFor="status-select" className="text-sm font-medium">
              New Status
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value as TenantStatus);
                setError(null);
                setShowConfirmation(false);
              }}
              disabled={!hasManageTenantsPermission}
            >
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {tenantStatusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Status Preview */}
          {selectedStatusOption && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <Badge
                className={`${getStatusColorClasses(selectedStatusOption.color)} flex items-center gap-2 w-fit`}
              >
                <StatusIcon className="h-3 w-3" />
                {selectedStatusOption.label}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {selectedStatusOption.description}
              </p>
            </div>
          )}

          {/* Notes Field */}
          <div className="space-y-2">
            <label htmlFor="status-notes" className="text-sm font-medium">
              Notes {selectedStatus === "blacklisted" && <span className="text-destructive">*</span>}
            </label>
            <Textarea
              id="status-notes"
              placeholder={
                selectedStatus === "blacklisted"
                  ? "Please provide a reason for blacklisting this tenant..."
                  : "Add any additional notes (optional)..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!hasManageTenantsPermission}
              rows={3}
            />
          </div>

          {/* Validation Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Confirmation for unit unassignment */}
          {showConfirmation && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will unassign the tenant from their current unit. Do you want to continue?
              </AlertDescription>
            </Alert>
          )}

          {/* Permission Warning */}
          {!hasManageTenantsPermission && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to manage tenant statuses. Contact your administrator.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasManageTenantsPermission || isSubmitting || !selectedStatus}
          >
            {isSubmitting ? "Updating..." : showConfirmation ? "Confirm & Update" : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
