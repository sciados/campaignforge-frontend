import { useState } from "react";

// Example platform icons (replace with your SVG or icon components)
const TikTokIcon = () => <span>🎵</span>;
const InstagramIcon = () => <span>📸</span>;
const YouTubeIcon = () => <span>▶️</span>;
const FacebookIcon = () => <span>📘</span>;

interface Platform {
  id: string;
  name: string;
  icon: JSX.Element;
}

const platforms: Platform[] = [
  { id: "tiktok", name: "TikTok", icon: <TikTokIcon /> },
  { id: "instagram_reel", name: "Instagram Reel", icon: <InstagramIcon /> },
  { id: "youtube_short", name: "YouTube Short", icon: <YouTubeIcon /> },
  { id: "facebook_story", name: "Facebook Story", icon: <FacebookIcon /> },
];

interface Props {
  selectedPlatform?: string;
  onSelect: (platformId: string) => void;
}

export default function PlatformSelector({
  selectedPlatform,
  onSelect,
}: Props) {
  const [selected, setSelected] = useState(selectedPlatform || "tiktok");

  const handleSelect = (platformId: string) => {
    setSelected(platformId);
    onSelect(platformId);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {platforms.map((platform) => (
        <div
          key={platform.id}
          onClick={() => handleSelect(platform.id)}
          className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition
                      ${
                        selected === platform.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
        >
          <div className="text-3xl mb-2">{platform.icon}</div>
          <div className="text-sm font-medium text-center">{platform.name}</div>
        </div>
      ))}
    </div>
  );
}
