import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { useApi } from "@/hooks/useApi";
const difficultyOptions = ["Easy", "Medium", "Hard"];
const categoryOptions = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];
import { API_URL } from "../../config";

export default function CreateScreen() {
  const { apiCall } = useApi();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  // const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const [instructions, setInstructions] = useState([""]);
  const [ingredients, setIngredients] = useState<{ quantity: string; name: string }[]>([
    { quantity: '', name: '' }
  ]);

  const toggleDifficulty = (level: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]
    );
  };

  // const toggleCategory = (category: string) => {
  //   setSelectedCategories((prev) =>
  //     prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
  //   );
  // };


  const handleInstructionChange = (text: string, index: number) => {
    const newInstructions = [...instructions];
    newInstructions[index] = text;
    setInstructions(newInstructions);
  };

  const handleIngredientChange = (index: number, field: 'quantity' | 'name', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };


  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };


  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(newInstructions);
    }
  };
  const addIngredient = () => {
    setIngredients([...ingredients, { quantity: '', name: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
  };

  const handleSubmit = async () => {
    try {
      // const parsedIngredients = ingredients.map((ingredientStr) => {
      //   const parsed = parseIngredient(ingredientStr);
      //   if (parsed) return `${parsed.quantity} ${parsed.unit} ${parsed.name}`;
      //   return null;
      // }).filter(Boolean);

      // if (parsedIngredients.length === 0) {
      //   alert("Some ingredients could not be parsed correctly.");
      //   return;
      // }

      const recipeData = {
        title,
        description,
        ingredients,
        instructions: instructions.join("\n"),
        prep_time: parseInt(prepTime),
        cook_time: parseInt(cookTime),
        difficulty: selectedDifficulties[0] || null,
        // category_ids: selectedCategories.map(category => categoryOptions.indexOf(category) + 1),
        image_url: imageUrl,
      };

      console.log("Submitting:", recipeData);

      const response = await apiCall(`${API_URL}/recipes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (!response || !response.ok) {
        throw new Error("Failed to create recipe");
      }

      const result = await response.json();
      console.log("Recipe created!", result);
      alert('Recipe created successfully!');
    } catch (error) {
      console.error('Error creating recipe:', error.message);
      alert('Failed to create recipe.');
    }
  };


  const populateFormWithRecipe = (recipe: any) => {
    setTitle(recipe.title || "");
    setDescription(recipe.description || "");
    // setIngredients(recipe.ingredients || [""]);
    setInstructions(recipe.instructions || [""]);
    setPrepTime(recipe.prep_time ? recipe.prep_time.toString() : "");
    setCookTime(recipe.cook_time ? recipe.cook_time.toString() : "");
    setSelectedDifficulties(recipe.difficulty ? [recipe.difficulty] : []);
    // setSelectedCategories(recipe.categories || []);
    setImageUrl(recipe.image_url || "");
  };


  // const parseIngredient = (ingredientStr: string) => {
  //   const pattern = /(\d+(\.\d+)?)\s*(\w+)\s*(.+)/;
  //   const match = ingredientStr.trim().match(pattern);

  //   if (match) {
  //     const quantity = parseFloat(match[1]);
  //     const unit = match[3];
  //     const name = match[4].trim();
  //     return { quantity, unit, name };
  //   }
  //   return null;
  // };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create a New Recipe</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter recipe title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter a short description"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Ingredients */}
        <Text style={styles.label}>Ingredients</Text>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.ingredientInputs}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                placeholder="Qty"
                value={ingredient.quantity}
                onChangeText={(text) => handleIngredientChange(index, 'quantity', text)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Ingredient"
                value={ingredient.name}
                onChangeText={(text) => handleIngredientChange(index, 'name', text)}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => removeIngredient(index)}
              >
                <Icon name="minuscircleo" size={24} color="#D98324" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addIngredient}
              >
                <Icon name="pluscircleo" size={24} color="#D98324" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Instructions */}
        <Text style={styles.label}>Instructions</Text>
        {instructions.map((instr, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.instructionNumber}>{index + 1}.</Text>
            <TextInput
              style={[styles.input, styles.instructionInput]}
              placeholder="Instruction step"
              value={instr}
              onChangeText={(text) => handleInstructionChange(text, index)}
              multiline
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => removeInstruction(index)}
              >
                <Icon name="minuscircleo" size={24} color="#D98324" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addInstruction}
              >
                <Icon name="pluscircleo" size={24} color="#D98324" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Image URL Input */}
        <Text style={styles.label}>Recipe Image URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter image URL"
          value={imageUrl}
          onChangeText={handleImageUrlChange}
        />

        {/* Display image from image url*/}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.recipeImage} />
        ) : null}

        <Text style={styles.label}>Prep Time (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 15"
          keyboardType="numeric"
          value={prepTime}
          onChangeText={setPrepTime}
        />

        <Text style={styles.label}>Cook Time (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 30"
          keyboardType="numeric"
          value={cookTime}
          onChangeText={setCookTime}
        />

        {/* Difficulty */}
        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.chipsContainer}>
          {difficultyOptions.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.chip,
                selectedDifficulties.includes(level) && styles.chipSelected,
              ]}
              onPress={() => toggleDifficulty(level)}
            >
              <Text style={selectedDifficulties.includes(level) ? styles.chipTextSelected : styles.chipText}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        {/* <Text style={styles.label}>Category</Text>
        <View style={styles.chipsContainer}>
          {categoryOptions.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                selectedCategories.includes(category) && styles.chipSelected,
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text style={selectedCategories.includes(category) ? styles.chipTextSelected : styles.chipText}>
                {category}
              </Text>
            </TouchableOpacity>
          ))} */}
        {/* </View>
        <View style={[styles.buttonContainer, { marginTop: 16 }]}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => populateFormWithRecipe({ */}


        {/* Submit Recipe Button */}
        <View style={[styles.buttonContainer, { marginTop: 32 }]}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Recipe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 100
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#D98324",
  },
  chipText: {
    color: "#555",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 16,
    marginRight: 8,
  },
  instructionInput: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#D98324",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  recipeImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
    marginVertical: 16,
  },
  ingredientInputs: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  quantityInput: {
    flex: 0.3,
  },
  nameInput: {
    flex: 0.7,
  },

});
