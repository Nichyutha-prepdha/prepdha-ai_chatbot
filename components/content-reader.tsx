"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Sparkles,
  MessageSquare,
  Highlighter,
  Copy,
  ChevronDown,
  BookOpen,
  Eye,
  EyeOff,
  Search,
} from "lucide-react"

interface TextToolbarProps {
  position: { top: number; left: number }
  selectedText: string
  onAskAI: (text: string) => void
  onAddSnippet: () => void
  onAddComment: () => void
  onHighlight: () => void
  onCopy: () => void
  onClose: () => void
}

function TextToolbar({
  position,
  selectedText,
  onAskAI,
  onAddSnippet,
  onAddComment,
  onHighlight,
  onCopy,
  onClose,
}: TextToolbarProps) {
  return (
    <div
      className="fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-card border border-border shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <button
        onClick={onAddSnippet}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <ChevronDown className="w-3 h-3" />
        Add it to
      </button>
      <div className="w-px h-4 bg-border" />
      <button
        onClick={() => onAskAI(selectedText)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        Ask AI
      </button>
      <div className="w-px h-4 bg-border" />
      <button
        onClick={onAddComment}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <MessageSquare className="w-3 h-3" />
        Add a Comment
      </button>
      <div className="w-px h-4 bg-border" />
      <button
        onClick={onHighlight}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <Highlighter className="w-3 h-3" />
        Highlight
      </button>
      <div className="w-px h-4 bg-border" />
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <Copy className="w-3 h-3" />
        Copy Text
      </button>
    </div>
  )
}

type ChapterStatus = "completed" | "in-progress" | "not-started"

interface Chapter {
  id: string
  title: string
  status: ChapterStatus
  badge?: string
  subtitle?: string
  sections: {
    id: string
    label?: string
    title: string
    body: string
    image?: string
  }[]
  vocabulary: { word: string; definition: string }[]
}

const chapters: Chapter[] = [
  {
    id: "chapter-1",
    title: "Military Campaigns and Expansion",
    status: "in-progress",
    badge: "MC",
    subtitle: "Harsha vs Sasanka",
    sections: [
      {
        id: "ch1-part1",
        label: "Part 1",
        title: "A Young King in Turmoil",
        body:
          "When Harsha ascended to the throne at just sixteen years old in 606 CE, he stepped into a kingdom shaken by grief and political instability. His elder brother Rajyavardhana had been killed under suspicious circumstances, and powerful neighbours were already testing the limits of the new ruler. Despite his youth, Harsha quickly realised that hesitation could cost him both his family’s honour and his empire’s future.",
        image: "/images/harsha-painting.jpg",
      },
      {
        id: "ch1-part2",
        title: "Allies and Enemies",
        body:
          "To stabilise his rule, Harsha began carefully choosing allies among nearby kingdoms while keeping a close watch on Sasanka of Gauda, the ruler widely believed to be behind his brother’s death. Courtiers and generals debated whether Harsha should focus on internal reforms or immediate retaliation. Harsha listened to each side before deciding that securing loyal support at home was the first step toward any successful campaign.",
      },
      {
        id: "ch1-part3",
        title: "Preparing for Expansion",
        body:
          "Once his core territories were secure, Harsha turned his attention outward. He reorganised his army, improved communication between distant provinces, and ensured that supplies could move quickly across his lands. These preparations did not yet look like conquest to outsiders, but they quietly laid the foundation for the military campaigns that would soon follow.",
      },
    ],
    vocabulary: [
      {
        word: "Ascended",
        definition: "To rise to a position of power or authority, especially to the throne.",
      },
      {
        word: "Instability",
        definition: "A situation where things keep changing and cannot be relied on to stay the same.",
      },
      {
        word: "Retaliation",
        definition: "An action taken to get back at someone who has caused harm.",
      },
      {
        word: "Campaign",
        definition: "A series of planned military actions carried out to achieve a specific goal.",
      },
    ],
  },
  {
    id: "chapter-2",
    title: "First Expedition Against Sasanka",
    status: "completed",
    badge: "FE",
    subtitle: "Harsha’s first response",
    sections: [
      {
        id: "ch2-part1",
        title: "The March Begins",
        body:
          "News of Sasanka’s actions in Gauda spread quickly through Harsha’s court. Advisors warned that delaying a response would make Harsha appear weak. After weeks of planning, Harsha ordered his first expedition toward the eastern frontier. Villagers watched long lines of soldiers, horses, and war elephants moving along dusty roads, carrying the hopes of an empire seeking justice.",
        image: "/images/harsha-painting.jpg",
      },
      {
        id: "ch2-part2",
        title: "Challenges on the Road",
        body:
          "The journey toward Gauda was not easy. Heavy rains turned paths into rivers of mud, and some local chiefs hesitated to support Harsha openly, fearing Sasanka’s retaliation. Harsha used both diplomacy and firmness to secure safe passage, promising protection to those who sided with him and warning of consequences for those who secretly aided his enemy.",
      },
      {
        id: "ch2-part3",
        title: "A Message to Sasanka",
        body:
          "Although this first expedition did not immediately remove Sasanka from power, it sent a powerful message. Harsha showed that he would not quietly accept injustice or betrayal. The expedition tested his army, revealed which allies he could trust, and marked the beginning of a longer struggle that would reshape the balance of power in northern India.",
      },
    ],
    vocabulary: [
      {
        word: "Expedition",
        definition: "A long and organised journey, often for exploration or military purposes.",
      },
      {
        word: "Frontier",
        definition: "A border between two regions or kingdoms.",
      },
      {
        word: "Diplomacy",
        definition: "The skill of managing relationships and negotiations between rulers or states.",
      },
      {
        word: "Betrayal",
        definition: "Breaking trust by helping an enemy or acting against a friend or ally.",
      },
    ],
  },
  {
    id: "chapter-3",
    title: "Conquest after Sasanka’s death",
    status: "not-started",
    badge: "CS",
    subtitle: "Power shift in Gauda",
    sections: [
      {
        id: "ch3-part1",
        title: "A Kingdom Without a Ruler",
        body:
          "After Sasanka’s death, Gauda was left without a strong leader. Competing nobles tried to claim the throne, and rumours of rebellion spread across the region. Harsha saw both danger and opportunity in this moment. If he acted too slowly, another rival might seize Gauda. If he moved wisely, he could bring stability to the region under his own rule.",
      },
      {
        id: "ch3-part2",
        title: "Securing Gauda",
        body:
          "Harsha advanced with a combination of military strength and careful negotiation. Some cities opened their gates willingly, hoping that Harsha would restore order and protect trade routes. Others resisted and had to be persuaded through short but decisive battles. By rewarding cooperation and limiting unnecessary punishment, Harsha encouraged local leaders to accept his authority.",
      },
      {
        id: "ch3-part3",
        title: "From Enemy Territory to Empire",
        body:
          "Once Gauda was firmly under his control, Harsha focused on rebuilding rather than simple revenge. He repaired roads, encouraged scholars to visit his court, and supported temples and monasteries. In doing so, he turned a once-hostile region into an important part of his expanding empire.",
      },
    ],
    vocabulary: [
      {
        word: "Rebellion",
        definition: "An organised attempt to resist or overthrow a ruler or government.",
      },
      {
        word: "Authority",
        definition: "The right or power to give orders and make decisions.",
      },
      {
        word: "Stability",
        definition: "A condition in which things are steady and not likely to suddenly change.",
      },
    ],
  },
  {
    id: "chapter-4",
    title: "Conquest of Magadha",
    status: "not-started",
    badge: "CM",
    subtitle: "Expanding the empire",
    sections: [
      {
        id: "ch4-part1",
        title: "Why Magadha Mattered",
        body:
          "Magadha was a rich and ancient region, famous for its fertile land and important trade routes. Any ruler who controlled Magadha gained access to wealth, soldiers, and influence. Harsha understood that bringing Magadha into his realm would turn his kingdom into a truly powerful empire.",
      },
      {
        id: "ch4-part2",
        title: "Negotiations and Battles",
        body:
          "Before choosing war, Harsha tried to reach peaceful agreements with Magadha’s rulers. When some local powers refused to cooperate, he launched targeted campaigns rather than one long and costly war. These careful strategies allowed him to win key forts and cities without exhausting his army.",
      },
      {
        id: "ch4-part3",
        title: "Uniting the Regions",
        body:
          "After Magadha accepted his rule, Harsha worked to connect it with his other territories. He improved roads so that messengers, traders, and scholars could travel more easily. Over time, people from different regions of his empire began to feel more connected to one another, sharing ideas, goods, and cultural traditions.",
      },
    ],
    vocabulary: [
      {
        word: "Fertile",
        definition: "Able to produce many crops or support a lot of plant growth.",
      },
      {
        word: "Strategy",
        definition: "A carefully planned way of achieving a goal, especially in war or politics.",
      },
      {
        word: "Realm",
        definition: "A kingdom or area ruled by a particular person.",
      },
      {
        word: "Trade routes",
        definition: "Regular paths used by merchants to move goods between places.",
      },
    ],
  },
  {
    id: "chapter-5",
    title: "Architecture and Monuments Under Harsha",
    status: "not-started",
    badge: "AR",
    subtitle: "Building an Empire's Legacy",
    sections: [
      {
        id: "ch5-part1",
        title: "Temples of Faith and Power",
        body:
          "Harsha was a great patron of religious architecture, particularly supporting the construction of Hindu temples and Buddhist monasteries. The most famous example is the Harihara Temple at Osian, built to honor both Hindu and Buddhist traditions simultaneously. These temples were more than places of worship—they symbolized Harsha's power, his respect for learning, and his desire to unite different faiths under his rule. The intricate stone carvings and towering structures showcased the skill of his craftsmen and the wealth of his empire.",
        image: "/images/harsha-temple.jpg",
      },
      {
        id: "ch5-part2",
        title: "Nalanda University and Centers of Learning",
        body:
          "Harsha transformed Nalanda into one of the world's greatest centers of learning and intellectual discourse. He donated enormous sums to expand the university's buildings, libraries, and dormitories for scholars from across Asia. The complex featured multiple lecture halls, study rooms, and residential quarters designed to accommodate thousands of students and teachers. This architectural support for education reflected Harsha's belief that an empire's true strength came not just from military power, but from the advancement of knowledge and wisdom.",
        image: "/images/nalanda-university.jpg",
      },
      {
        id: "ch5-part3",
        title: "Urban Planning and Public Works",
        body:
          "Beyond religious and educational buildings, Harsha invested in infrastructure that improved daily life across his empire. He ordered the construction of roads, bridges, and rest houses for travelers and traders. Cities were planned with bazaars, water systems, and gardens. These practical architectural achievements connected his scattered territories and facilitated trade, making his empire more unified and prosperous. The roads Harsha built remained important trade routes for centuries after his reign.",
        image: "/images/harsha-roads.jpg",
      },
      {
        id: "ch5-part4",
        title: "Artistic Styles and Influences",
        body:
          "Harsha's patronage shaped the architectural style of his era, blending influences from earlier Gupta traditions with new, bold designs. Sculptors and builders worked with stone and brick to create intricate patterns, detailed reliefs, and imposing structures. The decorative elements often told stories from scriptures and history, making them both beautiful and educational. This golden age of architecture left a lasting cultural heritage that influenced Indian building styles for generations to come.",
        image: "/images/harsha-sculpture.jpg",
      },
    ],
    vocabulary: [
      {
        word: "Patronage",
        definition: "Support and funding provided by a wealthy or powerful person to artists, scholars, or projects.",
      },
      {
        word: "Monastery",
        definition: "A community of monks or nuns living together under religious rules.",
      },
      {
        word: "Infrastructure",
        definition: "Basic systems and facilities needed for a society to function, such as roads and water systems.",
      },
      {
        word: "Relief",
        definition: "A form of sculpture where images project from a flat background, often telling a story or showing scenes.",
      },
      {
        word: "Heritage",
        definition: "Traditions, achievements, and cultural elements passed down from the past.",
      },
      {
        word: "Discourse",
        definition: "Serious discussion or debate about a topic.",
      },
    ],
    
  },
]

interface ContentReaderProps {
  onAskAI: (text: string) => void
  onChapterContextChange: (context: string) => void
  onChapterChange?: (chapterId: string) => void
}

export function ContentReader({
  onAskAI,
  onChapterContextChange,
  onChapterChange,
}: ContentReaderProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState("")
  const [highlights, setHighlights] = useState<string[]>([
    "When Harsha ascended to the throne at just sixteen years old in 606 CE,",
  ])
  const [savedSnippets, setSavedSnippets] = useState<string[]>([])
  const [comments, setComments] = useState<{ id: string; text: string; note: string }[]>([])
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id ?? "")
  const [searchTerm, setSearchTerm] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelectedText(selection.toString().trim())
      setToolbarPos({
        top: rect.top - 50,
        left: Math.max(rect.left, 10),
      })
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showToolbar) {
        const target = e.target as HTMLElement
        if (!target.closest("[data-toolbar]")) {
          setShowToolbar(false)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showToolbar])

  const handleHighlight = () => {
    if (selectedText && !highlights.includes(selectedText)) {
      setHighlights([...highlights, selectedText])
    }
    setShowToolbar(false)
    window.getSelection()?.removeAllRanges()
  }

  const renderHighlightedText = (text: string) => {
    let result = text
    highlights.forEach((hl) => {
      if (result.includes(hl)) {
        result = result.replace(
          hl,
          `<mark class="bg-amber-200/70 text-foreground px-0.5 rounded-sm cursor-pointer">${hl}</mark>`
        )
      }
    })
    return result
  }

  const filteredChapters = chapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) ?? chapters[0]
  const vocabularyWords = selectedChapter.vocabulary

  useEffect(() => {
    if (!selectedChapter) return

    // Build comprehensive chapter context including title, sections, and vocabulary
    const combinedText =
      `Chapter: ${selectedChapter.title}\n` +
      `${selectedChapter.subtitle ? `Subtitle: ${selectedChapter.subtitle}\n` : ""}` +
      `\n---\n\n` +
      selectedChapter.sections
        .map((section) => `${section.title}\n${section.body}`)
        .join("\n\n---\n\n") +
      (selectedChapter.vocabulary.length
        ? "\n\n---\n\nKey vocabulary:\n" +
          selectedChapter.vocabulary
            .map((v) => `${v.word}: ${v.definition}`)
            .join("\n")
        : "")

    onChapterContextChange(combinedText)
    onChapterChange?.(selectedChapter.id)
  }, [selectedChapter, onChapterContextChange, onChapterChange])

  const handleAddSnippet = () => {
    if (selectedText && !savedSnippets.includes(selectedText)) {
      setSavedSnippets((prev) => [...prev, selectedText])
    }
    setShowToolbar(false)
    window.getSelection()?.removeAllRanges()
  }

  const handleAddComment = () => {
    if (!selectedText.trim()) return
    const note = window.prompt("Add a comment for this text:", "")
    if (note && note.trim()) {
      setComments((prev) => [
        ...prev,
        { id: Date.now().toString(), text: selectedText, note: note.trim() },
      ])
    }
    setShowToolbar(false)
    window.getSelection()?.removeAllRanges()
  }

  const handleCopy = () => {
    if (!selectedText) return
    navigator.clipboard.writeText(selectedText)
    setShowToolbar(false)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden" ref={contentRef}>
      {/* Left Chapters Panel */}
      <aside className="w-80 border-r border-border bg-card flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Chapters
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search within this chapter"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {filteredChapters.map((chapter) => {
            const isActive = chapter.id === selectedChapterId
            let statusLabel = "Not Started"
            let statusClasses =
              "text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"

            if (chapter.status === "completed") {
              statusLabel = "Completed"
              statusClasses =
                "text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
            } else if (chapter.status === "in-progress") {
              statusLabel = "In Progress"
              statusClasses =
                "text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-200"
            }

            return (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                  isActive
                    ? "border-[#7c3aed] bg-[#7c3aed]/5"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                      chapter.status === "completed"
                        ? "bg-emerald-500 text-white"
                        : chapter.status === "in-progress"
                        ? "bg-[#7c3aed] text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {chapter.badge ?? "CH"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {chapter.title}
                    </span>
                    {chapter.subtitle && (
                      <span className="text-[11px] text-muted-foreground truncate">
                        {chapter.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                <span className={statusClasses}>{statusLabel}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Reader Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Current chapter pill */}
          <button className="flex items-center gap-2 px-4 py-2 mb-6 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <BookOpen className="w-4 h-4" />
            <span className="truncate">
              {selectedChapter ? selectedChapter.title : "Select a chapter"}
            </span>
          </button>

          {/* Click to Reveal Card */}
          <div
            className={`mb-6 rounded-xl border-2 transition-all duration-300 ${
              isRevealed
                ? "border-[#7c3aed]/30 bg-[#7c3aed]/5"
                : "border-amber-300 bg-amber-50"
            }`}
          >
            <button
              onClick={() => setIsRevealed(!isRevealed)}
              className="w-full p-5 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isRevealed
                      ? "bg-[#7c3aed] text-white"
                      : "bg-amber-400 text-amber-900"
                  }`}
                >
                  {isRevealed ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  {isRevealed ? "Click to Hide" : "Click to Reveal"}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                Character Introduction
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRevealed
                  ? "Harsha (c. 590-647 CE) was a powerful emperor who ruled over a vast territory in northern India. Known for his military prowess, diplomatic skill, and patronage of arts and learning, he united much of North India under his rule. Sasanka was the king of Gauda (Bengal) who was involved in the deaths of Harsha's elder brother and brother-in-law."
                  : "Click to reveal the Main characters of the story."}
              </p>
            </button>
          </div>

          {/* Chapter Parts */}
          {selectedChapter.sections.map((section, index) => (
            <div
              key={section.id}
              className="mb-6 rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="p-4 pb-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#7c3aed] text-white mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {section.title}
                </span>
              </div>

              {/* Optional image for the first part or when provided */}
              {section.image && (
                <div className="px-4 pb-4">
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="px-4 pb-6" onMouseUp={handleMouseUp}>
                <h2 className="text-xl font-bold text-foreground mb-3">
                  {section.title}
                </h2>
                <div
                  className="text-sm leading-relaxed text-foreground/80"
                  dangerouslySetInnerHTML={{
                    __html: renderHighlightedText(section.body),
                  }}
                />
              </div>
            </div>
          ))}

          {/* Vocabulary Section */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Vocabulary
            </h3>
            <div className="flex flex-col gap-3">
              {vocabularyWords.map((item) => (
                <div
                  key={item.word}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-semibold text-[#7c3aed] shrink-0 min-w-[100px]">
                    {item.word}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.definition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Saved snippets */}
          {savedSnippets.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Saved snippets
              </h3>
              <div className="flex flex-col gap-2">
                {savedSnippets.map((snippet, index) => (
                  <div
                    key={`${index}-${snippet.slice(0, 20)}`}
                    className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
                  >
                    {snippet}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {comments.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Comments
              </h3>
              <div className="flex flex-col gap-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-border bg-muted/40 p-3"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      <span className="font-semibold">Text:</span> {comment.text}
                    </p>
                    <p className="text-xs text-foreground">
                      <span className="font-semibold">Comment:</span>{" "}
                      {comment.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text Selection Toolbar */}
        {showToolbar && (
          <div data-toolbar>
            <TextToolbar
              position={toolbarPos}
              selectedText={selectedText}
              onAskAI={(text) => {
                onAskAI(text)
                setShowToolbar(false)
              }}
              onAddSnippet={handleAddSnippet}
              onAddComment={handleAddComment}
              onHighlight={handleHighlight}
              onCopy={handleCopy}
              onClose={() => setShowToolbar(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
