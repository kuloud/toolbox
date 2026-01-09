"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Coffee, Copy, Heart, Terminal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdaptiveImage } from "./adaptive_image";

export function DashboardHeader() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(0);

  const handleCopyAddress = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setCopiedIndex(index);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-2">
          <div
            className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80"
            onClick={() => {
              navigate("/");
            }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Dev Toolbox
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-lg"
                  aria-label="Support Development"
                >
                  <Heart stroke="red" fill="red" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-4">
                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Support Dev Toolbox
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Your support helps improve the project
                      </p>
                    </div>
                  </div>

                  {/* Quick Donate Buttons */}
                  <div className="space-y-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        window.open("https://buymeacoffee.com/kuloud", "_blank")
                      }
                    >
                      <Coffee />
                      Buy Me a Coffee
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        window.open(
                          "https://github.com/sponsors/kuloud",
                          "_blank",
                        )
                      }
                    >
                      <Heart />
                      GitHub Sponsors
                    </Button>
                  </div>

                  {/* Crypto Section */}
                  <div className="rounded-lg border border-border p-3">
                    <h4 className="mb-2 text-sm font-medium">
                      Crypto Donations
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium">
                            Bitcoin (BTC)
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleCopyAddress(
                                "bc1pywhu6sr2w770e499fmkgyserxwf0z55pfwa09ef2znjsdxq3zl3su4wlyw",
                                0,
                              )
                            }
                          >
                            {copied && copiedIndex == 0 ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <code className="block truncate rounded-md bg-muted px-2 py-1.5 text-xs">
                          bc1pywhu6sr2w770e499fmkgyserxwf0z55pfwa09ef2znjsdxq3zl3su4wlyw
                        </code>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium">
                            Ethereum (ETH)
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleCopyAddress(
                                "0x58705685915FF0cF812D30dD9408cCA0D799f243",
                                1,
                              )
                            }
                          >
                            {copied && copiedIndex == 1 ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <code className="block truncate rounded-md bg-muted px-2 py-1.5 text-xs">
                          0x58705685915FF0cF812D30dD9408cCA0D799f243
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* QR Codes */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="text-center">
                      <p className="mb-2 text-xs font-medium">Wechat</p>
                      <div className="overflow-hidden rounded-lg border border-border p-2">
                        <AdaptiveImage
                          src="/images/payment_qr.png"
                          alt="Wechat payment QR Code"
                          className="h-auto w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Message */}
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <p className="text-xs text-muted-foreground">
                      Thank you for your support! ❤️
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
