"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
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
  onSave,
}: SettingFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [charCount, setCharCount] = useState(defaultValue.length);

  // Update value when defaultValue changes (from parent)
  useEffect(() => {
    setValue(defaultValue);
    setCharCount(defaultValue.length);
  }, [defaultValue]);

  // Handle value change — only sync parent state, no auto-save to DB
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setCharCount(newValue.length);
    onSave?.(settingKey, newValue);
  }, [onSave, settingKey]);

  // Immediate change for toggle and select (sync parent state)
  const handleImmediateChange = (newValue: string) => {
    setValue(newValue);
    setCharCount(newValue.length);
    onSave?.(settingKey, newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={settingKey} className="text-sm font-medium text-ar-black">
          {label}
          {required && <span className="ml-1 text-ar-gold">*</span>}
        </Label>
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
          />
        )}

        {type === "email" && (
          <Input
            id={settingKey}
            type="email"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
          />
        )}

        {type === "tel" && (
          <Input
            id={settingKey}
            type="tel"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
          />
        )}

        {type === "number" && (
          <Input
            id={settingKey}
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
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
              className="resize-none"
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
              onCheckedChange={(checked) => handleImmediateChange(checked ? "true" : "false")}
            />
            <span className="text-sm text-ar-gray-500">
              {value === "true" ? "Activé" : "Désactivé"}
            </span>
          </div>
        )}

        {type === "select" && (
          <Select
            value={value}
            onValueChange={handleImmediateChange}
          >
            <SelectTrigger>
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
