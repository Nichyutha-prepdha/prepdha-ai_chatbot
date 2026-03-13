export interface ChapterSection {
  id: string;
  title: string;
  body: string;
}

export interface ChapterVocabulary {
  word: string;
  definition: string;
}

export interface ChapterEmbeddingSource {
  id: string;
  title: string;
  subtitle?: string;
  sections: ChapterSection[];
  vocabulary: ChapterVocabulary[];
}

export const chapterEmbeddingSource: ChapterEmbeddingSource[] = [
  {
    id: "chapter-1",
    title: "Military Campaigns and Expansion",
    subtitle: "Harsha vs Sasanka",
    sections: [
      {
        id: "ch1-part1",
        title: "A Young King in Turmoil",
        body: "When Harsha ascended to the throne at just sixteen years old in 606 CE, he stepped into a kingdom shaken by grief and political instability. His elder brother Rajyavardhana had been killed under suspicious circumstances, and powerful neighbours were already testing the limits of the new ruler. Despite his youth, Harsha quickly realised that hesitation could cost him both his family's honour and his empire's future.",
      },
      {
        id: "ch1-part2",
        title: "Allies and Enemies",
        body: "To stabilise his rule, Harsha began carefully choosing allies among nearby kingdoms while keeping a close watch on Sasanka of Gauda, the ruler widely believed to be behind his brother's death. Courtiers and generals debated whether Harsha should focus on internal reforms or immediate retaliation. Harsha listened to each side before deciding that securing loyal support at home was the first step toward any successful campaign.",
      },
      {
        id: "ch1-part3",
        title: "Preparing for Expansion",
        body: "Once his core territories were secure, Harsha turned his attention outward. He reorganised his army, improved communication between distant provinces, and ensured that supplies could move quickly across his lands. These preparations did not yet look like conquest to outsiders, but they quietly laid the foundation for the military campaigns that would soon follow.",
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
    subtitle: "Harsha's first response",
    sections: [
      {
        id: "ch2-part1",
        title: "The March Begins",
        body: "News of Sasanka's actions in Gauda spread quickly through Harsha's court. Advisors warned that delaying a response would make Harsha appear weak. After weeks of planning, Harsha ordered his first expedition toward the eastern frontier. Villagers watched long lines of soldiers, horses, and war elephants moving along dusty roads, carrying the hopes of an empire seeking justice.",
      },
      {
        id: "ch2-part2",
        title: "Challenges on the Road",
        body: "The journey toward Gauda was not easy. Heavy rains turned paths into rivers of mud, and some local chiefs hesitated to support Harsha openly, fearing Sasanka's retaliation. Harsha used both diplomacy and firmness to secure safe passage, promising protection to those who sided with him and warning of consequences for those who secretly aided his enemy.",
      },
      {
        id: "ch2-part3",
        title: "A Message to Sasanka",
        body: "Although this first expedition did not immediately remove Sasanka from power, it sent a powerful message. Harsha showed that he would not quietly accept injustice or betrayal. The expedition tested his army, revealed which allies he could trust, and marked the beginning of a longer struggle that would reshape the balance of power in northern India.",
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
    title: "Conquest after Sasanka's death",
    subtitle: "Power shift in Gauda",
    sections: [
      {
        id: "ch3-part1",
        title: "A Kingdom Without a Ruler",
        body: "After Sasanka's death, Gauda was left without a strong leader. Competing nobles tried to claim the throne, and rumours of rebellion spread across the region. Harsha saw both danger and opportunity in this moment. If he acted too slowly, another rival might seize Gauda. If he moved wisely, he could bring stability to the region under his own rule.",
      },
      {
        id: "ch3-part2",
        title: "Securing Gauda",
        body: "Harsha advanced with a combination of military strength and careful negotiation. Some cities opened their gates willingly, hoping that Harsha would restore order and protect trade routes. Others resisted and had to be persuaded through short but decisive battles. By rewarding cooperation and limiting unnecessary punishment, Harsha encouraged local leaders to accept his authority.",
      },
      {
        id: "ch3-part3",
        title: "From Enemy Territory to Empire",
        body: "Once Gauda was firmly under his control, Harsha focused on rebuilding rather than simple revenge. He repaired roads, encouraged scholars to visit his court, and supported temples and monasteries. In doing so, he turned a once-hostile region into an important part of his expanding empire.",
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
    subtitle: "Expanding the empire",
    sections: [
      {
        id: "ch4-part1",
        title: "Why Magadha Mattered",
        body: "Magadha was a rich and ancient region, famous for its fertile land and important trade routes. Any ruler who controlled Magadha gained access to wealth, soldiers, and influence. Harsha understood that bringing Magadha into his realm would turn his kingdom into a truly powerful empire.",
      },
      {
        id: "ch4-part2",
        title: "Negotiations and Battles",
        body: "Before choosing war, Harsha tried to reach peaceful agreements with Magadha's rulers. When some local powers refused to cooperate, he launched targeted campaigns rather than one long and costly war. These careful strategies allowed him to win key forts and cities without exhausting his army.",
      },
      {
        id: "ch4-part3",
        title: "Uniting the Regions",
        body: "After Magadha accepted his rule, Harsha worked to connect it with his other territories. He improved roads so that messengers, traders, and scholars could travel more easily. Over time, people from different regions of his empire began to feel more connected to one another, sharing ideas, goods, and cultural traditions.",
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
    subtitle: "Building an Empire's Legacy",
    sections: [
      {
        id: "ch5-part1",
        title: "Temples of Faith and Power",
        body: "Harsha was a great patron of religious architecture, particularly supporting the construction of Hindu temples and Buddhist monasteries. The most famous example is the Harihara Temple at Osian, built to honor both Hindu and Buddhist traditions simultaneously. These temples were more than places of worship, they symbolized Harsha's power, his respect for learning, and his desire to unite different faiths under his rule. The intricate stone carvings and towering structures showcased the skill of his craftsmen and the wealth of his empire.",
      },
      {
        id: "ch5-part2",
        title: "Nalanda University and Centers of Learning",
        body: "Harsha transformed Nalanda into one of the world's greatest centers of learning and intellectual discourse. He donated enormous sums to expand the university's buildings, libraries, and dormitories for scholars from across Asia. The complex featured multiple lecture halls, study rooms, and residential quarters designed to accommodate thousands of students and teachers. This architectural support for education reflected Harsha's belief that an empire's true strength came not just from military power, but from the advancement of knowledge and wisdom.",
      },
      {
        id: "ch5-part3",
        title: "Urban Planning and Public Works",
        body: "Beyond religious and educational buildings, Harsha invested in infrastructure that improved daily life across his empire. He ordered the construction of roads, bridges, and rest houses for travelers and traders. Cities were planned with bazaars, water systems, and gardens. These practical architectural achievements connected his scattered territories and facilitated trade, making his empire more unified and prosperous. The roads Harsha built remained important trade routes for centuries after his reign.",
      },
      {
        id: "ch5-part4",
        title: "Artistic Styles and Influences",
        body: "Harsha's patronage shaped the architectural style of his era, blending influences from earlier Gupta traditions with new, bold designs. Sculptors and builders worked with stone and brick to create intricate patterns, detailed reliefs, and imposing structures. The decorative elements often told stories from scriptures and history, making them both beautiful and educational. This golden age of architecture left a lasting cultural heritage that influenced Indian building styles for generations to come.",
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
];
