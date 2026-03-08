import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json()

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key is not configured" }, { status: 500 })
    }

    // Format messages for the API — if content is parsed array, join back to string
    const formattedMessages = messages.map((message: any) => {
      if (Array.isArray(message.content)) {
        const parts = message.content
          .map((part: any) => {
            if (part.type === "code") {
              return `\`\`\`${part.language || ""}\n${part.content}\n\`\`\``
            }
            return part.content
          })
          .join("\n\n")
        return { ...message, content: parts }
      }
      return message
    })

    // Append code formatting instruction to system message
    const systemMessage = formattedMessages.find((m: any) => m.role === "system")
    if (systemMessage) {
      systemMessage.content +=
        "\n\nWhen providing code examples, use markdown code blocks with the appropriate language tag. For example: ```python\nprint('Hello')\n```"
    }

    const selectedModel = model || "deepseek/deepseek-chat-v3-0324:free"

    console.log("Sending request to OpenRouter, model:", selectedModel)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://nit-hamirpur-placement.vercel.app",
        "X-Title": "College Student Assistant",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", response.status, errorText)

      // If model not found, fall back to a known-good free model
      if (response.status === 404 || response.status === 400) {
        const fallbackResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://nit-hamirpur-placement.vercel.app",
            "X-Title": "College Student Assistant",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 4096,
          }),
        })

        if (!fallbackResponse.ok) {
          const fallbackError = await fallbackResponse.text()
          throw new Error(`API request failed: ${fallbackResponse.status} - ${fallbackError}`)
        }

        const fallbackData = await fallbackResponse.json()
        return NextResponse.json({
          content: fallbackData.choices[0].message.content,
          model: fallbackData.model,
        })
      }

      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("No content in API response")
    }

    console.log("Response received from OpenRouter, model:", data.model)

    return NextResponse.json({
      content,
      model: data.model,
    })
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json(
      { error: "Failed to process chat request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
