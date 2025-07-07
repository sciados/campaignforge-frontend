// src/components/marketplace/CategoryGrid.tsx
import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Sparkles, Heart, Leaf, Briefcase, Zap, Users } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  icon?: React.ReactNode
  productCount?: number
  isNew?: boolean
  isTrending?: boolean
}

interface CategoryGridProps {
  categories: Category[]
  selectedCategory?: string
  onCategorySelect: (categoryId: string) => void
  productCounts?: Record<string, number>
}

const CATEGORY_ICONS = {
  new: <Sparkles className="w-6 h-6" />,
  top: <TrendingUp className="w-6 h-6" />,
  health: <Heart className="w-6 h-6" />,
  ebusiness: <Zap className="w-6 h-6" />,
  selfhelp: <Users className="w-6 h-6" />,
  business: <Briefcase className="w-6 h-6" />,
  green: <Leaf className="w-6 h-6" />
}

const CATEGORY_COLORS = {
  new: 'from-purple-500 to-pink-500',
  top: 'from-red-500 to-orange-500',
  health: 'from-green-500 to-teal-500',
  ebusiness: 'from-blue-500 to-indigo-500',
  selfhelp: 'from-yellow-500 to-orange-500',
  business: 'from-gray-600 to-gray-800',
  green: 'from-green-400 to-emerald-500'
}

export default function CategoryGrid({
  categories,
  selectedCategory,
  onCategorySelect,
  productCounts = {}
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id
        const productCount = productCounts[category.id] || 0
        const icon = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS]
        const colorClass = CATEGORY_COLORS[category.id as keyof typeof CATEGORY_COLORS]
        
        return (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              isSelected ? 'ring-2 ring-black shadow-lg' : ''
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardHeader className="text-center">
              {/* Icon with Gradient Background */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
                {icon}
              </div>
              
              {/* Category Name */}
              <CardTitle className="text-lg font-semibold text-black mb-2">
                {category.name}
              </CardTitle>
              
              {/* Description */}
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                {category.description}
              </CardDescription>
              
              {/* Product Count & Badges */}
              <div className="flex items-center justify-center space-x-2 mt-4">
                {productCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {productCount} products
                  </Badge>
                )}
                
                {category.isNew && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    New
                  </Badge>
                )}
                
                {category.isTrending && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    Trending
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}