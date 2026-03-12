"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateSetting } from "@/app/[locale]/(admin)/admin/parametres/actions";

interface SelectOption {
  value: string;
  label: string;
}

interface SettingFieldProps {
  settingKey: string;
  label: string;
  description?: string;
  type: "text" | "textarea" | "toggle" | "select" | "number" | "email" | "tel";
  options?: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  debounceMs?: number;
  onSave?: (key: string, value: string) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SettingField({
  settingKey,
  label,
  description,
  type,
  options = [],
  defaultValue = "",
  placeholder,
  maxLength,
  required = false,
  debounceMs = 500,
  onSave,
}: SettingFieldProps) {
  const t = useTranslations();
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [charCount, setCharCount] = useState(defaultValue.length);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Update value when defaultValue changes (from parent)
  useEffect(() => {
    setValue(defaultValue);
    setCharCount(defaultValue.length);
  }, [defaultValue]);

  // Auto-save with debounce
  const saveSetting = useCallback(async (newValue: string) => {
    if (required && !newValue.trim()) {
      setStatus("error");
      setErrorMessage(t("errors.required"));
      return;
    }

    setStatus("saving");
    setErrorMessage("");

    try {
      const result = await updateSetting(settingKey, newValue, description);

      if (result.success) {
        setStatus("saved");
        onSave?.(settingKey, newValue);
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || t("errors.serverError"));
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(t("errors.serverError"));
    }
  }, [settingKey, description, required, onSave, t]);

  // Handle value change with debounce
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setCharCount(newValue.length);
    setStatus("idle");
    setErrorMessage("");

    // Always sync parent state so bulk save has the latest value
    onSave?.(settingKey, newValue);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Don't auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      saveSetting(newValue);
    }, debounceMs);
  }, [saveSetting, debounceMs, onSave, settingKey]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Manual save (for toggle and select)
  const handleImmediateSave = async (newValue: string) => {
    setValue(newValue);
    setCharCount(newValue.length);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    await saveSetting(newValue);
  };

  // Status indicator component
  const StatusIndicator = () => {
    switch (status) {
      case "saving":
        return (
          <span className="flex items-center gap-1 text-xs text-ar-gold">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("common.saving")}
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <Check className="h-3 w-3" />
            {t("common.saved")}
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errorMessage}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={settingKey} className="text-sm font-medium text-ar-black">
          {label}
          {required && <span className="ml-1 text-ar-gold">*</span>}
        </Label>
        <StatusIndicator />
      </div>

      {description && (
        <p className="text-xs text-ar-gray-500">{description}</p>
      )}

      <div className="relative">
        {type === "text" && (
          <Input
            id={settingKey}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={cn(
              "transition-all",
              status === "error" && "border-red-500 focus:border-red-500",
              status === "saved" && "border-green-500 focus:border-green-500"
            )}
          />
        )}

        {type === "email" && (
          <Input
            id={settingKey}
            type="email"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "transition-all",
              status === "error" && "border-red-500 focus:border-red-500",
              status === "saved" && "border-green-500 focus:border-green-500"
            )}
          />
        )}

        {type === "tel" && (
          <Input
            id={settingKey}
            type="tel"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "transition-all",
              status === "error" && "border-red-500 focus:border-red-500",
              status === "saved" && "border-green-500 focus:border-green-500"
            )}
          />
        )}

        {type === "number" && (
          <Input
            id={settingKey}
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "transition-all",
              status === "error" && "border-red-500 focus:border-red-500",
              status === "saved" && "border-green-500 focus:border-green-500"
            )}
          />
        )}

        {type === "textarea" && (
          <div className="relative">
            <Textarea
              id={settingKey}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={4}
              className={cn(
                "resize-none transition-all",
                status === "error" && "border-red-500 focus:border-red-500",
                status === "saved" && "border-green-500 focus:border-green-500"
              )}
            />
            {maxLength && (
              <div className="absolute bottom-2 right-2 text-xs text-ar-gray-400">
                {charCount}/{maxLength}
              </div>
            )}
          </div>
        )}

        {type === "toggle" && (
          <div className="flex items-center gap-3">
            <Switch
              id={settingKey}
              checked={value === "true"}
              onCheckedChange={(checked) => handleImmediateSave(checked ? "true" : "false")}
            />
            <span className="text-sm text-ar-gray-500">
              {value === "true" ? t("common.enabled") : t("common.disabled")}
            </span>
          </div>
        )}

        {type === "select" && (
          <Select
            value={value}
            onValueChange={handleImmediateSave}
          >
            <SelectTrigger
              className={cn(
                "transition-all",
                status === "error" && "border-red-500",
                status === "saved" && "border-green-500"
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

// Composant pour sauvegarder un groupe de settings
export function SaveButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations();

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="btn-primary flex items-center gap-2 disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.saving")}
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          {t("common.save")}
        </>
      )}
    </button>
  );
}
