import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import Icon from 'react-native-vector-icons/AntDesign';

const difficultyOptions = ["Easy", "Medium", "Hard"];
const categoryOptions = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];
const dietaryRestrictionsOptions = ["Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Vegetarian", "Halal"];

export default function CreateScreen() {
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const [instructions, setInstructions] = useState([""]);
  const [ingredients, setIngredients] = useState([""]);

  const toggleDifficulty = (level: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setSelectedDietaryRestrictions((prev) =>
      prev.includes(restriction) ? prev.filter((item) => item !== restriction) : [...prev, restriction]
    );
  };

  const handleInstructionChange = (text: string, index: number) => {
    const newInstructions = [...instructions];
    newInstructions[index] = text;
    setInstructions(newInstructions);
  };

  const handleIngredientChange = (text: string, index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const addIngredient = (index: number) => {
    setIngredients([...ingredients, ""]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(newInstructions);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create a New Recipe</Text>

        {/* Recipe Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="Enter recipe title" />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter a short description"
          multiline
        />

        {/* Ingredients */}
        <Text style={styles.label}>Ingredients</Text>
        {ingredients.map((ingr, index) => (
          <View key={index} style={styles.row}>
            <TextInput
              style={[styles.input, styles.instructionInput]}
              placeholder="Ingredient"
              value={ingr}
              onChangeText={(text) => handleIngredientChange(text, index)}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeIngredient(index)}
              >
                <Icon name="minuscircleo" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addIngredient}
              >
                <Icon name="pluscircleo" size={24} color="white" />
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
                style={styles.removeButton}
                onPress={() => removeInstruction(index)}
              >
                <Icon name="minuscircleo" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addInstruction}
              >
                <Icon name="pluscircleo" size={24} color="white" />
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

        {/* Prep time */}
        <Text style={styles.label}>Prep Time (minutes)</Text>
        <TextInput style={styles.input} placeholder="e.g., 15" keyboardType="numeric" />

        {/* Cook time */}
        <Text style={styles.label}>Cook Time (minutes)</Text>
        <TextInput style={styles.input} placeholder="e.g., 30" keyboardType="numeric" />

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
        <Text style={styles.label}>Category</Text>
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
          ))}
        </View>

        {/* Dietary Restrictions */}
        <Text style={styles.label}>Dietary Restrictions</Text>
        <View style={[styles.chipsContainer, { marginTop: 24 }]}>
          {dietaryRestrictionsOptions.map((restriction) => (
            <TouchableOpacity
              key={restriction}
              style={[
                styles.chip,
                selectedDietaryRestrictions.includes(restriction) && styles.chipSelected,
              ]}
              onPress={() => toggleDietaryRestriction(restriction)}
            >
              <Text style={selectedDietaryRestrictions.includes(restriction) ? styles.chipTextSelected : styles.chipText}>
                {restriction}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Recipe Button */}
        <View style={[styles.buttonContainer, { marginTop: 32 }]}>
          <TouchableOpacity style={styles.submitButton} onPress={() => { /* Handle submission */ }}>
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
  addButton: {
    backgroundColor: "#D98324",
    borderRadius: 20,
  },
  removeButton: {
    backgroundColor: "#D98324",
    borderRadius: 20,
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
  }
});
