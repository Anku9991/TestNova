"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center mb-6"
      >
        <Construction className="w-12 h-12 text-primary-500" />
      </motion.div>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground max-w-md">
        {description || "This feature is currently under construction and will be available in the next major update. Stay tuned!"}
      </p>
    </div>
  );
}
