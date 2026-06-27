import { Link } from "wouter";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button size="lg">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg">
                <Search className="w-4 h-4 mr-2" />
                Browse Businesses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
