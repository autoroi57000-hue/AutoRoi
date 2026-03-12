"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface FloatingWhatsAppButtonProps {
  locale?: string;
  whatsappNumber: string;
  businessName: string;
  messageFr: string;
  messageEn: string;
  tooltipFr: string;
  tooltipEn: string;
  subtitleFr: string;
  subtitleEn: string;
}

export function FloatingWhatsAppButton({
  locale = "fr",
  whatsappNumber,
  businessName,
  messageFr,
  messageEn,
  tooltipFr,
  tooltipEn,
  subtitleFr,
  subtitleEn,
}: FloatingWhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const message = locale === "en" ? messageEn : messageFr;
  const encodedMessage = encodeURIComponent(message);
  const phone = whatsappNumber.replace(/\D/g, "");
  const href = `https://wa.me/${phone}?text=${encodedMessage}`;

  const tooltipText = locale === "en" ? tooltipEn : tooltipFr;
  const subtitleText = locale === "en" ? subtitleEn : subtitleFr;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mb-2 overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="bg-ar-whatsapp p-4 text-white">
              <h4 className="font-semibold">{businessName}</h4>
              <p className="text-sm text-white/90">{tooltipText}</p>
            </div>
            <div className="p-4">
              <p className="mb-4 text-sm text-ar-silver">{subtitleText}</p>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-ar-whatsapp px-4 py-3 font-medium text-white transition-colors hover:bg-ar-whatsapp/80"
              >
                <MessageCircle className="h-5 w-5" />
                {locale === "fr" ? "Démarrer la conversation" : "Start chat"}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MagneticButton>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-ar-whatsapp text-white shadow-lg transition-transform hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={tooltipText}
        >
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-ar-whatsapp animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          <span className="absolute -inset-2 rounded-full bg-ar-whatsapp/20 animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="whatsapp"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip */}
          <span className="absolute right-full mr-3 whitespace-nowrap rounded-md bg-ar-black px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {tooltipText}
          </span>
        </motion.button>
      </MagneticButton>
    </div>
  );
}
