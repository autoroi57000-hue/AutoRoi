"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { Menu, X, Phone, MessageCircle, ChevronUp } from "lucide-react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { cn } from "@/lib/utils";
import { localePath } from '@/lib/constants'

interface HeaderProps {
  phoneNumber: string;
  whatsappNumber: string;
  businessName: string;
}

export function Header({ phoneNumber, whatsappNumber, businessName }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const isHomePage = pathname === `${localePath(locale)}` || pathname === `${localePath(locale, '/')}`;
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      setShowBackToTop(scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/vehicules", label: t("vehicles") },
    { href: "/location", label: t("rental") },
    { href: "/contact", label: t("contact") },
  ];

  const whatsappPhone = whatsappNumber.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${whatsappPhone}`;

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="scroll-progress"
        style={{ scaleX }}
        aria-hidden="true"
      />
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          isScrolled || !isHomePage
            ? "header-glass border-b border-ar-gray-700/50"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href={`${localePath(locale)}`}
              className="group relative flex items-center gap-2"
            >
              <Image
                src="/logo1.png"
                alt={businessName}
                width={64}
                height={64}
                className="rounded-full object-cover transition-opacity group-hover:opacity-80"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              <LayoutGroup>
                {navLinks.map((link) => {
                  const isActive = pathname === `${localePath(locale, link.href)}` ||
                    (link.href !== "/" && pathname.startsWith(`${localePath(locale, link.href)}`));

                  return (
                    <Link
                      key={link.href}
                      href={`${localePath(locale, link.href)}`}
                      className={cn(
                        "relative py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "text-ar-gold"
                          : isScrolled || !isHomePage
                            ? "text-ar-silver hover:text-ar-gold"
                            : "text-white/90 hover:text-ar-gold"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute -bottom-1 left-0 right-0 h-px"
                          style={{
                            background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
                          }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 380, damping: 30 }
                          }
                        />
                      )}
                    </Link>
                  );
                })}
              </LayoutGroup>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-4 md:flex">
              {/* WhatsApp Button */}
              <motion.a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="whatsapp-pulse flex h-11 w-11 items-center justify-center rounded-full bg-ar-whatsapp text-white shadow-lg"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </motion.a>

              {/* Phone Button */}
              <motion.a
                href={`tel:${phoneNumber}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                  isScrolled || !isHomePage
                    ? "bg-ar-gold/10 text-ar-gold hover:bg-ar-gold hover:text-ar-black"
                    : "bg-white/10 text-white hover:bg-ar-gold hover:text-ar-black"
                )}
                aria-label="Phone"
              >
                <Phone className="h-5 w-5" />
              </motion.a>

              {/* Locale Switcher */}
              <LocaleSwitcher
                className={cn(
                  isScrolled || !isHomePage ? "" : "[&_button]:text-white"
                )}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "relative z-50 rounded-lg p-2.5 transition-colors md:hidden",
                isMobileMenuOpen
                  ? "bg-ar-gold text-ar-black"
                  : isScrolled || !isHomePage
                    ? "text-ar-silver hover:text-ar-gold"
                    : "text-white hover:text-ar-gold"
              )}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
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
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute left-0 right-0 top-16 overflow-hidden border-b border-ar-gray-700/50 bg-ar-black/95 backdrop-blur-lg md:hidden"
            >
              <nav className="container mx-auto flex flex-col px-4 py-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={`${localePath(locale, link.href)}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block border-b border-ar-gray-700/50 py-4 text-lg transition-colors",
                        pathname === `${localePath(locale, link.href)}`
                          ? "text-ar-gold"
                          : "text-ar-silver hover:text-ar-gold"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Contact Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 grid grid-cols-2 gap-3"
                >
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-ar-whatsapp py-4 font-semibold text-white transition-transform active:scale-95"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${phoneNumber}`}
                    className="flex items-center justify-center gap-2 rounded-lg bg-ar-gold py-4 font-semibold text-ar-black transition-transform active:scale-95"
                  >
                    <Phone className="h-5 w-5" />
                    {t("contact")}
                  </a>
                </motion.div>

                {/* Mobile Locale Switcher */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 flex items-center justify-center border-t border-ar-gray-700/50 pt-6"
                >
                  <LocaleSwitcher />
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ar-gold text-ar-black shadow-lg transition-shadow hover:shadow-xl"
            aria-label="Back to top"
          >
            <ChevronUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
