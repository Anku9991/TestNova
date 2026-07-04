import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  imageClassName?: string;
}

export function Logo({ className, href = "/", imageClassName }: LogoProps) {
  const content = (
    <>
      <Image
        src="/logo.png"
        alt="TestNova Logo"
        width={150}
        height={45}
        className={cn("h-8 sm:h-10 w-auto object-contain dark:hidden", imageClassName)}
        priority
      />
      <Image
        src="/logo-dark.png"
        alt="TestNova Logo"
        width={150}
        height={45}
        className={cn("h-8 sm:h-10 w-auto object-contain hidden dark:block", imageClassName)}
        priority
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center gap-2 group", className)}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      {content}
    </div>
  );
}
