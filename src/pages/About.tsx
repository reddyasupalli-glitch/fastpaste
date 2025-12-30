import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Code, Users, Zap, Shield, Github, Twitter, Mail } from 'lucide-react';
import fastpasteLogo from '@/assets/fastpaste-logo.png';

const About = () => {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-3 py-4 sm:p-8">
      <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <ThemeToggle />
      </div>

      <Card className="mt-12 w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src={fastpasteLogo} alt="FastPaste" className="h-16 sm:h-20 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">About FastPaste</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            FastPaste is a real-time code sharing and messaging platform designed for developers 
            and teams who need to quickly share code snippets and collaborate.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Real-time Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Messages and code snippets sync instantly across all connected users.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Syntax Highlighting</h3>
                <p className="text-sm text-muted-foreground">
                  Code blocks are automatically detected and beautifully highlighted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Easy Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Share a 6-digit code and anyone can join your group instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">No Sign-up Required</h3>
                <p className="text-sm text-muted-foreground">
                  Start sharing immediately without creating an account.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
            <h3 className="mb-3 font-semibold text-foreground">Connect With Us</h3>
            <div className="flex justify-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@fastpaste.app"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Have questions or feedback? Reach out to us!
            </p>
          </div>

          <div className="text-center">
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
