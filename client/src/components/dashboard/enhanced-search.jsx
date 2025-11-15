import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { searchUsers } from '@/lib/user-api';

export function EnhancedSearch({ onUserSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);



  // Search users function
  const handleSearchUsers = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsers(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.length > 0);
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSearchQuery('');
    setIsOpen(false);
    setSuggestions([]);
    onUserSelect(user);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate completion rate color
  const getCompletionRateColor = (rate) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="search-container relative max-w-lg flex-1 hidden md:flex group" ref={searchRef}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 z-10" />
      
      <Input
        type="search"
        placeholder="Search users, tasks, departments..."
        className="w-full pl-12 pr-4 h-12 rounded-2xl bg-gradient-to-r from-card/50 via-card/30 to-card/50 backdrop-blur-sm border-0 hover:border-0 focus:border-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none transition-all duration-300 text-sm font-semibold placeholder:text-muted-foreground/70 shadow-lg hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/5"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => searchQuery && setIsOpen(true)}
      />

      {/* Search Suggestions */}
      {isOpen && (suggestions.length > 0 || loading) && (
        <Card
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-3 bg-card/98 dark:bg-card/95 backdrop-blur-2xl border-2 border-primary/30 dark:border-primary/20 shadow-2xl dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-primary/10"
        >
          {loading ? (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Searching users...</span>
              </div>
            </div>
          ) : (
            <div className="p-2">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2 px-3 py-2 bg-primary/5 dark:bg-primary/10 rounded-lg border-l-4 border-primary">
                Users ({suggestions.length})
              </div>
              {suggestions.map((user) => {
                if (!user || !user.name) return null;

                return (
                  <div
                    key={user._id || user.id}
                    onClick={() => handleUserSelect(user)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 dark:hover:from-primary/15 dark:hover:to-primary/5 cursor-pointer transition-all duration-200 group/item border border-transparent hover:border-primary/20 dark:hover:border-primary/30"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-primary/30 group-hover/item:ring-primary/60 group-hover/item:ring-4 transition-all duration-300 shadow-lg group-hover/item:shadow-xl group-hover/item:shadow-primary/20">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="gradient-primary text-primary-foreground font-bold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-foreground group-hover/item:text-primary transition-colors duration-200 truncate">
                        {user.name}
                      </h4>
                      <Badge variant="outline" className="text-xs shrink-0 border-primary/30 dark:border-primary/20 group-hover/item:border-primary group-hover/item:bg-primary/10">
                        {user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span className={getCompletionRateColor(user.completionRate)}>
                          {user.completionRate}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{user.activeTasks} active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                    <div className="text-xs text-muted-foreground shrink-0">
                      {user.department?.name || user.department || 'No Department'}
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
