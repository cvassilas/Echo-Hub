import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, ExternalLink } from "lucide-react";
import { card, SectionTitle } from "./ui";

export const WEB_URL = "https://cvassilas.github.io/Echo-Hub/";

/** Link and QR code for the browser / iPhone version. */
export const WebVersion: React.FC = () => {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { QRCode.toDataURL(WEB_URL, { margin: 1, width: 360, color: { dark: "#0b0f11", light: "#ffffff" } }).then(setQr).catch(() => {}); }, []);
  const copy = async () => { try { await navigator.clipboard.writeText(WEB_URL); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ } };
  return (
    <div className={`${card} p-4 space-y-3`}>
      <SectionTitle>Web version</SectionTitle>
      <p className="text-[12px] leading-snug text-[var(--c-text2)]">Works in any browser, including iPhone and laptop: use Share → Add to Home Screen to install it. Reports save in that browser. Opening other apps and sending to Clinical Logs need the Android app.</p>
      <div className="flex items-center gap-3">
        {qr ? <img src={qr} alt="QR code for the Echo Hub web version" className="w-32 h-32 rounded-xl bg-white p-1" /> : <div className="w-32 h-32 rounded-xl bg-[var(--c-surface2)]" />}
        <div className="flex-1 min-w-0 space-y-2">
          <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="block text-[12.5px] font-bold text-[var(--c-teal)] break-all">{WEB_URL}</a>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={copy} className="m3-press px-3 py-1.5 rounded-full border border-[var(--c-border2)] text-[12px] font-bold text-[var(--c-text2)] flex items-center gap-1">{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "Copied" : "Copy link"}</button>
            <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="m3-press px-3 py-1.5 rounded-full border border-[var(--c-border2)] text-[12px] font-bold text-[var(--c-text2)] flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" />Open</a>
          </div>
        </div>
      </div>
    </div>
  );
};
