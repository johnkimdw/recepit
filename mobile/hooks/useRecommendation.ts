// hooks/useRecommendations.ts
import { useState, useEffect, useCallback } from 'react';
import { API_URL } from "@/config";
import { useApi } from "@/hooks/useApi";

export interface Recipe {
  recipe_id: number;
  title: string;
  description: string;
  image_url: string;
  average_rating?: number;
  total_ratings?: number;
  prep_time?: string;
  cook_time?: string;
}

export function useRecommendations() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { apiCall } = useApi();

  const fetchRecommendations = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use apiCall instead of axios
      const response = await apiCall(`${API_URL}/recommendations/?limit=${limit}`);
      const data = await response.json();
      
      setRecipes(prevRecipes => {
        // Filter out any duplicates
        const newRecipes = data.filter(
          (newRecipe: Recipe) => !prevRecipes.some(
            (prevRecipe) => prevRecipe.recipe_id === newRecipe.recipe_id
          )
        );
        return [...prevRecipes, ...newRecipes];
      });
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const clearRecipes = useCallback(() => {
    setRecipes([]);
  }, []);

  const recordInteraction = useCallback(async (
    recipeId: number, 
    interactionType: 'like' | 'save' | 'dislike'
  ) => {
    try {
      // Use apiCall instead of axios
      await apiCall(`${API_URL}/recommendations/interactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipe_id: recipeId,
          interaction_type: interactionType
        })
      });
      
      // Remove the interacted recipe from the local state
      setRecipes(prevRecipes => 
        prevRecipes.filter(recipe => recipe.recipe_id !== recipeId)
      );
      
      // If running low on recipes, fetch more
      if (recipes.length <= 2) {
        fetchRecommendations();
      }
      
      return true;
    } catch (err) {
      console.error('Error recording interaction:', err);
      return false;
    }
  }, [recipes.length, fetchRecommendations, apiCall]);

  const refreshRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      // Use apiCall consistently
      await apiCall(`${API_URL}/recommendations/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      });
      // Then clear existing recipes
      clearRecipes();
      // Then fetch new ones
      await fetchRecommendations();
      return true;
    } catch (err) {
      console.error('Error refreshing recommendations:', err);
      setError('Failed to refresh recommendations. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRecommendations, clearRecipes, apiCall]);

//   useEffect(() => {
//     fetchRecommendations();
//   }, [fetchRecommendations]);

  return {
    recipes,
    loading,
    error,
    fetchRecommendations,
    recordInteraction,
    refreshRecommendations
  };
}