import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md mx-auto">
        {/* Glassmorphic container */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl shadow-2xl p-8 space-y-8">
          {/* Logo section */}
          <div className="flex justify-center">
            <div className="relative w-60 h-60 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-2">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/thuiLogo.png"
                  alt="JAOTHUI Logo"
                  width={240}
                  height={240}
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Welcome text section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-foreground leading-tight">
              ยินดีต้อนรับเข้าสู่ระบบ
            </h1>
            <p className="text-2xl text-foreground/90">
              ข้อมูลควาย
            </p>
          </div>

          {/* CTA button */}
          <div className="pt-4">
            <Button
              asChild
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Link href="/login">
                เข้าสู่ระบบ
              </Link>
            </Button>
          </div>

          {/* Footer text */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              powered by JAOTHUI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
