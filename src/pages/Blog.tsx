import { ArrowLeft, BookOpen, Code, Users, Zap, Shield, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const blogPosts = [
  {
    id: 'getting-started',
    title: 'Getting Started with FastPaste: Your Ultimate Code Sharing Guide',
    description: 'Learn how to use FastPaste effectively for real-time code collaboration with your team.',
    category: 'Tutorial',
    readTime: '5 min read',
    icon: BookOpen,
    date: 'January 13, 2025'
  },
  {
    id: 'code-collaboration-tips',
    title: '10 Best Practices for Code Collaboration in Remote Teams',
    description: 'Discover proven strategies to improve code sharing and collaboration when working remotely.',
    category: 'Best Practices',
    readTime: '8 min read',
    icon: Users,
    date: 'January 12, 2025'
  },
  {
    id: 'syntax-highlighting',
    title: 'Understanding Syntax Highlighting: Why It Matters for Developers',
    description: 'Explore how syntax highlighting improves code readability and reduces errors.',
    category: 'Technical',
    readTime: '6 min read',
    icon: Code,
    date: 'January 11, 2025'
  },
  {
    id: 'real-time-features',
    title: 'The Power of Real-Time: How FastPaste Enables Instant Collaboration',
    description: 'Deep dive into the technology behind real-time code sharing and synchronization.',
    category: 'Technical',
    readTime: '7 min read',
    icon: Zap,
    date: 'January 10, 2025'
  },
  {
    id: 'security-best-practices',
    title: 'Keeping Your Code Secure: Best Practices for Safe Code Sharing',
    description: 'Learn how to protect sensitive code and use password-protected rooms effectively.',
    category: 'Security',
    readTime: '6 min read',
    icon: Shield,
    date: 'January 9, 2025'
  },
  {
    id: 'productivity-tips',
    title: 'Boost Your Productivity: Quick Tips for Faster Code Sharing',
    description: 'Time-saving techniques and shortcuts to make your code sharing workflow more efficient.',
    category: 'Productivity',
    readTime: '4 min read',
    icon: Clock,
    date: 'January 8, 2025'
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">FastPaste Blog & Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Tutorials, best practices, and tips for getting the most out of FastPaste. 
            Learn how to collaborate more effectively with your team.
          </p>
        </div>

        <div className="grid gap-6">
          {blogPosts.map((post) => {
            const IconComponent = post.icon;
            return (
              <Link key={post.id} to={`/blog/${post.id}`}>
                <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-3">
                      {post.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Blog;
