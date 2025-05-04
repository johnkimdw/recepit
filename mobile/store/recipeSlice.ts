import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { API_URL } from "@/config";

const api_recipe_url = API_URL + "/recipes";

type SmallRecipe = {
  recipe_id: number;
  title: string;
  image_url: string;
  average_rating: number;
  prep_time: string;
  cook_time: string;
  total_ratings: number;
};

type SimpleRecipe = {
  recipe_id: number;
  title: string;
  image_url: string;
};

interface RecipeState {
  activeCategory: string;
  categoryCache: { [category: string]: SmallRecipe[] };
  featuredRecipe: SimpleRecipe | null;
  isFeaturedLoading: boolean;
  isCategoryLoading: boolean;
}

const initialState: RecipeState = {
  activeCategory: "Baking",
  categoryCache: {
    Baking: [],
    Budget: [],
    Health: [],
    Inspiration: [],
    Recipes: [],
  },
  featuredRecipe: null,
  isFeaturedLoading: false,
  isCategoryLoading: false,
};

// Async thunk for fetching categories
export const fetchCategoryRecipes = createAsyncThunk(
  "recipes/fetchCategory",
  async (category: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${api_recipe_url}/category/${category}`);
      return await response.json();
    } catch (error) {
      return rejectWithValue("Failed to fetch category recipes");
    }
  }
);

// Async thunk for fetching featured recipe
export const fetchFeaturedRecipe = createAsyncThunk(
  "recipes/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${api_recipe_url}/featured`);
      return await response.json();
    } catch (error) {
      return rejectWithValue("Failed to fetch featured recipe");
    }
  }
);

const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Featured recipe loading states
      .addCase(fetchFeaturedRecipe.pending, (state) => {
        state.isFeaturedLoading = true;
      })
      .addCase(fetchFeaturedRecipe.fulfilled, (state, action) => {
        state.featuredRecipe = action.payload;
        state.isFeaturedLoading = false;
      })
      .addCase(fetchFeaturedRecipe.rejected, (state) => {
        state.isFeaturedLoading = false;
      })

      // Category loading states
      .addCase(fetchCategoryRecipes.pending, (state) => {
        state.isCategoryLoading = true;
      })
      .addCase(fetchCategoryRecipes.fulfilled, (state, action) => {
        state.categoryCache[state.activeCategory] = action.payload;
        state.isCategoryLoading = false;
      })
      .addCase(fetchCategoryRecipes.rejected, (state) => {
        state.isCategoryLoading = false;
      });
  },
});

export const { setActiveCategory } = recipeSlice.actions;
export default recipeSlice.reducer;
