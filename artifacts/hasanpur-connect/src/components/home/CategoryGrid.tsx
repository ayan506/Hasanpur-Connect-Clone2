import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Utensils, Stethoscope, GraduationCap, ShoppingCart, Shirt,
  Smartphone, Hammer, Scissors, Car, BedDouble, Gem, Sofa,
  Scale, Landmark, Church, Zap, Wrench, Candy, PartyPopper,
  BookOpen, Fuel, Bus, Wheat, Glasses, Dumbbell, Camera,
  Package, Building2, Home, LayoutGrid
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<LucideProps>> = {
  Utensils, Stethoscope, GraduationCap, ShoppingCart, Shirt,
  Smartphone, Hammer, Scissors, Car, BedDouble, Gem, Sofa,
  Scale, Landmark, Church, Zap, Wrench, Candy, PartyPopper,
  BookOpen, Fuel, Bus, Wheat, Glasses, Dumbbell, Camera,
  Package, Building2, Home, LayoutGrid,
};

const getIcon = (iconName: string | null | undefined) => {
  const Icon = iconName ? iconMap[iconName] : undefined;
  if (Icon) return <Icon className="w-8 h-8" />;
  return <LayoutGrid className="w-8 h-8" />;
};

export function CategoryGrid() {
  const { data: categories, isLoading } = useListCategories();

  if (isLoading || !categories) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            Explore Categories
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse businesses across various categories to find exactly what you're looking for in Hasanpur.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.slice(0, 11).map(cat => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <Card className="h-full hover-elevate transition-all hover:border-primary/50 cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {getIcon(cat.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.businessCount} listings</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          <Link href="/search">
            <Card className="h-full bg-slate-900 border-none hover-elevate transition-all cursor-pointer group text-white">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
                <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-sm">View All</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
