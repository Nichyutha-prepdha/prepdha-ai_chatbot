import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OpenAI } from "openai";

// Hardcoded chapter content as fallback
function getHardcodedChapterContent(chapterId: string): string | null {
  const chapters: { [key: string]: string } = {
    "chapter-1": `Military Campaigns and Expansion
Subtitle: Harsha vs Sasanka

When Harsha ascended to the throne at just sixteen years old in 606 CE, he stepped into a kingdom shaken by grief and political instability. His elder brother Rajyavardhana had been killed under suspicious circumstances, and powerful neighbours were already testing the limits of the new ruler. Despite his youth, Harsha quickly realised that hesitation could cost him both his family's honour and his empire's future.

To stabilise his rule, Harsha began carefully choosing allies among nearby kingdoms while keeping a close watch on Sasanka of Gauda, the ruler widely believed to be behind his brother's death. Courtiers and generals debated whether Harsha should focus on internal reforms or immediate retaliation. Harsha listened to each side before deciding that securing loyal support at home was the first step toward any successful campaign.

Once his core territories were secure, Harsha turned his attention outward. He reorganised his army, improved communication between distant provinces, and ensured that supplies could move quickly across his lands. These preparations did not yet look like conquest to outsiders, but they quietly laid the foundation for the military campaigns that would soon follow.

News of Sasanka's actions in Gauda spread quickly through Harsha's court. Advisors warned that delaying a response would make Harsha appear weak. After weeks of planning, Harsha ordered his first expedition toward the eastern frontier. Villagers watched long lines of soldiers, horses, and war elephants moving along dusty roads, carrying the hopes of an empire seeking justice.

The journey toward Gauda was not easy. Heavy rains turned paths into rivers of mud, and some local chiefs hesitated to support Harsha openly, fearing Sasanka's retaliation. Harsha used both diplomacy and firmness to secure safe passage, promising protection to those who sided with him and warning of consequences for those who secretly aided his enemy.

Although this first expedition did not immediately remove Sasanka from power, it sent a powerful message. Harsha showed that he would not quietly accept injustice or betrayal. The expedition tested his army, revealed which allies he could trust, and marked the beginning of a longer struggle that would reshape the balance of power in northern India.`,

    "chapter-2": `First Expedition Against Sasanka
Subtitle: Harsha's first response

News of Sasanka's actions in Gauda spread quickly through Harsha's court. Advisors warned that delaying a response would make Harsha appear weak. After weeks of planning, Harsha ordered his first expedition toward the eastern frontier. Villagers watched long lines of soldiers, horses, and war elephants moving along dusty roads, carrying the hopes of an empire seeking justice.

The journey toward Gauda was not easy. Heavy rains turned paths into rivers of mud, and some local chiefs hesitated to support Harsha openly, fearing Sasanka's retaliation. Harsha used both diplomacy and firmness to secure safe passage, promising protection to those who sided with him and warning of consequences for those who secretly aided his enemy.

Although this first expedition did not immediately remove Sasanka from power, it sent a powerful message. Harsha showed that he would not quietly accept injustice or betrayal. The expedition tested his army, revealed which allies he could trust, and marked the beginning of a longer struggle that would reshape the balance of power in northern India.`,

    "chapter-3": `Conquest after Sasanka's death
Subtitle: Power shift in Gauda

After Sasanka's death, Gauda was left without a strong leader. Competing nobles tried to claim the throne, and rumours of rebellion spread across the region. Harsha saw both danger and opportunity in this moment. If he acted too slowly, another rival might seize Gauda. If he moved wisely, he could bring stability to the region under his own rule.

Harsha advanced with a combination of military strength and careful negotiation. Some cities opened their gates willingly, hoping that Harsha would restore order and protect trade routes. Others resisted and had to be persuaded through short but decisive battles. By rewarding cooperation and limiting unnecessary punishment, Harsha encouraged local leaders to accept his authority.

Once Gauda was firmly under his control, Harsha focused on rebuilding rather than simple revenge. He repaired roads, encouraged scholars to visit his court, and supported temples and monasteries. In doing so, he turned a once-hostile region into an important part of his expanding empire.`,

    "chapter-4": `Conquest of Magadha
Subtitle: Expanding the empire

Magadha was a rich and ancient region, famous for its fertile land and important trade routes. Any ruler who controlled Magadha gained access to wealth, soldiers, and influence. Harsha understood that bringing Magadha into his realm would turn his kingdom into a truly powerful empire.

Before choosing war, Harsha tried to reach peaceful agreements with Magadha's rulers. When some local powers refused to cooperate, he launched targeted campaigns rather than one long and costly war. These careful strategies allowed him to win key forts and cities without exhausting his army.

After Magadha accepted his rule, Harsha worked to connect it with his other territories. He improved roads so that messengers, traders, and scholars could travel more easily. Over time, people from different regions of his empire began to feel more connected to one another, sharing ideas, goods, and cultural traditions.`,

    "chapter-5": `Architecture and Monuments Under Harsha
Subtitle: Building an empire's legacy

Temples of Faith and Power
Harsha's reign saw significant architectural development across his empire. He understood that impressive buildings could demonstrate both his devotion to the gods and his authority as a ruler. Temples constructed during his time featured intricate stone carvings, tall spires, and spacious halls for worshippers.

Patronage of Buddhist Institutions
As a devoted Buddhist, Harsha provided generous support for monasteries and stupas. He funded the construction of new meditation halls, libraries for sacred texts, and living quarters for monks. These institutions became centers of learning and spiritual practice that attracted scholars from across Asia.

Educational Centers
Harsha established universities and learning centers that combined religious instruction with secular subjects. Students studied mathematics, astronomy, medicine, and literature alongside Buddhist philosophy. These institutions helped preserve knowledge and promote intellectual exchange between different regions.

Urban Development
Cities under Harsha's rule saw major improvements in infrastructure. Wide roads, public water systems, and marketplaces were built to accommodate growing populations. The architectural style blended traditional Indian elements with influences from neighboring regions, creating a distinctive Harsha-era aesthetic.

Legacy in Stone
The buildings and monuments from Harsha's time continue to stand as testaments to his vision. They represent not just architectural achievement but the cultural and religious values that shaped his empire. These structures served as gathering places for communities and symbols of the empire's prosperity and stability.`
  };

  return chapters[chapterId] || null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    
    // Check if summary already exists in database
    const existingPage = await (prisma as any).page.findFirst({
      where: { chapterId }
    });

    if (existingPage?.content) {
      // Transform existing cached summary with AI for better formatting
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert educational content creator. Take the existing summary and transform it into a more engaging, student-friendly format. Follow these guidelines:

1. Use clear, simple language appropriate for students
2. Organize content with proper headings and bullet points
3. Make it engaging and memorable
4. Use emojis to make it more visually appealing
5. Break down complex topics into simple points
6. Ensure logical flow and readability
7. Keep all the important information but present it better

Format your response with:
- A catchy title
- Brief introduction (2-3 sentences)
- Key points with bullet points
- Important highlights
- Simple conclusion`
          },
          {
            role: "user",
            content: `Transform this existing summary into a more engaging and easy-to-understand format for students:\n\n${existingPage.content}`
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      const transformedSummary = completion.choices[0]?.message?.content || existingPage.content;

      return NextResponse.json({
        success: true,
        summary: transformedSummary,
        cached: true,
        chapterId,
        transformed: true
      });
    }

    // Generate new summary for this specific chapter
    const openai = new OpenAI();
    
    // Get chapter content directly from vector store using chapter-specific search
    const { OpenAIVectorStoreService } = await import("@/lib/openai-vector-store");
    const vectorService = new OpenAIVectorStoreService();
    
    // Search for general chapter content, not "summarize topic"
    const searchResults = await vectorService.searchSimilarDocuments(
      `chapter content ${chapterId}`,
      10,
      { chapterId }
    );

    if (searchResults.length === 0) {
      // Fallback: try broader search within chapter
      const fallbackResults = await vectorService.searchSimilarDocuments(
        `content`,
        10,
        { chapterId }
      );
      
      if (fallbackResults.length === 0) {
        // Final fallback: use hardcoded chapter content
        const chapterContent = getHardcodedChapterContent(chapterId);
        if (chapterContent) {
          // Generate summary from hardcoded content
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are an expert educational content creator. Create a clear, engaging, and well-structured summary that students can easily understand. Follow these guidelines:

1. Use clear, simple language appropriate for students
2. Organize content with proper headings and bullet points
3. Focus on the most important concepts and events
4. Make it engaging and memorable
5. Use emojis to make it more visually appealing
6. Break down complex topics into simple points
7. Ensure logical flow and readability

Format your response with:
- A catchy title
- Brief introduction (2-3 sentences)
- Key points with bullet points
- Important highlights
- Simple conclusion`
              },
              {
                role: "user",
                content: `Create an engaging and easy-to-understand summary of this chapter content for students:\n\n${chapterContent}`
              }
            ],
            max_tokens: 800,
            temperature: 0.8
          });

          const summary = completion.choices[0]?.message?.content || "Summary not available";

          // Save summary to Page table for this chapter
          await (prisma as any).page.create({
            data: {
              chapterId,
              content: summary
            }
          });

          return NextResponse.json({
            success: true,
            summary,
            cached: false,
            chapterId,
            source: "hardcoded"
          });
        }
        
        return NextResponse.json({
          success: false,
          error: "No content found for this chapter"
        }, { status: 404 });
      }
      
      // Use fallback results
      searchResults.push(...fallbackResults);
    }

    // Extract chapter content from search results
    const chapterContent = searchResults
      .map(result => result.content)
      .join('\n\n');

    // Generate summary
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert educational content creator. Create a clear, engaging, and well-structured summary that students can easily understand. Follow these guidelines:

1. Use clear, simple language appropriate for students
2. Organize content with proper headings and bullet points
3. Focus on the most important concepts and events
4. Make it engaging and memorable
5. Use emojis to make it more visually appealing
6. Break down complex topics into simple points
7. Ensure logical flow and readability

Format your response with:
- A catchy title
- Brief introduction (2-3 sentences)
- Key points with bullet points
- Important highlights
- Simple conclusion`
        },
        {
          role: "user",
          content: `Create an engaging and easy-to-understand summary of this chapter content for students:\n\n${chapterContent}`
        }
      ],
      max_tokens: 800,
      temperature: 0.8
    });

    const summary = completion.choices[0]?.message?.content || "Summary not available";

    // Save summary to Page table for this chapter
    await (prisma as any).page.create({
      data: {
        chapterId,
        content: summary
      }
    });

    return NextResponse.json({
      success: true,
      summary,
      cached: false,
      chapterId
    });

  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate summary" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    
    // Delete existing summary for this chapter
    const deletedPage = await (prisma as any).page.deleteMany({
      where: { chapterId }
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedPage.count} cached summaries for chapter ${chapterId}`,
      deletedCount: deletedPage.count
    });

  } catch (error) {
    console.error("Summary deletion error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete summary" 
      },
      { status: 500 }
    );
  }
}