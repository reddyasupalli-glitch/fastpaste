import { ArrowLeft, BookOpen, Code, Users, Zap, Shield, Clock, Share2 } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const blogContent: Record<string, {
  title: string;
  category: string;
  readTime: string;
  date: string;
  icon: any;
  content: React.ReactNode;
}> = {
  'getting-started': {
    title: 'Getting Started with FastPaste: Your Ultimate Code Sharing Guide',
    category: 'Tutorial',
    readTime: '5 min read',
    date: 'January 13, 2025',
    icon: BookOpen,
    content: (
      <>
        <p className="lead text-lg text-muted-foreground mb-6">
          FastPaste is a powerful real-time code and message sharing platform designed for developers, teams, and anyone who needs to share code snippets quickly and efficiently. This comprehensive guide will walk you through everything you need to know to get started.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What is FastPaste?</h2>
        <p className="mb-4">
          FastPaste is a web-based collaboration tool that enables real-time code sharing without the need for user registration or complicated setup processes. Whether you're pair programming, conducting code reviews, or simply need to share a quick snippet with a colleague, FastPaste makes it seamless and instant.
        </p>
        <p className="mb-4">
          Unlike traditional code sharing methods like email or messaging apps that can strip formatting and break code structure, FastPaste preserves your code exactly as you type it, complete with syntax highlighting for over 20 programming languages.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Creating Your First Room</h2>
        <p className="mb-4">
          Getting started with FastPaste is incredibly simple. Follow these steps to create your first collaborative room:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-2">
          <li><strong>Choose a Username:</strong> When you first visit FastPaste, you'll be prompted to enter a username. This is how other participants will identify you in the room. Choose something recognizable to your team.</li>
          <li><strong>Create a Room:</strong> Click the "Create Room" button to generate a new collaborative space. You'll receive a unique room code that you can share with others.</li>
          <li><strong>Set a Password (Optional):</strong> For sensitive code discussions, you can protect your room with a password. Only users with the correct password will be able to join.</li>
          <li><strong>Share the Room Code:</strong> Copy the room code and share it with your collaborators via any communication channel.</li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Joining an Existing Room</h2>
        <p className="mb-4">
          If someone has shared a room code with you, joining is just as easy:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-2">
          <li>Enter your username if you haven't already</li>
          <li>Click "Join Room" and enter the room code</li>
          <li>If the room is password-protected, you'll be prompted to enter the password</li>
          <li>You're now connected and can see all messages and code in real-time!</li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features to Explore</h2>
        <div className="grid gap-4 mb-6">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">🎨 Syntax Highlighting</h3>
            <p className="text-sm text-muted-foreground">Automatic syntax highlighting for JavaScript, Python, Java, C++, and many more languages makes your code easy to read and understand.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">⚡ Real-Time Sync</h3>
            <p className="text-sm text-muted-foreground">All messages and code appear instantly for all participants. No refresh needed – it's truly real-time collaboration.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">📎 File Sharing</h3>
            <p className="text-sm text-muted-foreground">Share files directly in the chat. Perfect for sharing screenshots, diagrams, or configuration files.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">🤖 AI Assistant</h3>
            <p className="text-sm text-muted-foreground">Get help with your code using our built-in AI assistant. Just mention @asu to ask questions or get suggestions.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Tips for Effective Code Sharing</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Use descriptive room names:</strong> When creating rooms for specific projects or topics, include context in your communication so team members know what the room is for.</li>
          <li><strong>Leverage reactions:</strong> Use emoji reactions to acknowledge code snippets or provide quick feedback without cluttering the chat.</li>
          <li><strong>Quote messages:</strong> Swipe right on a message to quote it, making threaded conversations clearer.</li>
          <li><strong>Copy with one click:</strong> Click the copy button on any code block to copy it to your clipboard instantly.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
        <p className="mb-4">
          FastPaste is designed to remove friction from code collaboration. Whether you're debugging with a colleague, teaching programming concepts, or conducting code reviews, our platform provides a fast, secure, and intuitive environment for sharing code in real-time.
        </p>
        <p>
          Ready to get started? Head back to the <Link to="/" className="text-primary hover:underline">homepage</Link> and create your first room today!
        </p>
      </>
    )
  },
  'code-collaboration-tips': {
    title: '10 Best Practices for Code Collaboration in Remote Teams',
    category: 'Best Practices',
    readTime: '8 min read',
    date: 'January 12, 2025',
    icon: Users,
    content: (
      <>
        <p className="lead text-lg text-muted-foreground mb-6">
          Remote work has transformed how development teams collaborate. Here are ten proven best practices to ensure smooth and effective code collaboration, whether your team is across the hall or across the globe.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Establish Clear Communication Channels</h2>
        <p className="mb-4">
          Define which tools to use for different types of communication. Use real-time tools like FastPaste for code sharing, Slack for quick discussions, and email for formal communications. Having clear channels reduces confusion and ensures messages reach the right people.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Document Everything</h2>
        <p className="mb-4">
          In remote environments, you can't tap a colleague on the shoulder to ask a question. Maintain comprehensive documentation for your codebase, including README files, inline comments, and wiki pages. This reduces bottlenecks and empowers team members to work independently.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Use Version Control Effectively</h2>
        <p className="mb-4">
          Git is the backbone of modern code collaboration. Follow established branching strategies (like GitFlow or trunk-based development), write meaningful commit messages, and conduct regular code reviews. These practices prevent conflicts and maintain code quality.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Embrace Asynchronous Work</h2>
        <p className="mb-4">
          Not everyone needs to be online at the same time. Embrace asynchronous communication by leaving detailed context in your messages, recording video explanations for complex topics, and respecting time zones when scheduling meetings.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Conduct Regular Code Reviews</h2>
        <p className="mb-4">
          Code reviews are essential for maintaining quality and sharing knowledge. Use tools like FastPaste to discuss specific code snippets in real-time, making the review process more interactive and educational for all team members.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Set Up Pair Programming Sessions</h2>
        <p className="mb-4">
          Pair programming, even remotely, accelerates learning and catches bugs early. Use screen sharing combined with FastPaste for sharing code snippets and discussing alternatives. Regular pairing sessions also help build team cohesion.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Create Coding Standards</h2>
        <p className="mb-4">
          Establish and document coding standards for your team. This includes naming conventions, file structure, formatting rules, and architecture patterns. Use linters and formatters to automate enforcement and reduce friction in code reviews.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Use Real-Time Collaboration Tools</h2>
        <p className="mb-4">
          Tools like FastPaste enable instant code sharing with syntax highlighting, making it easy to discuss code without context switching. The real-time nature means everyone sees updates immediately, creating a more fluid collaboration experience.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Schedule Regular Sync Meetings</h2>
        <p className="mb-4">
          While asynchronous work is valuable, regular sync meetings help maintain alignment. Daily standups, weekly team meetings, and monthly retrospectives keep everyone informed and provide opportunities to address issues early.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Foster a Culture of Feedback</h2>
        <p className="mb-4">
          Create an environment where team members feel comfortable giving and receiving constructive feedback. This applies to code reviews, process improvements, and interpersonal communication. A feedback-rich culture leads to continuous improvement.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
        <p className="mb-4">
          Effective remote code collaboration requires intentional effort and the right tools. By implementing these best practices, your team can maintain productivity, code quality, and team cohesion regardless of physical location.
        </p>
        <p>
          Start improving your team's collaboration today with <Link to="/" className="text-primary hover:underline">FastPaste</Link> – the fastest way to share code in real-time.
        </p>
      </>
    )
  },
  'syntax-highlighting': {
    title: 'Understanding Syntax Highlighting: Why It Matters for Developers',
    category: 'Technical',
    readTime: '6 min read',
    date: 'January 11, 2025',
    icon: Code,
    content: (
      <>
        <p className="lead text-lg text-muted-foreground mb-6">
          Syntax highlighting is one of those features developers take for granted until it's missing. This article explores what syntax highlighting is, how it works, and why it's crucial for developer productivity.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What is Syntax Highlighting?</h2>
        <p className="mb-4">
          Syntax highlighting is the visual differentiation of code elements using colors and styles. Keywords, strings, comments, variables, and other language constructs are displayed in different colors, making code structure immediately visible at a glance.
        </p>
        <p className="mb-4">
          Modern code editors like VS Code, Sublime Text, and platforms like FastPaste use sophisticated syntax highlighting engines to provide accurate and language-aware colorization.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">The Science Behind It</h2>
        <p className="mb-4">
          Research has shown that syntax highlighting significantly improves code comprehension. A study by Sarkar (2015) found that developers could identify code elements 20% faster with syntax highlighting enabled. This improvement comes from reduced cognitive load – your brain doesn't have to work as hard to parse the code structure.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Benefits for Developers</h2>
        <div className="grid gap-4 mb-6">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Faster Error Detection</h3>
            <p className="text-sm text-muted-foreground">Typos in keywords, unclosed strings, and missing brackets become immediately visible when the expected color doesn't appear.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Improved Readability</h3>
            <p className="text-sm text-muted-foreground">Color-coded code is easier to scan and understand, especially when reading unfamiliar codebases.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Better Code Navigation</h3>
            <p className="text-sm text-muted-foreground">Visual patterns help you quickly locate functions, classes, and important code sections.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Enhanced Learning</h3>
            <p className="text-sm text-muted-foreground">New developers can more easily understand language syntax when elements are visually distinguished.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How FastPaste Implements Syntax Highlighting</h2>
        <p className="mb-4">
          FastPaste uses Prism, a lightweight and extensible syntax highlighting library, to provide accurate colorization for over 20 programming languages including:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>JavaScript and TypeScript</li>
          <li>Python</li>
          <li>Java and Kotlin</li>
          <li>C, C++, and C#</li>
          <li>Go and Rust</li>
          <li>HTML, CSS, and SCSS</li>
          <li>SQL and GraphQL</li>
          <li>And many more...</li>
        </ul>
        <p className="mb-4">
          The highlighting is applied automatically when you share code, so you can focus on the content rather than formatting.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
        <p className="mb-4">
          Syntax highlighting might seem like a small feature, but its impact on developer productivity is significant. It reduces errors, improves comprehension, and makes code collaboration more effective.
        </p>
        <p>
          Experience beautiful syntax highlighting for your code sharing sessions on <Link to="/" className="text-primary hover:underline">FastPaste</Link>.
        </p>
      </>
    )
  },
  'real-time-features': {
    title: 'The Power of Real-Time: How FastPaste Enables Instant Collaboration',
    category: 'Technical',
    readTime: '7 min read',
    date: 'January 10, 2025',
    icon: Zap,
    content: (
      <>
        <p className="lead text-lg text-muted-foreground mb-6">
          Real-time collaboration has revolutionized how developers work together. This deep dive explores the technology that makes instant code sharing possible and how FastPaste leverages it for seamless collaboration.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What Makes It "Real-Time"?</h2>
        <p className="mb-4">
          In traditional web applications, you need to refresh the page to see new content. Real-time applications, however, push updates to all connected users instantly. When you type a message in FastPaste, it appears on everyone else's screen within milliseconds.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">The Technology Stack</h2>
        <p className="mb-4">
          FastPaste is built on modern real-time technologies:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>WebSockets:</strong> Persistent connections that allow bidirectional communication between the browser and server.</li>
          <li><strong>Supabase Realtime:</strong> A powerful backend that handles real-time subscriptions and broadcasts changes to all connected clients.</li>
          <li><strong>React:</strong> A frontend framework that efficiently updates the UI when new data arrives.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Real-Time Features in FastPaste</h2>
        <div className="grid gap-4 mb-6">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Instant Messages</h3>
            <p className="text-sm text-muted-foreground">Messages appear for all participants the moment they're sent, enabling fluid conversation.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Typing Indicators</h3>
            <p className="text-sm text-muted-foreground">See when others are typing, so you know to wait for their input before responding.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Online Presence</h3>
            <p className="text-sm text-muted-foreground">Know who's currently in the room and available for collaboration.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Live Reactions</h3>
            <p className="text-sm text-muted-foreground">Emoji reactions update instantly, providing immediate feedback on shared code.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Real-Time Matters for Code Collaboration</h2>
        <p className="mb-4">
          When debugging code together or pair programming, delays can break the flow of collaboration. Real-time updates ensure everyone is literally on the same page, seeing the same code at the same time. This synchronization is crucial for:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Live code reviews where comments appear as they're typed</li>
          <li>Pair programming sessions with instant code sharing</li>
          <li>Teaching scenarios where students see examples in real-time</li>
          <li>Interview coding sessions with live collaboration</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Performance Considerations</h2>
        <p className="mb-4">
          Real-time systems must balance speed with efficiency. FastPaste uses several optimizations:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Debouncing:</strong> Typing indicators don't fire on every keystroke to reduce network traffic.</li>
          <li><strong>Efficient Updates:</strong> Only changed data is transmitted, not the entire state.</li>
          <li><strong>Smart Reconnection:</strong> If your connection drops, FastPaste automatically reconnects and syncs.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
        <p className="mb-4">
          Real-time collaboration is no longer a luxury – it's an expectation. FastPaste harnesses the power of modern real-time technology to provide instant, seamless code sharing that feels like you're coding side by side.
        </p>
        <p>
          Experience the power of real-time collaboration on <Link to="/" className="text-primary hover:underline">FastPaste</Link>.
        </p>
      </>
    )
  },
  'security-best-practices': {
    title: 'Keeping Your Code Secure: Best Practices for Safe Code Sharing',
    category: 'Security',
    readTime: '6 min read',
    date: 'January 9, 2025',
    icon: Shield,
    content: (
      <>
        <p className="lead text-lg text-muted-foreground mb-6">
          Sharing code is essential for collaboration, but it comes with security considerations. Learn how to protect sensitive code and use FastPaste's security features effectively.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Understanding the Risks</h2>
        <p className="mb-4">
          Before sharing any code, consider what you're exposing. Common security risks include:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>API Keys and Secrets:</strong> Never share code containing API keys, passwords, or other credentials.</li>
          <li><strong>Proprietary Algorithms:</strong> Be cautious about sharing trade secrets or patented implementations.</li>
          <li><strong>Personal Data:</strong> Ensure no personal information is embedded in your code samples.</li>
          <li><strong>Security Vulnerabilities:</strong> Avoid sharing code that reveals security weaknesses in production systems.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">FastPaste Security Features</h2>
        <div className="grid gap-4 mb-6">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">🔒 Password-Protected Rooms</h3>
            <p className="text-sm text-muted-foreground">Create rooms that require a password to join, ensuring only authorized collaborators can access your code.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">⏱️ Automatic Expiration</h3>
            <p className="text-sm text-muted-foreground">Rooms and messages are automatically deleted after a period of inactivity, reducing the risk of stale data exposure.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">🚫 No Account Required</h3>
            <p className="text-sm text-muted-foreground">Since we don't store personal account data, there's less risk of your information being compromised in a data breach.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">🔐 Encrypted Transmission</h3>
            <p className="text-sm text-muted-foreground">All data is transmitted over HTTPS, protecting your code from interception during transit.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Best Practices for Secure Sharing</h2>
        <ol className="list-decimal pl-6 mb-4 space-y-3">
          <li>
            <strong>Sanitize Before Sharing:</strong> Remove all sensitive data from code snippets before sharing. Replace API keys with placeholders like <code className="bg-muted px-1 rounded">YOUR_API_KEY_HERE</code>.
          </li>
          <li>
            <strong>Use Password Protection:</strong> For sensitive discussions, always use password-protected rooms and share the password through a separate, secure channel.
          </li>
          <li>
            <strong>Limit Room Duration:</strong> Create new rooms for each session rather than reusing old ones. This limits the exposure window for your code.
          </li>
          <li>
            <strong>Verify Participants:</strong> Check the online users list to ensure only expected participants are in the room before sharing sensitive code.
          </li>
          <li>
            <strong>Be Mindful of Screenshots:</strong> Remember that any participant can screenshot shared content. Only share what you'd be comfortable seeing elsewhere.
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What NOT to Share</h2>
        <p className="mb-4">
          Never share the following in any code sharing platform:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Production database credentials</li>
          <li>Private API keys or access tokens</li>
          <li>SSH keys or SSL certificates</li>
          <li>Customer personal data (PII)</li>
          <li>Complete authentication or encryption implementations</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
        <p className="mb-4">
          Code sharing is essential for modern development, but security should never be an afterthought. By following these best practices and leveraging FastPaste's security features, you can collaborate effectively while protecting sensitive information.
        </p>
        <p>
          Start secure collaboration on <Link to="/" className="text-primary hover:underline">FastPaste</Link> today.
        </p>
      </>
    )
  },
  'productivity-tips': {
    title: 'Boost Your Productivity: Quick Tips for Faster Code Sharing',
    category: 'Productivity',
    readTime: '4 min read',
    date: 'January 8, 2025',
    icon: Clock,
    content: (
      <>
        <p className="lead text-lg text-muted-foreground mb-6">
          Small efficiency gains add up to major productivity improvements. Here are quick tips and shortcuts to make your FastPaste workflow faster and more efficient.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Copy Shortcuts</h2>
        <p className="mb-4">
          When you share code on FastPaste, each code block has a copy button. Click it to instantly copy the code to your clipboard – no need to manually select text.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Efficient Room Management</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Save frequently used rooms:</strong> FastPaste remembers your recently used rooms, making it quick to rejoin.</li>
          <li><strong>Use descriptive room codes:</strong> When possible, use memorable codes that indicate the purpose (team syncs, project names, etc.).</li>
          <li><strong>Quick join:</strong> Bookmark your room URL for instant access without entering the code each time.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Message Efficiency Tips</h2>
        <div className="grid gap-4 mb-6">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Swipe to Reply</h3>
            <p className="text-sm text-muted-foreground">Swipe right on any message to quote it in your reply, making context clear.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Use Reactions</h3>
            <p className="text-sm text-muted-foreground">Instead of typing "looks good" or "got it", use emoji reactions for quick acknowledgment.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">AI Assistant</h3>
            <p className="text-sm text-muted-foreground">Mention @asu to quickly get help with code, explanations, or suggestions without leaving the room.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Keyboard Shortcuts</h2>
        <p className="mb-4">
          Familiarize yourself with these common shortcuts:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Enter:</strong> Send message</li>
          <li><strong>Shift + Enter:</strong> New line in message</li>
          <li><strong>Cmd/Ctrl + V:</strong> Paste code (formatting preserved)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Theme and Display</h2>
        <p className="mb-4">
          FastPaste supports both light and dark themes. Choose the one that's easiest on your eyes for your environment:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Use dark mode for low-light environments and late-night coding</li>
          <li>Use light mode in bright offices or outdoor settings</li>
          <li>The theme toggle is in the header – one click to switch</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Batch Your Code Sharing</h2>
        <p className="mb-4">
          Instead of sending multiple small snippets, combine related code into one message. This makes the conversation easier to follow and reduces notification fatigue for your collaborators.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Conclusion</h2>
        <p className="mb-4">
          Productivity isn't about working harder – it's about working smarter. These small optimizations can save you hours over time and make your collaboration sessions more effective.
        </p>
        <p>
          Put these tips into practice on <Link to="/" className="text-primary hover:underline">FastPaste</Link>.
        </p>
      </>
    )
  }
};

const BlogPost = () => {
  const { postId } = useParams<{ postId: string }>();
  
  if (!postId || !blogContent[postId]) {
    return <Navigate to="/blog" replace />;
  }

  const post = blogContent[postId];
  const IconComponent = post.icon;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-3xl mx-auto">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary">{post.category}</Badge>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>

            <Separator className="mb-6" />

            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              {post.content}
            </div>

            <Separator className="my-8" />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found this helpful? Share it with your team!
              </p>
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}>
                <Share2 className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogPost;
