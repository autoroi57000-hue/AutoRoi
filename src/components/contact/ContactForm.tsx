"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactForm } from "@/app/[locale]/(public)/contact/actions";

// Schéma de validation Zod
const contactFormSchema = z.object({
  first_name: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne doit pas dépasser 50 caractères"),
  last_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères"),
  email: z.string().email("Veuillez entrer un email valide"),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[\d\s\+\-\(\)]{10,20}$/.test(val), {
      message: "Format de téléphone invalide",
    }),
  subject: z.enum(
    ["vehicle_info", "trade_in", "pricing", "other"]
  ),
  vehicle_ref: z.string().optional().nullable(),
  message: z
    .string()
    .min(20, "Le message doit contenir au moins 20 caractères")
    .max(2000, "Le message ne doit pas dépasser 2000 caractères"),
  rgpd_consent: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions",
  }),
  // Honeypot - champ caché
  website: z.string().optional().nullable(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  locale?: string;
}

const subjectOptions = {
  fr: {
    vehicle_info: "Information sur un véhicule",
    trade_in: "Reprise de véhicule",
    pricing: "Demande de prix",
    other: "Autre",
  },
  en: {
    vehicle_info: "Vehicle information",
    trade_in: "Trade-in request",
    pricing: "Pricing request",
    other: "Other",
  },
};

export function ContactForm({ locale = "fr" }: ContactFormProps) {
  const searchParams = useSearchParams();
  const vehicleFromUrl = searchParams.get("vehicule");

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      subject: undefined,
      vehicle_ref: vehicleFromUrl || "",
      message: "",
      rgpd_consent: false,
      website: "", // Honeypot
    },
  });

  const rgpdConsent = watch("rgpd_consent");
  const subjects = subjectOptions[locale as keyof typeof subjectOptions] || subjectOptions.fr;

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus("loading");
    setErrorMessage("");

    const result = await submitContactForm(data, locale);

    if (result.success) {
      setSubmitStatus("success");
      reset();
    } else {
      setSubmitStatus("error");
      setErrorMessage(
        result.error ||
          (locale === "fr"
            ? "Une erreur est survenue. Veuillez réessayer."
            : "An error occurred. Please try again.")
      );
    }
  };

  // État succès
  if (submitStatus === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-ar-gold/30 bg-ar-gold/5 p-8 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ar-gold/20">
          <CheckCircle className="h-8 w-8 text-ar-gold" />
        </div>
        <h3 className="font-display text-xl font-bold text-ar-black">
          {locale === "fr" ? "Message envoyé !" : "Message sent!"}
        </h3>
        <p className="mt-2 text-ar-silver">
          {locale === "fr"
            ? "Nous vous répondrons sous 24h."
            : "We will get back to you within 24 hours."}
        </p>
        <Button
          onClick={() => setSubmitStatus("idle")}
          className="mt-6 bg-ar-gold text-ar-black hover:bg-ar-gold-dark"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {locale === "fr" ? "Envoyer un autre message" : "Send another message"}
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Honeypot - champ caché pour les bots */}
      <div className="hidden" aria-hidden="true">
        <input
          {...register("website")}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Prénom + Nom */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-ar-black">
            {locale === "fr" ? "Prénom" : "First name"}
            <span className="ml-1 text-ar-gold">*</span>
          </Label>
          <Input
            id="first_name"
            {...register("first_name")}
            className="border-ar-gray/30 bg-white focus:border-ar-gold focus:ring-ar-gold"
            placeholder={locale === "fr" ? "Jean" : "John"}
          />
          {errors.first_name && (
            <p className="flex items-center gap-1 text-xs text-ar-danger">
              <AlertCircle className="h-3 w-3" />
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-ar-black">
            {locale === "fr" ? "Nom" : "Last name"}
            <span className="ml-1 text-ar-gold">*</span>
          </Label>
          <Input
            id="last_name"
            {...register("last_name")}
            className="border-ar-gray/30 bg-white focus:border-ar-gold focus:ring-ar-gold"
            placeholder={locale === "fr" ? "Dupont" : "Doe"}
          />
          {errors.last_name && (
            <p className="flex items-center gap-1 text-xs text-ar-danger">
              <AlertCircle className="h-3 w-3" />
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Email + Téléphone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-ar-black">
            Email
            <span className="ml-1 text-ar-gold">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className="border-ar-gray/30 bg-white focus:border-ar-gold focus:ring-ar-gold"
            placeholder="jean.dupont@email.com"
          />
          {errors.email && (
            <p className="flex items-center gap-1 text-xs text-ar-danger">
              <AlertCircle className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-ar-black">
            {locale === "fr" ? "Téléphone" : "Phone"}
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            className="border-ar-gray/30 bg-white focus:border-ar-gold focus:ring-ar-gold"
            placeholder="+33 6 12 34 56 78"
          />
          {errors.phone && (
            <p className="flex items-center gap-1 text-xs text-ar-danger">
              <AlertCircle className="h-3 w-3" />
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Objet */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="text-ar-black">
          {locale === "fr" ? "Objet" : "Subject"}
          <span className="ml-1 text-ar-gold">*</span>
        </Label>
        <Select
          onValueChange={(value) =>
            setValue("subject", value as ContactFormData["subject"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger
            id="subject"
            className="border-ar-gray/30 bg-white focus:border-ar-gold focus:ring-ar-gold"
          >
            <SelectValue
              placeholder={
                locale === "fr" ? "Sélectionnez un objet" : "Select a subject"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(subjects).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subject && (
          <p className="flex items-center gap-1 text-xs text-ar-danger">
            <AlertCircle className="h-3 w-3" />
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Véhicule concerné */}
      <div className="space-y-2">
        <Label htmlFor="vehicle_ref" className="text-ar-black">
          {locale === "fr" ? "Véhicule concerné" : "Vehicle concerned"}
          <span className="ml-2 text-xs font-normal text-ar-silver">
            ({locale === "fr" ? "optionnel" : "optional"})
          </span>
        </Label>
        <Input
          id="vehicle_ref"
          {...register("vehicle_ref")}
          className="border-ar-gray/30 bg-white focus:border-ar-gold focus:ring-ar-gold"
          placeholder={
            locale === "fr"
              ? "Ex: BMW X5 2020"
              : "Ex: BMW X5 2020"
          }
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-ar-black">
          {locale === "fr" ? "Message" : "Message"}
          <span className="ml-1 text-ar-gold">*</span>
        </Label>
        <Textarea
          id="message"
          {...register("message")}
          rows={6}
          className="resize-none border-ar-gray/30 bg-white focus:border-ar-gold focus:ring-ar-gold"
          placeholder={
            locale === "fr"
              ? "Décrivez votre demande en détail..."
              : "Describe your request in detail..."
          }
        />
        <div className="flex items-center justify-between">
          {errors.message ? (
            <p className="flex items-center gap-1 text-xs text-ar-danger">
              <AlertCircle className="h-3 w-3" />
              {errors.message.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-ar-silver">
            {watch("message")?.length || 0} / 2000
          </span>
        </div>
      </div>

      {/* RGPD Consentement */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="rgpd_consent"
            checked={rgpdConsent}
            onCheckedChange={(checked) =>
              setValue("rgpd_consent", checked as boolean, {
                shouldValidate: true,
              })
            }
            className="mt-1 border-ar-gray/30 data-[state=checked]:bg-ar-gold data-[state=checked]:text-ar-black"
          />
          <Label
            htmlFor="rgpd_consent"
            className="cursor-pointer text-sm font-normal leading-relaxed text-ar-silver"
          >
            {locale === "fr"
              ? "J'accepte que mes données personnelles soient utilisées pour traiter ma demande. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données."
              : "I agree that my personal data will be used to process my request. In accordance with GDPR, you have the right to access, rectify and delete your data."}
            <span className="ml-1 text-ar-gold">*</span>
          </Label>
        </div>
        {errors.rgpd_consent && (
          <p className="flex items-center gap-1 text-xs text-ar-danger">
            <AlertCircle className="h-3 w-3" />
            {errors.rgpd_consent.message}
          </p>
        )}
      </div>

      {/* Erreur générale */}
      <AnimatePresence>
        {submitStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-ar-danger/5 p-3 text-sm text-ar-danger"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton submit */}
      <Button
        type="submit"
        disabled={submitStatus === "loading"}
        className="w-full bg-ar-gold py-6 text-base font-semibold text-ar-black transition-all hover:bg-ar-gold-dark hover:shadow-lg disabled:opacity-50"
      >
        {submitStatus === "loading" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {locale === "fr" ? "Envoi en cours..." : "Sending..."}
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            {locale === "fr" ? "Envoyer le message" : "Send message"}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-ar-silver/70">
        {locale === "fr"
          ? "* Champs obligatoires"
          : "* Required fields"}
      </p>
    </form>
  );
}
