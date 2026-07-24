import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Star, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
    'All', 'Beach', 'Mountains', 'Historical', 'Wildlife', 'Religious',
    'Romantic', 'Adventure', 'Hidden Gems', 'Luxury', 'Budget', 'Family', 'Nightlife'
]

const DESTINATIONS = [
    { title: 'Santorini', country: 'Greece', category: 'Romantic', rating: 4.9, img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Bali', country: 'Indonesia', category: 'Beach', rating: 4.8, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Kyoto', country: 'Japan', category: 'Historical', rating: 4.9, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Swiss Alps', country: 'Switzerland', category: 'Mountains', rating: 4.9, img: 'https://images.unsplash.com/photo-1531315630248-2b87fcf32d20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Masai Mara', country: 'Kenya', category: 'Wildlife', rating: 4.8, img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Varanasi', country: 'India', category: 'Religious', rating: 4.7, img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Maldives', country: 'Maldives', category: 'Luxury', rating: 4.9, img: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Goa', country: 'India', category: 'Nightlife', rating: 4.6, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Garmisch', country: 'Germany', category: 'Adventure', rating: 4.7, img: 'https://images.unsplash.com/photo-1469796466635-455cede14e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Hampi', country: 'India', category: 'Historical', rating: 4.8, img: 'https://images.unsplash.com/photo-1599387737222-386f78f69904?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Hoi An', country: 'Vietnam', category: 'Budget', rating: 4.8, img: 'https://images.unsplash.com/photo-1559495166-3d750346a81a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Walt Disney World', country: 'USA', category: 'Family', rating: 4.7, img: 'https://images.unsplash.com/photo-1534067332-9cb7610091ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Raja Ampat', country: 'Indonesia', category: 'Hidden Gems', rating: 4.9, img: 'https://images.unsplash.com/photo-1582236371520-74e7cf49c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Banff', country: 'Canada', category: 'Mountains', rating: 4.9, img: 'https://images.unsplash.com/photo-1506161109015-ab1b91317765?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Tulum', country: 'Mexico', category: 'Beach', rating: 4.7, img: 'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
]

const ExplorePage = () => {
    const navigate = useNavigate()
    const [activeCategory, setActiveCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredDestinations = DESTINATIONS.filter(dest => {
        const matchesCategory = activeCategory === 'All' || dest.category === activeCategory
        const matchesSearch = dest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dest.country.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pt-24">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold font-outfit tracking-tight mb-3">
                            Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">World</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] max-w-xl">
                            Discover breathtaking destinations categorized by your favorite travel styles.
                            Find your next adventure.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search destinations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--card-surface)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-[var(--primary)] shadow-soft transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50" size={20} />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-10 pb-2 overflow-x-auto hide-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat} onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${activeCategory === cat
                                    ? 'bg-[var(--primary)] text-white shadow-md'
                                    : 'bg-[var(--card-surface)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--border-color)]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Masonry Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    <AnimatePresence>
                        {filteredDestinations.map((dest, i) => (
                            <motion.div
                                key={dest.title}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer shadow-soft"
                                onClick={() => navigate('/', { state: { initialDestination: dest.title } })}
                            >
                                <img
                                    src={dest.img}
                                    alt={dest.title}
                                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                                <div className="absolute bottom-0 left-0 w-full p-5 text-white">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider bg-black/30 backdrop-blur-md px-2 py-1 rounded border border-white/20 mb-2 inline-block">
                                                {dest.category}
                                            </span>
                                            <h3 className="text-xl font-bold font-outfit leading-tight">{dest.title}</h3>
                                            <div className="flex items-center gap-1 text-sm text-white/80 mt-1">
                                                <MapPin size={14} /> {dest.country}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold">
                                            <Star size={14} className="text-amber-400 fill-amber-400" /> {dest.rating}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredDestinations.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-block p-4 rounded-full bg-[var(--card-surface)] mb-4">
                            <Search size={32} className="text-[var(--text-secondary)] opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold font-outfit mb-2">No destinations found</h3>
                        <p className="text-[var(--text-secondary)]">Try adjusting your category filter or search query.</p>
                        <button
                            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                            className="mt-6 px-6 py-2 rounded-full border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all font-medium"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ExplorePage
