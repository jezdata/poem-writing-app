import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Sparkles, Copy, RefreshCw, PenLine, Download } from "lucide-react";

const stylePrompts = {
  free_verse: "Write a modern free verse poem with vivid imagery and emotional clarity.",
  sonnet: "Write a sonnet-inspired poem with elevated language, lyrical flow, and a sense of structure.",
  haiku: "Write a haiku-inspired short poem focused on nature, seasonality, and a moment of perception.",
  romantic: "Write a romantic poem with warmth, longing, tenderness, and elegant phrasing.",
  melancholy: "Write a reflective melancholy poem with restraint, atmosphere, and emotional depth.",
  inspirational: "Write an uplifting poem with hope, momentum, and strong closing lines."
};

const seedLines = {
  free_verse: [
    "The city folds its neon wings at dawn,",
    "and somewhere a window learns the color of forgiveness.",
    "I carry your name like a small bright stone,",
    "warming slowly in the pocket of the morning."
  ],
  sonnet: [
    "When evening threads her silver through the air,",
    "the restless heart grows formal in its ache;",
    "it builds from borrowed light a patient prayer,",
    "then trembles at the silence it must make."
  ],
  haiku: [
    "Rain on cedar steps",
    "a sparrow startles the dusk",
    "tea cools by the door"
  ],
  romantic: [
    "Your laughter leaves a candle in the room,",
    "a quiet gold that lingers after speech.",
    "Even the dark becomes a softer bloom",
    "whenever memory finds what hands can’t reach."
  ],
  melancholy: [
    "The house remembers footsteps after rain,",
    "each board a patient keeper of old weather.",
    "What leaves us does not always leave in pain;",
    "sometimes it fades like thread, and not like sever."
  ],
  inspirational: [
    "Begin again, though yesterday was loud.",
    "The seed does not apologize for spring.",
    "Lift what is small; it learns to make you proud.",
    "Trust even your quietest wing."
  ]
};

function buildPoem({
  topic,
  mood,
  style,
  keywords
}: {
  topic: string;
  mood: string;
  style: keyof typeof seedLines;
  keywords: string;
}) {
  const cleanTopic = topic.trim() || "the heart";
  const keywordList = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const base = [...seedLines[style]];
  const moodLine =
    mood.trim().length > 0
      ? `Tonight the poem leans toward ${mood.trim().toLowerCase()}, without letting go of light.`
      : "Tonight the poem leans toward wonder, even in its quiet places.";

  const topicLine = `It keeps returning to ${cleanTopic}, as if naming it might let it breathe.`;

  const keywordLine =
    keywordList.length > 0
      ? `Inside it move ${keywordList.slice(0, 4).join(", ")}, each one a small door opening.`
      : "Inside it move shadow, breath, distance, and an ordinary kind of grace.";

  const endingOptions = [
    "And still the page stays open, asking for one more true thing.",
    "By the final line, even silence has learned to sing.",
    "So the night does not close; it simply turns the page.",
    "And what was broken in the dark begins, quietly, to belong."
  ];

  const ending =
    endingOptions[(cleanTopic.length + keywordList.length + style.length) % endingOptions.length];

  if (style === "haiku") {
    return [
      `${cleanTopic}`.slice(0, 22),
      mood.trim() ? `${mood.trim()} drifts through pine` : "soft twilight passes",
      keywordList[0] ? `${keywordList[0].slice(0, 18)} remains` : "one small bird remains"
    ].join("\n");
  }

  return [...base, topicLine, moodLine, keywordLine, ending].join("\n");
}

export default function App() {
  const [title, setTitle] = useState("Untitled Poem");
  const [topic, setTopic] = useState("");
  const [mood, setMood] = useState("");
  const [keywords, setKeywords] = useState("");
  const [style, setStyle] = useState<keyof typeof seedLines>("free_verse");
  const [poem, setPoem] = useState(
    buildPoem({
      topic: "moonlight",
      mood: "tender",
      style: "free_verse",
      keywords: "window, memory, blue hour"
    })
  );

  const promptPreview = useMemo(() => {
    const parts = [stylePrompts[style]];
    if (topic.trim()) parts.push(`Topic: ${topic.trim()}.`);
    if (mood.trim()) parts.push(`Mood: ${mood.trim()}.`);
    if (keywords.trim()) parts.push(`Include: ${keywords.trim()}.`);
    return parts.join(" ");
  }, [style, topic, mood, keywords]);

  const generatePoem = () => {
    setPoem(buildPoem({ topic, mood, style, keywords }));
  };

  const copyPoem = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${poem}`);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const clearAll = () => {
    setTitle("Untitled Poem");
    setTopic("");
    setMood("");
    setKeywords("");
    setStyle("free_verse");
    setPoem(
      buildPoem({
        topic: "moonlight",
        mood: "tender",
        style: "free_verse",
        keywords: "window, memory, blue hour"
      })
    );
  };

  const downloadPoem = () => {
    const blob = new Blob([`${title}\n\n${poem}`], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "poem"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-6 md:p-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="rounded-3xl shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3">
                  <PenLine className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Poem Writing App</CardTitle>
                  <p className="text-sm text-slate-600">
                    Draft poems, experiment with styles, and export what you write.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Poem title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A title for your poem"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="love, rain, memory, oceans..."
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Mood</label>
                  <Input
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="wistful, joyful, tender..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Style</label>
                  <Select
                    value={style}
                    onValueChange={(value) => setStyle(value as keyof typeof seedLines)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free_verse">Free verse</SelectItem>
                      <SelectItem value="sonnet">Sonnet-inspired</SelectItem>
                      <SelectItem value="haiku">Haiku-inspired</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="melancholy">Melancholy</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Keywords</label>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="comma-separated words to weave in"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Prompt preview</label>
                <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                  {promptPreview}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={generatePoem} className="rounded-2xl">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate poem
                </Button>

                <Button variant="secondary" onClick={copyPoem} className="rounded-2xl">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                <Button variant="secondary" onClick={downloadPoem} className="rounded-2xl">
                  <Download className="mr-2 h-4 w-4" />
                  Export .txt
                </Button>

                <Button variant="ghost" onClick={clearAll} className="rounded-2xl">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="h-full rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-center text-2xl font-semibold tracking-wide">
                  {title}
                </h2>
                <Textarea
                  value={poem}
                  onChange={(e) => setPoem(e.target.value)}
                  className="min-h-[420px] resize-none border-0 bg-transparent p-0 text-base leading-8 shadow-none focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
